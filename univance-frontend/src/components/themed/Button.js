// src/components/themed/Button.js
import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Text from './Typography';

/**
 * Themed button that follows the Univance design system
 */
const Button = ({
  mode = 'contained',
  variant = 'primary',
  size = 'medium',
  children,
  style,
  labelStyle,
  disabled,
  loading,
  icon,
  onPress,
  ...props
}) => {
  const theme = useTheme();
  const { univance } = theme;
  
  // Button variants configuration with proper contrast
  const variants = {
    primary: {
      background: univance.colors.primary.purple,
      pressedBackground: univance.colors.secondary.darkPurple,
      color: univance.colors.neutral.white,
      gradient: univance.gradients.purple,
    },
    secondary: {
      background: univance.colors.primary.pink,
      pressedBackground: univance.colors.secondary.darkPink,
      color: univance.colors.neutral.white,
      gradient: univance.gradients.primary,
    },
    outline: {
      background: 'transparent',
      pressedBackground: theme.dark ? 'rgba(173, 86, 196, 0.1)' : univance.colors.background.lightPurple,
      color: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.purple,
      border: theme.dark ? univance.colors.primary.lavender : univance.colors.primary.purple,
      gradient: null,
    },
    ghost: {
      background: 'transparent',
      pressedBackground: theme.dark ? 'rgba(255, 141, 161, 0.1)' : univance.colors.background.lightPink,
      color: univance.colors.primary.pink, 
      gradient: null,
    }
  };

  // Button sizes configuration
  const sizes = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 14
    },
    medium: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 16
    },
    large: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 18
    }
  };

  // Get current variant and size settings
  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;
  
  // Button background depends on mode
  const buttonBackground = mode === 'contained' 
    ? currentVariant.background 
    : 'transparent';
  
  // For gradient buttons
  const useGradient = mode === 'contained' && currentVariant.gradient && !disabled;
  
  // Loader color
  const loaderColor = mode === 'contained' 
    ? univance.colors.neutral.white 
    : currentVariant.color;

  // Render a gradient button
  if (useGradient) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled || loading}
        onPress={onPress}
        style={[
          styles.button,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
            borderRadius: univance.borderRadius.pill,
            opacity: disabled ? 0.5 : 1,
            borderWidth: variant === 'outline' ? 2 : 0,
            borderColor: currentVariant.border,
          },
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={currentVariant.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: univance.borderRadius.pill }]}
        />
        
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          
          {loading ? (
            <ActivityIndicator size="small" color={loaderColor} />
          ) : (
            <Text
              style={[
                styles.label,
                {
                  fontSize: currentSize.fontSize,
                  color: currentVariant.color,
                },
                labelStyle,
              ]}
            >
              {children}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Render a standard button
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: buttonBackground,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: univance.borderRadius.pill,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: currentVariant.border,
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        {loading ? (
          <ActivityIndicator size="small" color={loaderColor} />
        ) : (
          <Text
            style={[
              styles.label,
              {
                fontSize: currentSize.fontSize,
                color: currentVariant.color,
              },
              labelStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Extra component needed for the full JSX syntax above
const View = ({ children, style }) => (
  <div style={style}>{children}</div>
);

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Button;