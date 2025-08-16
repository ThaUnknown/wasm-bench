use wasm_bindgen::prelude::*;
use flate2::{Compression, write::GzEncoder, read::GzDecoder};
use std::io::prelude::*;

#[wasm_bindgen]
pub fn gzip_compress(data: &[u8]) -> Vec<u8> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::fast());
    encoder.write_all(data).unwrap();
    encoder.finish().unwrap()
}

#[wasm_bindgen]
pub fn gzip_decompress(data: &[u8]) -> Vec<u8> {
    let mut decoder = GzDecoder::new(data);
    let mut result = Vec::new();
    decoder.read_to_end(&mut result).unwrap();
    result
}
