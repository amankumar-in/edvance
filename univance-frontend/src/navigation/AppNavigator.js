// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';

// Create stack navigator for the main app
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  // We will add logic to check if the user is authenticated later
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Main app screens will be added here later
          <Stack.Screen name="Main" component={() => null} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;