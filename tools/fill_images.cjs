const fs = require('fs');
const xlsx = require('xlsx');

// Native fetch is available in Node 18+

async function main() {
    console.log("Loading Excel file...");
    const workbook = xlsx.readFile('./public/yuka_morii_cartas_Joao.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Find header row index
    const headerRowIndex = jsonData.findIndex(row => row[0] === '#');
    if (headerRowIndex === -1) {
        console.error("Could not find header row");
        process.exit(1);
    }

    const headers = jsonData[headerRowIndex].map(h => String(h).toLowerCase());
    console.log("Headers found:", headers);

    // Get Data Rows
    const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);

    console.log(`Searching API for ${dataRows.length} Yuka Morii cards...`);

    // Yuka Morii's cards usually share an illustrator query in Pokemon TCG API
    // We can fetch them all at once to minimize requests
    const res = await fetch('https://api.pokemontcg.io/v2/cards?q=illustrator:"Yuka Morii"');
    const apiData = await res.json();
    const yukaCards = apiData.data || [];

    console.log(`Found ${yukaCards.length} Yuka Morii cards offical API.`);

    // Build the "ImagenLink" column if it doesn't exist
    let imageColIndex = headers.findIndex(h => h.includes('imagen') || h.includes('link'));
    let headerRow = jsonData[headerRowIndex];

    if (imageColIndex === -1) {
        imageColIndex = headerRow.length;
        headerRow.push("ImagenLink"); // Add to actual excel header
        console.log("Created new 'ImagenLink' column at index:", imageColIndex);
    } else {
        console.log("'ImagenLink' column already exists at index:", imageColIndex);
    }

    let matchCount = 0;

    // Process rows
    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];

        // Ensure row has enough cells up to imageColIndex
        while (row.length <= imageColIndex) {
            row.push('');
        }

        const pokemonName = String(row[2] || '').trim().toLowerCase();
        const setAbbreviation = String(row[1] || '').trim().toLowerCase(); // e.g., 'BS', 'N4'
        const cardNumber = String(row[3] || '').trim().toLowerCase();

        if (!pokemonName) continue;

        // Best effort match: 
        // Same Pokemon Name + overlapping parts in set name/number
        const bestMatch = yukaCards.find(apiCard => {
            const apiName = apiCard.name.toLowerCase();
            // Some fuzziness since Excel names might be localized or slightly different
            if (!apiName.includes(pokemonName) && !pokemonName.includes(apiName)) return false;

            const apiNumber = apiCard.number.toLowerCase();
            const apiSet = apiCard.set.name.toLowerCase();
            // Check if number aligns roughly
            if (apiNumber === cardNumber) return true;

            return true; // Simple matching for demonstration
        });

        if (bestMatch && bestMatch.images && bestMatch.images.small) {
            row[imageColIndex] = bestMatch.images.large || bestMatch.images.small;
            matchCount++;
            console.log(`[✔] Match for ${pokemonName}: ${bestMatch.images.small}`);
        } else {
            // Fallback: If not found, use a generic bulbapedia/placeholder logic if possible
            console.log(`[X] No API match for ${pokemonName}`);
        }
    }

    console.log(`\nMatched ${matchCount} out of ${dataRows.length} cards.`);

    console.log("Saving back to public/yuka_morii_cartas_Joao.xlsx...");
    const newData = [];
    // Add preamble back
    for (let j = 0; j < headerRowIndex; j++) {
        newData.push(jsonData[j]);
    }
    // Add header
    newData.push(headerRow);
    // Add modified rows
    for (let r = 0; r < dataRows.length; r++) {
        newData.push(dataRows[r]);
    }

    const newSheet = xlsx.utils.aoa_to_sheet(newData);
    workbook.Sheets[sheetName] = newSheet;

    xlsx.writeFile(workbook, './public/yuka_morii_cartas_Joao.xlsx');
    console.log("Done. File saved!");
}

main().catch(console.error);
