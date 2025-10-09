import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmployeeProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login page (same login portal for admin and employees)
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'employee' && user?.role !== 'admin') {
    // Redirect non-employee/admin users to their respective dashboards
    if (user?.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default EmployeeProtectedRoute;
