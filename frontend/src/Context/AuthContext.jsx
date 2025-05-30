// AuthContext provides authentication state and logic to the app
import React, { createContext, useContext, useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { getProfile } from '../api/auth/auth.api';
import { toast } from 'sonner';
import { useLogout } from '../api/auth/auth.mutations'
import { Loader } from '../components';
import { Flex } from '@radix-ui/themes';
import { buildSelectionList } from '../utils/helperFunctions';

// Define the shape and default values for the AuthContext
const AuthContext = createContext({
  user: null,
  profiles: {},
  setProfiles: () => { },
  setUser: () => { },
  token: null,
  setToken: () => { },
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  loading: false,
  fetchProfile: async () => null,
  handleLogout: async () => null,
  isLoggingOut: false,
  activeRole: null,
  setActiveRole: () => { },
  selectionList: [],
  setSelectionList: () => { }
});

// AuthProvider wraps the app and provides authentication state and actions
export const AuthProvider = ({ children }) => {
  // Initialize user and token from localStorage for persistence
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(localStorage.getItem('activeRole'));
  const [selectionList, setSelectionList] = useState([]);
  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [profiles, setProfiles] = useState(null)

  // Fetch the user's profile from the backend and update state/localStorage
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      if (res?.data?.user) {
        setUser(res.data.user);
        setProfiles(res.data.profiles)
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
      fetchProfile().then(data => {
        if (data?.user && data?.profiles) {
          setSelectionList(buildSelectionList(data.user, data.profiles));
        }
      })
    } else {
      setLoading(false);
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
    activeRole,
    setActiveRole,
    selectionList,
    setSelectionList, 
    profiles, 
    setProfiles
  }), [user, token, isAuthenticated, loading, isLoggingOut, activeRole, selectionList, profiles]);

  // Provide the context to children, show loading UI if fetching
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Flex justify='center' align='center' className='h-screen'>
          <Loader />
        </Flex>
      ) : children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming AuthContext
export const useAuth = () => useContext(AuthContext);
