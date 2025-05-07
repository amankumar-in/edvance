// PublicRoute restricts access to routes for unauthenticated users only
import { Navigate, Outlet } from 'react-router';
import React from 'react';
import { useAuth } from '../Context/AuthContext';

const PublicRoute = () => {
  // Get authentication status from AuthContext
  const { isAuthenticated } = useAuth();

  // If authenticated, redirect to the home/dashboard page
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If not authenticated, render the nested routes (e.g., login, register)
  return <Outlet />;
};
export default PublicRoute; 