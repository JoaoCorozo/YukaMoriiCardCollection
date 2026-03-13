export interface PokemonCard {
    id: string;
    rank: number;
    set: string;
    pokemon: string;
    number: string;
    rarity: string;
    variant: string;
    price: number;
    owned: boolean;
    imageUrl?: string;
}
