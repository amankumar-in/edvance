// src/screens/auth/ForgotPasswordScreen.js
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
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Form state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // UI state
  const [submitButtonHovered, setSubmitButtonHovered] = useState(false);
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

  // Validate email
  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setError('');
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    
    try {
      // Call forgot password API
      await authService.forgotPassword(email);
      
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error('Forgot password error:', error);
      
      // Handle specific API errors
      if (error.status === 404) {
        setError('No account found with this email address');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to process your request. Please try again.');
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
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                {success 
                  ? 'Check your email for reset instructions' 
                  : 'Enter your email to reset your password'}
              </Text>
            </View>
            
            
            
            {success ? (
              <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                  <LinearGradient
                    colors={['#0F766E', '#0D9488']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.successIcon}
                  >
                    <MaterialCommunityIcons 
                      name="email-check-outline" 
                      size={30} 
                      color="white" 
                    />
                  </LinearGradient>
                </View>
                
                <Text style={styles.successTitle}>
                  Reset Instructions Sent!
                </Text>
                
                <Text style={styles.successMessage}>
                  Password reset instructions have been sent to:
                </Text>
                
                <Text style={styles.emailHighlight}>{email}</Text>
                
                <Text style={styles.successSubtext}>
                  Please check your inbox (and spam folder) for an email with a link to reset your password.
                </Text>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.9}
                  onMouseEnter={() => Platform.OS === 'web' && setSubmitButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setSubmitButtonHovered(false)}
                  style={styles.buttonContainer}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F8F8']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.button,
                      submitButtonHovered && styles.hoveredButton
                    ]}
                  >
                    <Text style={styles.buttonText}>Return to Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formCard}>
                {/* Error message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons 
                      name="alert-circle-outline" 
                      size={20} 
                      color="#B91C1C" 
                      style={styles.messageIcon}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                
                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Email"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError('');
                      }}
                      style={styles.input}
                      error={!!error}
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
                    {error ? (
                      <HelperText type="error" visible={!!error} style={styles.helperText}>
                        {error}
                      </HelperText>
                    ) : (
                      <HelperText type="info" visible={true} style={styles.infoText}>
                        Enter the email address you used to register
                      </HelperText>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}
                    onMouseEnter={() => Platform.OS === 'web' && setSubmitButtonHovered(true)}
                    onMouseLeave={() => Platform.OS === 'web' && setSubmitButtonHovered(false)}
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
                        submitButtonHovered && styles.hoveredButton
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#AD56C4" />
                      ) : (
                        <Text style={styles.buttonText}>Send Reset Instructions</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                  activeOpacity={0.7}
                  onMouseEnter={() => Platform.OS === 'web' && setBackButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setBackButtonHovered(false)}
                  style={[
                    styles.backButton,
                    backButtonHovered && styles.hoveredBackButton
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
                    name="information-outline" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.8)" 
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.helpText}>
                    You will receive an email with a link to reset your password. The link will expire after 24 hours.
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
  successTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMessage: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  emailHighlight: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 18,
    color: '#FFC2BA',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successSubtext: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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

export default ForgotPasswordScreen;