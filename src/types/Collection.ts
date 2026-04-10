export interface CollectionItem {
    id: string;
    title: string;
    description: string;
    coverImageUrl?: string;
    type: 'official' | 'custom' | 'imported';
    totalCards: number;
    ownedCards: number;
    excelUrl?: string; // For official collections that fetch from Excel
}
