import * as wasm from './pkg/sha_was.js'
import { Bench } from 'https://esm.sh/tinybench'
import { Sha256 } from 'https://esm.sh/@aws-crypto/sha256-js'

await wasm.default('./pkg/sha_was_bg.wasm')
// Usage example

const bench = new Bench({ time: 100 })

const data = new Uint8Array([104, 101, 108, 108, 111]) // "hello"
const mediumData = crypto.getRandomValues(new Uint8Array(65536))
// 100MB data
const largeData = new Uint8Array(Array.from({length:10 * 1024 * 1024},() => Math.floor(Math.random()*256)))

bench
  .add('WASM 5 bytes', () => {
    wasm.hash_sha256(data)
  })
  .add('WebCrypto 5 bytes', async () => {
    // hash using web crypto 
    await crypto.subtle.digest('SHA-256', data)
  })
  .add('JS 5 bytes', async () => {
    const hash = new Sha256();
    hash.update(data);
    await hash.digest();
  })
  .add('WASM 65536 bytes', () => {
    wasm.hash_sha256(mediumData)
  })
  .add('WebCrypto 65536 bytes', async () => {
    // hash using web crypto 
    await crypto.subtle.digest('SHA-256', mediumData)
  })
  .add('JS 65536 bytes', async () => {
    const hash = new Sha256();
    hash.update(mediumData);
    await hash.digest();
  })
  .add('WASM 10MB', () => {
    wasm.hash_sha256(largeData)
  })
  .add('WebCrypto 10MB', async () => {
    // hash using web crypto 
    await crypto.subtle.digest('SHA-256', largeData)
  })
  .add('JS 10MB', async () => {
    const hash = new Sha256();
    hash.update(largeData);
    await hash.digest();
  })

await bench.warmupTasks()
await bench.run()

console.table(bench.table())