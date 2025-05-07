// ProtectedRoute restricts access to routes for authenticated users only
import { Navigate, Outlet } from 'react-router';
import React from 'react';
import { useAuth } from '../Context/AuthContext'

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the nested routes
  return <Outlet />;
};

export default ProtectedRoute; 