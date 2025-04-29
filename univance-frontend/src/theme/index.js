// src/theme/index.js
import { DefaultTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Univance Color System
export const colors = {
  // Primary Colors
  primary: {
    pink: '#FF8DA1',
    peach: '#FFC2BA', 
    lavender: '#FF9CE9',
    purple: '#AD56C4'
  },
  // Secondary Colors
  secondary: {
    darkPink: '#FF6B85',
    darkPeach: '#FFAD9F',
    darkLavender: '#FF7DE0',
    darkPurple: '#9548A8'
  },
  // Background Colors
  background: {
    lightPink: '#FFF1F3',
    lightPeach: '#FFF6F5',
    lightLavender: '#FFF5FC',
    lightPurple: '#F9F0FC'
  },
  // Neutrals (Note: avoiding pure white/black)
  neutral: {
    white: '#FAFAFA',    // Slightly off-white for main backgrounds
    offWhite: '#F5F5F5', // For card backgrounds on white
    lightGray: '#E8EBF2', // For borders and separators (light mode)
    mediumGray: '#A9B3C1', // For disabled elements
    darkGray: '#5C718A',  // For secondary text
    charcoal: '#374151',  // For primary text (light mode)
    offBlack: '#1F2937'   // Very dark gray instead of pure black
  },
  // Dark theme colors
  dark: {
    background: '#121826', // Dark blue-gray for main background
    surface: '#1E2736',    // Slightly lighter for cards
    card: '#252E3F',       // Even lighter for cards on dark background
    surfaceLight: '#303950', // For interactive elements
    border: '#3B465A',      // For borders and separators
    text: '#E5E7EB',        // Off-white for text
    textSecondary: '#9CA3AF' // Light gray for secondary text
  },
  // Status colors
  status: {
    success: '#0F766E',
    successLight: '#ECFDF5',   // Light green background
    successDark: '#065F46',    // Dark green for text on light background
    warning: '#B45309',
    warningLight: '#FFFBEB',   // Light yellow background
    warningDark: '#92400E',    // Dark yellow for text on light background
    error: '#B91C1C',
    errorLight: '#FEF2F2',     // Light red background
    errorDark: '#991B1B'       // Dark red for text on light background
  }
};

// Gradients
export const gradients = {
  primary: ['#FF8DA1', '#FF6B85'],
  secondary: ['#FFC2BA', '#FF9CE9'],
  success: ['#FF7DE0', '#FF62D8'],
  warning: ['#FFAD9F', '#FF8DA1'],
  purple: ['#9548A8', '#8A40A0'],
  danger: ['#FF5252', '#FF1A1A']
};

// Font configuration
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'OpenSans_400Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'OpenSans_500Medium',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: '300',
    },
  },
  ios: {
    regular: {
      fontFamily: 'OpenSans_400Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'OpenSans_500Medium',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: '300',
    },
  },
  android: {
    regular: {
      fontFamily: 'OpenSans_400Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'OpenSans_500Medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'OpenSans_300Light',
      fontWeight: 'normal',
    },
  }
};

// Typography styles
export const typography = {
  heading1: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
  },
  heading2: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  heading3: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  display: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 18,
    lineHeight: 25,
  },
  button: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    lineHeight: 19,
  },
  caption: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
  }
};

// Spacing system
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Border radius
export const borderRadius = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  pill: 50,
};

// Function to get theme-specific colors with proper contrast
export const getThemeColors = (isDark) => ({
  // Base UI colors
  background: isDark ? colors.dark.background : colors.neutral.white,
  
  // Card and Surface colors - ensuring contrast with background
  surface: isDark ? colors.dark.surface : colors.neutral.offWhite,
  card: isDark ? colors.dark.card : colors.neutral.white,
  cardBorder: isDark ? colors.dark.border : colors.neutral.lightGray,
  
  // Text colors - ensuring good contrast on every background
  text: isDark ? colors.dark.text : colors.neutral.charcoal,
  textSecondary: isDark ? colors.dark.textSecondary : colors.neutral.darkGray,
  
  // Interactive elements
  surfaceAccent: isDark ? '#3D2936' : colors.background.lightPink,
  surfacePeach: isDark ? '#3D2E29' : colors.background.lightPeach,
  surfacePurple: isDark ? '#382C4A' : colors.background.lightPurple,
  surfaceLavender: isDark ? '#392C3A' : colors.background.lightLavender,
  
  // Dividers and borders
  border: isDark ? colors.dark.border : colors.neutral.lightGray,
  
  // Status colors with proper contrast
  success: isDark ? '#34D399' : colors.status.success,
  successLight: isDark ? 'rgba(15, 118, 110, 0.2)' : colors.status.successLight,
  successText: isDark ? '#34D399' : colors.status.successDark,
  
  warning: isDark ? '#FBBF24' : colors.status.warning,
  warningLight: isDark ? 'rgba(180, 83, 9, 0.2)' : colors.status.warningLight,
  warningText: isDark ? '#FBBF24' : colors.status.warningDark,
  
  error: isDark ? '#F87171' : colors.status.error,
  errorLight: isDark ? 'rgba(185, 28, 28, 0.2)' : colors.status.errorLight,
  errorText: isDark ? '#F87171' : colors.status.errorDark,
});

// Create the complete theme for React Native Paper
const createCompleteTheme = (isDark) => {
  const themeColors = getThemeColors(isDark);
  
  return {
    ...DefaultTheme,
    dark: isDark,
    mode: 'adaptive',
    roundness: 12,
    
    // Standard Paper colors
    colors: {
      ...DefaultTheme.colors,
      primary: isDark ? colors.primary.lavender : colors.primary.purple,
      accent: colors.primary.pink,
      background: themeColors.background,
      surface: themeColors.surface,
      text: themeColors.text,
      disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
      placeholder: themeColors.textSecondary,
      backdrop: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
      notification: colors.primary.pink,
      error: isDark ? '#F87171' : '#B91C1C',
      onSurface: themeColors.text,
      onBackground: themeColors.text,
      
      // Custom properties for Paper components
      elevation: {
        // No shadows for flat design
        level0: 'transparent',
        level1: 'transparent',
        level2: 'transparent',
        level3: 'transparent',
        level4: 'transparent',
        level5: 'transparent',
      },
    },
    
    // Custom Univance theme additions
    univance: {
      colors: {
        ...colors,
        ...themeColors,
      },
      gradients,
      typography,
      spacing,
      borderRadius,
    },
    
    // Fonts configuration
    fonts: configureFonts(fontConfig),
    
    // Animation configuration
    animation: {
      scale: 1.0,
    },
  };
};

// Create theme objects for light and dark modes
export const lightTheme = createCompleteTheme(false);
export const darkTheme = createCompleteTheme(true);