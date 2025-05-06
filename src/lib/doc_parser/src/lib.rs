use neon::prelude::*;
use shiva::{core::TransformerTrait, xlsx, csv};
use std::fs;
use bytes::Bytes;


fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("Hello, World"))  
}


fn xlsx_to_csv(mut cx: FunctionContext) -> JsResult<JsString> {
    let path = cx.argument::<JsString>(0)?.value(&mut cx);

    let input = match fs::read(path) {
        Ok(bytes) => Bytes::from(bytes),
        Err(e) => return cx.throw_error(format!("Failed to read file: {}", e)),
    };

    let document = match xlsx::Transformer::parse(&input) {
        Ok(doc) => doc,
        Err(e) => return cx.throw_error(format!("Failed to parse XLSX: {}", e)),
    };

    let csv_bytes = match csv::Transformer::generate(&document) {
        Ok(csv) => csv,
        Err(e) => return cx.throw_error(format!("Failed to generate CSV: {}", e)),
    };

    let csv_string = String::from_utf8(csv_bytes.to_vec())
    .unwrap_or_else(|_| "Invalid UTF-8 string".to_string());

    Ok(cx.string(csv_string))
}



#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("xlsx_to_csv", xlsx_to_csv)?;
    Ok(())
}
