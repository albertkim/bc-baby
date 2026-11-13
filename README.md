# BC Baby

A mobile-friendly chat app for British Columbia’s _Baby’s Best Chance_ handbook. Ask a question, get an answer from selected handbook excerpts, and see the source titles used.

The handbook is published by the Government of British Columbia and Provincial Health Services Authority. Download the original from [HealthLink BC](https://www.healthlinkbc.ca/living-well/parenting/parenting-babies-0-12-months/babys-best-chance-parents-handbook-pregnancy-and).

## Development

Use Node.js 26 and npm. Install the locked dependencies:

```sh
npm ci
```

Copy `.env.example` to `.env` and set `AI_GATEWAY_API_KEY` to a Vercel AI Gateway key. `SLACK_WEBHOOK_URL` is optional; leave it empty when testing so synthetic questions do not send notifications.

```sh
npm run dev
```

Open http://localhost:3000. Questions can contain 5–4,000 characters. Enter sends a question; Shift+Enter inserts a new line. A response can be stopped or retried after an error. Conversation history lives in the current browser session and resets on reload.

## Models and retrieval

Both source selection and answer generation use `openai/gpt-6-luna` through Vercel AI Gateway, with medium reasoning set explicitly in `src/lib/models.server.ts`.

Source selection uses the metadata for the handbook sections to choose up to four files. If selection fails or returns no valid IDs, local keyword search selects three sections. Answers stream from those excerpts. The app uses no embeddings or vector database.

Handbook Markdown and metadata are bundled into the server build, so production needs no source checkout or runtime filesystem access. After editing handbook sections, regenerate metadata:

```sh
npm run generate:metadata
```

The Python extraction scripts are offline tools for reprocessing the original PDF. The app does not execute them or require a Python environment. The extraction script uses `pypdf`.

## Verification

```sh
npm run check
```

This checks formatting, TypeScript, linting, the automated tests, a production build, and a smoke check against the built server. Tests cover request validation, bundled retrieval and its fallback, chat streaming, follow-up messages, retry, and keyboard input. External model requests are mocked; tests require no credentials or paid calls.

To run the production build locally:

```sh
npm run build
npm run preview
```

The preview server needs `AI_GATEWAY_API_KEY` in its process environment; it does not load `.env` automatically. Vite loads `.env` during local development. Never give server secrets a `VITE_` prefix.

## Deployment

The repository is configured for TanStack Start on Vercel with Node.js 26. Set `AI_GATEWAY_API_KEY` in the appropriate Vercel environments. Add `SLACK_WEBHOOK_URL` only where notifications are wanted. Keep it unset in previews used for synthetic verification.

```sh
NITRO_PRESET=vercel npm run build
```

This produces Vercel’s Build Output API artifacts in `.vercel/output`. The server function allows 60 seconds; source selection has a 20-second timeout and answer generation a 45-second timeout, with a shared 55-second deadline. Validate an actual deployment’s streaming and timeout behavior before promotion.

The stable Nitro 2 adapter is intentional: Nitro 3 currently publishes a release candidate and the project avoids release candidates and nightlies. All direct dependencies use exact stable versions, with transitive versions recorded in `package-lock.json`.

`npm audit --omit=dev` checks production dependencies. At the November 2026 migration, production dependencies had no reported vulnerabilities. The stable build adapter still brings low/moderate advisories through `deepmerge` and `minimatch`; no compatible upstream fix is currently offered. These are build-tool dependencies, not imported by application request handlers. Recheck the full audit when updating the adapter.
