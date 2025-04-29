
// App.js
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, 
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold 
} from '@expo-google-fonts/nunito';
import {
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold
} from '@expo-google-fonts/quicksand';
import AuthNavigator from './src/navigation/AuthNavigator';
import { lightTheme } from './src/theme';
import { Platform } from 'react-native';
import { createURLConverter } from './src/utils/urlHandler';

// Keep the splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    OpenSans_300Light,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Once fonts are loaded, hide splash screen
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Custom URL handling for web
  const linking = {
    prefixes: ['univance://', 'http://localhost:8081', 'https://app.coinsforcollege.org'],
    config: {
      screens: {
        Login: 'Login',
        ResetPassword: {
          path: 'ResetPassword',
          parse: {
            token: (token) => token,
            email: (email) => decodeURIComponent(email),
          },
        },
        EmailVerification: {
          path: 'EmailVerification',
          parse: {
            token: (token) => token,
            email: (email) => decodeURIComponent(email),
          },
        },
        RoleSelection: '',
        Register: 'Register',
        ForgotPassword: 'ForgotPassword',
        ProfileCreation: 'ProfileCreation',
      },
    },
    // For web, handle URL parameters
    getPathFromState: (state) => {
      return state?.routes?.[state.index]?.name || '';
    },
  };

  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer linking={linking}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <AuthNavigator />
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
}
