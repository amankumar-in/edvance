// src/components/Container.js
import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import useDevice from '../utils/device';

/**
 * Container component for consistent layout across screens
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.scrollable - Whether content should be scrollable (default: true)
 * @param {string} props.widthType - Type of width constraint: 'narrow', 'standard', 'wide', 'full' (default: 'standard')
 * @param {string} props.backgroundColor - Override background color (default: theme background)
 * @param {Object} props.style - Additional container style
 * @param {Object} props.contentStyle - Additional content container style
 * @param {boolean} props.center - Center content vertically (default: false)
 * @param {number} props.padding - Container padding (default: based on device)
 * @returns {React.ReactElement}
 */
const Container = ({
  children,
  scrollable = true,
  widthType = 'standard',
  backgroundColor,
  style,
  contentStyle,
  center = false,
  padding,
  ...otherProps
}) => {
  const theme = useTheme();
  const device = useDevice();
  
  // Default to theme background color if none provided
  const bgColor = backgroundColor || theme.colors.background;
  
  // Determine padding based on device if not specified
  const defaultPadding = device.isPhone ? 16 : (device.isTablet ? 24 : 32);
  const containerPadding = padding !== undefined ? padding : defaultPadding;
  
  // Get appropriate content width based on device and width type
  let maxWidth;
  switch(widthType) {
    case 'narrow':
      maxWidth = device.contentWidth.narrow;
      break;
    case 'wide':
      maxWidth = device.contentWidth.wide;
      break;
    case 'full':
      maxWidth = device.contentWidth.full;
      break;
    case 'standard':
    default:
      maxWidth = device.contentWidth.standard;
      break;
  }
  
  // Additional styles for centering if requested
  const centerStyles = center ? {
    justifyContent: 'center',
    flex: 1,
  } : {};
  
  // The main content area with width constraints
  const contentContainer = (
    <View 
      style={[
        styles.contentContainer, 
        { 
          maxWidth, 
          paddingHorizontal: containerPadding 
        },
        contentStyle
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView 
      edges={['top', 'left', 'right']} 
      style={[
        styles.container, 
        { backgroundColor: bgColor },
        style
      ]}
    >
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            centerStyles
          ]}
          showsVerticalScrollIndicator={Platform.OS !== 'web'}
        >
          {contentContainer}
        </ScrollView>
      ) : (
        <View style={[styles.flexContainer, centerStyles]}>
          {contentContainer}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 16,
  }
});

export default Container;