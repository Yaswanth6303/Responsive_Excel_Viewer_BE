// src/components/RouteGuard.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouteGuard({ children }) {
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    // Logout when navigating away from admin route
    if (location.pathname !== '/admin') {
      logout();
    }
  }, [location.pathname, logout]);

  return children;
}

export default RouteGuard;
