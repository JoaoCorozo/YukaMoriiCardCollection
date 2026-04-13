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
        <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-slate-800">
            <header className="mb-12 text-center flex flex-col items-center">
                <img src="/apple-touch-icon.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full border-2 border-slate-200 shadow-md mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                <h1 className="text-4xl sm:text-5xl font-black drop-shadow-sm mb-3">Poké Trackers</h1>
                <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
                    Administra tus cartas completando las colecciones oficiales o creando las tuyas propias.
                </p>
                <div className="h-1 w-20 bg-indigo-500 rounded-full mt-6"></div>
            </header>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Library className="text-indigo-500" /> Tus Colecciones
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                        <Upload size={18} className={isImporting ? "animate-pulse" : ""} />
                        <span className="hidden sm:inline">{isImporting ? "Importando..." : "Importar Excel"}</span>
                        <span className="sm:hidden">{isImporting ? "..." : "Importar"}</span>
                    </button>
                    <button
                        onClick={handleCreateCustom}
                        className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                    >
                        <FolderPlus size={18} />
                        <span className="hidden sm:inline">Nueva Colección</span>
                        <span className="sm:hidden">Nueva</span>
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
                        className="bg-white text-left w-full rounded-3xl border-2 border-slate-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden relative shadow-sm"
                    >
                        {col.id !== 'yuka-morii' && (
                            <div 
                                className="absolute top-3 right-3 z-10 p-2 text-red-500 bg-white/80 hover:bg-red-500 hover:text-white backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Estás seguro de que quieres eliminar "${col.title}"? Esta acción no se puede deshacer.`)) {
                                        onDeleteCollection(col.id);
                                    }
                                }}
                                title="Eliminar colección"
                            >
                                <Trash2 size={16} />
                            </div>
                        )}
                        
                        <div className="w-full h-36 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-100 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                                {col.coverImageUrl ? (
                                    <img src={col.coverImageUrl} className="w-full h-full object-cover" alt="cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-200"></div>
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        
                        <div className="p-5 flex flex-col justify-between flex-1 bg-white relative z-10 w-full">
                            <div>
                                <h3 className="font-black text-lg text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{col.title}</h3>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                                <div className="font-bold text-slate-700">
                                    <span className="text-indigo-600 font-black text-xl">{col.ownedCards}</span>
                                    <span className="text-slate-400 text-xs ml-1 font-bold">/ {col.totalCards > 0 ? col.totalCards : '?'}</span>
                                </div>
                                <div className="bg-indigo-50 p-2 rounded-full text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={18} />
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
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md"
                >
                    <Download size={16} /> Descargar Plantilla Excel
                </a>
            </div>
        </div>
    );
};
