import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  actions = null
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Desktop Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="hidden lg:flex fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
            {actions && (
              <div className="mt-6 flex gap-3">
                {actions}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Bottom Sheet */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-4 pb-24">
            {children}
          </div>

          {actions && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              {actions}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
