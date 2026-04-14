import React, { useRef, useState } from 'react';
import type { CollectionItem } from '../types/Collection';
import { Library, Upload, ChevronRight, FolderPlus, Download, Trash2 } from 'lucide-react';

interface DashboardProps {
    collections: CollectionItem[];
    onSelectCollection: (id: string) => void;
    onImportCollection: (file: File, name: string) => Promise<void>;
    onCreateCollection: (name: string) => Promise<void>;
    onDeleteCollection: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ collections, onSelectCollection, onImportCollection, onCreateCollection, onDeleteCollection }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        const name = file.name.replace('.xlsx', '').replace('.csv', '');
        await onImportCollection(file, name);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreateCustom = async () => {
        const name = prompt("Escribe el nombre de tu nueva colección:");
        if (name) {
            await onCreateCollection(name);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
            {/* Pokédex Header */}
            <header className="bg-red-600 border-b-8 border-slate-900 shadow-xl mb-12 relative">
                <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-full border-4 border-slate-900 shadow-[0_0_0_4px_rgba(0,0,0,0.1)_inset] mb-4 relative z-10">
                        <img src="/apple-touch-icon.png" alt="Logo" className="w-16 h-16 rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] mb-2 tracking-wide uppercase">
                        Poké Trackers
                    </h1>
                    <p className="text-red-100 font-bold text-center text-sm sm:text-base max-w-xl tracking-wide">
                        ¡Tu registro personalizado para atraparlas todas!
                    </p>
                </div>
                {/* Pokeball line effect */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-slate-900 z-0 translate-y-1/2"></div>
            </header>

            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                    <h2 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tight text-slate-800">
                        <Library className="text-red-600" size={32} strokeWidth={3} /> Mis Colecciones
                    </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex items-center gap-2 bg-yellow-400 text-yellow-950 border-4 border-slate-900 hover:bg-yellow-300 hover:-translate-y-1 active:translate-y-0 px-4 py-2.5 rounded-xl font-black uppercase transition-all shadow-[0_4px_0_rgb(15,23,42)] disabled:opacity-50"
                    >
                        <Upload size={20} strokeWidth={3} className={isImporting ? "animate-pulse" : ""} />
                        <span className="hidden sm:inline">{isImporting ? "Cargando..." : "Subir Excel"}</span>
                        <span className="sm:hidden">{isImporting ? "..." : "Subir"}</span>
                    </button>
                    <button
                        onClick={handleCreateCustom}
                        className="flex items-center gap-2 bg-blue-500 text-white border-4 border-slate-900 hover:bg-blue-400 hover:-translate-y-1 active:translate-y-0 px-4 py-2.5 rounded-xl font-black uppercase transition-all shadow-[0_4px_0_rgb(15,23,42)]"
                    >
                        <FolderPlus size={20} strokeWidth={3} />
                        <span className="hidden sm:inline">Crear Nueva</span>
                        <span className="sm:hidden">Crear</span>
                    </button>
                </div>
            </div>
            
            <input 
                type="file" 
                accept=".xlsx, .csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {collections.map(col => (
                    <button 
                        key={col.id} 
                        onClick={() => onSelectCollection(col.id)}
                        className="bg-white text-left w-full rounded-2xl border-4 border-slate-900 hover:border-blue-500 hover:-translate-y-1 transition-transform duration-200 group flex flex-col overflow-hidden relative shadow-[4px_4px_0_rgb(15,23,42)]"
                    >
                        <div 
                            className="absolute top-3 right-3 z-20 p-2 text-white bg-slate-900 border-2 border-slate-900 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`¿Estás seguro de que quieres eliminar "${col.title}"? Esta acción no se puede deshacer.`)) {
                                    onDeleteCollection(col.id);
                                }
                            }}
                            title="Eliminar colección"
                        >
                            <Trash2 size={16} strokeWidth={3} />
                        </div>
                        
                        <div className="w-full h-40 bg-slate-200 flex items-center justify-center relative overflow-hidden border-b-4 border-slate-900">
                            <div className="absolute inset-0 bg-slate-200 transition-transform duration-500 group-hover:scale-105">
                                {col.coverImageUrl ? (
                                    <img src={col.coverImageUrl} className="w-full h-full object-cover" alt="cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500"></div>
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        
                        <div className="p-5 flex flex-col justify-between flex-1 bg-white relative z-10 w-full">
                            <div>
                                <h3 className="font-black text-xl text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase">{col.title}</h3>
                            </div>
                            
                            <div className="flex items-center justify-between border-t-4 border-slate-100 pt-3 mt-3">
                                <div className="font-bold text-slate-400">
                                    <span className="text-slate-900 font-black text-2xl">{col.ownedCards}</span>
                                    <span className="ml-1 uppercase text-sm">/ {col.totalCards > 0 ? col.totalCards : '?'}</span>
                                </div>
                                <div className="bg-slate-100 border-2 border-slate-300 p-2 rounded-full text-slate-500 group-hover:bg-yellow-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-colors">
                                    <ChevronRight size={20} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </button>
                ))}

            </div>
            
            <div className="mt-16 text-center">
                <a 
                    href="/template_coleccion.xlsx" 
                    download 
                    className="inline-flex items-center gap-2 text-sm font-black uppercase text-slate-500 hover:text-slate-900 bg-white px-6 py-3 rounded-xl border-4 border-slate-300 hover:border-slate-900 transition-all hover:-translate-y-1"
                >
                    <Download size={18} strokeWidth={3} /> Plantilla .XLSX
                </a>
            </div>
        </div>
        </div>
    );
};
