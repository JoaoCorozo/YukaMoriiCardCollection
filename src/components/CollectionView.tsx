import React, { useState, useMemo } from 'react';
import { CardItem } from './CardItem';
import { CardDetailModal } from './CardDetailModal';
import type { PokemonCard } from '../types/PokemonCard';
import type { CollectionItem } from '../types/Collection';
import { Search, Library, CheckCircle, XCircle, Loader, AlertTriangle, RefreshCw, ArrowLeft, PlusCircle } from 'lucide-react';

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
    onDeleteCard?: (id: string) => void;
    onEditCard?: (id: string, updatedFields: Partial<PokemonCard>) => void;
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
    onAddManualCard,
    onDeleteCard,
    onEditCard
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

        return { total, owned, missing, percentage };
    }, [cards]);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddManualCard && newCard.pokemon) {
            onAddManualCard({
                ...newCard,
                rank: cards.length + 1
            });
            setShowAddForm(false);
            setNewCard({ pokemon: '', set: '', number: '', rarity: 'Common', variant: 'Normal', imageUrl: '' });
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Pokédex Header */}
            <header className="sticky top-0 z-30 bg-red-600 border-b-8 border-slate-900 shadow-xl relative">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 relative z-10">

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full border-4 border-slate-900 hover:-translate-x-1 transition-transform shadow-[0_4px_0_rgb(0,0,0,0.3)]">
                                <ArrowLeft size={24} strokeWidth={3} />
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase flex items-center gap-3 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
                                {collection.coverImageUrl && (
                                    <img src={collection.coverImageUrl} alt="Logo" className="w-12 h-12 rounded-full border-4 border-slate-900 bg-white hidden sm:block object-cover shadow-[0_2px_0_rgba(0,0,0,0.3)]" />
                                )}
                                {collection.title}
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <div className="flex bg-slate-900 rounded-xl p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] w-full sm:w-auto overflow-hidden">
                                <button onClick={() => setFilter('all')} className={`flex-1 px-4 py-2 font-black uppercase text-sm transition-colors ${filter === 'all' ? 'bg-white text-slate-900 rounded-lg' : 'text-slate-400 hover:text-white'}`}>Todas</button>
                                <button onClick={() => setFilter('owned')} className={`flex-1 px-4 py-2 font-black uppercase text-sm transition-colors ${filter === 'owned' ? 'bg-green-400 text-green-950 rounded-lg' : 'text-slate-400 hover:text-white'}`}>Atrapadas</button>
                                <button onClick={() => setFilter('missing')} className={`flex-1 px-4 py-2 font-black uppercase text-sm transition-colors ${filter === 'missing' ? 'bg-red-500 text-white rounded-lg' : 'text-slate-400 hover:text-white'}`}>Me Faltan</button>
                            </div>

                            {collection.excelUrl && (
                                <button
                                    onClick={() => reloadDatabase()}
                                    title="Sincronizar base de datos"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black uppercase shadow-[0_4px_0_rgb(15,23,42)] border-4 border-slate-900 active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto"
                                >
                                    <RefreshCw size={18} strokeWidth={3} className={loading ? "animate-spin" : ""} />
                                    SYNC
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-2 mt-4 relative z-10 w-full pb-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-slate-400" strokeWidth={3} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar carta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-4 py-3 bg-white border-4 border-slate-900 rounded-xl text-slate-900 text-base font-black placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-[0_4px_0_rgba(0,0,0,0.2)]"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 bg-white border-4 border-slate-900 rounded-xl text-slate-900 text-base font-black focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-[0_4px_0_rgba(0,0,0,0.2)] cursor-pointer"
                        >
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
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex items-center gap-3">
                        <div className="bg-blue-500 p-2.5 rounded-xl text-white border-2 border-slate-900"><Library size={24} strokeWidth={3} /></div>
                        <div>
                            <p className="text-xs text-blue-800 font-black uppercase">Progreso</p>
                            <p className="text-2xl font-black text-slate-900">{stats.percentage}%</p>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex items-center gap-3">
                        <div className="bg-green-500 p-2.5 rounded-xl text-white border-2 border-slate-900"><CheckCircle size={24} strokeWidth={3} /></div>
                        <div>
                            <p className="text-xs text-green-800 font-black uppercase">¡Atrapadas!</p>
                            <p className="text-2xl font-black text-slate-900">{stats.owned} <span className="text-sm text-slate-500">/ {stats.total}</span></p>
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex items-center gap-3">
                        <div className="bg-red-500 p-2.5 rounded-xl text-white border-2 border-slate-900"><XCircle size={24} strokeWidth={3} /></div>
                        <div>
                            <p className="text-xs text-red-800 font-black uppercase">Me Faltan</p>
                            <p className="text-2xl font-black text-slate-900">{stats.missing}</p>
                        </div>
                    </div>
                </div>

                {/* Add Manual Item (Only for Custom) */}
                {collection.type === 'custom' && (
                    <div className="mb-8">
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full py-5 border-4 border-dashed border-slate-400 hover:border-slate-900 rounded-3xl text-slate-600 font-black uppercase flex justify-center items-center gap-3 hover:bg-slate-200 hover:text-slate-900 transition-all"
                            >
                                <PlusCircle size={24} strokeWidth={3} /> Añadir Carta a Mano
                            </button>
                        ) : (
                            <form onSubmit={handleAddSubmit} className="bg-yellow-50 p-6 rounded-2xl shadow-[8px_8px_0_rgb(15,23,42)] border-4 border-slate-900 flex flex-col gap-4">
                                <h3 className="text-xl font-black uppercase text-slate-800 border-b-4 border-slate-900 pb-2 inline-block w-fit">Añadir Nueva Carta</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    <input required placeholder="Nombre del Pokémon" value={newCard.pokemon} onChange={e => setNewCard({ ...newCard, pokemon: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400" />
                                    <input required placeholder="Set/Expansión" value={newCard.set} onChange={e => setNewCard({ ...newCard, set: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400" />
                                    <input placeholder="Número (ej. 001/198)" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400" />
                                    <input placeholder="Rareza (ej. Común, Rara)" value={newCard.rarity} onChange={e => setNewCard({ ...newCard, rarity: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400" />
                                    <input placeholder="Variante (ej. Holo, Reverse)" value={newCard.variant} onChange={e => setNewCard({ ...newCard, variant: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400" />
                                    <input placeholder="URL de Imagen Fija" value={newCard.imageUrl} onChange={e => setNewCard({ ...newCard, imageUrl: e.target.value })} className="p-3 border-4 rounded-xl bg-white text-slate-800 border-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-400 sm:col-span-2" />
                                </div>
                                <div className="flex gap-4 justify-end mt-4">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 font-black uppercase text-slate-900 bg-white border-4 border-slate-900 hover:bg-slate-200 rounded-xl shadow-[0_4px_0_rgb(15,23,42)] active:translate-y-1 active:shadow-none transition-all">Cancelar</button>
                                    <button type="submit" className="px-6 py-3 font-black uppercase text-white bg-blue-500 border-4 border-slate-900 hover:bg-blue-600 rounded-xl shadow-[0_4px_0_rgb(15,23,42)] active:translate-y-1 active:shadow-none transition-all">Guardar Carta</button>
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
                cards={filteredCards}
                initialCardId={selectedCard?.id || null}
                onClose={() => setSelectedCard(null)}
                // We keep onToggleOwned by id exactly the same, 
                // since the modal passes the specific card.id
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
                onDeleteCard={onDeleteCard ? (id) => {
                    onDeleteCard(id);
                    setSelectedCard(null);
                } : undefined}
                onEditCard={onEditCard ? (id, updatedFields) => {
                    onEditCard(id, updatedFields);
                    if (selectedCard?.id === id) {
                        setSelectedCard(prev => prev ? { ...prev, ...updatedFields } : null);
                    }
                } : undefined}
            />
        </div>
    );
};
