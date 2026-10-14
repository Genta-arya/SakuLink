import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { linksService } from '../services/links.service';
import LinkCard from '../components/links/LinkCard';
import EditLinkDialog from '../components/links/EditLinkDialog';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { Loader, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function RecentPage() {
  const { user } = useAuth();
  const { searchQuery, sortOrder } = useSearch();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);

  const loadRecent = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await linksService.getLinks(user.uid, 'recently-opened');
      const recentLinks = data.filter(link => link.lastOpenedAt);
      setLinks(recentLinks);
    } catch (error) {
      console.error('Gagal memuat link terbaru:', error);
      toast.error('Gagal memuat link terbaru');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

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
        <Clock size={24} className="text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terbaru</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredLinks.length} dari {links.length} link yang pernah dibuka</p>
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">{searchQuery ? 'Tidak ada link yang cocok' : 'Belum ada link yang dibuka baru-baru ini'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
