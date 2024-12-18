// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ requiredRole, children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Always redirect to login for admin route if not authenticated
  if (!user && requiredRole === 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For non-admin routes or authenticated users
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return children;
}

export default ProtectedRoute;