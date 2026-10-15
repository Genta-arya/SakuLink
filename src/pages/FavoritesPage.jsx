import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { linksService } from '../services/links.service';
import LinkCard from '../components/links/LinkCard';
import EditLinkDialog from '../components/links/EditLinkDialog';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { Loader, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { searchQuery, sortOrder } = useSearch();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await linksService.getFavoriteLinks(user.uid);
      setLinks(data);
    } catch (error) {
      console.error('Gagal memuat favorit:', error);
      toast.error('Gagal memuat favorit');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavorite = async (linkId, isFavorite) => {
    try {
      await linksService.updateLink(user.uid, linkId, { isFavorite });
      setLinks(links.filter(link => link.id !== linkId));
      toast.success('Dihapus dari favorit');
    } catch (error) {
      console.error('Gagal update favorit:', error);
      toast.error('Gagal update favorit');
    }
  };

  const handleEdit = (link) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
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

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (!sortOrder || sortOrder === 'a-z') {
      return a.title.localeCompare(b.title);
    }
    return b.title.localeCompare(a.title);
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Heart size={24} className="text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Favorit</h1>
         
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{searchQuery ? 'Tidak ada link favorit yang cocok' : 'Belum ada link favorit'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLinks.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={handleEdit}
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
        message={`Apakah Anda yakin ingin menghapus link ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        danger={true}
      />
    </div>
  );
}
