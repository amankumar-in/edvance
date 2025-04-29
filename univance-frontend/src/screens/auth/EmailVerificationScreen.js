// src/screens/auth/EmailVerificationScreen.js
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
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';

const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Get email from route params or URL query
  const email = route.params?.email || new URLSearchParams(window.location.search).get('email') || '';
  const tokenParam = route.params?.token || new URLSearchParams(window.location.search).get('token') || null;
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // UI state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [timer, setTimer] = useState(0);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [resendButtonHovered, setResendButtonHovered] = useState(false);
  const [supportLinkHovered, setSupportLinkHovered] = useState(false);

  // New state for verification
  const [verificationStatus, setVerificationStatus] = useState({
    loading: false,
    verified: false,
    error: ''
  });

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
  
  // Start a 60 second timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  
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

  // New effect to verify email when token is present
  useEffect(() => {
    const verifyEmailWithToken = async () => {
      if (tokenParam && email) {
        setVerificationStatus({
          loading: true,
          verified: false,
          error: ''
        });
        
        try {
          await authService.verifyEmail(tokenParam, email);
          
          setVerificationStatus({
            loading: false,
            verified: true,
            error: ''
          });
        } catch (error) {
          console.error('Email verification error:', error);
          
          setVerificationStatus({
            loading: false,
            verified: false,
            error: error.message || 'Verification failed. Please try again or request a new verification email.'
          });
        }
      }
    };
    
    verifyEmailWithToken();
  }, [tokenParam, email]);

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    setResendError('');
    
    try {
      await authService.resendVerification(email);
      
      setResendSuccess(true);
      setTimer(60); // Start 60 second countdown
    } catch (error) {
      setResendError(error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Navigate to login screen
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // Determine what content to show based on verification status
  const renderContent = () => {
    // Show loading state while verifying
    if (verificationStatus.loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      );
    }
    
    // Show success state if verified
    if (verificationStatus.verified) {
      return (
        <View style={styles.successCard}>
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={['#0F766E', '#0D9488']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.successIcon}
            >
              <MaterialCommunityIcons 
                name="email-check" 
                size={40} 
                color="white" 
              />
            </LinearGradient>
          </View>
          
          <Text style={styles.successCardTitle}>Email Verified!</Text>
          
          <Text style={styles.successMessage}>
            Your email has been successfully verified. You can now log in to your account.
          </Text>
          
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.9}
            onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
            style={styles.loginButtonContainer}
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
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Show error state if verification failed and token was provided
    if (verificationStatus.error && tokenParam) {
      return (
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <LinearGradient
              colors={['#B91C1C', '#991B1B']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.errorIcon}
            >
              <MaterialCommunityIcons 
                name="email-alert" 
                size={40} 
                color="white" 
              />
            </LinearGradient>
          </View>
          
          <Text style={styles.errorCardTitle}>Verification Failed</Text>
          
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={20} 
              color="#B91C1C" 
              style={styles.messageIcon}
            />
            <Text style={styles.errorText}>{verificationStatus.error}</Text>
          </View>
          
          <Text style={styles.errorInstructions}>
            Please try again or request a new verification email.
          </Text>
          
          <TouchableOpacity
            onPress={handleResendVerification}
            disabled={resendLoading || timer > 0}
            activeOpacity={0.8}
            onMouseEnter={() => Platform.OS === 'web' && setResendButtonHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setResendButtonHovered(false)}
            style={[
              styles.resendButton,
              (resendLoading || timer > 0) && styles.disabledButton,
              (!resendLoading && timer === 0 && resendButtonHovered) && styles.hoveredResendButton
            ]}
          >
            {resendLoading ? (
              <ActivityIndicator color="#AD56C4" size="small" />
            ) : (
              <Text style={styles.resendButtonText}>
                {timer > 0 
                  ? `Resend email (${timer}s)` 
                  : 'Resend verification email'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.9}
            onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
            style={styles.loginButtonContainer}
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
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Default: Show "check your inbox" if not verifying and no token provided
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Check your inbox
        </Text>
        
        <Text style={styles.description}>
          We've sent a verification link to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Please check your email and click on the verification link to activate your account. If you don't see the email, check your spam folder.
        </Text>
        
        {/* Success and Error Messages */}
        {resendSuccess && (
          <View style={styles.successContainer}>
            <MaterialCommunityIcons 
              name="check-circle-outline" 
              size={20} 
              color="#0F766E" 
              style={styles.messageIcon}
            />
            <Text style={styles.successText}>
              Verification email has been resent successfully!
            </Text>
          </View>
        )}
        
        {resendError ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={20} 
              color="#B91C1C" 
              style={styles.messageIcon}
            />
            <Text style={styles.errorText}>{resendError}</Text>
          </View>
        ) : null}
        
        {/* Resend Button */}
        <TouchableOpacity
          onPress={handleResendVerification}
          disabled={resendLoading || timer > 0}
          activeOpacity={0.8}
          onMouseEnter={() => Platform.OS === 'web' && setResendButtonHovered(true)}
          onMouseLeave={() => Platform.OS === 'web' && setResendButtonHovered(false)}
          style={[
            styles.resendButton,
            (resendLoading || timer > 0) && styles.disabledButton,
            (!resendLoading && timer === 0 && resendButtonHovered) && styles.hoveredResendButton
          ]}
        >
          {resendLoading ? (
            <ActivityIndicator color="#AD56C4" size="small" />
          ) : (
            <Text style={styles.resendButtonText}>
              {timer > 0 
                ? `Resend email (${timer}s)` 
                : 'Resend verification email'}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Go to Login Button */}
        <TouchableOpacity
          onPress={goToLogin}
          activeOpacity={0.9}
          onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
          onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
          style={styles.loginButtonContainer}
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
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.helpContainer}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={20} 
            color="rgba(255, 255, 255, 0.8)" 
            style={{marginRight: 8}}
          />
          <Text style={styles.helpText}>
            If you're having trouble, please check your spam folder or contact support.
          </Text>
        </View>
      </View>
    );
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
              <Text style={styles.title}>
                {verificationStatus.verified 
                  ? 'Email Verified' 
                  : 'Verify Your Email'}
              </Text>
              <Text style={styles.subtitle}>
                {verificationStatus.verified 
                  ? 'Your account is now active'
                  : 'Just one more step to complete your registration'}
              </Text>
            </View>
            
            {/* Email Icon */}
            {!verificationStatus.loading && !verificationStatus.verified && (
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#FF9CE9', '#FF7DE0']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.iconBackground}
                >
                  <MaterialCommunityIcons 
                    name="email-outline" 
                    size={40} 
                    color="white" 
                  />
                </LinearGradient>
              </View>
            )}
            
            {/* Render appropriate content based on status */}
            {renderContent()}
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Need help?</Text>
              <TouchableOpacity 
                onMouseEnter={() => Platform.OS === 'web' && setSupportLinkHovered(true)}
                onMouseLeave={() => Platform.OS === 'web' && setSupportLinkHovered(false)}
                style={[
                  styles.supportLink,
                  supportLinkHovered && {opacity: 0.8}
                ]}
              >
                <Text style={styles.supportLinkText}>Contact Support</Text>
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
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
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
  errorCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCardTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorCardTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 18,
    color: '#FF9CE9',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  instructions: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorInstructions: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successMessage: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successContainer: {
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#0F766E',
    flexDirection: 'row',
    alignItems: 'center',
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
  successText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: '#0F766E',
    flex: 1,
  },
  errorText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: '#B91C1C',
    flex: 1,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
    } : {})
  },
  hoveredResendButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
  },
  loginButtonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  loginButton: {
    borderRadius: 50,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
  helpContainer: {
    marginTop: 24,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 4,
  },
  supportLink: {
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.2s ease',
    } : {}),
  },
  supportLinkText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 14,
    color: '#FF9CE9',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default EmailVerificationScreen;