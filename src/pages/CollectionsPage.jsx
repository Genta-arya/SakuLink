import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { collectionsService } from '../services/collections.service';
import { linksService } from '../services/links.service';
import { Loader, Plus, Edit2, Trash2, X, Folder, BookOpen, Star, Briefcase, Heart, Code, Music, Camera, Plane, Coffee, Gamepad2, BookMarked, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  Folder, Book: BookOpen, Star, Briefcase, Heart, Code,
  Music, Camera, Plane, Coffee, Gamepad: Gamepad2, BookMarked,
};

const getCollectionIcon = (iconName) => {
  if (!iconName) return Folder;
  if (iconName.startsWith('http://') || iconName.startsWith('https://')) {
    return null;
  }
  return ICON_MAP[iconName] || Folder;
};

export default function CollectionsPage() {
  const { user } = useAuth();
  const { searchQuery, sortOrder } = useSearch();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [collectionLinkCounts, setCollectionLinkCounts] = useState({});
  const [saving, setSaving] = useState(false);
const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (anchorEl && !e.target.closest(`[data-collection-id="${anchorEl}"]`) && !e.target.closest('.collection-menu-dropdown')) {
        setAnchorEl(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [anchorEl]);

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

  setSaving(true);
  try {
    if (editingCollection) {
      const updatedCollection = await collectionsService.updateCollection(
        user.uid,
        editingCollection.id,
        { 
          name: collectionData.name, 
          description: collectionData.description || '',
          icon: collectionData.icon || editingCollection.icon,
          color: collectionData.color || editingCollection.color 
        }
      );
      setCollections(collections.map(c => c.id === editingCollection.id ? updatedCollection : c));
      toast.success('Koleksi berhasil diperbarui');
    } else {
      const nameExists = await collectionsService.checkCollectionNameExists(user.uid, collectionData.name);
      if (nameExists) {
        toast.error('Nama koleksi sudah ada.');
        return;
      }
      const newCollection = await collectionsService.createCollection(user.uid, { 
        name: collectionData.name, 
        description: collectionData.description || '',
        icon: collectionData.icon,
        color: collectionData.color 
      });
      setCollections([newCollection, ...collections]);
      toast.success('Koleksi berhasil dibuat');
    }
    setIsAddModalOpen(false);
    setEditingCollection(null);
  } catch (error) {
    console.error('Gagal menyimpan koleksi:', error);
    toast.error('Gagal menyimpan koleksi');
  } finally {
    setSaving(false);
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

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    if (!sortOrder || sortOrder === 'a-z') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* icon yang cocok */}
          <Folder size={24} className="text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Koleksi</h1>
          
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center text-sm gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={18} />
          Buat Koleksi
        </button>
      </div>

      {sortedCollections.length === 0 ? (
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
         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
           {sortedCollections.map(collection => {
             const IconComponent = getCollectionIcon(collection.icon);
             const isCustomUrl = collection.icon && (collection.icon.startsWith('http://') || collection.icon.startsWith('https://'));
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition shadow-sm flex flex-col justify-between relative"
                  onClick={() => {
                    navigate(`/collections/${collection.id}`);
                  }}
                >
<div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: collection.color || '#8B5CF6' }}
                        >
                          {isCustomUrl ? (
                            <img src={collection.icon} alt={collection.name} className="w-6 h-6 object-contain rounded" />
                          ) : (
                            <IconComponent size={20} className="text-white" />
                          )}
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900 leading-tight break-words">{collection.name}</h2>
                      </div>
                      <div data-collection-id={collection.id}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(anchorEl === collection.id ? null : collection.id);
                          }}
                          className="p-1  text-gray-500 hover:bg-gray-100 rounded transition"
                          title="More"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{collectionLinkCounts[collection.id] || 0} link</span>
                  </div>
                  {anchorEl === collection.id && (
                    <div 
                      className="absolute top-0 right-0 mt-2 mr-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 collection-menu-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(null);
                            openEditModal(collection);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(null);
                            openDeleteModal(collection.id);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
             );
           })}
         </div>
       )}

      {/* Add/Edit Collection Modal */}
      <CollectionModal 
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleSaveCollection}
        collection={editingCollection}
        loading={saving}
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
const ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'Book', icon: BookOpen },
  { name: 'Star', icon: Star },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Heart', icon: Heart },
  { name: 'Code', icon: Code },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Plane', icon: Plane },
  { name: 'Coffee', icon: Coffee },
  { name: 'Gamepad', icon: Gamepad2 },
  { name: 'BookMarked', icon: BookMarked },
];

const COLORS = [
  '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#3B82F6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

const CollectionModal = ({ isOpen, onClose, onSave, collection, loading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [customIconUrl, setCustomIconUrl] = useState('');

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
      setSelectedIcon(collection.icon || '');
      setSelectedColor(collection.color || '#8B5CF6');
      setCustomIconUrl('');
    } else {
      setName('');
      setDescription('');
      setSelectedIcon('');
      setSelectedColor('#8B5CF6');
      setCustomIconUrl('');
    }
  }, [collection, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const icon = customIconUrl.trim() ? customIconUrl.trim() : selectedIcon;
    onSave({ name, description, icon: icon, color: selectedColor });
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
          <h2 className="text-base font-semibold text-gray-900">{collection ? 'Edit Koleksi' : 'Buat Koleksi Baru'}</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Icon atau URL Gambar</label>
            <input
              type="text"
              value={customIconUrl}
              onChange={(e) => setCustomIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            />
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`flex items-center justify-center p-2 rounded-lg border-2 transition hover:bg-gray-50 ${
                    selectedIcon === name ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                  title={name}
                >
                  <Icon size={20} className={selectedIcon === name ? 'text-indigo-600' : 'text-gray-600'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Warna</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${
                    selectedColor === color ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium text-sm" disabled={loading}>Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader size={16} className="animate-spin" />}
              {collection ? 'Simpan' : 'Buat Koleksi'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
