// src/components/themed/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Text from './Typography';

const Card = ({ 
  children, 
  title, 
  variant = 'default', 
  icon, 
  style, 
  ...props 
}) => {
  const theme = useTheme();
  const { colors } = theme.univance;
  
  // These are the exact color values from your design demo
  const getCardStyle = () => {
    switch(variant) {
      case 'accent':
        return {
          backgroundColor: theme.dark ? '#3D2936' : '#FFF1F3', 
          borderWidth: 0
        };
      case 'purple':
        return {
          backgroundColor: theme.dark ? '#382C4A' : '#F9F0FC',
          borderWidth: 0
        };
      default:
        return {
          backgroundColor: theme.dark ? '#2D3748' : '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.dark ? '#3A4559' : '#CDD5DF'
        };
    }
  };
  
  return (
    <View 
      style={[
        styles.card,
        getCardStyle(),
        style
      ]}
      {...props}
    >
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          {title && (
            <Text style={styles.title}>
              {title}
            </Text>
          )}
        </View>
      )}
      <View>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9CE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default Card;