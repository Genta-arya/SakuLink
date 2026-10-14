import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { linksService } from '../services/links.service';
import LinkCard from '../components/links/LinkCard';
import QuickAddDialog from '../components/links/QuickAddDialog';
import EditLinkDialog from '../components/links/EditLinkDialog';
import ConfirmModal from '../components/feedback/ConfirmModal';
import { Loader, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LibraryPage() {
  const { user } = useAuth();
  const { searchQuery, sortOrder } = useSearch();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLinkId, setDeletingLinkId] = useState(null);
  const [duplicateLink, setDuplicateLink] = useState(null);

  const loadLinks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await linksService.getLinks(user.uid);
      setLinks(data);
    } catch (error) {
      console.error('Gagal memuat link:', error);
      toast.error('Gagal memuat link');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleSaveLink = async (linkData) => {
    const duplicate = await linksService.checkDuplicate(user.uid, linkData.url);
    if (duplicate) {
      setDuplicateLink(duplicate);
      toast.warning('Link sudah ada di perpustakaan');
      return;
    }

    try {
      const newLink = await linksService.createLink(user.uid, linkData);
      setLinks([newLink, ...links]);
      toast.success('Link berhasil disimpan');
    } catch (error) {
      console.error('Gagal menyimpan link:', error);
      throw error;
    }
  };

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
    switch (sortOrder) {
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
      default:
        return b.title.localeCompare(a.title);
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Semua Link</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredLinks.length} dari {links.length} link</p>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus size={18} />
          Simpan Link
        </button>
      </div>

       {filteredLinks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Tidak ada link yang cocok' : 'Belum ada link tersimpan'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Simpan link pertama Anda →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLinks.map(link => (
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

      <QuickAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setDuplicateLink(null);
        }}
        onSave={handleSaveLink}
        isDuplicate={!!duplicateLink}
        duplicateLink={duplicateLink}
      />

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
