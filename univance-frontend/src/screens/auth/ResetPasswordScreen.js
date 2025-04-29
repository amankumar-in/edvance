// src/screens/auth/ResetPasswordScreen.js
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Get token and email from URL/route params
  const token = route.params?.token || new URLSearchParams(window.location.search).get('token') || null;
  const emailParam = route.params?.email || new URLSearchParams(window.location.search).get('email') || '';
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [isTokenVerifying, setIsTokenVerifying] = useState(true);
  
  // Button hover states
  const [resetButtonHovered, setResetButtonHovered] = useState(false);
  const [loginButtonHovered, setLoginButtonHovered] = useState(false);
  const [requestNewButtonHovered, setRequestNewButtonHovered] = useState(false);

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

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !emailParam) {
        setValidToken(false);
        setErrorMessage('Invalid or expired reset link. Please request a new password reset.');
        setIsTokenVerifying(false);
        return;
      }
      
      try {
        // Verify the token with API
        await authService.verifyResetToken(token, emailParam);
        setValidToken(true);
        setIsTokenVerifying(false);
      } catch (error) {
        console.error('Token verification error:', error);
        setValidToken(false);
        setErrorMessage('Invalid or expired reset link. Please request a new password reset.');
        setIsTokenVerifying(false);
      }
    };
    
    verifyToken();
  }, [token, emailParam]);

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
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Call reset password API with both token and email
      await authService.resetPassword({
        token,
        email: emailParam,
        newPassword: formData.password
      });
      
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error('Reset password error:', error);
      
      // Handle specific API errors
      if (error.status === 400) {
        setErrorMessage('Invalid request. Please try again with a new reset link.');
      } else if (error.status === 404) {
        setErrorMessage('Password reset link is expired or invalid.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    }
  };

  // If still verifying token, show loading state
  if (isTokenVerifying) {
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
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </View>
    );
  }

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
              <Text style={styles.title}>
                Reset Password
              </Text>
              <Text style={styles.subtitle}>
                {success 
                  ? 'Your password has been successfully reset'
                  : 'Create a new password for your account'}
              </Text>
            </View>
            
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={success ? ['#0F766E', '#0D9488'] : ['#FF9CE9', '#FF7DE0']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.iconBackground}
              >
                <MaterialCommunityIcons 
                  name={success ? "check-circle-outline" : "lock-reset"} 
                  size={40} 
                  color="white" 
                />
              </LinearGradient>
            </View>
            
            {!validToken ? (
              <View style={styles.invalidTokenCard}>
                <View style={styles.errorIconContainer}>
                  <LinearGradient
                    colors={['#B91C1C', '#991B1B']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.errorIcon}
                  >
                    <MaterialCommunityIcons 
                      name="link-off" 
                      size={30} 
                      color="white" 
                    />
                  </LinearGradient>
                </View>
                
                <Text style={styles.invalidTokenTitle}>
                  Invalid Reset Link
                </Text>
                
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons 
                    name="alert-circle-outline" 
                    size={20} 
                    color="#B91C1C" 
                    style={styles.messageIcon}
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.9}
                  onMouseEnter={() => Platform.OS === 'web' && setRequestNewButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setRequestNewButtonHovered(false)}
                  style={styles.buttonContainer}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F8F8']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.button,
                      requestNewButtonHovered && styles.hoveredButton
                    ]}
                  >
                    <Text style={styles.buttonText}>Request New Reset Link</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : success ? (
              <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                  <LinearGradient
                    colors={['#0F766E', '#0D9488']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.successIcon}
                  >
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={30} 
                      color="white" 
                    />
                  </LinearGradient>
                </View>
                
                <Text style={styles.successMessage}>
                  Your password has been reset successfully!
                </Text>
                
                <Text style={styles.successSubtext}>
                  You can now log in with your new password.
                </Text>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.9}
                  onMouseEnter={() => Platform.OS === 'web' && setLoginButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setLoginButtonHovered(false)}
                  style={styles.buttonContainer}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F8F8']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.button,
                      loginButtonHovered && styles.hoveredButton
                    ]}
                  >
                    <Text style={styles.buttonText}>Go to Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formCard}>
                {/* Error message */}
                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons 
                      name="alert-circle-outline" 
                      size={20} 
                      color="#B91C1C" 
                      style={styles.messageIcon}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}
                
                <View style={styles.formSection}>
                  {/* Password Field */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="New Password"
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
                    ) : (
                      <HelperText type="info" visible={true} style={styles.infoText}>
                        Password must be at least 8 characters
                      </HelperText>
                    )}
                  </View>
                  
                  {/* Confirm Password Field */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Confirm New Password"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleChange('confirmPassword', text)}
                      style={styles.input}
                      error={!!errors.confirmPassword}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
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
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          color="rgba(255, 255, 255, 0.7)"
                        />
                      }
                    />
                    {errors.confirmPassword ? (
                      <HelperText type="error" visible={!!errors.confirmPassword} style={styles.helperText}>
                        {errors.confirmPassword}
                      </HelperText>
                    ) : null}
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.9}
                    onMouseEnter={() => Platform.OS === 'web' && setResetButtonHovered(true)}
                    onMouseLeave={() => Platform.OS === 'web' && setResetButtonHovered(false)}
                    style={[
                      styles.buttonContainer,
                      loading && {opacity: 0.6}
                    ]}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F8F8F8']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={[
                        styles.button,
                        resetButtonHovered && styles.hoveredButton
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#AD56C4" />
                      ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                  activeOpacity={0.7}
                  onMouseEnter={() => Platform.OS === 'web' && setLoginButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setLoginButtonHovered(false)}
                  style={[
                    styles.backButton,
                    loginButtonHovered && styles.hoveredBackButton
                  ]}
                >
                  <MaterialCommunityIcons 
                    name="arrow-left" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.8)" 
                    style={styles.backButtonIcon}
                  />
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
                
                <View style={styles.helpContainer}>
                  <MaterialCommunityIcons 
                    name="shield-check-outline" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.8)" 
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.helpText}>
                    For better security, create a strong password with a mix of letters, numbers, and special characters.
                  </Text>
                </View>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'white',
    marginTop: 16,
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
    maxWidth: 500,
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
  iconContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
  },
  invalidTokenCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invalidTokenTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMessage: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 18,
    color: '#0F766E',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtext: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(185, 28, 28, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#B91C1C',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: 8,
  },
  errorText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: '#B91C1C',
    flex: 1,
  },
  formSection: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
  },
  helperText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    color: '#FCA5A5',
  },
  infoText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
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
  buttonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 18,
    color: '#AD56C4',
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.2s ease',
      cursor: 'pointer',
    } : {})
  },
  hoveredBackButton: {
    opacity: 0.7,
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  helpContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
});

export default ResetPasswordScreen;