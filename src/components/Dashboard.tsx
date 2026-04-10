import React, { useRef, useState } from 'react';
import type { CollectionItem } from '../types/Collection';
import { Library, Upload, Plus, ChevronRight, FolderPlus } from 'lucide-react';

interface DashboardProps {
    collections: CollectionItem[];
    onSelectCollection: (id: string) => void;
    onImportCollection: (file: File, name: string) => Promise<void>;
    onCreateCollection: (name: string) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ collections, onSelectCollection, onImportCollection, onCreateCollection }) => {
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
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="mb-10 text-center">
                <img src="/apple-touch-icon.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                <h1 className="text-4xl font-black text-slate-800 drop-shadow-sm mb-2">Poké Trackers</h1>
                <p className="text-slate-500 font-medium text-lg">Selecciona una colección o crea la tuya propia</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Collections List */}
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border-2 border-slate-100 flex flex-col gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700">
                        <Library className="text-blue-500" /> Tus Colecciones
                    </h2>
                    <div className="flex flex-col gap-3">
                        {collections.map(col => (
                            <button 
                                key={col.id} 
                                onClick={() => onSelectCollection(col.id)}
                                className="text-left w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all hover:border-slate-300 hover:shadow-md group"
                            >
                                <div className="w-14 h-14 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                                    {col.coverImageUrl ? (
                                        <img src={col.coverImageUrl} className="w-full h-full object-cover" alt="cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">{col.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        {col.ownedCards} / {col.totalCards > 0 ? col.totalCards : '?'} obtenidas
                                    </p>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Import and Create Section */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl text-white">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Upload className="text-blue-200" /> Importar Excel
                        </h2>
                        <p className="text-blue-100 text-sm mb-6">
                            Sube cualquier hoja de cálculo (.xlsx) y la aplicación creará una colección instantánea detectando los nombres e imágenes de tus cartas.
                        </p>
                        <input 
                            type="file" 
                            accept=".xlsx, .csv" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="w-full py-4 bg-white text-blue-800 font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                            {isImporting ? "Importando..." : "Subir Archivo Excel"}
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-8 rounded-3xl shadow-xl text-white flex-1 flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <FolderPlus className="text-purple-200" /> Colección Vacía
                        </h2>
                        <p className="text-purple-100 text-sm mb-6">
                            Comienza un registro desde cero y agrega cartas individualmente de forma manual.
                        </p>
                        <button 
                            onClick={handleCreateCustom}
                            className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white border-2 border-white/50 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Crear Colección
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
