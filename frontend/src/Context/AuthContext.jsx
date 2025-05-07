// AuthContext provides authentication state and logic to the app
import React, { createContext, useContext, useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { getProfile } from '../api/auth/auth.api';
import { toast } from 'sonner';
import { useLogout } from '../api/auth/auth.mutations'

// Define the shape and default values for the AuthContext
const AuthContext = createContext({
  user: null,
  setUser: () => { },
  token: null,
  setToken: () => { },
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  loading: false,
  fetchProfile: async () => null,
  handleLogout: async () => null,
  isLoggingOut: false,
});

// AuthProvider wraps the app and provides authentication state and actions
export const AuthProvider = ({ children }) => {
  // Initialize user and token from localStorage for persistence
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(false);

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Fetch the user's profile from the backend and update state/localStorage
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // Return user data for further use if needed
        return res.data;
      }
    } catch (error) {
      // Log and notify on error, clear state and localStorage
      console.error('Failed to fetch profile', error);
      toast.error('Failed to fetch profile', {
        description: error.message,
      });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    logout(undefined, {
      onSuccess: () => {
        console.log('Logged out successfully');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.clear();
      },
      onError: (error) => {
        console.error('Failed to logout', error);
        toast.error('Failed to logout');
      }
    })
  }

  // On mount, if authenticated, fetch the user profile
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, []);

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo(() => ({
    user,
    setUser,
    token,
    setToken,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    fetchProfile,
    handleLogout,
    isLoggingOut,
  }), [user, token, isAuthenticated, loading, isLoggingOut]);

  // Provide the context to children, show loading UI if fetching
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <>Loading...</>
      ) : children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming AuthContext
export const useAuth = () => useContext(AuthContext);
