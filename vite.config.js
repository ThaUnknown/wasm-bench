import { defineConfig } from 'vite'

export default defineConfig({
  base: '/wasm-bench/',
  build: {
    outDir: 'docs',
    target: 'esnext' // browsers can handle the latest ES features
  },
  optimizeDeps: {
    exclude: ['blake3-wasm']
  }
})
