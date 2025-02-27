import * as wasm from './pkg/sha_was.js'
import { Bench } from 'tinybench'
import { Sha256 } from '@aws-crypto/sha256-js'
await wasm.default()

const bench = new Bench({ iterations: 100, name: 'SHA-256' })
bench.concurrency = null
bench.threshold = 1

function createData (size) {
  const data = new Uint8Array(size)

  const maxChunkSize = 65536

  for (let offset = 0; offset < size; offset += maxChunkSize) {
    data.set(crypto.getRandomValues(new Uint8Array(Math.min(maxChunkSize, size - offset))), offset)
  }

  return data
}

// Starting size: 8 bytes
const startSize = 8
// Ending size: 100 MB (100 * 1024 * 1024 bytes)
const endSize = 128 * 1024 * 1024

for (let size = startSize; size <= endSize; size *= 2) {
  // Create data of current size
  const data = createData(size)

  // Log information about the generated data
  console.log(`Bytes: ${data.length}, First 5 values: [${data.slice(0, 5)}]`)
  bench
    .add('WASM ' + data.length, () => {
      wasm.sha2(data)
    })
    .add('WebCrypto ' + data.length, async () => {
    // hash using web crypto
      await crypto.subtle.digest('SHA-256', data)
    })
    .add('JS ' + data.length, async () => {
      const hash = new Sha256()
      hash.update(data)
      await hash.digest()
    })
}

// bench
//   .add('WASM sha2 10MB', () => {
//     wasm.sha2(createData(endSize / 1000))
//   })
//   .add('WebCrypto 10MB', async () => {
//     // hash using web crypto
//     await crypto.subtle.digest('SHA-256', createData(endSize / 1000))
//   })
//   .add('JS 10MB', async () => {
//     const hash = new Sha256()
//     hash.update(createData(endSize / 1000))
//     await hash.digest()
//   })

const res = await bench.run()
// const res = []
// console.table(bench.table())
const text = JSON.stringify(res.map(({ name, result }) => {
  const res = { ...result }
  res.samples = res.samples.length
  res.latency.samples = res.latency?.samples.length
  res.throughput.samples = res.throughput?.samples.length
  return { name, result: res }
}))

// download as text file
const a = document.createElement('a')
a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
a.download = 'results.json'
a.click()
