import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Load theme from Firestore on user change
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const savedTheme = userData.preferences?.theme || 'system';
            setTheme(savedTheme);
          }
        } catch (error) {
          console.error('Gagal memuat preferensi tema:', error);
        }
      } else {
        // Guest user: fallback to localStorage
        const savedTheme = localStorage.getItem('sakulink-theme') || 'system';
        setTheme(savedTheme);
      }
      setLoading(false);
    };

    loadTheme();
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (isDark) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const listener = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('sakulink-theme', newTheme);
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'preferences.theme': newTheme,
        });
      } catch (error) {
        console.error('Gagal menyimpan tema ke Firestore:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, changeTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
