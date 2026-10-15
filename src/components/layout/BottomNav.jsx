import { Link, useLocation } from 'react-router-dom';
import { Heart, Layers, Plus } from 'lucide-react';

const leftNavItems = [
  { icon: Layers, label: 'Koleksi', path: '/' },
];

const rightNavItems = [
  { icon: Heart, label: 'Favorit', path: '/favorites' },
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
            aria-label="Tambah link"
            className="group absolute -top-6 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white ring-4 ring-white border-2 border-indigo-200 shadow-lg shadow-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/60 hover:scale-105 active:scale-95"
          >
            <Plus
              size={30}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
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
