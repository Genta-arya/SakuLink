import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import nav from "../assets/nav.png"
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen  bg-white flex items-center justify-center">
        <img src={nav} alt="Loading..." className="w-96" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
