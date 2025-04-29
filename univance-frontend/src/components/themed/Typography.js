// src/components/themed/Typography.js
import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * Themed Text component following the Univance typography system
 */
const Text = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();
  const { univance } = theme;
  
  // Get appropriate text color based on variant and theme
  const getTextColor = () => {
    // If specific color is provided, use it
    if (color) return color;
    
    // Otherwise use semantic colors based on variant
    switch(variant) {
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'body':
      case 'display':
      case 'button':
      case 'caption':
        return theme.univance.colors.text;
      case 'secondary':
        return theme.univance.colors.textSecondary;
      case 'accent':
        return theme.dark ? univance.colors.primary.lavender : univance.colors.primary.purple;
      default:
        return theme.univance.colors.text;
    }
  };
  
  // Get typography style for the variant
  const getTypographyStyle = () => {
    switch (variant) {
      case 'heading1': return univance.typography.heading1;
      case 'heading2': return univance.typography.heading2;
      case 'heading3': return univance.typography.heading3;
      case 'body': return univance.typography.body;
      case 'bodySmall': return univance.typography.bodySmall;
      case 'display': return univance.typography.display;
      case 'button': return univance.typography.button;
      case 'caption': return univance.typography.caption;
      default: return univance.typography.body;
    }
  };
  
  return (
    <RNText
      style={[
        getTypographyStyle(),
        { color: getTextColor() },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Tag component for display name
Text.displayName = 'Text';

export default Text;

// Export named variants for convenience
export const Heading1 = (props) => <Text variant="heading1" {...props} />;
export const Heading2 = (props) => <Text variant="heading2" {...props} />;
export const Heading3 = (props) => <Text variant="heading3" {...props} />;
export const Body = (props) => <Text variant="body" {...props} />;
export const BodySmall = (props) => <Text variant="bodySmall" {...props} />;
export const Display = (props) => <Text variant="display" {...props} />;
export const Caption = (props) => <Text variant="caption" {...props} />;
export const Secondary = (props) => <Text variant="secondary" {...props} />;
export const Accent = (props) => <Text variant="accent" {...props} />;