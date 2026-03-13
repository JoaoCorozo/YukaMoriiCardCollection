import type { PokemonCard } from '../types/PokemonCard';
import { Star, CheckCircle, Circle, ImagePlus } from 'lucide-react';

interface CardItemProps {
    card: PokemonCard;
    onClick: () => void;
    onToggleOwned: (e: React.MouseEvent) => void;
}

export const CardItem = ({ card, onClick, onToggleOwned }: CardItemProps) => {
    return (
        <div
            onClick={onClick}
            className={`relative p-5 rounded-3xl shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border-4 flex flex-col ${card.owned
                ? 'bg-white border-green-400 shadow-green-200/50'
                : 'bg-white border-slate-100 shadow-slate-200/50 hover:border-yellow-300'
                }`}
        >
            {/* Price Badge */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-950 font-black text-sm px-4 py-2 rounded-full shadow-md border-2 border-white transform rotate-3 z-10">
                ${card.price.toFixed(2)}
            </div>

            {/* Decorative dots */}
            <div className="absolute top-4 left-4 flex gap-1 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500"></div>
            </div>

            {/* Image Area */}
            <div className="w-full h-40 mt-6 mb-4 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative group">
                {card.imageUrl ? (
                    <img
                        src={card.imageUrl}
                        alt={card.pokemon}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <ImagePlus size={32} className="mb-2 opacity-30" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Sin foto</span>
                    </div>
                )}
            </div>

            <div className="mb-2">
                <h3 className="font-black text-2xl text-slate-800 truncate pr-6">{card.pokemon}</h3>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="truncate">{card.set}</span>
                <span className="text-slate-300">•</span>
                <span className="whitespace-nowrap">#{card.number}</span>
            </div>

            <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5 w-fit">
                        <Star size={12} className="fill-blue-500 text-blue-500" />
                        {card.rarity}
                    </span>
                    {card.variant && (
                        <span className="text-xs font-bold text-slate-400 pl-1 capitalize">
                            {card.variant}
                        </span>
                    )}
                </div>

                <button
                    onClick={onToggleOwned}
                    className={`p-3 rounded-full transition-all transform active:scale-90 shadow-sm z-10 relative ${card.owned
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/30'
                        : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                        }`}
                    title={card.owned ? "Ya la tengo" : "Me falta"}
                >
                    {card.owned ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
            </div>
        </div>
    );
};
