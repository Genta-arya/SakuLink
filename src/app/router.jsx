import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import LibraryPage from '../pages/LibraryPage';
import CollectionsPage from '../pages/CollectionsPage';
import FavoritesPage from '../pages/FavoritesPage';
import RecentPage from '../pages/RecentPage';
import LinkDetailPage from '../pages/LinkDetailPage';
import SettingsPage from '../pages/SettingsPage';
import CollectionDetailPage from '../pages/CollectionDetailPage';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'collections/:collectionId', element: <CollectionDetailPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'recent', element: <RecentPage /> },
      { path: 'link/:linkId', element: <LinkDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
