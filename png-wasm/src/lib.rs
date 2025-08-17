use wasm_bindgen::prelude::*;
use png::{BitDepth, ColorType, Encoder, Compression};
use std::io::Cursor;

#[wasm_bindgen]
pub fn encode_png(rgba_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let mut buffer = Vec::new();
    {
        // 32-bit RGB+alpha, non-interlaced
        let cursor = Cursor::new(&mut buffer);
        let mut encoder = Encoder::new(cursor, width, height);
        encoder.set_color(ColorType::Rgba);
        encoder.set_depth(BitDepth::Eight);
        encoder.set_compression(Compression::Default);
        
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(rgba_data).unwrap();
    }
    buffer
}
