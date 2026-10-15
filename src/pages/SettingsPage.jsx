import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { linksService } from '../services/links.service';
import { collectionsService } from '../services/collections.service';
import { encryptUrl, decryptUrl } from '../utils/encryption';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader, User, Mail, Settings, Save, Shield, Smartphone, Monitor, Layout, Folder } from 'lucide-react';
import { useCardDensity } from '../contexts/CardDensityContext';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
   const { user } = useAuth();
  const navigate = useNavigate();
  const { density, setDensity } = useCardDensity();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migratingToBackup, setMigratingToBackup] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setDisplayName(userData.displayName || user.displayName || 'Pengguna');
        setEmail(userData.email || user.email || '');
        setDensity(userData.preferences?.cardDensity || 'comfortable');
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

  const handleDensityChange = async (newDensity) => {
    if (!user) return;
    try {
      setIsSaving(true);
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        preferences: {
          cardDensity: newDensity
        }
      }, { merge: true });
      setDensity(newDensity);
      toast.success(`Densitas kartu diubah ke ${newDensity}`);
    } catch (error) {
      console.error('Gagal simpan setting:', error);
      toast.error('Gagal menyimpan preferensi');
    } finally {
      setIsSaving(false);
    }
  };

  const migrateLinks = async () => {
    if (!user) return;
    try {
      setMigrating(true);
      const linksRef = collection(db, 'users', user.uid, 'links');
      const snapshot = await getDocs(linksRef);
      
      let count = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Check if URL is plaintext (starts with http/https) - needs encryption
        const isPlaintext = typeof data.url === 'string' && (data.url.startsWith('http://') || data.url.startsWith('https://'));
        
        if (isPlaintext) {
          try {
            const encryptedUrl = await encryptUrl(data.url, user.uid);
            await updateDoc(docSnap.ref, { url: encryptedUrl });
            count++;
          } catch (encryptError) {
            console.warn('Failed to encrypt link:', encryptError);
            // Continue with other links
          }
        }
      }
      
      toast.success(`${count} link berhasil diamankan (enkripsi)`);
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Gagal melakukan enkripsi data lama');
    } finally {
      setMigrating(false);
    }
  };

  const migrateLinksToBackup = async () => {
    if (!user) return;
    try {
      setMigrating(true);
      
      // Check for links without a collection
      const linksRef = collection(db, 'users', user.uid, 'links');
      const snapshot = await getDocs(linksRef);
      const unassignedLinks = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.collectionId == null) {
          unassignedLinks.push({ id: docSnap.id, data });
        }
      }
      
      if (unassignedLinks.length === 0) {
        toast.info('Semua link sudah memiliki koleksi');
        setMigrating(false);
        return;
      }
      
      // Create or find "Backup" collection
      const collections = await collectionsService.getCollections(user.uid);
      let backupCollectionId = null;
      
      const backupCollection = collections.find(c => c.name === 'Backup');
      if (backupCollection) {
        backupCollectionId = backupCollection.id;
      } else {
        const newBackup = await collectionsService.createCollection(user.uid, {
          name: 'Backup',
          description: 'Link tanpa koleksi'
        });
        backupCollectionId = newBackup.id;
      }
      
      // Move all unassigned links to Backup collection
      let count = 0;
      for (const link of unassignedLinks) {
        await linksService.updateLink(user.uid, link.id, { collectionId: backupCollectionId });
        count++;
      }
      
      toast.success(`${count} link dipindahkan ke koleksi Backup`);
    } catch (error) {
      console.error('Migration to backup error:', error);
      toast.error('Gagal memindahkan link ke backup');
    } finally {
      setMigrating(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        preferences: {
          cardDensity: density,
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
      <div className="mb-12 pb-8 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferensi</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            
            <div className="flex-1 min-w-0 space-y-2">
             
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="cardDensity"
                    value="comfortable"
                    checked={density === 'comfortable'}
                    onChange={(e) => handleDensityChange(e.target.value)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  Komfortabel (Nama lengkap + Deskripsi + Tag)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="cardDensity"
                    value="compact"
                    checked={density === 'compact'}
                    onChange={(e) => handleDensityChange(e.target.value)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  Kompak (Nama link saja)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pilihan ini berlaku untuk semua halaman link
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          {migrating ? (
            <div className="flex items-center justify-center">
              <Loader size={20} className="mr-2" />
              <span>Mengenkripsi link lama...</span>
            </div>
          ) : (
            <button
              onClick={migrateLinks}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:border-indigo-300 transition"
            >
              <Shield size={20} className="mr-2" />
              <span>Amankan Link Lama (Enkripsi)</span>
            </button>
          )}
        </div>
        <div className="pt-2">
          {migratingToBackup ? (
            <div className="flex items-center justify-center">
              <Loader size={20} className="mr-2" />
              <span>Memindahkan link ke Backup...</span>
            </div>
          ) : (
            // <button
            //   onClick={migrateLinksToBackup}
            //   className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:border-indigo-300 transition"
            // >
            //   <Folder size={20} className="mr-2" />
            //   <span>Pindahkan ke Backup</span>
            // </button>
            <>
            </>
          )}
        </div>
      </div>

      {/* Save Preferences Button */}
      <div className="mt-8">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader size={20} className="mr-2" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}