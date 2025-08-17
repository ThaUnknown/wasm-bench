use wasm_bindgen::prelude::*;
use flate2::{Compression, write::GzEncoder, read::GzDecoder};
use std::io::prelude::*;

#[wasm_bindgen]
pub fn gzip_compress(data: &[u8]) -> Vec<u8> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
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

// #[wasm_bindgen]
// pub fn test_simd_support() -> bool {
//     // Check if SIMD is available by testing cfg
//     cfg!(target_feature = "simd128")
// }

// #[wasm_bindgen]
// pub fn test_simd_operation(data: &[u8]) -> Vec<u8> {
//     // Simple SIMD test: add 1 to each byte using vectorized operations
//     let mut result = Vec::with_capacity(data.len());
    
//     #[cfg(target_feature = "simd128")]
//     {
//         use std::arch::wasm32::*;
        
//         let chunks = data.chunks_exact(16);
//         let remainder = chunks.remainder();
        
//         for chunk in chunks {
//             unsafe {
//                 // Load 16 bytes into a SIMD vector
//                 let vec = v128_load(chunk.as_ptr() as *const v128);
                
//                 // Add 1 to each byte
//                 let ones = u8x16_splat(1);
//                 let added = u8x16_add(vec, ones);
                
//                 // Store result
//                 let mut temp = [0u8; 16];
//                 v128_store(temp.as_mut_ptr() as *mut v128, added);
//                 result.extend_from_slice(&temp);
//             }
//         }
        
//         // Handle remainder bytes
//         for &byte in remainder {
//             result.push(byte.wrapping_add(1));
//         }
//     }
    
//     // #[cfg(not(target_feature = "simd128"))]
//     // {
//     //     // Fallback: scalar addition
//     //     for &byte in data {
//     //         result.push(byte.wrapping_add(1));
//     //     }
//     // }
    
//     result
// }
