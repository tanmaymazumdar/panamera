import { resolve } from 'node:path'

import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  root: process.cwd(),
  test: {
    clearMocks: true,
    coverage: {
      provider: 'istanbul', // or 'v8'
      reporter: ['json', 'html'],
      thresholds: {
        branches: 61,
        functions: 46,
        lines: 72.5,
        statements: 69,
      },
    },
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/.git/**', 'coverage/**/*'],
    globals: true,
    include: [...configDefaults.include, 'src/**/*.{test,spec}.tsx?'],
    mockReset: true,
    setupFiles: './src/tests/setup.ts',
  },
})
