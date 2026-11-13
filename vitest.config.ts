import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests do not start the application server or deployment adapter.
export default defineConfig({
  resolve: { alias: { '#': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', clearMocks: true, restoreMocks: true },
})
