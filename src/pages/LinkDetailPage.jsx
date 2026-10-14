import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { linksService } from '../services/links.service';
import { 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Heart, 
  Copy, 
  Loader,
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

export default function LinkDetailPage() {
  const { linkId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const loadLink = useCallback(async () => {
    if (!user || !linkId) return;

    try {
      setLoading(true);
      const data = await linksService.getLink(user.uid, linkId);
      setLink(data);
      await linksService.updateLastOpened(user.uid, linkId);
    } catch (error) {
      console.error('Gagal memuat link:', error);
      toast.error('Link tidak ditemukan');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [linkId, user, navigate]);

  useEffect(() => {
    loadLink();
  }, [loadLink]);

  const handleFavorite = async () => {
    try {
      const updated = await linksService.updateLink(user.uid, linkId, { 
        isFavorite: !link.isFavorite 
      });
      setLink(updated);
      toast.success(updated.isFavorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
    } catch (error) {
      console.error('Gagal update favorit:', error);
      toast.error('Gagal update favorit');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link.url);
    toast.success('URL berhasil disalin');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Hapus link "${link.title}"?`)) return;
    
    try {
      await linksService.deleteLink(user.uid, linkId);
      toast.success('Link berhasil dihapus');
      navigate('/');
    } catch (error) {
      console.error('Gagal menghapus link:', error);
      toast.error('Gagal menghapus link');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Link tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft size={18} />
        Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Link Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <img
                src={link.faviconUrl}
                alt=""
                className="w-12 h-12 rounded object-cover bg-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 break-words">{link.title}</h1>
                <p className="text-sm text-gray-500 break-all">{link.domain}</p>
              </div>
            </div>

            {link.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">{link.description}</p>
              </div>
            )}

            {link.tags && link.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {link.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {link.notes && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Catatan</p>
                <p className="text-sm text-gray-700">{link.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <ExternalLink size={18} />
                Buka Link Asli
              </a>
              <button
                onClick={handleCopyUrl}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <Copy size={18} />
                Salin URL
              </button>
              <button
                onClick={handleFavorite}
                className={`w-full flex items-center justify-center gap-2 border px-4 py-2 rounded-lg transition ${
                  link.isFavorite 
                    ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart size={18} className={link.isFavorite ? 'fill-red-500' : ''} />
                {link.isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
              </button>
              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={18} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Iframe Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-[calc(100vh-200px)] relative">
            {iframeLoading && !iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <Loader size={32} className="animate-spin text-indigo-600" />
              </div>
            )}

            {iframeError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6">
                <AlertCircle size={48} className="text-yellow-500 mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Preview Tidak Tersedia</p>
                <p className="text-sm text-gray-600 text-center max-w-md mb-4">
                  Website ini tidak dapat ditampilkan di preview karena kebijakan keamanan (X-Frame-Options atau CSP).
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <ExternalLink size={18} />
                  Buka di Tab Baru
                </a>
              </div>
            ) : (
              <iframe
                src={link.url}
                title={link.title}
                className="w-full h-full"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
