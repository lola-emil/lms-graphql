use bytes::Bytes;
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon_serde4::from_value;
use serde::Deserialize;
use serde_json::Value;
use shiva::{core::Document, core::Element, core::TransformerTrait, csv, xlsx, xlsx::Transformer};
use std::fs;


use shiva::csv::Transformer as CsvTransformer;
use shiva::xlsx::Transformer as XlsxTransformer;



#[derive(Deserialize)]
struct Record {
    #[serde(flatten)]
    fields: std::collections::HashMap<String, serde_json::Value>,
}

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

fn to_xlsx(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let js_array = cx.argument::<JsArray>(0)?;
    let js_len = js_array.len(&mut cx);

    let mut records: Vec<Record> = Vec::new();

    for i in 0..js_len {
        let js_value: Handle<JsValue> = js_array.get(&mut cx, i)?;
        let js_obj: Handle<JsObject> = js_value.downcast_or_throw::<JsObject, _>(&mut cx)?;
        let json_value: Value = match from_value(&mut cx, js_obj.upcast()) {
            Ok(val) => val,
            Err(e) => return cx.throw_error(e.to_string()),
        };
        let record: Record = serde_json::from_value(json_value).unwrap();
        records.push(record);
    }

    // Prepare headers
    let headers: Vec<String> = if let Some(first) = records.get(0) {
        first.fields.keys().cloned().collect()
    } else {
        return cx.throw_error("Array is empty");
    };

    // Convert records to rows
    let rows: Vec<Vec<String>> = records
        .iter()
        .map(|record| {
            headers
                .iter()
                .map(|key| {
                    record
                        .fields
                        .get(key)
                        .map(|v| v.to_string())
                        .unwrap_or_default()
                })
                .collect()
        })
        .collect();

    // Create Elements from rows
    let elements: Vec<Element> = rows
        .iter()
        .map(|row| {
            // Map each row to an Element
            // This is a placeholder; you'll need to define how to map your data
            Element::Text {
                text: row.join("\t"), // Joining row values with tabs or commas
                size: 12,             // font size ni siya
            } // Replace with actual mapping
        })
        .collect();

    // Create the Document
    let document = Document::new(elements);

    // Generate XLSX bytes
    let xlsx_bytes = Transformer::generate(&document).unwrap();

    // Convert to JsBuffer
    let mut js_buffer = JsBuffer::new(&mut cx, xlsx_bytes.len())?;

    // Copy bytes into the buffer slice
    js_buffer.as_mut_slice(&mut cx).copy_from_slice(&xlsx_bytes);

    // Return the JsBuffer handle
    Ok(js_buffer)
}

fn csv_to_xlsx(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    // Get CSV string from JS argument
    let csv_string = cx.argument::<JsString>(0)?.value(&mut cx);

    // Convert to bytes
    let input_bytes = Bytes::from(csv_string);

    // Parse CSV into shiva Document
    let document = match CsvTransformer::parse(&input_bytes) {
        Ok(doc) => doc,
        Err(e) => return cx.throw_error(format!("CSV parse error: {}", e)),
    };

    // Debug: print number of elements in Document
    println!("Document has {:?} elements", document);

    // Generate XLSX bytes from Document
    let xlsx_bytes = match XlsxTransformer::generate(&document) {
        Ok(buf) => buf,
        Err(e) => return cx.throw_error(format!("XLSX generate error: {}", e)),
    };

    // Create JsBuffer and copy bytes
    let mut js_buffer = JsBuffer::new(&mut cx, xlsx_bytes.len())?;
    js_buffer.as_mut_slice(&mut cx).copy_from_slice(&xlsx_bytes);

    println!("XLSX bytes length: {}", xlsx_bytes.len());

    Ok(js_buffer)
}
#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("xlsx_to_csv", xlsx_to_csv)?;
    cx.export_function("arr_to_xlsx", to_xlsx)?;
    cx.export_function("csv_to_xlsx", csv_to_xlsx)?;
    Ok(())
}
