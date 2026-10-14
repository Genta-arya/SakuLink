import { Link, useLocation } from 'react-router-dom';
import { Library, Heart, Layers, Settings, Plus } from 'lucide-react';

const leftNavItems = [
  { icon: Library, label: 'Semua', path: '/' },
  { icon: Heart, label: 'Favorit', path: '/favorites' },
];

const rightNavItems = [
  { icon: Layers, label: 'Koleksi', path: '/collections' },
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];

export default function BottomNav({ onAddClick }) {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16 relative">
        {/* Left Nav Items */}
        {leftNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center w-full h-full transition ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}

        {/* Center Floating Add Button */}
        <div className="w-full flex items-center justify-center h-full">
          <button
            onClick={onAddClick}
            className="absolute -top-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-105 active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Nav Items */}
        {rightNavItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center w-full h-full transition ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
