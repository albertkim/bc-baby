import { createFileRoute } from '@tanstack/react-router'
import { convertToModelMessages, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { buildSourceContext, getConfigError } from '#/lib/content.server'

export const maxDuration = 30
const ANSWER_MODEL = 'openai/gpt-5.4-mini'
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const MIN_MESSAGE_LENGTH = 5
const MAX_MESSAGE_LENGTH = 4000
const MAX_CONTEXT_MESSAGES = 10

function getLatestQuestion(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user')

  if (!latestUserMessage) {
    return ''
  }

  return latestUserMessage.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

function getRequestMetadata(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? ''

  return {
    timestamp: new Date().toISOString(),
    ip:
      forwardedFor.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-vercel-forwarded-for') ||
      null,
    location: {
      city: request.headers.get('x-vercel-ip-city'),
      region: request.headers.get('x-vercel-ip-country-region'),
      country: request.headers.get('x-vercel-ip-country'),
    },
    browser: request.headers.get('user-agent'),
  }
}

function summarizeBrowser(userAgent: unknown) {
  if (typeof userAgent !== 'string' || userAgent.length === 0) {
    return 'unknown'
  }

  const browser = userAgent.includes('Edg/')
    ? 'Edge'
    : userAgent.includes('Chrome/')
      ? 'Chrome'
      : userAgent.includes('Firefox/')
        ? 'Firefox'
        : userAgent.includes('Safari/') && !userAgent.includes('Chrome/')
          ? 'Safari'
          : 'Unknown browser'

  const device = userAgent.includes('iPhone')
    ? 'iPhone'
    : userAgent.includes('iPad')
      ? 'iPad'
      : userAgent.includes('Android')
        ? 'Android'
        : userAgent.includes('Macintosh')
          ? 'Mac'
          : userAgent.includes('Windows')
            ? 'Windows'
            : 'Unknown device'

  return `${browser} on ${device}`
}

function notify(payload: Record<string, unknown>) {
  if (!SLACK_WEBHOOK_URL) {
    return
  }

  const payloadLocation = payload.location as
    | {
        city?: string | null
        region?: string | null
        country?: string | null
      }
    | undefined

  const location = [
    payloadLocation?.city,
    payloadLocation?.region,
    payloadLocation?.country,
  ]
    .filter(Boolean)
    .join(', ')

  const text = [
    `IP: ${String(payload.ip ?? 'unknown')}`,
    `Location: ${location || 'unknown'}`,
    `Browser: ${summarizeBrowser(payload.browser)}`,
    `Message: ${String(payload.message ?? '')}`,
    payload.error ? `Error: ${String(payload.error)}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  void fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text: `\`\`\`\n${text.replace(/```/g, "'''")}\n\`\`\``,
    }),
  }).catch(() => {})
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const configError = getConfigError()

        if (configError) {
          return new Response(configError, { status: 500 })
        }

        const { messages }: { messages: UIMessage[] } = await request.json()
        const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES)
        const question = getLatestQuestion(recentMessages)

        if (!question) {
          return new Response('Missing user question.', { status: 400 })
        }

        if (question.length < MIN_MESSAGE_LENGTH) {
          return new Response('Message is too short.', { status: 400 })
        }

        if (question.length > MAX_MESSAGE_LENGTH) {
          return new Response('Message is too long.', { status: 400 })
        }

        const requestMetadata = getRequestMetadata(request)

        notify({
          type: 'chat_message',
          ...requestMetadata,
          message: question,
        })

        try {
          const { context, sources } = await buildSourceContext(question)
          const sourceList = sources.map((source) => source.title).join('; ')
          const systemPrompt = `
You are a helpful assistant who helps new parents in British Columbia with their pregnancy and baby care.
You answer questions using mainly only the provided Baby's Best Chance handbook excerpts, which is published by the Government of British Columbia and Provincial Health Services Authority.

If the answer is not in the provided excerpts, say so plainly.
Do not invent medical advice beyond the handbook. You can provide some general advice from info not in the handbook, but make it clear that it's general knowledge not from the handbook.
Use clear, direct language. Keep answers short, bullet points no longer than 5-10 items at most; give longer answers if the user asks for more information.
Format responses in Markdown when it improves readability. Highlight important information in bold.
You do not need to refer to the handbook or excerpt in your replies; just answer the question.
Never offer things like "if you want i can" or similar clickbait. Just answer the question.

You were developed by Albert Kim, a new parent in British Columbia. You made this to help other new parents in the province who want to easily reference the Baby's Best Chance handbook as a primary source of information.

End every answer with a single line that starts with "Sources:" followed by the source titles you relied on.

Selected handbook excerpts:
${context}

Selected sources: ${sourceList}
`

          const result = streamText({
            model: ANSWER_MODEL,
            system: systemPrompt,
            messages: await convertToModelMessages(recentMessages),
          })

          return result.toUIMessageStreamResponse({
            onError: (error) => {
              notify({
                type: 'chat_error',
                ...requestMetadata,
                message: question,
                error: error instanceof Error ? error.message : 'Unknown error',
              })

              return 'The handbook response failed.'
            },
          })
        } catch (error) {
          notify({
            type: 'chat_error',
            ...requestMetadata,
            message: question,
            error: error instanceof Error ? error.message : 'Unknown error',
          })

          return new Response('The handbook response failed.', { status: 500 })
        }
      },
    },
  },
})
