// src/screens/auth/RoleSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RoleSelectionScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors } = theme.univance;
  const [selectedRole, setSelectedRole] = useState(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
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
  
  // User roles with icons
  const roleOptions = [
    {
      id: 'STUDENT',
      title: 'Student',
      icon: 'school',
      gradient: ['#FF8DA1', '#FF6B85'],
    },
    {
      id: 'PARENT',
      title: 'Parent',
      icon: 'account-child-circle',
      gradient: ['#FFC2BA', '#FFAD9F'],
    },
    {
      id: 'TEACHER',
      title: 'Teacher',
      icon: 'human-male-board',
      gradient: ['#FF9CE9', '#FF7DE0'],
    },
    {
      id: 'SOCIAL_WORKER',
      title: 'Social Worker',
      icon: 'account-group',
      gradient: ['#64B5F6', '#2196F3'],
    },
    {
      id: 'SCHOOL',
      title: 'School Admin',
      icon: 'domain',
      gradient: ['#AD56C4', '#9548A8'],
    },
  ];

  // Handle role selection
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  // Navigate to registration with selected role
  const handleContinue = () => {
    if (selectedRole) {
      navigation.navigate('Register', { role: selectedRole });
    }
  };

  // Navigate to login
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Get columns based on screen size
  const getNumColumns = () => {
    if (windowWidth >= 1100) return 5; // Large desktop
    if (windowWidth >= 768) return 3;  // Desktop/tablet
    if (windowWidth >= 350) return 2;  // Make sure phones show at least 2 columns
    return 1;                          // Very small mobile
  };

  const numColumns = getNumColumns();
  const cardWidth = numColumns === 1 ? '90%' : 
                   numColumns === 2 ? '45%' : 
                   numColumns === 3 ? '30%' : '18%';

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
              <Text style={styles.title}>Welcome to Univance</Text>
              <Text style={styles.subtitle}>Let's start by selecting your role</Text>
            </View>
            
            <View style={[
              styles.roleGrid, 
              {
                gap: numColumns === 1 ? 15 : 20,
                maxWidth: numColumns <= 2 ? 600 : numColumns === 3 ? 900 : 1100
              }
            ]}>
              {roleOptions.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.8}
                  onMouseEnter={() => Platform.OS === 'web' && setHoveredCard(role.id)}
                  onMouseLeave={() => Platform.OS === 'web' && setHoveredCard(null)}
                  style={{
                    width: cardWidth
                  }}
                >
                  <LinearGradient
                    colors={selectedRole === role.id ? role.gradient : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[
                      styles.roleCard,
                      selectedRole === role.id && styles.selectedCard,
                      hoveredCard === role.id && styles.hoveredCard
                    ]}
                  >
                    <LinearGradient
                      colors={role.gradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.iconContainer}
                    >
                      <MaterialCommunityIcons 
                        name={role.icon} 
                        size={30} 
                        color="white" 
                      />
                    </LinearGradient>
                    
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    
                    {/* Selected indicator */}
                    {selectedRole === role.id && (
                      <View style={styles.checkmark}>
                        <MaterialCommunityIcons 
                          name="check-circle" 
                          size={22} 
                          color="white" 
                        />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedRole}
              activeOpacity={0.9}
              onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
              onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
              style={[
                styles.buttonContainer,
                !selectedRole && {opacity: 0.6}
              ]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F8F8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.continueButton,
                  buttonHovered && styles.hoveredButton
                ]}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginText}>Log In</Text>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  roleCard: {
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    } : {})
  },
  hoveredCard: {
    transform: [{scale: 1.03}],
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedCard: {
    transform: [{scale: 1.05}],
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    } : {})
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  continueButton: {
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
  loginText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RoleSelectionScreen;