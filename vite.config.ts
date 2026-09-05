import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const chunks = {
  'react-flow': /\/react-flow-auto-layout|\/@xyflow\/react/g,
  'fontsource-variable': /\/@fontsource-variable/g,
  'jsx-runtime': /\/jsx-runtime/g,
  react: /\/react\//g,
  'react-dom': /\/react-dom\//g,
  'react-router': /\/react-router\//g,
  'react-redux': /\/react-redux\//g,
  redux: /\/redux\/|redux-thunk|reselect/g,
  recharts: /\/recharts/g,
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        chunkFileNames: '[name].[hash].js',
        codeSplitting: {
          groups: [
            {
              name: (moduleId) => {
                for (const [name, pattern] of Object.entries(chunks)) {
                  if (pattern.test(moduleId)) {
                    return name
                  }
                }
                return null
              },
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss({ optimize: { minify: true } })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
