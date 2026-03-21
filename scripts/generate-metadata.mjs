import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const OUTPUT_PATH = path.join(CONTENT_DIR, 'metadata.json')

const STOPWORDS = new Set([
  'a',
  'about',
  'after',
  'all',
  'also',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'before',
  'between',
  'but',
  'by',
  'can',
  'do',
  'during',
  'each',
  'for',
  'from',
  'get',
  'has',
  'have',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'know',
  'may',
  'more',
  'not',
  'of',
  'on',
  'or',
  'other',
  'out',
  'part',
  'should',
  'that',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'through',
  'to',
  'up',
  'use',
  'what',
  'when',
  'where',
  'which',
  'who',
  'with',
  'you',
  'your',
])

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function collectKeywords(...parts) {
  const combined = parts.join(' ').toLowerCase()
  const words = combined.match(/[a-z][a-z'-]+/g) ?? []
  return [...new Set(words.filter((word) => word.length > 2 && !STOPWORDS.has(word)))].slice(0, 18)
}

function getSummary(lines) {
  const prose = lines
    .filter((line) => line.trim())
    .filter((line) => !line.startsWith('#'))
    .filter((line) => !line.startsWith('_Source pages:'))
    .filter((line) => !/^\*\*[A-Z0-9 ?&/-]+\*\*$/.test(line))
    .filter((line) => !line.trim().startsWith('- '))
    .slice(0, 5)

  return normalizeWhitespace(prose.join(' ')).slice(0, 420)
}

async function main() {
  const entries = []
  const filenames = (await readdir(CONTENT_DIR))
    .filter((name) => name.endsWith('.md'))
    .sort()

  for (const filename of filenames) {
    const filePath = path.join(CONTENT_DIR, filename)
    const content = await readFile(filePath, 'utf8')
    const lines = content.split('\n')
    const title = lines.find((line) => line.startsWith('# '))?.replace(/^# /, '').trim() ?? filename
    const headings = lines
      .filter((line) => /^##+\s+/.test(line))
      .map((line) => line.replace(/^##+\s+/, '').trim())
      .slice(0, 12)

    entries.push({
      id: filename.replace(/\.md$/, ''),
      title,
      path: `content/${filename}`,
      summary: getSummary(lines),
      keywords: collectKeywords(title, headings.join(' ')),
      headings,
    })
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
