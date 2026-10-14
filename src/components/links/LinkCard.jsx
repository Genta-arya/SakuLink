import { Heart, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCardDensity } from '../../contexts/CardDensityContext';

export default function LinkCard({ link, onEdit, onDelete, onFavorite }) {
  const { cardDensity } = useCardDensity();
  const isCompact = cardDensity === 'compact';

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    onFavorite(link.id, !link.isFavorite);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    onEdit(link);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    onDelete(link.id);
  };

  const statusColors = {
    unread: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition shadow-sm flex flex-col ${isCompact ? 'p-3' : 'p-4'}`}
    >
      <div className={`flex gap-${isCompact ? '2' : '4'}`}>
        {/* Favicon */}
        <div className="flex-shrink-0">
          <img
            src={link.faviconUrl}
            alt=""
            className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover bg-white`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 truncate ${isCompact ? 'text-sm' : ''}`}>{link.title}</h3>
              <p className={`text-gray-500 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>{link.domain}</p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={handleFavoriteClick}
                className="p-1 hover:bg-gray-100 rounded transition"
                title={link.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Heart
                  size={isCompact ? 16 : 18}
                  className={link.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>
          </div>

          {/* Tags and Status */}
          {!isCompact && (
            <div className="mt-2 flex gap-2 flex-wrap items-center">
              {link.tags && link.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {link.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {link.status !== 'unread' && (
                <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[link.status]}`}>
                  {link.status === 'in_progress' ? 'Sedang Dikerjakan' : 'Selesai'}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {!isCompact && link.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{link.description}</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`flex gap-2 mt-${isCompact ? '2' : '3'} pt-${isCompact ? '2' : '3'} border-t border-gray-100`}>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-1 text-indigo-600 hover:bg-indigo-50 px-3 rounded transition ${isCompact ? 'py-1 text-xs' : 'py-1.5 text-sm'}`}
        >
          <ExternalLink size={isCompact ? 14 : 16} />
          {!isCompact && 'Buka'}
        </a>
        <button
          onClick={handleEditClick}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded transition"
          title="Edit"
        >
          <Edit2 size={isCompact ? 14 : 16} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
          title="Hapus"
        >
          <Trash2 size={isCompact ? 14 : 16} />
        </button>
      </div>
    </motion.div>
  );
}

