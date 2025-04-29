// src/services/authService.js
import axios from 'axios';
import config from '../config/env';
import storageService from './storageService';

const API_URL = config.apiUrl;

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
authApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await storageService.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await storageService.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, logout user
          await logout();
          return Promise.reject(error);
        }
        
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          { skipAuthRefresh: true }
        );
        
        // Get new tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Save new tokens
        await storageService.setItem('accessToken', accessToken);
        await storageService.setItem('refreshToken', newRefreshToken);
        
        // Update authorization header
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Retry original request
        return authApi(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, logout user
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @param {string} userData.role - User role (STUDENT, PARENT, TEACHER, SCHOOL, SOCIAL_WORKER)
 * @returns {Promise} API response
 */
const register = async (userData) => {
  try {
    const response = await authApi.post('/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify user email with verification code
 * @param {string} token - Email verification token
 * @param {string} email - User email
 * @returns {Promise} API response
 */
const verifyEmail = async (token, email) => {
  try {
    const response = await authApi.get(`/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise} API response
 */
const resendVerification = async (email) => {
  try {
    const response = await authApi.post('/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * User login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} API response with tokens and user info
 */
const login = async (credentials) => {
  try {
    const response = await authApi.post('/login', credentials);
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Save tokens to storage
    await storageService.setItem('accessToken', accessToken);
    await storageService.setItem('refreshToken', refreshToken);
    await storageService.setItem('userRole', user.roles[0]); // Just store the first role for simplicity
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} API response
 */
const forgotPassword = async (email) => {
  try {
    const response = await authApi.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify reset password token
 * @param {string} token - Reset password token
 * @param {string} email - User email
 * @returns {Promise} API response
 */
const verifyResetToken = async (token, email) => {
  try {
    const response = await authApi.get(`/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Reset user password
 * @param {Object} resetData - Password reset data
 * @param {string} resetData.token - Reset token
 * @param {string} resetData.email - User email
 * @param {string} resetData.newPassword - New password
 * @returns {Promise} API response
 */
const resetPassword = async (resetData) => {
  try {
    console.log('Sending reset data:', resetData);
    const requestBody = {
      token: resetData.token,
      email: resetData.email,
      newPassword: resetData.password || resetData.newPassword // Support both formats
    };
    
    const response = await authApi.post('/reset-password', requestBody);
    return response.data;
  } catch (error) {
    console.error('Reset API error response:', error.response?.data);
    throw handleApiError(error);
  }
};

/**
 * User logout
 * @returns {Promise} API response
 */
const logout = async () => {
  try {
    const refreshToken = await storageService.getItem('refreshToken');
    if (refreshToken) {
      await authApi.post('/logout', { refreshToken });
    }
    
    // Clear storage
    await storageService.removeItem('accessToken');
    await storageService.removeItem('refreshToken');
    await storageService.removeItem('userRole');
    
    return { success: true };
  } catch (error) {
    // Clear tokens even if API call fails
    await storageService.removeItem('accessToken');
    await storageService.removeItem('refreshToken');
    await storageService.removeItem('userRole');
    
    throw handleApiError(error);
  }
};

/**
 * Update user password
 * @param {Object} passwordData - Password update data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise} API response
 */
const updatePassword = async (passwordData) => {
  try {
    const response = await authApi.put('/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get current user profile
 * @returns {Promise} API response with user profile
 */
const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/me');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
const isAuthenticated = async () => {
  try {
    const token = await storageService.getItem('accessToken');
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get user role
 * @returns {Promise<string|null>} User role or null if not authenticated
 */
const getUserRole = async () => {
  try {
    return await storageService.getItem('userRole');
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object from axios
 * @returns {Object} Standardized error object
 */
const handleApiError = (error) => {
  const errorResponse = {
    message: 'An unexpected error occurred',
    status: 500,
    data: null
  };
  
  if (error.response) {
    // Server responded with error
    console.error('API Error Response:', error.response.data);
    errorResponse.message = error.response.data.message || 'Server error';
    errorResponse.status = error.response.status;
    errorResponse.data = error.response.data;
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server:', error.request);
    errorResponse.message = 'No response from server';
    errorResponse.status = 503;
  } else {
    // Request setup error
    console.error('Request error:', error.message);
    errorResponse.message = error.message;
  }
  
  return errorResponse;
};

const authService = {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  logout,
  updatePassword,
  getCurrentUser,
  isAuthenticated,
  getUserRole
};

export default authService;