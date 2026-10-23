import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, providerOnly = false }) {
  const { user, loading, isAdmin, isPrestataire } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Gestion du catalogue : espace prestataire/admin uniquement. Les
  // clientes (et visiteurs) passent par le formulaire de demande.
  if (providerOnly) {
    if (!user || (!isPrestataire && !isAdmin)) return <Navigate to="/demande" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
