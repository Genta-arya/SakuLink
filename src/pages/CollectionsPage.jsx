import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { collectionsService } from '../services/collections.service';
import { linksService } from '../services/links.service';
import { Loader, Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { useNavigate } from 'react-router-dom';

export default function CollectionsPage() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [collectionLinkCounts, setCollectionLinkCounts] = useState({});

  const loadCollections = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await collectionsService.getCollections(user.uid);
      setCollections(data);
      // Load link counts for each collection
      const counts = {};
      for (const col of data) {
        const links = await linksService.getLinksByCollection(user.uid, col.id);
        counts[col.id] = links.length;
      }
      setCollectionLinkCounts(counts);
    } catch (error) {
      console.error('Gagal memuat koleksi:', error);
      toast.error('Gagal memuat koleksi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleSaveCollection = async (collectionData) => {
    if (!collectionData.name) {
      toast.error('Nama koleksi tidak boleh kosong.');
      return;
    }

    try {
      if (editingCollection) {
        const updatedCollection = await collectionsService.updateCollection(
          user.uid,
          editingCollection.id,
          { name: collectionData.name, description: collectionData.description || '' }
        );
        setCollections(collections.map(c => c.id === editingCollection.id ? updatedCollection : c));
        toast.success('Koleksi berhasil diperbarui');
      } else {
        const nameExists = await collectionsService.checkCollectionNameExists(user.uid, collectionData.name);
        if (nameExists) {
          toast.error('Nama koleksi sudah ada.');
          return;
        }
        const newCollection = await collectionsService.createCollection(user.uid, { name: collectionData.name, description: collectionData.description || '' });
        setCollections([newCollection, ...collections]);
        toast.success('Koleksi berhasil dibuat');
      }
      setIsAddModalOpen(false);
      setEditingCollection(null);
    } catch (error) {
      console.error('Gagal menyimpan koleksi:', error);
      toast.error('Gagal menyimpan koleksi');
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await collectionsService.deleteCollection(user.uid, deletingCollectionId);
      setCollections(collections.filter(c => c.id !== deletingCollectionId));
      delete collectionLinkCounts[deletingCollectionId];
      toast.success('Koleksi berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus koleksi:', error);
      toast.error('Gagal menghapus koleksi');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingCollectionId(null);
    }
  };

  const openDeleteModal = (collectionId) => {
    setDeletingCollectionId(collectionId);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingCollection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredCollections = collections.filter(collection => {
    const query = searchQuery.toLowerCase();
    return (
      collection.name.toLowerCase().includes(query) ||
      (collection.description && collection.description.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Koleksi</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredCollections.length} dari {collections.length} koleksi</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} />
          Buat Koleksi
        </button>
      </div>

      {filteredCollections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">{searchQuery ? 'Tidak ada koleksi yang cocok' : 'Belum ada koleksi'}</p>
          {!searchQuery && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Buat koleksi pertama Anda →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map(collection => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{collection.name}</h2>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(collection)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => openDeleteModal(collection.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{collection.description || 'Tidak ada deskripsi.'}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{collectionLinkCounts[collection.id] || 0} link</span>
                <button 
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  onClick={() => navigate(`/collections/${collection.id}`)}
                >
                  Lihat →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Collection Modal */}
      <CollectionModal 
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleSaveCollection}
        collection={editingCollection}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCollectionId(null);
        }}
        onConfirm={handleDeleteCollection}
        title="Hapus Koleksi"
        message="Apakah Anda yakin ingin menghapus koleksi ini? Link di dalamnya tidak akan dihapus."
        confirmText="Hapus"
        cancelText="Batal"
        danger={true}
      />
    </div>
  );
}

// Modal component
const CollectionModal = ({ isOpen, onClose, onSave, collection }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [collection, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{collection ? 'Edit Koleksi' : 'Buat Koleksi Baru'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition"><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">Nama Koleksi *</label>
            <input
              id="collectionName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Proyek Penting"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
            <textarea
              id="collectionDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat koleksi ini"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium text-sm">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm">{collection ? 'Simpan' : 'Buat Koleksi'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
