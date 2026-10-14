import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { authService } from "./services/auth.service";
import { Toaster } from "sonner";
import BottomNav from "./components/layout/BottomNav";
import SearchBar from "./components/layout/SearchBar";
import QuickAddDialog from "./components/links/QuickAddDialog";
import { useSearch } from "./contexts/SearchContext";
import { useAddLinkDialog } from "./contexts/AddLinkDialogContext";
import { linksService } from "./services/links.service";
import { useAuth } from "./contexts/AuthContext";
import {
  Library,
  Heart,
  Clock,
  Layers,
  Settings,
  LogOut,
  Search,
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

  const showSearchBar = location.pathname !== "/settings";
  const isHomepage = location.pathname === "/";

  useEffect(() => {
    setShowSort(isHomepage);
  }, [isHomepage, setShowSort]);

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
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              <Library size={20} />
              Semua Link
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              <Heart size={20} />
              Favorit
            </Link>
            <Link
              to="/recent"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              <Clock size={20} />
              Terbaru
            </Link>
            <Link
              to="/collections"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              <Layers size={20} />
              Koleksi
            </Link>
          </nav>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden text-xl font-bold text-gray-900">
            <img src={nav} alt="SakuLink Logo" className="w-40" />
          </div>

          <div className="flex-1 mx-4">
            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4"></div>
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

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav onAddClick={openAddDialog} />

      {/* Quick Add Dialog */}
      <QuickAddDialog
        isOpen={isOpen}
        onClose={closeAddDialog}
        onSave={handleSaveLink}
      />
    </div>
  );
}
