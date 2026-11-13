import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitroV2Plugin({
      compatibilityDate: '2026-11-13',
      vercel: { functions: { maxDuration: 60 } },
    }),
    react(),
  ],
  resolve: { tsconfigPaths: true },
  // Lucide's Node and bundler export conditions resolve to different files.
  // Bundle the used icons so deployment tracing cannot omit the Node entry.
  ssr: { noExternal: ['lucide-react'] },
})
