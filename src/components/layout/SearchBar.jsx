import { Search, X, ArrowUpDown } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { useState } from 'react';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, sortOrder, setSortOrder, showSort } = useSearch();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchQuery('');
    setIsFocused(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari link, domain, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
              title="Bersihkan pencarian"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          {searchQuery && (
            <p className="text-xs text-gray-500">
              Menampilkan hasil untuk: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
          {showSort && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-600">Urutkan:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
