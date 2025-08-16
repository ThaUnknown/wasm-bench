import * as wasmPng from './pkg-png/png_wasm.js'
import { Bench, Task } from 'tinybench'
import { PNG } from 'pngjs/browser'

await wasmPng.default()

function createRGBAData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4)
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.floor(Math.random() * 256)     // R
    data[i + 1] = Math.floor(Math.random() * 256) // G
    data[i + 2] = Math.floor(Math.random() * 256) // B
    data[i + 3] = 255                             // A (full opacity)
  }
  
  return data
}

const imageSizes = [
  { width: 64, height: 64 },
  { width: 128, height: 128 },
  { width: 256, height: 256 },
  { width: 512, height: 512 },
  { width: 1024, height: 1024 },
  { width: 2048, height: 2048 },
  { width: 4096, height: 4096 }
]

const wasmBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'WASM' })
wasmBench.concurrency = null
wasmBench.threshold = 1
const canvasBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'Canvas' })
canvasBench.concurrency = null
canvasBench.threshold = 1
const pngjsBench = new Bench({ iterations: 10, time: 10000, warmupIterations: 5, name: 'PNGJS' })
pngjsBench.concurrency = null
pngjsBench.threshold = 1

console.log('Setting up PNG benchmarks...')
for (const { width, height } of imageSizes) {
  const imageData = new ImageData(createRGBAData(width, height), width, height)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) throw new Error('Could not get canvas context')

  wasmBench
    .add(`${width}`, () => {
      // @ts-ignore
      wasmPng.encode_png(imageData.data, width, height)
    })
  canvasBench.add(`${width}`, async () => {
      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL('image/png')
    })
  pngjsBench.add(`${width}`, () => {
      const png = new PNG({ width, height })
      
      png.data.set(imageData.data)
      
      return PNG.sync.write(png)
    })
}

/**
 * @param {Task[]} results
 * @param {string} suite
 */
function processResults(results, suite) {
  const processedResults = results.map(({ name, result }) => {
    if (!result) return { name, suite, error: 'No result' }
    
    return { 
      name, 
      suite,
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
  downloadLink.download = `${suite}-benchmark-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  downloadLink.textContent = 'Download PNG Results'
  document.body.appendChild(downloadLink)
}

console.log('Running PNG benchmarks...')
processResults(await wasmBench.run(), 'wasm-png')
console.table(wasmBench.table())
processResults(await canvasBench.run(), 'canvas')
console.table(canvasBench.table())
processResults(await pngjsBench.run(), 'pngjs')
console.table(pngjsBench.table())

console.log('Benchmarking completed!')
