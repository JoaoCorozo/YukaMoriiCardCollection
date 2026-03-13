import { useState, useMemo } from 'react';
import { usePokemonCards } from './hooks/usePokemonCards';
import { CardItem } from './components/CardItem';
import { CardDetailModal } from './components/CardDetailModal';
import type { PokemonCard } from './types/PokemonCard';
import { Search, Library, CheckCircle, XCircle, DollarSign, Loader, AlertTriangle } from 'lucide-react';

function App() {
  const { cards, loading, error, toggleOwnership, updateCardImage } = usePokemonCards();
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'missing'>('all');

  const filteredCards = useMemo(() => {
    return cards.map(c => ({ ...c })).filter(card => {
      const search = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pokemonName = card.pokemon.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const setName = card.set.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      const matchesSearch = pokemonName.includes(search) || setName.includes(search);

      if (filter === 'owned') return matchesSearch && card.owned;
      if (filter === 'missing') return matchesSearch && !card.owned;
      return matchesSearch;
    });
  }, [cards, searchTerm, filter]);

  const stats = useMemo(() => {
    const total = cards.length;
    const owned = cards.filter(c => c.owned).length;
    const missing = total - owned;
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    const totalValue = cards.reduce((sum, card) => card.owned ? sum + card.price : sum, 0);

    return { total, owned, missing, percentage, totalValue };
  }, [cards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader className="w-16 h-16 text-red-500 animate-spin mb-4" />
        <p className="text-xl font-bold text-slate-700">Cargando tu PokéDex...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border-2 border-red-500 p-8 rounded-3xl max-w-md shadow-2xl">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">¡Oh no! Un problema</h2>
          <p className="text-slate-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-yellow-50 font-sans selection:bg-yellow-300">
      {/* Playful Header */}
      <header className="sticky top-0 z-30 bg-red-600 shadow-lg border-b-4 border-red-700">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 relative overflow-hidden">
          {/* Decorative Pokéball curve */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full border-8 border-white pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight text-center sm:text-left drop-shadow-md flex items-center gap-3">
              <img src="/apple-touch-icon.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white bg-white hidden sm:block" onError={(e) => e.currentTarget.style.display = 'none'} />
              Colección Yuka <span className="text-yellow-300">Morii</span>
            </h1>

            <div className="flex bg-red-800/50 rounded-full p-1 border-2 border-red-500/50 shadow-inner backdrop-blur-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-red-600 shadow-md scale-105' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('owned')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'owned' ? 'bg-green-400 text-green-950 shadow-md scale-105' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                Tengo
              </button>
              <button
                onClick={() => setFilter('missing')}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filter === 'missing' ? 'bg-slate-700 text-white shadow-md scale-105' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                Faltan
              </button>
            </div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Busca por nombre o set de expansión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-4 border-yellow-400 rounded-2xl text-slate-800 text-lg font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 transition-all shadow-lg"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Colorful Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 transform transition hover:-translate-y-1">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Library size={28} /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-black text-slate-800">{stats.percentage}%</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border-2 border-green-100 shadow-xl shadow-green-200/40 flex items-center gap-4 transform transition hover:-translate-y-1">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600"><CheckCircle size={28} /></div>
            <div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Obtenidas</p>
              <p className="text-2xl font-black text-slate-800">{stats.owned} <span className="text-sm text-slate-400 font-semibold">/ {stats.total}</span></p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border-2 border-red-100 shadow-xl shadow-red-200/40 flex items-center gap-4 transform transition hover:-translate-y-1">
            <div className="bg-red-100 p-3 rounded-2xl text-red-600"><XCircle size={28} /></div>
            <div>
              <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Faltantes</p>
              <p className="text-2xl font-black text-slate-800">{stats.missing}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border-2 border-yellow-100 shadow-xl shadow-yellow-200/40 flex items-center gap-4 transform transition hover:-translate-y-1">
            <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-600"><DollarSign size={28} /></div>
            <div>
              <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider mb-1">Valor Total</p>
              <p className="text-2xl font-black text-slate-800">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Card Grid */}
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
              <img src="/apple-touch-icon.png" alt="Not found" className="w-24 h-24 mx-auto mb-6 opacity-30 grayscale hidden sm:block" onError={(e) => e.currentTarget.style.display = 'none'} />
              <Search className="h-16 w-16 mx-auto mb-4 opacity-30 sm:hidden" />
              <p className="text-2xl font-bold text-slate-500 mb-2">Ningún Pokémon encontrado</p>
              <p className="text-lg">Intenta buscar con otra palabra.</p>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
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
}

export default App;
