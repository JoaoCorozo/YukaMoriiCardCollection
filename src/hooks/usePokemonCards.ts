import { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import type { PokemonCard } from '../types/PokemonCard';
import localforage from 'localforage';

export const usePokemonCards = () => {
    const [cards, setCards] = useState<PokemonCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch original Excel data
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

                // Identify the "ImagenLink" column index dynamically
                const headers = jsonData[headerRowIndex].map((h: any) => String(h).toLowerCase());
                const imageColIndex = headers.findIndex((h: string) => h.includes('imagen') || h.includes('link'));

                const rawData = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);

                // 2. Load persisted data from localforage (own status and custom images)
                const savedData: Record<string, { owned: boolean, imageUrl?: string }> | null =
                    await localforage.getItem('pwa-pokemon-data');
                const userModifications = savedData || {};

                // 3. Merge Excel Data with Persisted Data
                const parsedCards: PokemonCard[] = rawData.map((row, index) => {
                    const baseId = `${row[1]}-${row[2]}-${row[3]}-${row[4]}`;
                    const id = `${baseId}-${index}`;

                    let isOwned = String(row[7] || '').includes('Sí') || String(row[7] || '').includes('Si') || String(row[7] || '').includes('✅');
                    let customImage = undefined;

                    // Default image from Excel, if the column exists
                    const defaultImage = imageColIndex !== -1 && row[imageColIndex] ? String(row[imageColIndex]).trim() : undefined;

                    // Override with local state if it exists
                    if (userModifications[id] !== undefined) {
                        isOwned = userModifications[id].owned;
                        customImage = userModifications[id].imageUrl;
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

                // Sort by price descending
                parsedCards.sort((a, b) => b.price - a.price);

                setCards(parsedCards);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const toggleOwnership = async (id: string) => {
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, owned: !card.owned } : card
            );

            // Fire and forget save
            setTimeout(() => {
                const dataToSave = newCards.reduce((acc, card) => {
                    if (card.owned || card.imageUrl) {
                        acc[card.id] = { owned: card.owned, imageUrl: card.imageUrl };
                    }
                    return acc;
                }, {} as Record<string, { owned: boolean, imageUrl?: string }>);
                localforage.setItem('pwa-pokemon-data', dataToSave).catch(console.error);
            }, 0);

            return newCards;
        });
    };

    const updateCardImage = async (id: string, imageUrl: string) => {
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, imageUrl } : card
            );

            // Fire and forget save
            setTimeout(() => {
                const dataToSave = newCards.reduce((acc, card) => {
                    if (card.owned || card.imageUrl) {
                        acc[card.id] = { owned: card.owned, imageUrl: card.imageUrl };
                    }
                    return acc;
                }, {} as Record<string, { owned: boolean, imageUrl?: string }>);
                localforage.setItem('pwa-pokemon-data', dataToSave).catch(console.error);
            }, 0);

            return newCards;
        });
    };

    return { cards, loading, error, toggleOwnership, updateCardImage };
};
