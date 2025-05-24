const { csv_to_xlsx } = require("./index.node");
const fs = require("fs")

function objectsToCsv(data, options = {}) {
    if (!Array.isArray(data) || data.length === 0) return '';

    const delimiter = options.delimiter || ',';
    const quote = options.quote || '"';

    // Collect all keys from the first object as headers
    const headers = Object.keys(data[0]);

    // Convert a value safely, quoting if needed
    const escapeValue = (value) => {
        const str = value != null ? String(value) : '';
        if (str.includes(delimiter) || str.includes('\n') || str.includes(quote)) {
            return quote + str.replace(new RegExp(quote, 'g'), quote + quote) + quote;
        }
        return str;
    };

    // Header row
    const csv = [
        headers.map(escapeValue).join(delimiter),
        ...data.map(row =>
            headers.map(header => escapeValue(row[header])).join(delimiter)
        )
    ];

    return csv.join('\n');
}


async function main() {
    const data = [
        { id: 1, name: "Alice", age: 30, email: "alice@example.com", active: true },
        { id: 2, name: "Bob", age: 25, email: "bob@example.com", active: false },
        { id: 3, name: "Charlie", age: 28, email: "charlie@example.com", active: true },
        { id: 4, name: "Diana", age: 32, email: "diana@example.com", active: true },
        { id: 5, name: "Ethan", age: 27, email: "ethan@example.com", active: false },
        { id: 6, name: "Fiona", age: 35, email: "fiona@example.com", active: true },
        { id: 7, name: "George", age: 29, email: "george@example.com", active: true },
        { id: 8, name: "Hannah", age: 31, email: "hannah@example.com", active: false },
        { id: 9, name: "Ian", age: 26, email: "ian@example.com", active: true },
        { id: 10, name: "Julia", age: 33, email: "julia@example.com", active: true },
        { id: 11, name: "Kevin", age: 24, email: "kevin@example.com", active: false },
        { id: 12, name: "Laura", age: 30, email: "laura@example.com", active: true },
        { id: 13, name: "Mike", age: 28, email: "mike@example.com", active: true },
        { id: 14, name: "Nina", age: 27, email: "nina@example.com", active: false },
        { id: 15, name: "Oscar", age: 34, email: "oscar@example.com", active: true },
        { id: 16, name: "Paula", age: 29, email: "paula@example.com", active: true },
        { id: 17, name: "Quinn", age: 31, email: "quinn@example.com", active: false },
        { id: 18, name: "Rachel", age: 26, email: "rachel@example.com", active: true },
        { id: 19, name: "Steve", age: 32, email: "steve@example.com", active: true },
        { id: 20, name: "Tina", age: 25, email: "tina@example.com", active: false }
    ];


    const csv = objectsToCsv(data);
    const buffer = csv_to_xlsx(csv);

    console.log({
        data,
        csv
    })

    fs.writeFileSync("./output.xlsx", Buffer.from(buffer))
}


main();