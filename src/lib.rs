use sha2::{Sha256, Digest};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash_sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

#[wasm_bindgen]
pub fn test_hash() -> Vec<u8> {
    hash_sha256(b"hello")
}