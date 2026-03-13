import xlsx from 'xlsx';
import fs from 'fs';

const filePath = './public/yuka_morii_cartas_Joao.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = xlsx.read(buffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log(JSON.stringify(data.slice(0, 3), null, 2));
