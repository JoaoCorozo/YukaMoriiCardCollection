export interface PokemonCard {
    id: string;
    rank: number;
    set: string;
    pokemon: string;
    number: string;
    rarity: string;
    variant: string;

    owned: boolean;
    imageUrl?: string;
}
