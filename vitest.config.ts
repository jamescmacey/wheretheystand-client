import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Unit tests only, deliberately outside Nuxt.
 *
 * What is tested here -- the seat allocation -- is pure and has no business
 * needing a Nuxt runtime to run. Keeping it out means the suite starts in
 * under a second, which is what makes it worth running.
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
