const xlsx = require('xlsx');

function inspect() {
    const workbook = xlsx.readFile('./public/yuka_morii_cartas_Joao.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const headerRowIndex = jsonData.findIndex(row => row[0] === '#');
    if (headerRowIndex === -1) {
        console.error("No header row found");
        return;
    }

    const headers = jsonData[headerRowIndex];
    console.log("=== HEADERS ===");
    console.log(headers);

    const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);
    console.log("\n=== FIRST 2 ROWS OF DATA ===");
    console.log(dataRows[0]);
    console.log(dataRows[1]);
}

inspect();
