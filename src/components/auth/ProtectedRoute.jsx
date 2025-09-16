// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check user role
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    // Redirect to appropriate dashboard or show unauthorized
    if (user) {
      switch (user.role) {
        case 'freelancer':
          return <Navigate to="/freelancer/dashboard" replace />;
        case 'client':
          return <Navigate to="/client/dashboard" replace />;
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;