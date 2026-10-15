import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CardDensityContext = createContext();

export const useCardDensity = () => {
  const context = useContext(CardDensityContext);
  if (!context) {
    throw new Error('useCardDensity must be used within CardDensityProvider');
  }
  return context;
};

export const CardDensityProvider = ({ children }) => {
  const { user } = useAuth();
  const [cardDensity, setCardDensity] = useState('comfortable');
  const [loading, setLoading] = useState(true);

  const loadCardDensity = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setCardDensity(userData.preferences?.cardDensity || userData.settings?.cardDensity || 'comfortable');
      }
    } catch (error) {
      console.error('Gagal memuat card density:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCardDensity();
  }, [loadCardDensity]);

  return (
    <CardDensityContext.Provider value={{ density: cardDensity, setDensity: setCardDensity, loading }}>
      {children}
    </CardDensityContext.Provider>
  );
};
