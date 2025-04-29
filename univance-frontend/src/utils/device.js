// src/utils/device.js
import { Dimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';

// Device type constants
export const DEVICE_TYPES = {
  PHONE: 'phone',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

// Orientation constants
export const ORIENTATIONS = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
};

// Width breakpoints (in pixels)
export const BREAKPOINTS = {
  PHONE_MAX: 767,      // Maximum width for phones
  TABLET_MIN: 768,     // Minimum width for tablets
  TABLET_MAX: 1023,    // Maximum width for tablets
  DESKTOP_MIN: 1024    // Minimum width for desktops
};

// Content width recommendations (in pixels)
export const CONTENT_WIDTHS = {
  NARROW: {            // Auth screens, forms
    PHONE: '100%',
    TABLET: 600,
    DESKTOP: 600
  },
  STANDARD: {          // Content screens
    PHONE: '100%',
    TABLET: 720,
    DESKTOP: 900
  },
  WIDE: {              // Dashboards, tables
    PHONE: '100%',
    TABLET: 900,
    DESKTOP: 1200
  },
  FULL: {              // Admin panels, full-screen layouts
    PHONE: '100%',
    TABLET: '100%',
    DESKTOP: '100%'
  }
};

/**
 * Get current device dimensions
 * @returns {Object} width and height
 */
export const getWindowDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Determine the current device type based on platform and screen size
 * @returns {string} 'phone', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  const { width } = getWindowDimensions();
  
  // Platform-specific detection
  if (Platform.OS === 'web') {
    // Use width-based detection on web
    if (width < BREAKPOINTS.TABLET_MIN) {
      return DEVICE_TYPES.PHONE;
    } else if (width < BREAKPOINTS.DESKTOP_MIN) {
      return DEVICE_TYPES.TABLET;
    } else {
      return DEVICE_TYPES.DESKTOP;
    }
  } else {
    // For native platforms, use OS detection with size fallback
    const isTablet = Platform.isPad || 
                    (width >= BREAKPOINTS.TABLET_MIN && 
                     width <= BREAKPOINTS.TABLET_MAX);
                     
    if (isTablet) {
      return DEVICE_TYPES.TABLET;
    }
    
    // Check if it's a large device that might be a desktop in a window (rare)
    if (width > BREAKPOINTS.TABLET_MAX) {
      return DEVICE_TYPES.DESKTOP;
    }
    
    // Default to phone for most native apps
    return DEVICE_TYPES.PHONE;
  }
};

/**
 * Determine the current orientation
 * @returns {string} 'portrait' or 'landscape'
 */
export const getOrientation = () => {
  const { width, height } = getWindowDimensions();
  return width < height ? ORIENTATIONS.PORTRAIT : ORIENTATIONS.LANDSCAPE;
};

/**
 * Get the recommended content width for the current device
 * @param {string} widthType 'NARROW', 'STANDARD', 'WIDE', or 'FULL'
 * @returns {number|string} The recommended content width
 */
export const getContentWidth = (widthType = 'STANDARD') => {
  const deviceType = getDeviceType();
  return CONTENT_WIDTHS[widthType][deviceType];
};

/**
 * Hook for accessing device information in components
 * Automatically updates on dimension changes
 * @returns {Object} Device information object
 */
export const useDevice = () => {
  const [dimensions, setDimensions] = useState(getWindowDimensions());
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [orientation, setOrientation] = useState(getOrientation());
  
  useEffect(() => {
    const handleDimensionChange = ({ window }) => {
      setDimensions(window);
      setDeviceType(getDeviceType());
      setOrientation(getOrientation());
    };
    
    // Subscribe to dimension changes
    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    
    // Clean up
    return () => {
      // For React Native versions >= 0.65
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // For older React Native versions
        Dimensions.removeEventListener('change', handleDimensionChange);
      }
    };
  }, []);
  
  // Return the combined device information
  return {
    width: dimensions.width,
    height: dimensions.height,
    deviceType,
    isPhone: deviceType === DEVICE_TYPES.PHONE,
    isTablet: deviceType === DEVICE_TYPES.TABLET,
    isDesktop: deviceType === DEVICE_TYPES.DESKTOP,
    orientation,
    isPortrait: orientation === ORIENTATIONS.PORTRAIT,
    isLandscape: orientation === ORIENTATIONS.LANDSCAPE,
    contentWidth: {
      narrow: getContentWidth('NARROW'),
      standard: getContentWidth('STANDARD'),
      wide: getContentWidth('WIDE'),
      full: getContentWidth('FULL')
    }
  };
};

export default useDevice;