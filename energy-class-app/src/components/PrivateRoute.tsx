import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LinearProgress, Container } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  if (!user) {
    // Rediriger vers la page de connexion en sauvegardant l'URL de destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 