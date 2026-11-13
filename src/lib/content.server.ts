import { generateText, Output } from 'ai'
import { z } from 'zod'

import { handbookModel } from './models.server'
import { HANDBOOKS } from './handbooks'

const bundledMetadata = import.meta.glob<string>(
  '../../content/metadata.json',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
)

const bundledMarkdown = import.meta.glob<string>('../../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const metadataEntrySchema = z.object({
  id: z.string(),
  handbookId: z.enum(['baby', 'toddler']),
  startPage: z.number().int().positive(),
  endPage: z.number().int().positive(),
  title: z.string(),
  path: z.string(),
  summary: z.string(),
  keywords: z.array(z.string()),
  headings: z.array(z.string()),
})

const metadataSchema = z.array(metadataEntrySchema)

const pickResultSchema = z.object({
  fileIds: z.array(z.string()).min(1).max(4),
})

export type MetadataEntry = z.infer<typeof metadataEntrySchema>

function tokenize(value: string) {
  return (value.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []).filter(
    (word) => word.length > 2,
  )
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)]
}

function scoreFallback(question: string, entry: MetadataEntry) {
  const questionTerms = new Set(tokenize(question))
  const titleTerms = tokenize(entry.title)
  const summaryTerms = tokenize(entry.summary)
  const keywordTerms = entry.keywords.map((keyword) => keyword.toLowerCase())

  let score = 0

  for (const term of questionTerms) {
    if (titleTerms.includes(term)) score += 3
    if (keywordTerms.includes(term)) score += 2
    if (summaryTerms.includes(term)) score += 1
  }

  return score
}

function loadMetadata() {
  const raw = bundledMetadata['../../content/metadata.json']

  if (!raw) {
    throw new Error('Bundled content metadata is missing.')
  }

  return metadataSchema.parse(JSON.parse(raw))
}

function readSource(entry: MetadataEntry) {
  const relativePath = `../../${entry.path}`
  const content = bundledMarkdown[relativePath]

  if (!content) {
    throw new Error(`Bundled handbook content is missing for ${entry.path}.`)
  }

  return {
    ...entry,
    content,
  }
}

async function pickSourceIds(
  question: string,
  metadata: MetadataEntry[],
  abortSignal?: AbortSignal,
) {
  try {
    const { output } = await generateText({
      ...handbookModel,
      abortSignal,
      timeout: 20_000,
      output: Output.object({ schema: pickResultSchema }),
      prompt: [
        'Pick the most relevant sections from the two BC parenting handbooks for answering the current question.',
        'Return 1 to 4 file ids, using either or both books as appropriate.',
        'Use the child’s age and topic from the conversation. The current question takes priority if the age or topic changes.',
        'The books overlap at 6–12 months. Do not treat them as mutually exclusive.',
        'If age is unknown and changes the guidance, include relevant age-specific sections so the answer can ask for clarification.',
        'Use the metadata exactly as given.',
        'Prefer the fewest files needed to answer well.',
        `Handbooks: ${JSON.stringify(HANDBOOKS)}`,
        '',
        `Question: ${question}`,
        '',
        'Metadata:',
        JSON.stringify(metadata, null, 2),
      ].join('\n'),
    })

    const validIds = new Set(metadata.map((entry) => entry.id))
    const pickedIds = dedupe(output.fileIds).filter((id) => validIds.has(id))

    if (pickedIds.length > 0) {
      return pickedIds.slice(0, 4)
    }
  } catch (error) {
    if (abortSignal?.aborted) throw error
    console.warn(
      'Source selection failed; using handbook keyword search.',
      error,
    )
  }

  const ranked = metadata
    .map((entry) => ({ entry, score: scoreFallback(question, entry) }))
    .sort((left, right) => right.score - left.score)
  // A routing outage must not silently exclude one of the overlapping books.
  return Object.keys(HANDBOOKS).flatMap((handbookId) =>
    ranked
      .filter(({ entry }) => entry.handbookId === handbookId)
      .slice(0, 2)
      .map(({ entry }) => entry.id),
  )
}

export async function buildSourceContext(
  question: string,
  abortSignal?: AbortSignal,
) {
  const metadata = loadMetadata()
  const pickedIds = await pickSourceIds(question, metadata, abortSignal)
  const selectedEntries = pickedIds
    .map((id) => metadata.find((entry) => entry.id === id))
    .filter((entry): entry is MetadataEntry => Boolean(entry))
  const sources = selectedEntries.map(readSource)
  const context = sources
    .map((source) => {
      const book = HANDBOOKS[source.handbookId]
      return [
        `## ${book.title} — ${source.title}`,
        `Edition: ${book.edition}. Scope: ${book.scope}`,
        `Source: ${book.url}#page=${source.startPage} (PDF pages ${source.startPage}–${source.endPage})`,
        source.content,
      ].join('\n\n')
    })
    .join('\n\n')

  return {
    sources,
    context,
  }
}
