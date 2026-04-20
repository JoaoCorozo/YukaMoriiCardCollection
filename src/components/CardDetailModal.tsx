import React, { useRef, useState, useEffect } from 'react';
import type { PokemonCard } from '../types/PokemonCard';
import { X, CheckCircle, Circle, MapPin, Hash, Star, LayoutList, UploadCloud, Trash, Edit2, Save, ChevronLeft, ChevronRight } from 'lucide-react';

interface CardDetailProps {
    cards: PokemonCard[];
    initialCardId: string | null;
    onClose: () => void;
    onUpdateImage: (id: string, imageUrl: string) => void;
    onToggleOwned: (id: string) => void;
    onDeleteCard?: (id: string) => void;
    onEditCard?: (id: string, updatedFields: Partial<PokemonCard>) => void;
}

export const CardDetailModal = ({ cards, initialCardId, onClose, onUpdateImage, onToggleOwned, onDeleteCard, onEditCard }: CardDetailProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showDetails, setShowDetails] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedCard, setEditedCard] = useState<Partial<PokemonCard>>({});

    useEffect(() => {
        if (initialCardId && cards.length > 0) {
            const index = cards.findIndex(c => c.id === initialCardId);
            setCurrentIndex(index >= 0 ? index : -1);
        } else {
            setCurrentIndex(-1);
        }
    }, [initialCardId, cards]);

    useEffect(() => {
        setIsEditing(false);
        setShowDetails(false);
        setEditedCard({});
    }, [currentIndex]);

    if (currentIndex < 0 || cards.length === 0) return null;

    const card = cards[currentIndex];

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

    const removeImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onUpdateImage(card.id, '');
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-md" onClick={onClose}>
            {/* Global Close Button */}
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-3 sm:p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0_rgb(0,0,0)] border-2 border-slate-900"
            >
                <X size={28} strokeWidth={3} />
            </button>

            {/* Prev Button */}
            {currentIndex > 0 && (
                <button 
                    onClick={handlePrev} 
                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-5 rounded-full bg-slate-800 text-white hover:bg-yellow-400 hover:text-slate-900 border-4 border-slate-900 transition-all shadow-[4px_4px_0_rgb(0,0,0)] hover:-translate-x-1"
                >
                    <ChevronLeft size={32} strokeWidth={4} />
                </button>
            )}

            {/* Next Button */}
            {currentIndex < cards.length - 1 && (
                <button 
                    onClick={handleNext} 
                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-40 p-3 sm:p-5 rounded-full bg-slate-800 text-white hover:bg-yellow-400 hover:text-slate-900 border-4 border-slate-900 transition-all shadow-[4px_4px_0_rgb(0,0,0)] hover:translate-x-1"
                >
                    <ChevronRight size={32} strokeWidth={4} />
                </button>
            )}

            {/* Main Card Container */}
            <div 
                className="w-full max-w-sm md:max-w-md lg:max-w-lg aspect-[63/88] relative cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
            >
                {/* The Card Background/Border */}
                <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-200 border-8 border-slate-900 shadow-[8px_8px_0_rgb(15,23,42),0_0_50px_rgba(250,204,21,0.2)] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                    
                    {/* The Image */}
                    {card.imageUrl ? (
                         <img 
                            src={card.imageUrl} 
                            alt={card.pokemon} 
                            className="w-full h-full object-contain pointer-events-none select-none z-10" 
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/reverso.jpeg';
                            }}
                        />
                    ) : (
                         <img 
                            src="/reverso.jpeg" 
                            alt="Reverso" 
                            className="w-full h-full object-cover pointer-events-none select-none opacity-80 mix-blend-multiply z-10" 
                        />
                    )}

                    {/* Camera Button (Only visible if no details overlay) */}
                    {!showDetails && (
                        <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className={`absolute bottom-4 right-4 z-20 p-4 bg-blue-500 text-white rounded-full border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] hover:bg-blue-400 transition-all ${card.imageUrl ? 'opacity-0 group-hover:opacity-100' : 'animate-bounce'}`}
                            title="Subir foto"
                        >
                            <UploadCloud size={24} strokeWidth={3} />
                        </button>
                    )}
                    
                    {!showDetails && card.imageUrl && (
                        <button
                            onClick={removeImage}
                            className="absolute top-4 right-4 z-20 p-3 bg-red-500 text-white rounded-full border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] hover:bg-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Borrar foto"
                        >
                            <Trash size={18} strokeWidth={3} />
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Dark Overlay (The Details) */}
                    <div 
                        className={`absolute inset-0 bg-slate-900/90 backdrop-blur-md z-30 p-6 flex flex-col overflow-y-auto transition-opacity duration-300 ease-in-out cursor-default ${showDetails ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={(e) => e.stopPropagation()} /* so click inside doesn't toggle off immediately if they click a button */
                    >
                        {/* Internal Close overlay button */}
                        <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 p-2 bg-slate-800 text-white rounded-full border-2 border-slate-700 hover:bg-slate-700">
                            <X size={20} strokeWidth={3} />
                        </button>

                        {/* Edit top-left */}
                        {onEditCard && !isEditing && (
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditedCard({
                                        pokemon: card.pokemon,
                                        set: card.set,
                                        number: card.number,
                                        rarity: card.rarity,
                                        variant: card.variant,
                                        imageUrl: card.imageUrl
                                    });
                                }}
                                className="absolute top-4 left-4 p-2 bg-yellow-400 text-yellow-950 rounded-full border-2 border-yellow-500 hover:bg-yellow-300 shadow-[2px_2px_0_rgb(0,0,0)]"
                                title="Editar Datos"
                            >
                                <Edit2 size={20} strokeWidth={3} />
                            </button>
                        )}

                        <div className="mt-10 mb-6 text-center">
                            {isEditing ? (
                                <div className="flex flex-col gap-3 px-4">
                                    <input
                                        value={editedCard.pokemon || ''}
                                        onChange={e => setEditedCard({ ...editedCard, pokemon: e.target.value })}
                                        className="text-2xl font-black text-center text-slate-900 bg-white border-4 border-slate-900 rounded-xl p-3 w-full focus:outline-none uppercase"
                                        placeholder="Nombre"
                                    />
                                    <input
                                        value={editedCard.imageUrl || ''}
                                        onChange={e => setEditedCard({ ...editedCard, imageUrl: e.target.value })}
                                        className="text-sm font-bold text-center text-slate-900 bg-white border-4 border-slate-900 rounded-xl p-3 w-full focus:outline-none"
                                        placeholder="URL de Imagen Fija"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-4xl font-black text-white uppercase tracking-tight drop-shadow-[0_4px_0_rgb(0,0,0)]">{card.pokemon}</h2>
                            )}
                        </div>

                        {/* Status Toggle Big Button */}
                        <div
                            onClick={(e) => { e.stopPropagation(); onToggleOwned(card.id); }}
                            className={`mb-6 p-4 rounded-2xl border-4 cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-4 shadow-[4px_4px_0_rgb(0,0,0)] ${card.owned ? 'bg-green-500 border-slate-900 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {card.owned ? <CheckCircle size={32} strokeWidth={3} /> : <Circle size={32} strokeWidth={3} />}
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-widest opacity-80">Estado de Captura</p>
                                <p className="text-2xl font-black uppercase tracking-tighter">{card.owned ? '¡Ya la tienes!' : 'Aún te falta'}</p>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                            {/* Set */}
                            <div className="bg-slate-800 p-3 rounded-xl border-2 border-slate-700 flex flex-col gap-1">
                                <p className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><MapPin size={14}/> Set</p>
                                {isEditing ? (
                                    <input value={editedCard.set || ''} onChange={e => setEditedCard({ ...editedCard, set: e.target.value })} className="w-full font-black text-sm p-2 rounded text-slate-900" />
                                ) : (
                                    <p className="text-white font-black uppercase truncate" title={card.set}>{card.set}</p>
                                )}
                            </div>
                            
                            {/* Number */}
                            <div className="bg-slate-800 p-3 rounded-xl border-2 border-slate-700 flex flex-col gap-1">
                                <p className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><Hash size={14}/> Número</p>
                                {isEditing ? (
                                    <input value={editedCard.number || ''} onChange={e => setEditedCard({ ...editedCard, number: e.target.value })} className="w-full font-black text-sm p-2 rounded text-slate-900" />
                                ) : (
                                    <p className="text-white font-black uppercase">{card.number}</p>
                                )}
                            </div>

                            {/* Rarity */}
                            <div className="bg-slate-800 p-3 rounded-xl border-2 border-slate-700 flex flex-col gap-1">
                                <p className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><Star size={14}/> Rareza</p>
                                {isEditing ? (
                                    <input value={editedCard.rarity || ''} onChange={e => setEditedCard({ ...editedCard, rarity: e.target.value })} className="w-full font-black text-sm p-2 rounded text-slate-900" />
                                ) : (
                                    <p className="text-white font-black uppercase truncate" title={card.rarity}>{card.rarity}</p>
                                )}
                            </div>

                            {/* Variant */}
                            <div className="bg-slate-800 p-3 rounded-xl border-2 border-slate-700 flex flex-col gap-1">
                                <p className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><LayoutList size={14}/> Variante</p>
                                {isEditing ? (
                                    <input value={editedCard.variant || ''} onChange={e => setEditedCard({ ...editedCard, variant: e.target.value })} className="w-full font-black text-sm p-2 rounded text-slate-900" />
                                ) : (
                                    <p className="text-white font-black uppercase truncate" title={card.variant}>{card.variant || 'N/A'}</p>
                                )}
                            </div>
                        </div>

                        {/* Edit Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 mb-4">
                                <button onClick={() => setIsEditing(false)} className="flex-1 p-3 rounded-xl bg-slate-700 text-white font-black uppercase hover:bg-slate-600 transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={() => { if (onEditCard) onEditCard(card.id, editedCard); setIsEditing(false); }} className="flex-1 p-3 rounded-xl bg-blue-500 border-2 border-blue-400 text-white font-black uppercase hover:bg-blue-400 shadow-[2px_2px_0_rgb(0,0,0)] flex justify-center items-center gap-2">
                                    <Save size={18} strokeWidth={3}/> Guar.
                                </button>
                            </div>
                        )}

                        {/* Delete Button */}
                        {onDeleteCard && !isEditing && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("¿Seguro que deseas eliminar esta carta de la colección?")) {
                                        onDeleteCard(card.id);
                                    }
                                }}
                                className="w-full p-4 rounded-xl bg-red-600 text-white font-black uppercase border-4 border-slate-900 hover:bg-red-500 flex items-center justify-center gap-2 transition-transform active:translate-y-1 shadow-[4px_4px_0_rgb(0,0,0)]"
                            >
                                <Trash size={20} strokeWidth={3} />
                                Soltar Carta
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
