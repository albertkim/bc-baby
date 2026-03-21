import { generateText, Output } from 'ai'
import { z } from 'zod'

const ROUTER_MODEL = 'openai/gpt-5.4-mini'

const bundledMetadata = import.meta.glob('../../content/metadata.json', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const bundledMarkdown = import.meta.glob('../../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const metadataEntrySchema = z.object({
  id: z.string(),
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

async function loadMetadata() {
  const raw = bundledMetadata['../../content/metadata.json']

  if (!raw) {
    throw new Error('Bundled content metadata is missing.')
  }

  return metadataSchema.parse(JSON.parse(raw))
}

async function readSource(entry: MetadataEntry) {
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

export function getConfigError() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return 'Missing AI_GATEWAY_API_KEY.'
  }

  return null
}

async function pickSourceIds(question: string, metadata: MetadataEntry[]) {
  try {
    const { output } = await generateText({
      model: ROUTER_MODEL,
      output: Output.object({ schema: pickResultSchema }),
      temperature: 0,
      prompt: [
        'Pick the most relevant handbook files for answering the user question.',
        'Return only 2 to 4 file ids.',
        'Use the metadata exactly as given.',
        'Prefer the fewest files needed to answer well.',
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
  } catch {
    // Fall through to the local fallback scorer.
  }

  return metadata
    .map((entry) => ({ entry, score: scoreFallback(question, entry) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ entry }) => entry.id)
}

export async function buildSourceContext(question: string) {
  const metadata = await loadMetadata()
  const pickedIds = await pickSourceIds(question, metadata)
  const selectedEntries = pickedIds
    .map((id) => metadata.find((entry) => entry.id === id))
    .filter((entry): entry is MetadataEntry => Boolean(entry))
  const sources = await Promise.all(selectedEntries.map(readSource))
  const context = sources
    .map((source) =>
      [`## ${source.title}`, `File: ${source.path}`, source.content].join('\n\n'),
    )
    .join('\n\n')

  return {
    sources,
    context,
  }
}
