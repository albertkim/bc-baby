import { generateText } from 'ai'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildSourceContext } from './content.server'

vi.mock('ai', async (original) => ({
  ...(await original<typeof import('ai')>()),
  generateText: vi.fn(),
}))

const sleepId = '09-baby-care-sleep-attachment-diapering-and-cleaning'

afterEach(() => vi.resetAllMocks())

describe('handbook retrieval', () => {
  it('loads bundled excerpts for valid source IDs and removes duplicate selections', async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { fileIds: [sleepId, sleepId, 'missing'] },
    } as never)
    const { context, sources } = await buildSourceContext(
      'How should my baby sleep?',
    )
    expect(sources.map((source) => source.id)).toEqual([sleepId])
    expect(context).toContain('Safer Sleep')
    expect(context).toContain(sources[0]?.title)
  })

  it.each(['failure', 'unknown IDs'])(
    'falls back to relevant bundled excerpts after %s',
    async (reason) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      if (reason === 'failure')
        vi.mocked(generateText).mockRejectedValue(
          new Error('Provider unavailable'),
        )
      else
        vi.mocked(generateText).mockResolvedValue({
          output: { fileIds: ['missing'] },
        } as never)
      const { sources, context } = await buildSourceContext(
        'sleep sleeping baby',
      )
      expect(sources).toHaveLength(3)
      expect(sources.some((source) => source.id === sleepId)).toBe(true)
      expect(context.length).toBeGreaterThan(100)
    },
  )

  it('does not make a fallback request after cancellation', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.mocked(generateText).mockRejectedValue(controller.signal.reason)
    await expect(
      buildSourceContext('Baby sleep', controller.signal),
    ).rejects.toBeDefined()
  })
})
