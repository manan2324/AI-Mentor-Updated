import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is admin
  if (user && user.role === 'admin') {
    return <Outlet />;
  }

  // If not admin, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
