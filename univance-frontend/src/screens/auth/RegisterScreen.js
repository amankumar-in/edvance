// src/screens/auth/RegisterScreen.js
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
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { colors } = theme.univance;
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Get role from navigation params
  const { role } = route.params || { role: null };
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonHovered, setButtonHovered] = useState(false);
  const [backButtonHovered, setBackButtonHovered] = useState(false);

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

  // Redirect to role selection if no role is provided
  useEffect(() => {
    if (!role) {
      navigation.replace('RoleSelection');
    }
  }, [role, navigation]);

  // Get role title for display
  const getRoleTitle = () => {
    switch(role) {
      case 'STUDENT': return 'Student';
      case 'PARENT': return 'Parent';
      case 'TEACHER': return 'Teacher';
      case 'SCHOOL': return 'School Admin';
      case 'SOCIAL_WORKER': return 'Social Worker';
      default: return '';
    }
  };

  // Get role colors
  const getRoleColors = () => {
    switch(role) {
      case 'STUDENT': return ['#FF8DA1', '#FF6B85'];
      case 'PARENT': return ['#FFC2BA', '#FFAD9F'];
      case 'TEACHER': return ['#FF9CE9', '#FF7DE0'];
      case 'SOCIAL_WORKER': return ['#64B5F6', '#2196F3'];
      case 'SCHOOL': return ['#AD56C4', '#9548A8'];
      default: return ['#AD56C4', '#9548A8'];
    }
  };

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
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
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

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: role
      };
      
      // Call registration API
      const response = await authService.register(registrationData);
      
      setLoading(false);
      
      // Navigate to email verification screen
      navigation.navigate('EmailVerification', { 
        email: formData.email,
        userId: response.userId || response.id || response.data?.id || response.data?.userId
      });
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      
      // Handle specific API errors
      if (error.status === 409) {
        setErrorMessage('This email is already registered. Please try logging in.');
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    }
  };

  // Return to role selection
  const handleBack = () => {
    navigation.goBack();
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
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Register as a {getRoleTitle()} to get started</Text>
            </View>
            
            {/* Role Icon */}
            <View style={styles.roleIconContainer}>
              <LinearGradient
                colors={getRoleColors()}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.roleIcon}
              >
                <MaterialCommunityIcons 
                  name={role === 'STUDENT' ? 'school' : 
                        role === 'PARENT' ? 'account-child-circle' : 
                        role === 'TEACHER' ? 'human-male-board' :
                        role === 'SOCIAL_WORKER' ? 'account-group' : 'domain'} 
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
              {/* Name Fields in same row */}
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
                  <TextInput
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                    style={styles.input}
                    error={!!errors.firstName}
                    mode="outlined"
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
                  {errors.firstName ? (
                    <HelperText type="error" visible={!!errors.firstName} style={styles.helperText}>
                      {errors.firstName}
                    </HelperText>
                  ) : null}
                </View>
                
                <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
                  <TextInput
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                    style={styles.input}
                    error={!!errors.lastName}
                    mode="outlined"
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
                  {errors.lastName ? (
                    <HelperText type="error" visible={!!errors.lastName} style={styles.helperText}>
                      {errors.lastName}
                    </HelperText>
                  ) : null}
                </View>
              </View>
              
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
              
              {/* Password Fields in same row */}
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
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
                  ) : (
                    <HelperText type="info" visible={true} style={[styles.helperText, {color: 'rgba(255, 255, 255, 0.7)'}]}>
                      At least 8 characters
                    </HelperText>
                  )}
                </View>
                
                <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    style={styles.input}
                    error={!!errors.confirmPassword}
                    mode="outlined"
                    secureTextEntry={true}
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
                  {errors.confirmPassword ? (
                    <HelperText type="error" visible={!!errors.confirmPassword} style={styles.helperText}>
                      {errors.confirmPassword}
                    </HelperText>
                  ) : null}
                </View>
              </View>
            </View>
            
            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
                onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
                onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
                style={[
                  styles.registerButtonContainer,
                  loading && {opacity: 0.6}
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F8F8']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={[
                    styles.registerButton,
                    buttonHovered && styles.hoveredButton
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#AD56C4" />
                  ) : (
                    <Text style={styles.registerButtonText}>Register</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Back Button */}
              <TouchableOpacity 
                onPress={handleBack}
                disabled={loading}
                activeOpacity={0.7}
                onMouseEnter={() => Platform.OS === 'web' && setBackButtonHovered(true)}
                onMouseLeave={() => Platform.OS === 'web' && setBackButtonHovered(false)}
                style={[
                  styles.backButton,
                  backButtonHovered && styles.hoveredBackButton
                ]}
              >
                <Text style={styles.backButtonText}>Back to Role Selection</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>
                  Log In
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
    maxWidth: 800,
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
  roleIconContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  roleIcon: {
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
    maxWidth: 600,
  },
  errorMessage: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    minWidth: 150,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
  },
  helperText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    color: '#FCA5A5',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 10,
  },
  registerButtonContainer: {
    width: '100%',
  },
  registerButton: {
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
  registerButtonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 18,
    color: '#AD56C4',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoveredBackButton: {
    opacity: 0.8,
  },
  backButtonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_600SemiBold' : 'Nunito-SemiBold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 6,
  },
  loginLink: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;