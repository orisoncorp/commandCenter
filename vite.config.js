import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three-core', test: /node_modules\/three\// },
            { name: 'r3f', test: /node_modules\/@react-three\// },
            { name: 'react-vendor', test: /node_modules\/(react|react-dom)\// },
          ],
        },
      },
    },
  },
})
