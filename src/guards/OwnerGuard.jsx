import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export default function OwnerGuard({ children }) {
  const { user, isOwner, loading } = useAuth();

  // Wait for auth check to complete
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)', fontWeight: 'bold' }}>
        Loading Profile...
      </div>
    );
  }

  // If not logged in at all, redirect to login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If logged in but not an owner, redirect to home
  if (!isOwner) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // If authorized, render the child routes/components
  return children;
}
