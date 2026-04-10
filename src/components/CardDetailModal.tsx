import React, { useRef } from 'react';
import type { PokemonCard } from '../types/PokemonCard';
import { X, CheckCircle, Circle, MapPin, Hash, Star, LayoutList, UploadCloud, Trash } from 'lucide-react';

interface CardDetailProps {
    card: PokemonCard | null;
    onClose: () => void;
    onUpdateImage: (id: string, imageUrl: string) => void;
    onToggleOwned: (id: string) => void;
}

export const CardDetailModal = ({ card, onClose, onUpdateImage, onToggleOwned }: CardDetailProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!card) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    onUpdateImage(card.id, reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        onUpdateImage(card.id, '');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
            <div
                className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border-8 border-yellow-400 relative"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header Ribbon */}
                <div className="absolute top-0 inset-x-0 h-24 bg-red-600 rounded-t-[1.5rem] -z-10"></div>
                <div className="absolute top-0 right-0 p-4 z-20">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white hover:text-red-600 transition-colors shadow-sm"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pt-6 space-y-6 relative z-10 mt-6">

                    <div className="text-center relative">
                        <div className="w-40 h-56 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-xl border-4 border-white shadow-slate-300/50 relative overflow-hidden group">
                            {card.imageUrl ? (
                                <>
                                    <img src={card.imageUrl} alt={card.pokemon} className="w-full h-full object-contain p-2" />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar foto"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 group">
                                    <img 
                                        src="/apple-touch-icon.png" 
                                        alt="Sin imagen" 
                                        className="w-32 h-32 opacity-20 grayscale"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`absolute bottom-3 right-3 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:scale-105 transition-all ${card.imageUrl ? 'opacity-0 group-hover:opacity-100' : ''}`}
                                title="Subir foto"
                            >
                                <UploadCloud size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <h1 className="text-4xl font-black text-slate-800 drop-shadow-sm mb-3 font-sans pb-2">
                            {card.pokemon}
                        </h1>
                        <div className="inline-block px-5 py-2 rounded-full bg-slate-100 text-slate-700 font-bold border-2 border-slate-200 shadow-sm text-lg">
                            💰 ${card.price.toFixed(2)} USD
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 shadow-sm flex items-start gap-3">
                                <MapPin className="text-blue-500 mt-0.5" size={20} />
                                <div>
                                    <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Set</p>
                                    <p className="text-slate-800 font-black text-lg leading-tight">{card.set}</p>
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-100 shadow-sm flex items-start gap-3">
                                <Hash className="text-purple-500 mt-0.5" size={20} />
                                <div>
                                    <p className="text-xs text-purple-500 uppercase font-bold tracking-wider mb-1">Número</p>
                                    <p className="text-slate-800 font-black text-lg leading-tight">{card.number}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 shadow-sm flex items-start gap-3">
                                <Star className="text-orange-500 mt-0.5" size={20} />
                                <div>
                                    <p className="text-xs text-orange-500 uppercase font-bold tracking-wider mb-1">Rareza</p>
                                    <p className="text-slate-800 font-black leading-tight">{card.rarity}</p>
                                </div>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-2xl border-2 border-pink-100 shadow-sm flex items-start gap-3">
                                <LayoutList className="text-pink-500 mt-0.5" size={20} />
                                <div>
                                    <p className="text-xs text-pink-500 uppercase font-bold tracking-wider mb-1">Variante</p>
                                    <p className="text-slate-800 font-black leading-tight">{card.variant || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Collection Status with animated backdrop */}
                        <div
                            onClick={() => onToggleOwned(card.id)}
                            className={`mt-8 p-5 rounded-3xl border-4 shadow-md flex items-center gap-4 transition-colors duration-300 relative overflow-hidden cursor-pointer hover:scale-[1.02] ${card.owned
                                ? 'bg-green-50 border-green-400 shadow-green-100'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-slate-100'
                                }`}
                        >
                            {card.owned && (
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-pulse pointer-events-none"></div>
                            )}

                            <div className={`p-4 rounded-full relative z-10 transition-colors ${card.owned ? 'bg-green-400 text-white shadow-lg shadow-green-400/50' : 'bg-slate-200 text-slate-400'}`}>
                                {card.owned ? <CheckCircle size={32} /> : <Circle size={32} />}
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold uppercase tracking-wider mb-1 text-slate-500">Estado</p>
                                <p className={`text-2xl font-black ${card.owned ? 'text-green-600' : 'text-slate-400'}`}>
                                    {card.owned ? '¡Capturado!' : 'Falta (Click)'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
