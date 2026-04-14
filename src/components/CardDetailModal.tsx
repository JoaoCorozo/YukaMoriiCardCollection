import React, { useRef, useState, useEffect } from 'react';
import type { PokemonCard } from '../types/PokemonCard';
import { X, CheckCircle, Circle, MapPin, Hash, Star, LayoutList, UploadCloud, Trash, Edit2, Save, XCircle } from 'lucide-react';

interface CardDetailProps {
    card: PokemonCard | null;
    onClose: () => void;
    onUpdateImage: (id: string, imageUrl: string) => void;
    onToggleOwned: (id: string) => void;
    onDeleteCard?: (id: string) => void;
    onEditCard?: (id: string, updatedFields: Partial<PokemonCard>) => void;
}

export const CardDetailModal = ({ card, onClose, onUpdateImage, onToggleOwned, onDeleteCard, onEditCard }: CardDetailProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCard, setEditedCard] = useState<Partial<PokemonCard>>({});

    useEffect(() => {
        setIsEditing(false);
        setEditedCard({});
    }, [card]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[12px_12px_0_rgb(15,23,42)] animate-fade-in-up border-4 border-slate-900 relative"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header Ribbon */}
                <div className="absolute top-0 inset-x-0 h-24 bg-red-600 rounded-t-[1.3rem] border-b-4 border-slate-900 -z-10"></div>
                <div className="absolute top-0 right-0 p-4 z-20 flex gap-3">
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
                            className="p-2 rounded-xl bg-white border-4 border-slate-900 text-slate-900 hover:bg-yellow-400 hover:-translate-y-1 transition-all shadow-[0_4px_0_rgb(15,23,42)]"
                            title="Editar"
                        >
                            <Edit2 size={24} strokeWidth={3} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white border-4 border-slate-900 text-slate-900 hover:bg-red-500 hover:text-white hover:-translate-y-1 transition-all shadow-[0_4px_0_rgb(15,23,42)]"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 pt-6 space-y-6 relative z-10 mt-6 font-sans">

                    <div className="text-center relative">
                        <div className="w-40 h-56 mx-auto bg-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)] border-4 border-slate-900 relative overflow-hidden group">
                            {card.imageUrl ? (
                                <>
                                    <img 
                                        src={card.imageUrl} 
                                        alt={card.pokemon} 
                                        className="w-full h-full object-contain p-2" 
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/reverso.jpeg';
                                            e.currentTarget.className = "w-full h-full object-contain p-2 opacity-90";
                                        }}
                                    />
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
                                        src="/reverso.jpeg" 
                                        alt="Reverso de carta" 
                                        className="w-full h-full object-contain p-2 opacity-90"
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

                        {isEditing ? (
                            <div className="flex flex-col items-center gap-3 mb-4 mt-4">
                                <input
                                    value={editedCard.pokemon || ''}
                                    onChange={e => setEditedCard({ ...editedCard, pokemon: e.target.value })}
                                    className="text-2xl font-black text-center text-slate-900 bg-white border-4 border-slate-900 rounded-xl p-3 w-full focus:outline-none focus:ring-4 focus:ring-yellow-400 uppercase"
                                    placeholder="Nombre del Pokémon"
                                />
                                <input
                                    value={editedCard.imageUrl || ''}
                                    onChange={e => setEditedCard({ ...editedCard, imageUrl: e.target.value })}
                                    className="text-sm font-bold text-center text-slate-900 bg-white border-4 border-slate-900 rounded-xl p-3 w-full focus:outline-none focus:ring-4 focus:ring-yellow-400 mt-2"
                                    placeholder="URL de Imagen Fija"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-black text-slate-900 uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.2)] mb-2 mt-4 tracking-tight">
                                    {card.pokemon}
                                </h1>
                            </>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-yellow-50 p-4 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                                    <MapPin size={20} strokeWidth={3} />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Set</p>
                                </div>
                                <div className="w-full">
                                    {isEditing ? (
                                        <input value={editedCard.set || ''} onChange={e => setEditedCard({ ...editedCard, set: e.target.value })} className="w-full font-black text-sm p-2 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                                    ) : (
                                        <p className="text-slate-900 font-black text-lg uppercase leading-tight truncate" title={card.set}>{card.set}</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Hash size={20} strokeWidth={3} />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Número</p>
                                </div>
                                <div className="w-full">
                                    {isEditing ? (
                                        <input value={editedCard.number || ''} onChange={e => setEditedCard({ ...editedCard, number: e.target.value })} className="w-full font-black text-sm p-2 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    ) : (
                                        <p className="text-slate-900 font-black text-lg uppercase leading-tight">{card.number}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <Star size={20} strokeWidth={3} />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Rareza</p>
                                </div>
                                <div className="w-full">
                                    {isEditing ? (
                                        <input value={editedCard.rarity || ''} onChange={e => setEditedCard({ ...editedCard, rarity: e.target.value })} className="w-full font-black text-sm p-2 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400" />
                                    ) : (
                                        <p className="text-slate-900 font-black uppercase leading-tight truncate" title={card.rarity}>{card.rarity}</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0_rgb(15,23,42)] flex flex-col gap-1 items-start">
                                <div className="flex items-center gap-2 text-pink-600 mb-1">
                                    <LayoutList size={20} strokeWidth={3} />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Variante</p>
                                </div>
                                <div className="w-full">
                                    {isEditing ? (
                                        <input value={editedCard.variant || ''} onChange={e => setEditedCard({ ...editedCard, variant: e.target.value })} className="w-full font-black text-sm p-2 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                                    ) : (
                                        <p className="text-slate-900 font-black uppercase leading-tight truncate" title={card.variant}>{card.variant || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-4 mt-4 overflow-hidden p-1">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 p-3 rounded-xl bg-white border-4 border-slate-900 text-slate-900 font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-[0_4px_0_rgb(15,23,42)] active:translate-y-1 active:shadow-none"
                                >
                                    <XCircle size={20} strokeWidth={3} />
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        if (onEditCard) {
                                            onEditCard(card.id, editedCard);
                                        }
                                        setIsEditing(false);
                                    }}
                                    className="flex-1 p-3 rounded-xl bg-blue-500 border-4 border-slate-900 text-white font-black uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-blue-400 transition-all shadow-[0_4px_0_rgb(15,23,42)] active:translate-y-1 active:shadow-none"
                                >
                                    <Save size={20} strokeWidth={3} />
                                    Guardar Cambios
                                </button>
                            </div>
                        )}

                        {/* Collection Status with animated backdrop */}
                        <div
                            onClick={() => onToggleOwned(card.id)}
                            className={`mt-8 p-5 rounded-xl border-4 flex items-center gap-4 transition-all duration-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 shadow-[4px_4px_0_rgb(15,23,42)] active:translate-y-0 active:shadow-[0_0_0_rgb(15,23,42)] ${card.owned
                                ? 'bg-green-400 border-slate-900'
                                : 'bg-white border-slate-900 hover:bg-slate-100'
                                }`}
                        >

                            <div className={`p-4 rounded-xl border-4 relative z-10 transition-colors shadow-[0_4px_0_rgb(15,23,42)] ${card.owned ? 'bg-white border-slate-900 text-green-500' : 'bg-white border-slate-900 text-slate-400'}`}>
                                {card.owned ? <CheckCircle size={32} strokeWidth={3} /> : <Circle size={32} strokeWidth={3} />}
                            </div>
                            <div className="relative z-10">
                                <p className={`text-sm font-black uppercase tracking-wider mb-1 ${card.owned ? 'text-green-900' : 'text-slate-500'}`}>Estado de Captura</p>
                                <p className={`text-2xl font-black uppercase tracking-tight ${card.owned ? 'text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]' : 'text-slate-400'}`}>
                                    {card.owned ? '¡Ya la tienes!' : 'Aún te falta'}
                                </p>
                            </div>
                        </div>

                        {onDeleteCard && (
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Seguro que deseas eliminar esta carta de la colección?")) {
                                        onDeleteCard(card.id);
                                    }
                                }}
                                className="w-full mt-6 p-4 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest border-4 border-slate-900 hover:bg-red-500 flex items-center justify-center gap-2 transition-all shadow-[0_4px_0_rgb(15,23,42)] active:translate-y-1 active:shadow-none"
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
