#!/bin/bash

# Build SHA-256 WASM
echo "Building SHA-256 WASM..."
wasm-pack build --target web --release --out-dir pkg

# Build Gzip WASM
echo "Building Gzip WASM..."
cd gzip-wasm
wasm-pack build --target web --release --out-dir ../pkg-gzip
cd ..

# Build PNG WASM
echo "Building PNG WASM..."
cd png-wasm
wasm-pack build --target web --release --out-dir ../pkg-png
cd ..

echo "All WASM modules built successfully!"
