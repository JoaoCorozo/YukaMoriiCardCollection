import React, { useState, useMemo } from 'react';
import { CardItem } from './CardItem';
import { CardDetailModal } from './CardDetailModal';
import type { PokemonCard } from '../types/PokemonCard';
import type { CollectionItem } from '../types/Collection';
import { Search, Library, CheckCircle, XCircle, DollarSign, Loader, AlertTriangle, RefreshCw, ArrowLeft, PlusCircle } from 'lucide-react';

interface CollectionViewProps {
    collection: CollectionItem;
    cards: PokemonCard[];
    loading: boolean;
    error: string | null;
    toggleOwnership: (id: string) => void;
    updateCardImage: (id: string, url: string) => void;
    reloadDatabase: () => void;
    onBack: () => void;
    onAddManualCard?: (card: Omit<PokemonCard, 'id' | 'owned'>) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
    collection,
    cards,
    loading,
    error,
    toggleOwnership,
    updateCardImage,
    reloadDatabase,
    onBack,
    onAddManualCard
}) => {
    const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'owned' | 'missing'>('all');
    const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'name-asc' | 'name-desc' | 'set-asc' | 'number-asc'>('price-desc');
    const [showAddForm, setShowAddForm] = useState(false);

    // Manual Add Form State
    const [newCard, setNewCard] = useState({
        pokemon: '',
        set: '',
        number: '',
        rarity: 'Common',
        variant: 'Normal',
        price: 0,
        imageUrl: ''
    });

    const filteredCards = useMemo(() => {
        let result = cards.map(c => ({ ...c })).filter(card => {
            const search = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const pokemonName = card.pokemon.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const setName = card.set.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const matchesSearch = pokemonName.includes(search) || setName.includes(search);

            if (filter === 'owned') return matchesSearch && card.owned;
            if (filter === 'missing') return matchesSearch && !card.owned;
            return matchesSearch;
        });

        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.pokemon.localeCompare(b.pokemon);
                case 'name-desc': return b.pokemon.localeCompare(a.pokemon);
                case 'set-asc': return a.set.localeCompare(b.set) || a.number.localeCompare(b.number, undefined, { numeric: true });
                case 'number-asc': return a.number.localeCompare(b.number, undefined, { numeric: true });
                default: return 0;
            }
        });

        return result;
    }, [cards, searchTerm, filter, sortBy]);

    const stats = useMemo(() => {
        const total = cards.length;
        const owned = cards.filter(c => c.owned).length;
        const missing = total - owned;
        const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
        const totalValue = cards.reduce((sum, card) => card.owned ? sum + card.price : sum, 0);

        return { total, owned, missing, percentage, totalValue };
    }, [cards]);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddManualCard && newCard.pokemon) {
            onAddManualCard({
                ...newCard,
                rank: cards.length + 1
            });
            setShowAddForm(false);
            setNewCard({ pokemon: '', set: '', number: '', rarity: 'Common', variant: 'Normal', price: 0, imageUrl: '' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader className="w-16 h-16 text-red-500 animate-spin mb-4" />
                <p className="text-xl font-bold text-slate-700">Cargando la colección...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white border-2 border-red-500 p-8 rounded-3xl max-w-md shadow-2xl">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-800 mb-2">¡Oh no! Un problema</h2>
                    <p className="text-slate-600 font-medium mb-6">{error}</p>
                    <button onClick={onBack} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 font-sans selection:bg-indigo-300 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-slate-900 shadow-lg border-b-4 border-indigo-500">
                <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full border-8 border-white pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5 relative z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                {collection.coverImageUrl && (
                                    <img src={collection.coverImageUrl} alt="Logo" className="w-10 h-10 rounded-full border-2 border-indigo-400 bg-white hidden sm:block object-cover" />
                                )}
                                {collection.title}
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex bg-slate-800 rounded-full p-1 shadow-inner backdrop-blur-sm">
                                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-300 hover:text-white'}`}>Todas</button>
                                <button onClick={() => setFilter('owned')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'owned' ? 'bg-green-400 text-green-950 shadow-md' : 'text-slate-300 hover:text-white'}`}>Tengo</button>
                                <button onClick={() => setFilter('missing')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'missing' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-300 hover:text-white'}`}>Faltan</button>
                            </div>

                            {collection.excelUrl && (
                                <button
                                    onClick={() => reloadDatabase()}
                                    title="Sincronizar base de datos"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold shadow-md transition-all active:scale-95 border-2 border-indigo-400"
                                >
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    Sincronizar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 mt-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar carta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl text-white text-base font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all shadow-lg"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-lg cursor-pointer"
                        >
                            <option value="price-desc">💰 Precio (Mayor a Menor)</option>
                            <option value="price-asc">💲 Precio (Menor a Mayor)</option>
                            <option value="name-asc">🔤 Nombre (A - Z)</option>
                            <option value="name-desc">🔤 Nombre (Z - A)</option>
                            <option value="set-asc">📦 Set / Expansión</option>
                            <option value="number-asc">🔢 Número</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Library size={24} /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                            <p className="text-xl font-black text-slate-800">{stats.percentage}%</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-xl text-green-600"><CheckCircle size={24} /></div>
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase">Obtenidas</p>
                            <p className="text-xl font-black text-slate-800">{stats.owned} <span className="text-xs text-slate-400">/ {stats.total}</span></p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-xl text-red-600"><XCircle size={24} /></div>
                        <div>
                            <p className="text-xs text-red-600 font-bold uppercase">Faltantes</p>
                            <p className="text-xl font-black text-slate-800">{stats.missing}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><DollarSign size={24} /></div>
                        <div>
                            <p className="text-xs text-yellow-600 font-bold uppercase">Valor</p>
                            <p className="text-xl font-black text-slate-800">${stats.totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Add Manual Item (Only for Custom) */}
                {collection.type === 'custom' && (
                    <div className="mb-8">
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-3xl text-indigo-600 font-bold flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors"
                            >
                                <PlusCircle /> Agregar Carta Manualmente
                            </button>
                        ) : (
                            <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-3xl shadow-xl border-2 border-indigo-100 flex flex-col gap-4">
                                <h3 className="text-lg font-bold text-slate-800">Nueva Carta</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input required placeholder="Nombre del Pokémon" value={newCard.pokemon} onChange={e => setNewCard({ ...newCard, pokemon: e.target.value })} className="p-3 border rounded-xl" />
                                    <input required placeholder="Set/Expansión" value={newCard.set} onChange={e => setNewCard({ ...newCard, set: e.target.value })} className="p-3 border rounded-xl" />
                                    <input placeholder="Número (ej. 001/198)" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} className="p-3 border rounded-xl" />
                                    <input type="number" placeholder="Precio ($)" value={newCard.price || ''} onChange={e => setNewCard({ ...newCard, price: Number(e.target.value) })} className="p-3 border rounded-xl" />
                                    <input placeholder="URL de Imagen Fija" value={newCard.imageUrl} onChange={e => setNewCard({ ...newCard, imageUrl: e.target.value })} className="p-3 border rounded-xl sm:col-span-2" />
                                </div>
                                <div className="flex gap-3 justify-end mt-2">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancelar</button>
                                    <button type="submit" className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">Guardar</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.length > 0 ? (
                        filteredCards.map((card) => (
                            <CardItem
                                key={card.id}
                                card={card}
                                onClick={() => setSelectedCard(card)}
                                onToggleOwned={(e) => {
                                    e.stopPropagation();
                                    toggleOwnership(card.id);
                                    if (selectedCard?.id === card.id) {
                                        setSelectedCard(prev => prev ? { ...prev, owned: !prev.owned } : null);
                                    }
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-2xl font-bold text-slate-500 mb-2">Ninguna carta encontrada</p>
                        </div>
                    )}
                </div>
            </main>

            <CardDetailModal
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
                onToggleOwned={(id) => {
                    toggleOwnership(id);
                    if (selectedCard?.id === id) {
                        setSelectedCard(prev => prev ? { ...prev, owned: !prev.owned } : null);
                    }
                }}
                onUpdateImage={(id, url) => {
                    updateCardImage(id, url);
                    if (selectedCard?.id === id) {
                        setSelectedCard(prev => prev ? { ...prev, imageUrl: url } : null);
                    }
                }}
            />
        </div>
    );
};
