import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collectionsService } from '../../services/collections.service';
import { Loader } from 'lucide-react';
import BottomSheet from '../feedback/BottomSheet';

export default function EditLinkDialog({ isOpen, onClose, onSave, link }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('unread');
  const [collectionId, setCollectionId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setDescription(link.description || '');
      setTags(link.tags ? link.tags.join(', ') : '');
      setNotes(link.notes || '');
      setStatus(link.status || 'unread');
      setCollectionId(link.collectionId || null);
    }
  }, [link]);

  const loadCollections = useCallback(async () => {
    try {
      setCollectionsLoading(true);
      const data = await collectionsService.getCollections(user.uid);
      setCollections(data);
    } catch (error) {
      console.error('Gagal memuat koleksi:', error);
    } finally {
      setCollectionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadCollections();
    }
  }, [isOpen, user, loadCollections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(link.id, {
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: notes.trim(),
        status,
        collectionId: collectionId || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const actions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium text-sm"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50"
      >
        {isLoading && <Loader size={16} className="animate-spin" />}
        Simpan
      </button>
    </>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Link"
      actions={actions}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (pisahkan koma)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="unread">Belum Dibaca</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Koleksi
          </label>
          <select
            value={collectionId || ''}
            onChange={(e) => setCollectionId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={collectionsLoading}
          >
            <option value="">Tanpa Koleksi</option>
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </form>
    </BottomSheet>
  );
}
