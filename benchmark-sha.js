import * as wasmSha from './pkg/sha_was.js'
import { Bench, Task } from 'tinybench'
import { Sha256 } from '@aws-crypto/sha256-js'

await wasmSha.default()

function createData(size) {
  const data = new Uint8Array(size)
  const maxChunkSize = 65536

  for (let offset = 0; offset < size; offset += maxChunkSize) {
    data.set(crypto.getRandomValues(new Uint8Array(Math.min(maxChunkSize, size - offset))), offset)
  }

  return data
}

const startSize = 8
const endSize = 128 * 1024 * 1024

const dataSizes = []
for (let size = startSize; size <= endSize; size *= 2) {
  dataSizes.push(size)
}

const wasmBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'SHA-256' })
wasmBench.concurrency = null
wasmBench.threshold = 1
const webCryptoBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'WebCrypto' })
webCryptoBench.concurrency = null
webCryptoBench.threshold = 1
const jsBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'JS' })
jsBench.concurrency = null
jsBench.threshold = 1

console.log('Setting up SHA-256 benchmarks...')
for (const size of dataSizes) {
  const data = createData(size)
  
  wasmBench.add(`${size}`, () => {
      wasmSha.sha2(data)
    })
  webCryptoBench.add(`${size}`, async () => {
      await crypto.subtle.digest('SHA-256', data)
    })
  jsBench.add(`${size}`, async () => {
      const hash = new Sha256()
      hash.update(data)
      await hash.digest()
    })
}

/**
 * @param {Task[]} results
 * @param {string} suite
 */
function processResults(results, suite) {
  const processedResults = results.map(({ name, result }) => {
    if (!result) return { name, suite, error: 'No result' }

    const latency = result.latency?.samples.length || 0
    const throughput = result.throughput?.samples.length || 0
    // @ts-ignore
    delete result.latency?.samples
    // @ts-ignore
    delete result.throughput?.samples
    
    return { 
      name, 
      suite,
      latency,
      throughput,
      result
    }
  })

  const resultsText = JSON.stringify(processedResults, null, 2)

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(new Blob([resultsText], { type: 'application/json' }))
  downloadLink.download = `${suite}-benchmark-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  downloadLink.textContent = 'Download SHA-256 Results'
  document.body.appendChild(downloadLink)
}

console.log('Running SHA-256 benchmarks...')
processResults(await wasmBench.run(), 'wasm-sha')
console.table(wasmBench.table())
processResults(await webCryptoBench.run(), 'web-crypto')
console.table(webCryptoBench.table())
processResults(await jsBench.run(), 'js')
console.table(jsBench.table())

console.log('Benchmarking completed!')
