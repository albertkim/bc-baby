import { convertToModelMessages, safeValidateUIMessages, streamText } from 'ai'
import { z } from 'zod'
import { buildSourceContext } from './content.server'
import {
  getMessageText,
  MAX_CONTEXT_MESSAGES,
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
} from './chat'
import { handbookModel } from './models.server'
import { getRequestMetadata, notify } from './notifications.server'

// Bound the full request as well as the most recent question.
const MAX_REQUEST_BYTES = 128 * 1024
const requestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(MAX_CONTEXT_MESSAGES),
})

export async function handleChat(request: Request): Promise<Response> {
  const bytes = await request.arrayBuffer()
  if (bytes.byteLength > MAX_REQUEST_BYTES) {
    return new Response('Conversation is too long. Please start a new chat.', {
      status: 413,
    })
  }

  let body: unknown
  try {
    body = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return new Response('Invalid chat request.', { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success)
    return new Response('Invalid chat request.', { status: 400 })

  const validated = await safeValidateUIMessages({
    messages: parsed.data.messages,
  })
  if (!validated.success)
    return new Response('Invalid chat messages.', { status: 400 })

  // This is a text-only handbook chat. Never accept client-supplied system
  // instructions, tool calls, files, or reasoning as part of its prompt.
  const messages = validated.data
  if (
    messages.some(
      (message) =>
        !['user', 'assistant'].includes(message.role) ||
        message.parts.some(
          (part) => part.type !== 'text' && part.type !== 'step-start',
        ),
    )
  )
    return new Response('Only text chat messages are supported.', {
      status: 400,
    })

  const latest = messages.at(-1)
  const question = latest?.role === 'user' ? getMessageText(latest) : ''
  if (question.length < MIN_QUESTION_LENGTH)
    return new Response('Please enter a question of at least 5 characters.', {
      status: 400,
    })
  if (question.length > MAX_QUESTION_LENGTH)
    return new Response(
      'Please keep your question to 4,000 characters or fewer.',
      { status: 400 },
    )

  if (!process.env.AI_GATEWAY_API_KEY)
    return new Response(
      'Handbook chat is not configured. Please try again later.',
      { status: 503 },
    )

  const metadata = getRequestMetadata(request)
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(55_000)])
  notify({ ...metadata, message: question })
  const reportError = (error: unknown) => {
    if (request.signal.aborted) return 'Response stopped.'
    console.error('Handbook chat failed:', error)
    notify({
      ...metadata,
      message: question,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return 'The handbook response failed. Please try again.'
  }

  try {
    const earlierQuestions = messages
      .slice(0, -1)
      .filter((message) => message.role === 'user')
      .slice(-2)
      .map(getMessageText)
    const retrievalQuestion = earlierQuestions.length
      ? `Earlier questions:\n${earlierQuestions.join('\n')}\n\nCurrent question:\n${question}`
      : question
    const { context, sources } = await buildSourceContext(
      retrievalQuestion,
      signal,
    )
    const sourceList = sources.map((source) => source.title).join('; ')
    const instructions = `
You are a helpful assistant who helps new parents in British Columbia with their pregnancy and baby care.
You answer questions using only the provided Baby's Best Chance handbook excerpts, which is published by the Government of British Columbia and Provincial Health Services Authority.

If the answer is not in the provided excerpts, say so plainly.
Do not invent medical advice or supplement the excerpts with unsupported claims.
Use clear, direct language. Keep answers short, bullet points no longer than 5-10 items at most; give longer answers if the user asks for more information.
Format responses in Markdown when it improves readability. Highlight important information in bold.
You do not need to refer to the handbook or excerpt in your replies; just answer the question.
Never offer things like "if you want i can" or similar clickbait. Just answer the question.

You were developed by Albert Kim, a new parent in British Columbia. The app helps other new parents in the province who want to easily reference the Baby's Best Chance handbook as a primary source of information.

End every answer with a single line that starts with "Sources:" followed by the source titles you relied on.

Selected handbook excerpts:
${context}

Selected sources: ${sourceList}
`

    const result = streamText({
      ...handbookModel,
      instructions,
      messages: await convertToModelMessages(messages),
      abortSignal: signal,
      timeout: 45_000,
    })
    return result.toUIMessageStreamResponse({
      sendReasoning: false,
      onError: reportError,
    })
  } catch (error) {
    return new Response(reportError(error), { status: 502 })
  }
}
