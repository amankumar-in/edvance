// src/components/themed/Alert.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Text from './Typography';

/**
 * Themed Alert component following the Univance design system
 */
const Alert = ({
  title,
  children,
  variant = 'info',
  style,
  ...props
}) => {
  const theme = useTheme();
  const { univance } = theme;
  
  // Alert variants configuration with proper contrast
  const variants = {
    info: {
      background: theme.dark ? 'rgba(173, 86, 196, 0.2)' : univance.colors.background.lightLavender,
      border: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.purple,
      titleColor: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.purple,
      textColor: theme.univance.colors.text,
    },
    success: {
      background: theme.univance.colors.successLight,
      border: theme.univance.colors.success,
      titleColor: theme.univance.colors.successText,
      textColor: theme.univance.colors.text,
    },
    warning: {
      background: theme.univance.colors.warningLight,
      border: theme.univance.colors.warning,
      titleColor: theme.univance.colors.warningText,
      textColor: theme.univance.colors.text,
    },
    error: {
      background: theme.univance.colors.errorLight,
      border: theme.univance.colors.error,
      titleColor: theme.univance.colors.errorText,
      textColor: theme.univance.colors.text,
    }
  };
  
  // Get current variant settings
  const currentVariant = variants[variant] || variants.info;
  
  return (
    <View
      style={[
        styles.alert,
        {
          backgroundColor: currentVariant.background,
          borderLeftWidth: 4,
          borderLeftColor: currentVariant.border,
        },
        style
      ]}
      {...props}
    >
      {title && (
        <Text
          variant="heading3" 
          style={[
            styles.title, 
            { color: currentVariant.titleColor }
          ]}
        >
          {title}
        </Text>
      )}
      <Text style={[styles.message, { color: currentVariant.textColor }]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  }
});

export default Alert;