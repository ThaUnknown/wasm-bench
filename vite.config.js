import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/wasm-bench/',
  build: {
    outDir: 'docs',
    target: 'esnext', // browsers can handle the latest ES features
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gzip: resolve(__dirname, 'gzip.html'),
        png: resolve(__dirname, 'png.html'),
        sha256: resolve(__dirname, 'sha256.html')
      }
    }
  }
})
