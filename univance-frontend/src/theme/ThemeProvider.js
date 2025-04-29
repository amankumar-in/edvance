// src/theme/ThemeProvider.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme } from './index';

// Create Theme Context
const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Get device color scheme
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme || 'light');
  
  // Update theme if device theme changes
  useEffect(() => {
    if (deviceTheme) {
      setTheme(deviceTheme);
    }
  }, [deviceTheme]);
  
  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };
  
  // Determine if dark mode is active
  const isDark = theme === 'dark';
  
  // Get the correct theme object
  const paperTheme = isDark ? darkTheme : lightTheme;
  
  // Context value
  const themeContext = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    colors: paperTheme.univance.colors,
    typography: paperTheme.univance.typography,
    spacing: paperTheme.univance.spacing,
    borderRadius: paperTheme.univance.borderRadius,
    gradients: paperTheme.univance.gradients,
  };
  
  return (
    <ThemeContext.Provider value={themeContext}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};