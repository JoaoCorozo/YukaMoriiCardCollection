import { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import type { PokemonCard } from '../types/PokemonCard';
import localforage from 'localforage';

const DB_KEY = 'yuka-morii-cards-db';
const LEGACY_DB_KEY = 'pwa-pokemon-data';

export const usePokemonCards = () => {
    const [cards, setCards] = useState<PokemonCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            // 1. Check if we already have the full DB saved
            const localDB: PokemonCard[] | null = await localforage.getItem(DB_KEY);
            
            if (localDB && Array.isArray(localDB) && localDB.length > 0) {
                // Full Database already loaded previously, no need to parse Excel
                setCards(localDB);
                setLoading(false);
                return;
            }

            // 2. Fallback: Parse the Excel if it's the first time
            await performExcelSync(true);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            setLoading(false);
        }
    };

    const performExcelSync = async (isFirstTime: boolean) => {
        setLoading(true);
        try {
            const response = await fetch('/yuka_morii_cartas_Joao.xlsx');
            if (!response.ok) throw new Error('Failed to fetch Excel file');

            const arrayBuffer = await response.arrayBuffer();
            const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            const headerRowIndex = jsonData.findIndex(row => row[0] === '#');

            if (headerRowIndex === -1) {
                throw new Error('Could not find header row');
            }

            const headers = jsonData[headerRowIndex].map((h: any) => String(h).toLowerCase());
            const imageColIndex = headers.findIndex((h: string) => h.includes('imagen') || h.includes('link'));

            const rawData = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);

            // Recover pre-existing data logic dependent on if it's first run or a forced sync
            let userModifications: Record<string, { owned: boolean, imageUrl?: string }> = {};
            
            if (isFirstTime) {
                // Recover from old original app storage
                const legacyData: Record<string, { owned: boolean, imageUrl?: string }> | null =
                    await localforage.getItem(LEGACY_DB_KEY);
                userModifications = legacyData || {};
            } else {
                // We are forcing a reload from an existing setup, keep the current ownership!
                const currentDB: PokemonCard[] | null = await localforage.getItem(DB_KEY);
                if (currentDB && Array.isArray(currentDB)) {
                    currentDB.forEach(c => {
                        userModifications[c.id] = { owned: c.owned };
                    });
                }
            }

            // 3. Merge and Build DB
            const parsedCards: PokemonCard[] = rawData.map((row, index) => {
                const baseId = `${row[1]}-${row[2]}-${row[3]}-${row[4]}`;
                const id = `${baseId}-${index}`;

                let isOwned = String(row[7] || '').includes('Sí') || String(row[7] || '').includes('Si') || String(row[7] || '').includes('✅');
                let customImage = undefined;

                const defaultImage = imageColIndex !== -1 && row[imageColIndex] ? String(row[imageColIndex]).trim() : undefined;

                // Override ownership if there is local history
                if (userModifications[id] !== undefined) {
                    isOwned = userModifications[id].owned;
                    // On forced sync we don't restore old images to ensure we take Excel links
                    if (isFirstTime && userModifications[id].imageUrl) {
                        customImage = userModifications[id].imageUrl;
                    }
                }

                return {
                    id,
                    rank: Number(row[0]),
                    set: String(row[1] || ''),
                    pokemon: String(row[2] || ''),
                    number: String(row[3] || ''),
                    rarity: String(row[4] || ''),
                    variant: String(row[5] || ''),
                    price: Number(row[6]) || 0,
                    owned: isOwned,
                    imageUrl: customImage || defaultImage,
                };
            });

            parsedCards.sort((a, b) => b.price - a.price);

            // 4. Save the FULL DB for next time
            await localforage.setItem(DB_KEY, parsedCards);
            
            setCards(parsedCards);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Sync Failed: ' + err);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleOwnership = async (id: string) => {
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, owned: !card.owned } : card
            );
            localforage.setItem(DB_KEY, newCards).catch(console.error);
            return newCards;
        });
    };

    const updateCardImage = async (id: string, imageUrl: string) => {
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, imageUrl } : card
            );
            localforage.setItem(DB_KEY, newCards).catch(console.error);
            return newCards;
        });
    };

    const reloadDatabase = () => performExcelSync(false);

    return { cards, loading, error, toggleOwnership, updateCardImage, reloadDatabase };
};
