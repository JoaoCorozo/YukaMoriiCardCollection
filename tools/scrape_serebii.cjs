const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');

async function scrapeSerebii() {
    console.log("Fetching Serebii page...");
    const url = 'https://www.serebii.net/card/dex/artist/yukamorii.shtml';
    
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        
        const $ = cheerio.load(data);
        const cards = [];
        let currentSet = "Unknown Set";
        
        // Serebii card list tables usually have "dextable" class
        $('table.dextable tr').each((i, row) => {
            const tds = $(row).find('td');
            
            // If it has class "foo" and colspan 4 or 5, it's a Set Header usually
            if ($(row).find('td.foo').length > 0) {
                currentSet = $(row).find('td.foo a').text().trim() || $(row).find('td.foo').text().trim();
                return;
            }
            
            // Card rows usually have Image, Name, Card Type, Set, etc
            if (tds.length >= 3) {
                const imgCell = $(tds[0]).find('img');
                const nameCell = $(tds[1]).find('a');
                
                if (nameCell.length > 0) {
                    const pokemonName = nameCell.text().trim();
                    const cardLink = "https://www.serebii.net" + nameCell.attr('href');
                    const imgUrl = "https://www.serebii.net" + imgCell.attr('src');
                    
                    // The 3rd td is usually card type, 4th might be number (or part of 2nd)
                    let cardNumber = $(tds[3]).text().trim();
                    if (!cardNumber || isNaN(parseInt(cardNumber))) {
                        // Sometimes the number is in the 2nd cell next to the name, or in 4th
                        cardNumber = $(tds[2]).text().trim(); 
                    }
                    
                    if (pokemonName && pokemonName !== 'Name') {
                         cards.push({
                             set: currentSet,
                             pokemon: pokemonName,
                             number: cardNumber.replace(/[^a-zA-Z0-9]/g, ''),
                             imageUrl: imgUrl
                         });
                    }
                }
            }
        });

        console.log(`Found ${cards.length} cards from Serebii.`);
        
        if (cards.length > 0) {
           console.log("First 5 Serebii Cards:", cards.slice(0, 5));
        }

    } catch (err) {
        console.error("Error fetching or parsing:", err.message);
    }
}

scrapeSerebii();
