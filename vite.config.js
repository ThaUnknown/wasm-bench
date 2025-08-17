import { defineConfig } from 'vite'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/wasm-bench/',
    plugins: [
    nodePolyfills({
      include: ['stream', 'util', 'zlib'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Override the default polyfills for specific modules.
      overrides: {
        zlib: './zlib.cjs',
        process: 'process-fast'
      }
    }),
  ],
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
