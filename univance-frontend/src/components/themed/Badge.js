// src/components/themed/Badge.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Text from './Typography';

/**
 * Themed Badge component following the Univance design system
 */
const Badge = ({
  children,
  variant = 'default',
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();
  const { univance } = theme;
  
  // Badge variants configuration with proper contrast
  const variants = {
    default: {
      background: univance.colors.primary.pink,
      textColor: univance.colors.neutral.white,
      border: false,
    },
    purple: {
      background: univance.colors.primary.purple,
      textColor: univance.colors.neutral.white,
      border: false,
    },
    outline: {
      background: 'transparent',
      textColor: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.pink,
      border: true,
      borderColor: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.pink,
    },
    success: {
      background: theme.univance.colors.successLight,
      textColor: theme.univance.colors.successText,
      border: false,
    },
    warning: {
      background: theme.univance.colors.warningLight,
      textColor: theme.univance.colors.warningText,
      border: false,
    }
  };
  
  // Get current variant settings
  const currentVariant = variants[variant] || variants.default;
  
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.background,
          borderWidth: currentVariant.border ? 1 : 0,
          borderColor: currentVariant.border ? currentVariant.borderColor : undefined,
        },
        style
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          { color: currentVariant.textColor },
          textStyle
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default Badge;