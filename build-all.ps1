# Set WASM SIMD flags for maximum performance
$env:RUSTFLAGS = "-C target-feature=+simd128,+relaxed-simd,+bulk-memory,+mutable-globals"

# Build SHA-256 WASM
Write-Host "Building SHA-256 WASM..."
wasm-pack build --target web --release --out-dir pkg

# Build Gzip WASM
Write-Host "Building Gzip WASM..."
Set-Location gzip-wasm
wasm-pack build --target web --release --out-dir ../pkg-gzip
Set-Location ..

# Build PNG WASM
Write-Host "Building PNG WASM..."
Set-Location png-wasm
wasm-pack build --target web --release --out-dir ../pkg-png
Set-Location ..

Write-Host "All WASM modules built successfully!"
