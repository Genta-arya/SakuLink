import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');
  const [showSort, setShowSort] = useState(false);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, sortOrder, setSortOrder, showSort, setShowSort }}>
      {children}
    </SearchContext.Provider>
  );
};
