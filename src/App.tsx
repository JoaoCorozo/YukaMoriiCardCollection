import { useState } from 'react';
import { useCollections } from './hooks/useCollections';
import { Dashboard } from './components/Dashboard';
import { CollectionView } from './components/CollectionView';

function App() {
  const { 
    collections, 
    activeCollection, 
    cards, 
    loading, 
    error, 
    loadCollection, 
    unloadCollection,
    toggleOwnership, 
    updateCardImage, 
    reloadDatabase,
    createCollection,
    importCollectionFromExcel,
    addManualCard
  } = useCollections();

  const [currentView, setCurrentView] = useState<'dashboard' | 'collection'>('dashboard');

  const handleSelectCollection = async (id: string) => {
    await loadCollection(id);
    setCurrentView('collection');
  };

  const handleBackToDashboard = () => {
    unloadCollection();
    setCurrentView('dashboard');
  };

  const handleCreateCollection = async (name: string) => {
    const newCol = await createCollection(name, 'Colección personalizada.');
    await loadCollection(newCol.id);
    setCurrentView('collection');
  };

  const handleImportCollection = async (file: File, name: string) => {
    const newCol = await importCollectionFromExcel(file, name, 'Importado desde Excel');
    await loadCollection(newCol.id);
    setCurrentView('collection');
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-300 transition-all font-sans">
      {currentView === 'dashboard' || !activeCollection ? (
        <Dashboard 
          collections={collections}
          onSelectCollection={handleSelectCollection}
          onCreateCollection={handleCreateCollection}
          onImportCollection={handleImportCollection}
          onDeleteCollection={deleteCollection}
        />
      ) : (
        <CollectionView 
          collection={activeCollection}
          cards={cards}
          loading={loading}
          error={error}
          onBack={handleBackToDashboard}
          toggleOwnership={toggleOwnership}
          updateCardImage={updateCardImage}
          reloadDatabase={reloadDatabase}
          onAddManualCard={(card) => addManualCard(activeCollection.id, card)}
        />
      )}
    </div>
  );
}

export default App;
