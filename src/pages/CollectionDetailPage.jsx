import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionsService } from '../services/collections.service';
import { linksService } from '../services/links.service';
import LinkCard from '../components/links/LinkCard';
import EditLinkDialog from '../components/links/EditLinkDialog';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { Loader, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CollectionDetailPage() {
  const { user } = useAuth();
  const { collectionId } = useParams();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);

  const loadCollection = useCallback(async () => {
    if (!user || !collectionId) return;
    try {
      setLoading(true);
      const collectionData = await collectionsService.getCollection(user.uid, collectionId);
      setCollection(collectionData);
      const linksData = await linksService.getLinksByCollection(user.uid, collectionId);
      setLinks(linksData);
    } catch (error) {
      console.error('Gagal memuat koleksi:', error);
      toast.error('Gagal memuat koleksi');
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  }, [user, collectionId, navigate]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handleEditLink = (link) => {
    setEditingLink(link);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (linkId, updates) => {
    try {
      await linksService.updateLink(user.uid, linkId, updates);
      setLinks(links.map(link =>
        link.id === linkId ? { ...link, ...updates } : link
      ));
      toast.success('Link berhasil diperbarui');
    } catch (error) {
      console.error('Gagal memperbarui link:', error);
      throw error;
    }
  };

  const handleDeleteClick = (linkId) => {
    setDeletingLinkId(linkId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await linksService.deleteLink(user.uid, deletingLinkId);
      setLinks(links.filter(link => link.id !== deletingLinkId));
      toast.success('Link berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus link:', error);
      toast.error('Gagal menghapus link');
    }
  };

  const handleFavorite = async (linkId, isFavorite) => {
    try {
      await linksService.updateLink(user.uid, linkId, { isFavorite });
      setLinks(links.map(link =>
        link.id === linkId ? { ...link, isFavorite } : link
      ));
      toast.success(isFavorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
    } catch (error) {
      console.error('Gagal update favorit:', error);
      toast.error('Gagal update favorit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Koleksi tidak ditemukan</p>
        <button
          onClick={() => navigate('/collections')}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Kembali ke koleksi →
        </button>
      </div>
    );
  }

  const filteredLinks = links.filter(link => {
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.domain.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      link.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/collections')}
          className="p-2 hover:bg-gray-100 rounded-md transition"
          title="Kembali"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
          )}
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">{searchQuery ? 'Tidak ada link yang cocok' : 'Belum ada link dalam koleksi ini'}</p>
          {!searchQuery && (
            <p className="text-sm text-gray-400">Edit link dari perpustakaan untuk menambahkan ke koleksi ini</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={handleEditLink}
              onDelete={() => handleDeleteClick(link.id)}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}

      <EditLinkDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveEdit}
        link={editingLink}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLinkId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Link"
        message="Apakah Anda yakin ingin menghapus link ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        danger={true}
      />
    </div>
  );
}
