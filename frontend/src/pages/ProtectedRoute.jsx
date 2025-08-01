import React from 'react'
import { useAuth } from '../Context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Flex } from '@radix-ui/themes';
import { Loader } from '../components';

// Redirect to dashboard role-specific dashboard
const roleDashboard = {
  'student': '/student/dashboard',
  'teacher': '/teacher/dashboard',
  'school_admin': '/school-admin/dashboard',
  'parent': '/parent/dashboard',
  'social_worker': '/social-worker/dashboard',
  'platform_admin': '/platform-admin/dashboard',
}

// ProtectedRoute component to protect routes based on role
function ProtectedRoute({ allowedRole }) {
  const { activeRole, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while loading
  if (loading) {
    return <Flex align='center' justify='center'><Loader /></Flex>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  // Redirect to unauthorized if role is not allowed
  if (!roleDashboard[activeRole]) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Redirect to role-specific dashboard if role is not allowed
  if (activeRole?.toLowerCase() !== allowedRole?.toLowerCase()) {
    return <Navigate to={roleDashboard[activeRole]} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute

// RoleBasedRedirect component to redirect to role-specific dashboard
export const RoleBasedRedirect = () => {
  const { activeRole, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Flex align='center' justify='center'><Loader /></Flex>;
  }

  if (isAuthenticated) {
    const dashboardPath = roleDashboard[activeRole] || '/';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};