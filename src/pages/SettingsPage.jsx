import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { LogOut, Loader, User, Mail, Settings, Save } from 'lucide-react';
import { authService } from '../services/auth.service';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [cardDensity, setCardDensity] = useState('comfortable');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setDisplayName(userData.displayName || user.displayName || 'Pengguna');
        setEmail(userData.email || user.email || '');
        setCardDensity(userData.preferences?.cardDensity || 'comfortable');
      } else {
        setDisplayName(user.displayName || 'Pengguna');
        setEmail(user.email || '');
      }
    } catch (error) {
      console.error('Gagal memuat profil user:', error);
      toast.error('Gagal memuat profil user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        preferences: {
          cardDensity: cardDensity,
        },
        updatedAt: new Date(),
      }, { merge: true });
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Gagal menyimpan pengaturan:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

   const handleLogout = async () => {
     try {
       await authService.logout();
       navigate('/login');
      
     } catch (error) {
       console.error('Gagal logout:', error);
       toast.error(getAuthErrorMessage(error));
     }
   };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-12">Pengaturan</h1>

      {/* Profile Section */}
      <div className="mb-12 pb-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Akun Saya</h2>
        <div className="space-y-5">
       

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={24} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
              <p className="text-base font-medium text-gray-900 truncate">{email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded transition hover:bg-red-50"
        >
          <LogOut size={16} />
          Keluar Akun
        </button>
      </div>

      {/* Preferences Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Settings size={20} className="text-indigo-600" />
          Preferensi
        </h2>
        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kepadatan Kartu Link
            </label>
            <div className="flex gap-4">
              {[
                { value: 'comfortable', label: 'Nyaman' },
                { value: 'compact', label: 'Rapat' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cardDensity"
                    value={value}
                    checked={cardDensity === value}
                    onChange={(e) => setCardDensity(e.target.value)}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full justify-center text-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
}
