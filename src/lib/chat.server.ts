import { convertToModelMessages, safeValidateUIMessages, streamText } from 'ai'
import { z } from 'zod'
import { buildSourceContext } from './content.server'
import {
  type HandbookMessage,
  getMessageText,
  MAX_CONTEXT_MESSAGES,
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
} from './chat'
import { handbookModel } from './models.server'
import { HANDBOOKS } from './handbooks'
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
      .map(getMessageText)
    const retrievalQuestion = earlierQuestions.length
      ? `Earlier questions:\n${earlierQuestions.join('\n')}\n\nCurrent question:\n${question}`
      : question
    const { context, sources } = await buildSourceContext(
      retrievalQuestion,
      signal,
    )
    const sourceList = sources
      .map((source) => {
        const book = HANDBOOKS[source.handbookId]
        return `[${book.title} — ${source.title}](${book.url}#page=${source.startPage})`
      })
      .join('; ')
    const instructions = `
You help parents and caregivers in British Columbia with pregnancy, baby care, and toddler care through 36 months.
Answer using only the provided excerpts from Baby’s Best Chance (8th edition, updated in 2024) and Toddler’s First Steps (4th edition, updated in 2024), published by BC’s public health organizations.

Automatically use either or both handbooks according to the question. Never ask the user to choose a handbook.
Use the child’s age if established in the conversation. If age changes the advice and is unknown, ask one short question about their age before giving age-specific guidance. Do not assume that the word “baby” or “toddler” establishes an exact age.
Keep advice tied to the age range in the source. Do not apply toddler guidance to a newborn or merge guidance for different ages. Page transcripts may preserve tables using fixed-width columns: read each age label with its own column or row. If a table’s associations are unclear, do not guess.
When guidance overlaps, use the relevant excerpts together. If excerpts conflict, explain the difference rather than silently choosing. Previous assistant answers are conversation context, not evidence.

If the answer is not in the provided excerpts, say so plainly.
Do not invent medical advice or supplement the excerpts with unsupported claims.
Use clear, direct language. Keep answers short, bullet points no longer than 5-10 items at most; give longer answers if the user asks for more information.
Format responses in Markdown when it improves readability. Highlight important information in bold.
You do not need to refer to the handbook or excerpt in your replies; just answer the question.
Never offer things like "if you want i can" or similar clickbait. Just answer the question.

You were developed by Albert Kim, a parent in British Columbia. BC Baby makes the province’s pregnancy, baby, and toddler handbooks easier to use.

End every substantive answer with a single line starting with "Sources:" followed by the supplied Markdown links for only the sections you relied on. Include the handbook name and section title. Use the exact URLs supplied. A clarification question alone does not need a source line.

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
    return result.toUIMessageStreamResponse<HandbookMessage>({
      sendReasoning: false,
      messageMetadata: ({ part }) =>
        part.type === 'start'
          ? {
              handbookIds: [
                ...new Set(sources.map((source) => source.handbookId)),
              ],
            }
          : undefined,
      onError: reportError,
    })
  } catch (error) {
    return new Response(reportError(error), { status: 502 })
  }
}
