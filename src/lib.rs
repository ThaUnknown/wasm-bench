use blake3;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[target_feature(enable = "simd128")]
pub fn hash_sha256(data: &[u8]) -> Vec<u8> {
    blake3::hash(data).as_bytes().to_vec()
}

#[wasm_bindgen]
pub fn test_hash() -> Vec<u8> {
    hash_sha256(b"hello")
}