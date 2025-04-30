// src/screens/main/Dashboard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../../services/authService';

const Dashboard = () => {
  const navigation = useNavigation();
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // Reset to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7B3F98', '#4A275B', '#2B1C4A']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />
      
      <SafeAreaView style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Univance!</Text>
        <Text style={styles.subtitleText}>You are now logged in</Text>
        
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Dashboard placeholder - Your content will appear here
          </Text>
        </View>
        
        <Button 
          mode="contained" 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          Logout
        </Button>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    textAlign: 'center',
  },
  placeholderBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#AD56C4',
    paddingHorizontal: 16,
  },
});

export default Dashboard;