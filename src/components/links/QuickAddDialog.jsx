import { useState } from 'react';
import { Loader } from 'lucide-react';
import { isValidUrl } from '../../utils/url';
import BottomSheet from '../feedback/BottomSheet';

export default function QuickAddDialog({ isOpen, onClose, onSave, collections, isDuplicate, duplicateLink }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URL harus diisi');
      return;
    }

    if (!isValidUrl(url)) {
      setError('URL tidak valid. Gunakan http:// atau https://');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .trim()
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
        collectionId: selectedCollection || null,
      });

      setUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      setSelectedCollection('');
      onClose();
    } catch (err) {
      setError(err.message);
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
        disabled={isLoading}
      >
        Batal
      </button>
      <button
        type="submit"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading && <Loader size={16} className="animate-spin" />}
        {isLoading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Simpan Link Baru"
      actions={actions}
    >
      {isDuplicate && duplicateLink && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200 text-sm mb-4">
          <p className="font-medium text-yellow-900">Link sudah disimpan</p>
          <p className="text-yellow-800 mt-1">Klik tombol di bawah untuk membuka link yang sudah ada.</p>
          <button
            onClick={() => onClose()}
            className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Lihat Link →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL *
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul (opsional)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul custom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi (opsional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catatan singkat tentang link ini"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (opsional, pisahkan dengan koma)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        {/* Collection selector dropdown */}
        {collections && collections.length > 0 && (
          <div>
            <label htmlFor="collection" className="block text-sm font-medium text-gray-700 mb-1">
              Koleksi *
            </label>
            <select
              id="collection"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="">-- Pilih koleksi --</option>
              {collections.map(collection => (
                <option
                  key={collection.id}
                  value={collection.id}
                >
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </BottomSheet>
  );
}