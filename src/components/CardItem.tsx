import type { PokemonCard } from '../types/PokemonCard';
import { Star, CheckCircle, Circle } from 'lucide-react';

interface CardItemProps {
    card: PokemonCard;
    onClick: () => void;
    onToggleOwned: (e: React.MouseEvent) => void;
}

export const CardItem = ({ card, onClick, onToggleOwned }: CardItemProps) => {
    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 border-4 flex flex-col items-stretch ${card.owned
                ? 'bg-yellow-50 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] hover:shadow-[8px_8px_0_rgb(15,23,42)]'
                : 'bg-white border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] hover:shadow-[8px_8px_0_rgb(15,23,42)] hover:border-blue-500'
                }`}
        >
            {/* Decorative dots (Classic Battery/Status Style) */}
            <div className="absolute top-4 left-4 flex gap-1 z-10">
                <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900 shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-900 shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900 shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.3)]"></div>
            </div>

            {/* Image Area */}
            <div className="w-full h-40 mt-6 mb-4 rounded-xl overflow-hidden bg-slate-200 border-4 border-slate-900 flex items-center justify-center relative group shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)]">
                {card.imageUrl ? (
                    <img
                        src={card.imageUrl}
                        alt={card.pokemon}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/reverso.jpeg';
                            e.currentTarget.className = "w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 shadow-sm opacity-90";
                        }}
                    />
                ) : (
                    <img 
                        src="/reverso.jpeg" 
                        alt="Reverso de carta" 
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 shadow-sm opacity-90"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
            </div>

            <div className="mb-2 border-b-4 border-slate-900 pb-2">
                <h3 className="font-black text-2xl text-slate-800 truncate uppercase tracking-tight">{card.pokemon}</h3>
            </div>

            <div className="flex items-center gap-2 text-sm font-black text-slate-600 mb-4 bg-slate-200 p-2.5 rounded-xl border-4 border-slate-900 uppercase">
                <span className="truncate">{card.set}</span>
                <span className="text-slate-400">•</span>
                <span className="whitespace-nowrap">#{card.number}</span>
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col gap-1.5 flex-1">
                    <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-blue-500 text-white border-2 border-slate-900 flex items-center gap-1.5 w-fit uppercase shadow-[2px_2px_0_rgb(15,23,42)]">
                        <Star size={14} className="fill-white" strokeWidth={3} />
                        {card.rarity}
                    </span>
                    {card.variant && (
                        <span className="text-xs font-black text-slate-500 pl-1 uppercase tracking-tight">
                            {card.variant}
                        </span>
                    )}
                </div>

                <button
                    onClick={onToggleOwned}
                    className={`p-3 rounded-full transition-all transform active:translate-y-1 shadow-[2px_2px_0_rgb(15,23,42)] active:shadow-none z-10 relative border-4 border-slate-900 ${card.owned
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                    title={card.owned ? "Ya la tengo" : "Me falta"}
                >
                    {card.owned ? <CheckCircle size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={3} />}
                </button>
            </div>
        </div>
    );
};
