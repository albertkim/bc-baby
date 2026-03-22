# BC - Baby's Best Chance

A simple chat interface for the BC *Baby's Best Chance* handbook.

## Why This Exists

I am a new parent in British Columbia and wanted an easier way to reference the primary source material.

Physical copies of *Baby's Best Chance* are no longer easy to get, and the PDF version is hard to read on a phone. This project turns the handbook into a small chat app so it is faster to search, easier to use on mobile, and still grounded in the original handbook content.

## What It Does

- Splits the handbook into cleaned Markdown files by major section
- Generates metadata for those sections
- Lets a user ask a question in chat
- Selects the most relevant handbook files
- Answers from those handbook excerpts

The goal is not generic parenting advice. The goal is quick access to the handbook itself.

## Source Handbook

The full handbook can be downloaded from HealthLink BC:

[Baby's Best Chance: Parents' Handbook of Pregnancy and Baby Care](https://www.healthlinkbc.ca/living-well/parenting/parenting-babies-0-12-months/babys-best-chance-parents-handbook-pregnancy-and)

## Stack

- TanStack Start
- React
- shadcn/ui
- AI SDK
- Vercel AI Gateway

## Content Structure

- [content](/Users/albertkim/Documents/GitHub/bc-baby/content): cleaned handbook sections as Markdown
- [content/metadata.json](/Users/albertkim/Documents/GitHub/bc-baby/content/metadata.json): file metadata used for routing
- [scripts/generate-metadata.mjs](/Users/albertkim/Documents/GitHub/bc-baby/scripts/generate-metadata.mjs): regenerates metadata from the content files

## How Retrieval Works

This app does not use embeddings or a vector database.

Instead:

1. The user asks a question.
2. The app looks at `content/metadata.json`.
3. A small model picks the most relevant handbook files.
4. The app loads those files.
5. The answer model responds using only those selected excerpts.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Regenerate metadata after content changes:

```bash
npm run generate:metadata
```

## Environment

Create a `.env` file with:

```bash
AI_GATEWAY_API_KEY=your_key_here
```

## Notes

- The handbook content is bundled into the production build so deployment does not rely on local filesystem reads.
- The UI is optimized for phone use because that was a primary motivation for the project.
