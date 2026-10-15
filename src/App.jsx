import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "./services/auth.service";
import { Toaster } from "sonner";
import BottomNav from "./components/layout/BottomNav";
import SearchBar from "./components/layout/SearchBar";
import QuickAddDialog from "./components/links/QuickAddDialog";
import { useSearch } from "./contexts/SearchContext";
import { useAddLinkDialog } from "./contexts/AddLinkDialogContext";
import { linksService } from "./services/links.service";
import { collectionsService } from "./services/collections.service";
import { useAuth } from "./contexts/AuthContext";
import {
  Library,
  Heart,
  Clock,
  Layers,
  Settings,
  LogOut,
  Search,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import nav from "./assets/nav.png";
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery, setShowSort } = useSearch();
  const {
    isOpen,
    open: openAddDialog,
    close: closeAddDialog,
  } = useAddLinkDialog();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);

  const showSearchBar = location.pathname !== "/settings";
  const isListPage =
    ["/", "/library", "/favorites", "/recent", "/collections"].includes(
      location.pathname,
    ) || location.pathname.startsWith("/collections/");

  useEffect(() => {
    setShowSort(isListPage);
  }, [location.pathname, setShowSort]);

  useEffect(() => {
    if (!user) return;
    const loadCollections = async () => {
      try {
        const data = await collectionsService.getCollections(user.uid);
        setCollections(data);
      } catch (error) {
        console.error("Gagal memuat koleksi:", error);
        toast.error("Gagal memuat koleksi");
      }
    };
    loadCollections();
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  const handleSaveLink = async (linkData) => {
    if (!user) return;
    try {
      const duplicate = await linksService.checkDuplicate(
        user.uid,
        linkData.url,
      );
      if (duplicate) {
        toast.warning("Link sudah ada di perpustakaan");
        return;
      }
      await linksService.createLink(user.uid, linkData);
      toast.success("Link berhasil disimpan");
      closeAddDialog();
      window.location.reload();
    } catch (error) {
      console.error("Gagal menyimpan link:", error);
      toast.error("Gagal menyimpan link");
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" richColors />

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex flex-col h-full">
          <img src={nav} alt="SakuLink Logo" className="mb-4" />

          <nav className="flex-1 space-y-2">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
                location.pathname === '/'
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers size={20} />
              Koleksi
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
                location.pathname === '/favorites'
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart size={20} />
              Favorit
            </Link>
          </nav>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
                location.pathname === '/settings'
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              Pengaturan
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:pb-0 pb-20">
        {/* Header */}
        <header className="h-16 md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden text-xl font-bold text-gray-900">
            <img src={nav} alt="SakuLink Logo" className="w-40" />
          </div>

          <div className="flex items-center gap-4">
           
          </div>

          <div className="md:hidden flex justify-end items-end gap-4">
            <button
              onClick={() => navigate("/settings")}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Search Bar - Mobile & Desktop */}
        {showSearchBar && <SearchBar />}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Desktop Floating Add Button */}
      <div className="hidden md:block fixed bottom-6 right-6 z-30">
        <button
          onClick={openAddDialog}
          aria-label="Tambah link"
          className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white ring-4 ring-white border-2 border-indigo-200 shadow-lg shadow-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/60 hover:scale-105 active:scale-95"
        >
          <Plus
            size={28}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:rotate-90"
          />
        </button>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav onAddClick={openAddDialog} />

      {/* Quick Add Dialog */}
      <QuickAddDialog
        isOpen={isOpen}
        onClose={closeAddDialog}
        onSave={handleSaveLink}
        collections={collections}
      />
    </div>
  );
}
