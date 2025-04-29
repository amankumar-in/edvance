// src/utils/fontUtils.js
import { Platform } from 'react-native';

/**
 * Get the correct font family name based on platform
 */
export const getFontFamily = (fontName, weight) => {
  // On web, use the Expo Google Fonts naming convention
  if (Platform.OS === 'web') {
    switch (weight) {
      case 'regular':
        return `${fontName}_400Regular`;
      case 'medium':
        return `${fontName}_500Medium`;
      case 'semibold':
        return `${fontName}_600SemiBold`;
      case 'bold':
        return `${fontName}_700Bold`;
      case 'extrabold':
      case 'black':
        return `${fontName}_800ExtraBold`;
      default:
        return `${fontName}_400Regular`;
    }
  } 
  
  // On native platforms, use the actual font file names from assets
  else {
    switch (weight) {
      case 'regular':
        return `${fontName}-Regular`;
      case 'medium':
        return `${fontName}-Medium`;
      case 'semibold':
        return `${fontName}-SemiBold`;
      case 'bold':
        return `${fontName}-Bold`;
      case 'extrabold':
        return `${fontName}-ExtraBold`;
      case 'black':
        return `${fontName}-Black`;
      default:
        return `${fontName}-Regular`;
    }
  }
};

// Common app fonts
export const fonts = {
  // Headings
  heading1: getFontFamily('Nunito', 'bold'),
  heading2: getFontFamily('Nunito', 'semibold'),
  heading3: getFontFamily('Nunito', 'medium'),
  
  // Body text
  bodyRegular: getFontFamily('OpenSans', 'regular'),
  bodySemibold: getFontFamily('OpenSans', 'semibold'),
  bodyBold: getFontFamily('OpenSans', 'bold'),
  
  // UI Elements
  button: getFontFamily('Nunito', 'bold'),
  caption: getFontFamily('OpenSans', 'regular'),
};