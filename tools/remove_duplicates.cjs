const xlsx = require('xlsx');

function removeDuplicates() {
    console.log("Cargando el archivo Excel...");
    const filePath = './public/yuka_morii_cartas_Joao.xlsx';
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find header row index
    const headerRowIndex = jsonData.findIndex(row => row[0] === '#');
    if (headerRowIndex === -1) {
        console.error("No se encontró la fila de cabeceras.");
        process.exit(1);
    }

    const headers = jsonData[headerRowIndex];
    console.log("Cabeceras encontradas:", headers);

    const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);
    console.log(`\nTotal de cartas originales: ${dataRows.length}`);

    const uniqueCards = new Map();
    const cleanDataRows = [];
    let duplicatesRemoved = 0;

    dataRows.forEach(row => {
        // Build a unique key for the card: Set + Pokemon + Number
        const setName = String(row[1] || '').trim().toLowerCase();
        const pokemonName = String(row[2] || '').trim().toLowerCase();
        const cardNumber = String(row[3] || '').trim().toLowerCase();

        const uniqueKey = `${setName}-${pokemonName}-${cardNumber}`;

        // If we haven't seen this card before, keep it
        if (!uniqueCards.has(uniqueKey)) {
            uniqueCards.set(uniqueKey, true);
            cleanDataRows.push(row);
        } else {
            console.log(`[DUPLICADO ELIMINADO]: ${pokemonName} (${setName} #${cardNumber})`);
            duplicatesRemoved++;
            // Note: If you want to keep the variant with higher price, 
            // you could compare row[6] here and replace the existing one in cleanDataRows.
            // But usually first occurrence is fine.
        }
    });

    console.log(`\nCartas únicas conservadas: ${cleanDataRows.length}`);
    console.log(`Duplicados eliminados: ${duplicatesRemoved}`);

    // Rebuild the data array
    const newData = [];
    // 1. Add everything before headers
    for (let j = 0; j < headerRowIndex; j++) {
        newData.push(jsonData[j]);
    }
    // 2. Add header
    newData.push(headers);
    // 3. Add clean data rows
    for (let r = 0; r < cleanDataRows.length; r++) {
        // Re-number the '#' column so it stays ordered
        cleanDataRows[r][0] = r + 1;
        newData.push(cleanDataRows[r]);
    }

    // Convert back to sheet and overwrite
    console.log("Guardando datos limpios...");
    const newSheet = xlsx.utils.aoa_to_sheet(newData);
    workbook.Sheets[sheetName] = newSheet;

    xlsx.writeFile(workbook, filePath);
    console.log("¡Archivo Excel sobreescrito con éxito!");
}

removeDuplicates();
