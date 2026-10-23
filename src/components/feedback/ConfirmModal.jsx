import BottomSheet from './BottomSheet';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  danger = false
}) {
  if (!isOpen) return null;

  const actions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-sm ${
          danger
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
    >
      <div className="flex items-start gap-4">
        {danger && (
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
