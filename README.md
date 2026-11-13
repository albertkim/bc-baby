# BC Baby

A mobile-friendly chat app for British Columbia’s _Baby’s Best Chance_ and _Toddler’s First Steps_ handbooks, covering pregnancy, babies, and children through 36 months. Ask naturally: the app selects sections from either or both books, replies in a message bubble, and identifies the handbook and sections used in the source links below each answer. When age changes the guidance and has not been established, the assistant is instructed to ask.

The bundled sources are _Baby’s Best Chance_, 8th edition, updated in 2024, and _Toddler’s First Steps_, 4th edition, updated in 2024. The original PDFs are included in the repository. The toddler PDF was downloaded from HealthLink BC on November 13, 2026. Book titles, editions, scopes, covers, and official PDF links are defined in `src/lib/handbooks.ts`.

## Development

Use Node.js 26 and npm. Install the locked dependencies:

```sh
npm ci
```

Copy `.env.example` to `.env` and set `AI_GATEWAY_API_KEY` to a Vercel AI Gateway key. `SLACK_WEBHOOK_URL` is optional; leave it empty during local development to avoid sending notifications.

```sh
npm run dev
```

Open http://localhost:3000. Questions can contain 5–4,000 characters. Enter sends a question; Shift+Enter inserts a new line. A response can be stopped or retried after an error. Conversation history lives in the current browser session and resets on reload.

## Models and retrieval

Both source selection and answer generation use `openai/gpt-6-luna` through Vercel AI Gateway, with medium reasoning set explicitly in `src/lib/models.server.ts`.

Source selection uses metadata to choose up to four sections across both books, considering age and prior user questions in the bounded conversation. If selection fails or returns no valid IDs, local keyword search selects two sections from each book so neither is excluded. Answers stream from those excerpts. The app uses no embeddings or vector database.

Handbook Markdown and metadata are bundled into the server build, so production needs no source checkout or runtime filesystem access. After editing handbook sections, regenerate metadata:

```sh
npm run generate:metadata
```

Handbook Markdown is curated against the source PDFs, not generated directly from PDF text. Its headings, lists, procedures, age tables, and warnings reconstruct the meaning of the source layout. Keep numbers, units, age boundaries, conditions, resources, and substantive wording intact. Mark unclear or malformed source text explicitly instead of inventing a correction. PDF extraction can help read the source, but it must not overwrite these notes. The old extraction and cleanup scripts have been removed because they produced or reintroduced layout errors.

Toddler notes include physical PDF pages 10–146: introduction, all five care sections, resources, and Canada’s Food Guide. Front matter, the index, and the back cover are omitted. Informative diagram labels and relationships are transcribed where they can be established; the source PDFs remain available for the original illustrations. Source links use physical PDF page numbers rather than the book’s printed page numbers.

## Verification

```sh
npm run check
```

This checks formatting, TypeScript, linting, and a production build.

To run the production build locally:

```sh
npm run build
npm run preview
```

The preview server needs `AI_GATEWAY_API_KEY` in its process environment; it does not load `.env` automatically. Vite loads `.env` during local development. Never give server secrets a `VITE_` prefix.

## Deployment

The repository is configured for TanStack Start on Vercel with Node.js 26. Set `AI_GATEWAY_API_KEY` in the appropriate Vercel environments. Add `SLACK_WEBHOOK_URL` only where notifications are wanted. Leave it unset in preview environments.

```sh
NITRO_PRESET=vercel npm run build
```

This produces Vercel’s Build Output API artifacts in `.vercel/output`. The server function allows 60 seconds; source selection has a 20-second timeout and answer generation a 45-second timeout, with a shared 55-second deadline.

The stable Nitro 2 adapter is intentional: Nitro 3 currently publishes a release candidate and the project avoids release candidates and nightlies. All direct dependencies use exact stable versions, with transitive versions recorded in `package-lock.json`.

`npm audit --omit=dev` checks production dependencies. At the November 2026 migration, production dependencies had no reported vulnerabilities. The stable build adapter still brings low/moderate advisories through `deepmerge` and `minimatch`; no compatible upstream fix is currently offered. These are build-tool dependencies, not imported by application request handlers. Recheck the full audit when updating the adapter.
