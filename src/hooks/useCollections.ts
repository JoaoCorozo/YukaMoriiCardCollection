import { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import localforage from 'localforage';
import type { PokemonCard } from '../types/PokemonCard';
import type { CollectionItem } from '../types/Collection';

const INDEX_KEY = 'pokemon-collections-index';

const PREDEFINED_COLLECTIONS: CollectionItem[] = [
    {
        id: 'yuka-morii',
        title: 'Yuka Morii Art Collection',
        description: 'Todas las cartas ilustradas por Yuka Morii',
        type: 'official',
        totalCards: 0,
        ownedCards: 0,
        excelUrl: '/yuka_morii_cartas_Joao.xlsx',
        coverImageUrl: '/apple-touch-icon.png'
    }
];

export const useCollections = () => {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [activeCollection, setActiveCollection] = useState<CollectionItem | null>(null);
    const [cards, setCards] = useState<PokemonCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial load of collections index
    useEffect(() => {
        const loadIndex = async () => {
            try {
                let index: CollectionItem[] | null = await localforage.getItem(INDEX_KEY);
                
                if (!index || index.length === 0) {
                    // Initialize with predefined
                    index = [...PREDEFINED_COLLECTIONS];
                    await localforage.setItem(INDEX_KEY, index);
                } else {
                    // Ensure predefined exist inside index just in case
                    const newIndex = [...index];
                    let modified = false;
                    PREDEFINED_COLLECTIONS.forEach(pre => {
                        if (!newIndex.find(c => c.id === pre.id)) {
                            newIndex.push(pre);
                            modified = true;
                        }
                    });
                    if (modified) {
                        index = newIndex;
                        await localforage.setItem(INDEX_KEY, index);
                    }
                }
                setCollections(index);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        loadIndex();
    }, []);

    const updateCollectionStats = async (collectionId: string, currentCards: PokemonCard[]) => {
        const total = currentCards.length;
        const owned = currentCards.filter(c => c.owned).length;
        
        setCollections(prev => {
            const next = prev.map(c => c.id === collectionId ? { ...c, totalCards: total, ownedCards: owned } : c);
            localforage.setItem(INDEX_KEY, next).catch(console.error);
            if (activeCollection && activeCollection.id === collectionId) {
                setActiveCollection(next.find(c => c.id === collectionId) || null);
            }
            return next;
        });
    };

    const loadCollection = async (collectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const col = collections.find(c => c.id === collectionId);
            if (!col) throw new Error('Colección no encontrada');
            setActiveCollection(col);

            const dbKey = `collection-data-${collectionId}`;
            // MIGRATION HELPER: map old 'yuka-morii-cards-db' to 'collection-data-yuka-morii'
            if (collectionId === 'yuka-morii') {
                const legacyFullDB: PokemonCard[] | null = await localforage.getItem('yuka-morii-cards-db');
                if (legacyFullDB && legacyFullDB.length > 0) {
                    const currentNewDB: PokemonCard[] | null = await localforage.getItem(dbKey);
                    if (!currentNewDB) {
                        await localforage.setItem(dbKey, legacyFullDB);
                    }
                }
            }

            const localDB: PokemonCard[] | null = await localforage.getItem(dbKey);

            if (localDB && Array.isArray(localDB) && localDB.length > 0) {
                setCards(localDB);
                updateCollectionStats(collectionId, localDB);
                setLoading(false);
                return;
            }

            // Fallback: load from URL if available
            if (col.excelUrl) {
                await performUrlSync(col, false);
            } else {
                setCards([]);
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error cargando colección');
            setLoading(false);
        }
    };

    const performUrlSync = async (col: CollectionItem, forceSync: boolean) => {
        setLoading(true);
        try {
            if (!col.excelUrl) throw new Error("No hay URL configurada para esta colección.");
            
            const response = await fetch(col.excelUrl);
            if (!response.ok) throw new Error('Failed to fetch data');

            let parsedCards: PokemonCard[] = [];

            if (col.excelUrl.endsWith('.json')) {
                const data = await response.json();
                parsedCards = data;
            } else if (col.excelUrl.endsWith('.xlsx')) {
                const arrayBuffer = await response.arrayBuffer();
                const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
                const headerRowIndex = jsonData.findIndex(row => row[0] === '#');

                if (headerRowIndex === -1) throw new Error('No header row in Excel');

                const headers = jsonData[headerRowIndex].map((h: any) => String(h).toLowerCase());
                const imageColIndex = headers.findIndex((h: string) => h.includes('imagen') || h.includes('link'));
                const rawData = jsonData.slice(headerRowIndex + 1).filter(row => row.length > 0 && row[0]);

                let userModifications: Record<string, { owned: boolean, imageUrl?: string }> = {};
                
                if (forceSync) {
                    const dbKey = `collection-data-${col.id}`;
                    const currentDB: PokemonCard[] | null = await localforage.getItem(dbKey);
                    if (currentDB && Array.isArray(currentDB)) {
                        currentDB.forEach(c => { userModifications[c.id] = { owned: c.owned }; });
                    }
                } else if (col.id === 'yuka-morii') {
                    const legacyData: Record<string, { owned: boolean, imageUrl?: string }> | null =
                        await localforage.getItem('pwa-pokemon-data');
                    userModifications = legacyData || {};
                }

                parsedCards = rawData.map((row, index) => {
                    const baseId = `${row[1]}-${row[2]}-${row[3]}-${row[4]}`;
                    const id = `${baseId}-${index}`;
                    let isOwned = String(row[7] || '').includes('Sï¿½') || String(row[7] || '').includes('Si') || String(row[7] || '').includes('✅');
                    let customImage = undefined;
                    const defaultImage = imageColIndex !== -1 && row[imageColIndex] ? String(row[imageColIndex]).trim() : undefined;

                    if (userModifications[id] !== undefined) {
                        isOwned = userModifications[id].owned;
                        if (!forceSync && userModifications[id].imageUrl) {
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
            }

            const dbKey = `collection-data-${col.id}`;
            await localforage.setItem(dbKey, parsedCards);
            updateCollectionStats(col.id, parsedCards);
            
            if (activeCollection && activeCollection.id === col.id) {
                setCards(parsedCards);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error en sincronización');
            setLoading(false);
        }
    };

    const toggleOwnership = async (id: string) => {
        if (!activeCollection) return;
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, owned: !card.owned } : card
            );
            const dbKey = `collection-data-${activeCollection.id}`;
            localforage.setItem(dbKey, newCards).then(() => updateCollectionStats(activeCollection.id, newCards)).catch(console.error);
            return newCards;
        });
    };

    const updateCardImage = async (id: string, imageUrl: string) => {
        if (!activeCollection) return;
        setCards(prevCards => {
            const newCards = prevCards.map(card =>
                card.id === id ? { ...card, imageUrl } : card
            );
            const dbKey = `collection-data-${activeCollection.id}`;
            localforage.setItem(dbKey, newCards).catch(console.error);
            return newCards;
        });
    };

    const reloadDatabase = () => {
        if (activeCollection && activeCollection.excelUrl) {
            performUrlSync(activeCollection, true);
        }
    };

    const createCollection = async (title: string, description: string) => {
        const id = 'custom-' + Date.now();
        const newCol: CollectionItem = {
            id,
            title,
            description,
            type: 'custom',
            totalCards: 0,
            ownedCards: 0
        };
        const nextIndex = [...collections, newCol];
        await localforage.setItem(INDEX_KEY, nextIndex);
        setCollections(nextIndex);
        return newCol;
    };

    const importCollectionFromExcel = async (file: File, title: string, description: string) => {
        setLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            const headerRowIndex = jsonData.findIndex(row => String(row[0]).includes('#') || String(row[0]).toLowerCase().includes('id'));
            
            const actualHeaderRow = headerRowIndex === -1 ? 0 : headerRowIndex;
            const headers = jsonData[actualHeaderRow].map((h: any) => String(h).toLowerCase());
            
            const imageColIndex = headers.findIndex((h: string) => h.includes('imagen') || h.includes('link') || h.includes('url'));
            const nameColIndex = headers.findIndex((h: string) => h.includes('nombre') || h.includes('pokemon'));
            const setColIndex = headers.findIndex((h: string) => h.includes('set') || h.includes('expansi'));
            
            const rawData = jsonData.slice(actualHeaderRow + 1).filter(row => row.length > 0 && (row[nameColIndex] || row[1]));
            
            const id = 'imported-' + Date.now();
            
            const parsedCards: PokemonCard[] = rawData.map((row, index) => {
                const pName = nameColIndex !== -1 ? row[nameColIndex] : row[1];
                const pSet = setColIndex !== -1 ? row[setColIndex] : row[2];
                const defaultImage = imageColIndex !== -1 && row[imageColIndex] ? String(row[imageColIndex]).trim() : undefined;
                
                return {
                    id: `${pName}-${pSet}-${index}`.replace(/\s+/g, '-'),
                    rank: Number(row[0] || index + 1),
                    set: String(pSet || 'Desconocido'),
                    pokemon: String(pName || 'Desconocido'),
                    number: String(row[3] || '0'),
                    rarity: String(row[4] || 'Común'),
                    variant: String(row[5] || 'Normal'),
                    price: Number(row[6]) || 0,
                    owned: false,
                    imageUrl: defaultImage,
                };
            });

            const newCol: CollectionItem = {
                id,
                title,
                description,
                type: 'imported',
                totalCards: parsedCards.length,
                ownedCards: 0,
                coverImageUrl: parsedCards[0]?.imageUrl
            };

            await localforage.setItem(`collection-data-${id}`, parsedCards);
            
            const nextIndex = [...collections, newCol];
            await localforage.setItem(INDEX_KEY, nextIndex);
            setCollections(nextIndex);
            
            setLoading(false);
            return newCol;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error importando');
            setLoading(false);
            throw err;
        }
    };
    
    // Add manual card
    const addManualCard = async (collectionId: string, card: Omit<PokemonCard, 'id' | 'owned'>) => {
        const dbKey = `collection-data-${collectionId}`;
        const localDB: PokemonCard[] | null = await localforage.getItem(dbKey);
        const currentArr = localDB || [];
        
        const newCard: PokemonCard = {
            ...card,
            id: `manual-${Date.now()}`,
            owned: true // Usually if you manually add it, you own it, but let's default to owned
        };
        
        const updatedCards = [newCard, ...currentArr];
        await localforage.setItem(dbKey, updatedCards);
        updateCollectionStats(collectionId, updatedCards);
        
        if (activeCollection && activeCollection.id === collectionId) {
            setCards(updatedCards);
        }
    };

    const unloadCollection = () => {
        setActiveCollection(null);
        setCards([]);
    };

    return { 
        collections, 
        activeCollection, 
        cards, 
        loading, 
        error, 
        loadCollection, 
        unloadCollection,
        toggleOwnership, 
        updateCardImage, 
        reloadDatabase,
        createCollection,
        importCollectionFromExcel,
        addManualCard
    };
};
