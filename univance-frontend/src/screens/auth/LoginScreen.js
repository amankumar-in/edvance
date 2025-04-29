// src/screens/auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator
} from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors } = theme.univance;
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [forgotPasswordHovered, setForgotPasswordHovered] = useState(false);
  const [registerHovered, setRegisterHovered] = useState(false);

  // Update dimensions when window size changes
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(Dimensions.get('window').width);
    };
    
    Dimensions.addEventListener('change', updateWidth);
    return () => {
      // Clean up
      if (Platform.OS === 'web') {
        Dimensions.removeEventListener('change', updateWidth);
      }
    };
  }, []);
  
  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error message
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Call login API
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe
      });
      
      setLoading(false);
      
      // Just navigate to login for now (placeholder - we'll implement proper navigation later)
      // This avoids the error about accessing role
      alert('Login successful! This is a placeholder - we would navigate to the home screen here.');
      
      // Instead of navigating or accessing response.role, we'll just stay on this screen for now
      // Once the full app is implemented, we would do something like:
      /*
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
      */
      
    } catch (error) {
      setLoading(false);
      
      // Handle specific API errors
      if (error.status === 401) {
        setErrorMessage('Invalid email or password');
      } else if (error.status === 403) {
        setErrorMessage('Your email is not verified. Please check your inbox and verify your email.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Full screen gradient background */}
      <LinearGradient
        colors={['#7B3F98', '#4A275B', '#2B1C4A']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative circles */}
      <View style={styles.decorationContainer}>
        <View style={[
          styles.decorCircle, 
          styles.decorCircle1,
          windowWidth < 768 && { top: -300, right: -150 }
        ]} />
        <View style={[
          styles.decorCircle, 
          styles.decorCircle2,
          windowWidth < 768 && { bottom: -250, left: -150 }
        ]} />
        {windowWidth >= 768 && (
          <View style={[
            styles.decorCircle, 
            styles.decorCircle3
          ]} />
        )}
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Log in to your account</Text>
            </View>
            
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#AD56C4', '#9548A8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.logo}
              >
                <MaterialCommunityIcons 
                  name="account" 
                  size={40} 
                  color="white" 
                />
              </LinearGradient>
            </View>
            
            {/* Error message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            ) : null}
            
            {/* Form */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  style={styles.input}
                  error={!!errors.email}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  outlineColor="rgba(255, 255, 255, 0.3)"
                  activeOutlineColor="white"
                  textColor="white"
                  theme={{
                    colors: {
                      placeholder: 'rgba(255, 255, 255, 0.7)',
                      text: 'white',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                />
                {errors.email ? (
                  <HelperText type="error" visible={!!errors.email} style={styles.helperText}>
                    {errors.email}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Password Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Password"
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                  style={styles.input}
                  error={!!errors.password}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  outlineColor="rgba(255, 255, 255, 0.3)"
                  activeOutlineColor="white"
                  textColor="white"
                  theme={{
                    colors: {
                      placeholder: 'rgba(255, 255, 255, 0.7)',
                      text: 'white',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  }
                />
                {errors.password ? (
                  <HelperText type="error" visible={!!errors.password} style={styles.helperText}>
                    {errors.password}
                  </HelperText>
                ) : null}
              </View>
              
              {/* Remember me & Forgot password */}
              <View style={styles.optionsRow}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.checkbox}
                  >
                    {rememberMe ? (
                      <MaterialCommunityIcons 
                        name="checkbox-marked" 
                        size={24} 
                        color="rgba(255, 255, 255, 0.9)" 
                      />
                    ) : (
                      <MaterialCommunityIcons 
                        name="checkbox-blank-outline" 
                        size={24} 
                        color="rgba(255, 255, 255, 0.7)" 
                      />
                    )}
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  onMouseEnter={() => Platform.OS === 'web' && setForgotPasswordHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setForgotPasswordHovered(false)}
                  style={[
                    styles.forgotPasswordLink,
                    forgotPasswordHovered && {opacity: 0.8}
                  ]}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
              onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
              style={[
                styles.loginButtonContainer,
                loading && {opacity: 0.6}
              ]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F8F8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.loginButton,
                  buttonHovered && styles.hoveredButton
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#AD56C4" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('RoleSelection')}
                disabled={loading}
                onMouseEnter={() => Platform.OS === 'web' && setRegisterHovered(true)}
                onMouseLeave={() => Platform.OS === 'web' && setRegisterHovered(false)}
                style={[
                  styles.registerLink,
                  registerHovered && {opacity: 0.8}
                ]}
              >
                <Text style={styles.registerText}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
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
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 300,
  },
  decorCircle1: {
    width: 600,
    height: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -200,
    right: -100,
  },
  decorCircle2: {
    width: 500,
    height: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -150,
    left: -100,
  },
  decorCircle3: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: '40%',
    right: '20%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 36,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  logoContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  errorMessage: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
  },
  helperText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    color: '#FCA5A5',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  forgotPasswordLink: {
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.2s ease',
    } : {}),
  },
  forgotPasswordText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 14,
    color: 'white',
    textDecorationLine: 'underline',
  },
  loginButtonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  loginButton: {
    borderRadius: 50,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
    } : {})
  },
  hoveredButton: {
    transform: [{scale: 1.03}],
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    } : {})
  },
  loginButtonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 18,
    color: '#AD56C4',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 6,
  },
  registerLink: {
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.2s ease',
    } : {}),
  },
  registerText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;