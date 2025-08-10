import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <div>Please sign in to access this page.</div>;
  }

  if (requireAdmin && !isAdmin) {
    return <div>Admin access required. Your domain: {user.email}</div>;
  }

  return <>{children}</>;
};