import { createFileRoute } from '@tanstack/react-router'
import { convertToModelMessages, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { buildSourceContext, getConfigError } from '#/lib/content.server'

export const maxDuration = 30
const ANSWER_MODEL = 'openai/gpt-5.4-mini'

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

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const configError = getConfigError()

        if (configError) {
          return new Response(configError, { status: 500 })
        }

        const { messages }: { messages: UIMessage[] } = await request.json()
        const question = getLatestQuestion(messages)

        if (!question) {
          return new Response('Missing user question.', { status: 400 })
        }

        const { context, sources } = await buildSourceContext(question)
        const sourceList = sources.map((source) => source.title).join('; ')

        const result = streamText({
          model: ANSWER_MODEL,
          system: [
            'You answer questions using only the provided Baby’s Best Chance handbook excerpts.',
            'If the answer is not in the provided excerpts, say so plainly.',
            'Do not invent medical advice beyond the handbook.',
            'Use clear, direct language. Keep answers short - give longer answers if the user asks for more information.',
            'You do not need to refer the the handbook or excerpt for your replies, just answer the question.',
            'End every answer with a single line that starts with "Sources:" followed by the source titles you relied on.',
            '',
            'Selected handbook excerpts:',
            context,
            '',
            `Selected sources: ${sourceList}`,
          ].join('\n'),
          messages: await convertToModelMessages(messages),
        })

        return result.toUIMessageStreamResponse({
          onError: () => 'The handbook response failed.',
        })
      },
    },
  },
})
