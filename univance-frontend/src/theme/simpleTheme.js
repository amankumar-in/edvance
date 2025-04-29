// src/theme/simpleTheme.js
import { DefaultTheme } from 'react-native-paper';

// Univance simplified theme 
const colors = {
  primary: '#AD56C4',
  accent: '#FF8DA1',
  background: '#FFFFFF',
  text: '#2D3748',
  textSecondary: '#526D82'
};

// Create a simplified theme object
export const simpleTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    text: colors.text
  }
};