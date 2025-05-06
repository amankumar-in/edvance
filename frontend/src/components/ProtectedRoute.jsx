import { Navigate, Outlet } from 'react-router';
import React from 'react';

const ProtectedRoute = () => {
  // This is a simplified authentication check
  // In a real app, you would implement proper authentication logic
  // For now, we'll simulate authentication with localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // For demo purposes, you can set localStorage.setItem('isAuthenticated', 'true')
  // to simulate a logged in user
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 