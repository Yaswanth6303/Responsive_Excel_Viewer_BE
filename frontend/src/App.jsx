// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RouteGuard from './components/RouteGuard';
import NotFound from './components/NotFound'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteGuard>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/" element={<Navigate to="/user" replace />} />
             {/* Add the 404 route at the end */}
             <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;