import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleChat } from './chat.server'
import { buildSourceContext } from './content.server'

vi.mock('./notifications.server', () => ({
  getRequestMetadata: () => ({}),
  notify: vi.fn(),
}))
vi.mock('./content.server', () => ({
  buildSourceContext: vi.fn(),
}))
vi.mock('ai', async (original) => ({
  ...(await original<typeof import('ai')>()),
  streamText: vi.fn(),
}))

function request(body: unknown) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const question = {
  id: 'question',
  role: 'user',
  parts: [{ type: 'text', text: 'How should my baby sleep?' }],
}

beforeEach(() => vi.stubEnv('AI_GATEWAY_API_KEY', 'test-key'))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetAllMocks()
})

describe('chat request boundary', () => {
  it.each([
    {},
    { messages: [] },
    { messages: [null] },
    { messages: [{ ...question, role: 'system' }] },
    { messages: [{ ...question, role: 'assistant' }] },
    { messages: [{ ...question, parts: [{ type: 'text', text: 'hi' }] }] },
    {
      messages: [
        { ...question, parts: [{ type: 'text', text: 'x'.repeat(4001) }] },
      ],
    },
    {
      messages: [
        {
          ...question,
          parts: [
            {
              type: 'file',
              mediaType: 'image/png',
              url: 'https://example.com/image.png',
            },
          ],
        },
      ],
    },
    { messages: Array.from({ length: 11 }, () => question) },
  ])(
    'rejects invalid or unsupported conversations before calling a model: %j',
    async (body) => {
      expect((await handleChat(request(body))).status).toBe(400)
      expect(buildSourceContext).not.toHaveBeenCalled()
      expect(streamText).not.toHaveBeenCalled()
    },
  )

  it('handles malformed JSON and oversized bodies', async () => {
    const malformed = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: '{',
    })
    expect((await handleChat(malformed)).status).toBe(400)
    expect(
      (await handleChat(request({ padding: 'x'.repeat(128 * 1024) }))).status,
    ).toBe(413)
  })

  it('returns a useful unavailable response without exposing configuration details', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
    const response = await handleChat(request({ messages: [question] }))
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('AI_GATEWAY_API_KEY')
    expect(buildSourceContext).not.toHaveBeenCalled()
  })

  it('streams answers with the requested model and reasoning using the selected handbook content', async () => {
    vi.mocked(buildSourceContext).mockResolvedValue({
      context: 'A firm, flat sleep surface.',
      sources: [{ title: 'Baby Sleep' }],
    } as never)
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: () =>
        createUIMessageStreamResponse({
          stream: createUIMessageStream({
            execute: ({ writer }) => {
              writer.write({ type: 'text-start', id: 'answer' })
              writer.write({
                type: 'text-delta',
                id: 'answer',
                delta: 'Use a firm, flat surface.\nSources: Baby Sleep',
              })
              writer.write({ type: 'text-end', id: 'answer' })
            },
          }),
        }),
    } as never)
    const response = await handleChat(request({ messages: [question] }))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/event-stream')
    expect(await response.text()).toContain('Sources: Baby Sleep')
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'openai/gpt-6-luna',
        reasoning: 'medium',
        instructions: expect.stringContaining('A firm, flat sleep surface.'),
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: question.parts[0]?.text }],
          },
        ],
      }),
    )
  })

  it('returns a recoverable error when retrieval fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(buildSourceContext).mockRejectedValue(
      new Error('Private provider details'),
    )
    const response = await handleChat(request({ messages: [question] }))
    expect(response.status).toBe(502)
    expect(await response.text()).toBe(
      'The handbook response failed. Please try again.',
    )
  })

  it('gives source selection the preceding questions to interpret a follow-up', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(buildSourceContext).mockRejectedValue(
      new Error('Stop before generation'),
    )
    await handleChat(
      request({
        messages: [
          question,
          {
            id: 'answer',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Sleep guidance.' }],
          },
          {
            id: 'follow-up',
            role: 'user',
            parts: [{ type: 'text', text: 'What about blankets?' }],
          },
        ],
      }),
    )
    expect(buildSourceContext).toHaveBeenCalledWith(
      expect.stringContaining(
        'Earlier questions:\nHow should my baby sleep?\n\nCurrent question:\nWhat about blankets?',
      ),
      expect.any(AbortSignal),
    )
  })
})
