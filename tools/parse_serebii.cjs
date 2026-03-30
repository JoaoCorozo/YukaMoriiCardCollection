const fs = require('fs');
const xlsx = require('xlsx');

function normalize(str) {
    if(!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseSerebii() {
    const raw = fs.readFileSync('tools/raw_list.txt', 'utf8');
    const lines = raw.split('\n').map(l => l.replace(/\r/g, ''));
    
    const cards = [];
    
    for(let i=0; i<lines.length; i++) {
        const line = lines[i];
        
        const parts = line.split('\t').filter(p => p.trim() !== '');
        
        if (parts.length >= 2 && line.startsWith('\t')) {
            let currentCard = {
                pokemon: parts[0].trim(),
                set: parts[1].trim(),
                number: '',
                rarity: 'Common'
            };
            
            if (i + 1 < lines.length) {
                const numLine = lines[i+1].trim();
                const numParts = numLine.split(' / ');
                if (numParts.length > 0) {
                    currentCard.number = numParts[0].trim();
                }
            }
            
            cards.push(currentCard);
        }
    }
    return cards;
}

function updateExcel() {
    const newCards = parseSerebii();
    console.log(`Parsed ${newCards.length} cards from Serebii list.`);
    
    const filePath = './public/yuka_morii_cartas_Joao.xlsx';
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    const headerRowIndex = jsonData.findIndex(row => row[0] === '#');
    const headers = jsonData[headerRowIndex];
    const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);
    
    console.log(`Found ${dataRows.length} existing cards in Excel.`);
    
    const existingMap = new Map();
    // Some serebii numbers don't match exactly maybe? 
    // We will index by Set + Pokemon + Number, but also store Set + Pokemon as fallback
    
    dataRows.forEach(row => {
        const set = normalize(row[1]);
        const pkmn = normalize(row[2]);
        const num = normalize(row[3]);
        
        existingMap.set(`${set}-${pkmn}-${num}`, row);
        if (!existingMap.has(`${set}-${pkmn}`)) {
            existingMap.set(`${set}-${pkmn}`, row); // loose match fallback
        }
    });

    const newDataRows = [];
    
    newCards.forEach((c, index) => {
        const strictKey = `${normalize(c.set)}-${normalize(c.pokemon)}-${normalize(c.number)}`;
        const looseKey = `${normalize(c.set)}-${normalize(c.pokemon)}`;
        
        let oldRow = existingMap.get(strictKey);
        if (!oldRow) {
             oldRow = existingMap.get(looseKey);
        }
        
        if (oldRow) {
            // Found a match!
            oldRow[0] = index + 1; 
            oldRow[1] = c.set;
            oldRow[2] = c.pokemon;
            oldRow[3] = c.number;
            newDataRows.push(oldRow);
        } else {
            // Brand new card
            const newRow = [];
            newRow[0] = index + 1; 
            newRow[1] = c.set;     
            newRow[2] = c.pokemon; 
            newRow[3] = c.number;  
            newRow[4] = c.rarity;  
            newRow[5] = '';        
            newRow[6] = 0;         
            newRow[7] = '❌ No';    
            
            const imgCol = headers.findIndex(h => String(h).toLowerCase().includes('imagen'));
            if (imgCol !== -1) {
                newRow[imgCol] = '';
            }
            
            newDataRows.push(newRow);
            console.log(`(+) Añadiendo: ${c.pokemon} (${c.set} #${c.number})`);
        }
    });
    
    const finalData = [];
    for(let j=0; j < headerRowIndex; j++) {
        finalData.push(jsonData[j]);
    }
    finalData.push(headers);
    for(let r=0; r < newDataRows.length; r++) {
        while(newDataRows[r].length < headers.length) {
            newDataRows[r].push('');
        }
        finalData.push(newDataRows[r]);
    }
    
    workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(finalData);
    xlsx.writeFile(workbook, filePath);
    
    console.log(`\n¡Éxito! Base de datos de PWA actualizada a ${newDataRows.length} cartas.`);
}

updateExcel();
