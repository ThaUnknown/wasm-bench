import * as wasmGzip from './pkg-gzip/gzip_wasm.js'
import { Bench, Task } from 'tinybench'
import pako from 'pako'

await wasmGzip.default()

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

const wasmBench = new Bench({ name: 'GZIP', iterations: 10, time: 10000, warmupIterations: 5 })
wasmBench.concurrency = null
wasmBench.threshold = 1
const compressionStreamBench = new Bench({ name: 'CompressionStream', iterations: 10, time: 10000, warmupIterations: 5 })
compressionStreamBench.concurrency = null
compressionStreamBench.threshold = 1
const pakoBench = new Bench({ name: 'Pako', iterations: 10, time: 10000, warmupIterations: 5 })
pakoBench.concurrency = null
pakoBench.threshold = 1

console.log('Setting up GZIP benchmarks...')
for (const size of dataSizes) {
  const data = createData(size)
  
  wasmBench.add(`${size}`, () => {
      return wasmGzip.gzip_compress(data)
    })
  compressionStreamBench.add(`${size}`, async () => {
      const { writable, readable } = new CompressionStream('gzip')
      const writer = writable.getWriter()
      
      writer.write(data)
      writer.close()
      
      return await new Response(readable).arrayBuffer()
    })
  pakoBench.add(`${size}`, () => {
      return pako.gzip(data)
    })
}

/**
 * @param {Task[]} results 
 */
function processResults(results) {
  const processedResults = results.map(({ name, result }) => {
    if (!result) return { name, suite: 'GZIP', error: 'No result' }
    
    return { 
      name, 
      suite: 'GZIP',
      latency: result.latency?.samples?.length || 0,
      throughput: result.throughput?.samples?.length || 0,
      hz: result.throughput?.mean || 0,
      mean: result.latency?.mean || 0,
      sd: result.latency?.sd || 0,
      min: result.latency?.min || 0,
      max: result.latency?.max || 0,
      p99: result.latency?.p99 || 0,
      p995: result.latency?.p995 || 0,
      p75: result.latency?.p75 || 0
    }
  })

  const resultsText = JSON.stringify(processedResults, null, 2)

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(new Blob([resultsText], { type: 'application/json' }))
  downloadLink.download = `gzip-benchmark-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  downloadLink.textContent = 'Download GZIP Results'
  document.body.appendChild(downloadLink)
}

console.log('Running GZIP benchmarks...')
processResults(await wasmBench.run())
console.table(wasmBench.table())
processResults(await compressionStreamBench.run())
console.table(compressionStreamBench.table())
processResults(await pakoBench.run())
console.table(pakoBench.table())

console.log('Benchmarking completed!')
