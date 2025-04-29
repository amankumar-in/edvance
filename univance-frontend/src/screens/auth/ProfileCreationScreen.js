// src/screens/auth/ProfileCreationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput as RNTextInput,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  Image
} from 'react-native';
import { TextInput, HelperText, Switch } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import authService from '../../services/authService';
import { useAppTheme } from '../../theme/ThemeProvider';

const ProfileCreationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, gradients } = useAppTheme();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  
  // Get user role from navigation params or URL query
  const userRole = route.params?.userRole || new URLSearchParams(window.location.search).get('userRole') || 'STUDENT';
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  
  // Ref to store user data once fetched
  const userDataRef = useRef(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [buttonHovered, setButtonHovered] = useState(false);
  const [skipHovered, setSkipHovered] = useState(false);
  const [linkParentHovered, setLinkParentHovered] = useState(false);
  const [linkSchoolHovered, setLinkSchoolHovered] = useState(false);
  const [isUnder13, setIsUnder13] = useState(false);
  const [parentConsentEmail, setParentConsentEmail] = useState('');
  const [consentRequested, setConsentRequested] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // User profile data
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: null,
    phoneNumber: '',
    avatar: null,
    
    // Student-specific data
    grade: '',
    
    // Optional connections
    parentLinkCode: '',
    parentEmail: '',
    schoolCode: '',
    
    // Parent-specific data
    childName: '',
    childEmail: '',
    childAge: '',
    childGrade: '',
    
    // Teacher-specific data
    schoolId: '',
    subjectsTaught: '',
    
    // School admin-specific data
    schoolName: '',
    schoolAddress: '',
    schoolCity: '',
    schoolState: '',
    schoolZipCode: '',
    schoolCountry: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolWebsite: '',
    schoolLogo: null,
    
    // Social worker-specific data
    organization: '',
    caseloadLimit: '',
  });

  // Get role-specific steps
  const getTotalSteps = () => {
    switch (userRole) {
      case 'STUDENT':
        return 4; // Profile info, student details, parent connection, school connection
      case 'PARENT':
        return 3; // Profile info, parent details, add children
      case 'TEACHER':
        return 3; // Profile info, teacher details, school connection
      case 'SCHOOL':
        return 3; // Profile info, school details, logo upload
      case 'SOCIAL_WORKER':
        return 3; // Profile info, organization details, caseload settings
      default:
        return 2;
    }
  };

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

  // Fetch current user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData?.data?.user) {
          userDataRef.current = userData.data.user;
          
          // Pre-fill form with existing user data
          setFormData(prev => ({
            ...prev,
            firstName: userData.data.user.firstName || '',
            lastName: userData.data.user.lastName || '',
            email: userData.data.user.email || '',
            dateOfBirth: userData.data.user.dateOfBirth ? new Date(userData.data.user.dateOfBirth) : null,
            phoneNumber: userData.data.user.phoneNumber || '',
            avatar: userData.data.user.avatar || null,
          }));
          
          // Check if user is under 13
          if (userData.data.user.dateOfBirth) {
            const birthDate = new Date(userData.data.user.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            setIsUnder13(age < 13);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle date of birth change
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    
    if (currentDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: currentDate }));
      
      // Check if user is under 13
      const today = new Date();
      let age = today.getFullYear() - currentDate.getFullYear();
      const m = today.getMonth() - currentDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < currentDate.getDate())) {
        age--;
      }
      setIsUnder13(age < 13);
    }
  };

  // Handle image selection
  const handleImagePick = async (fieldName) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.cancelled && result.assets && result.assets[0].uri) {
        setFormData(prev => ({ ...prev, [fieldName]: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image');
    }
  };

  // Validate step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate account info
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (isUnder13 && !parentConsentEmail.trim() && !consentRequested) {
        newErrors.parentConsentEmail = 'Parent email is required for users under 13';
      }
    }
    
    if (step === 2) {
      // Validate role-specific info
      if (userRole === 'STUDENT') {
        if (!formData.grade.trim()) {
          newErrors.grade = 'Grade is required';
        } else if (isNaN(parseInt(formData.grade)) || parseInt(formData.grade) < 1 || parseInt(formData.grade) > 12) {
          newErrors.grade = 'Grade must be a number between 1 and 12';
        }
      } else if (userRole === 'TEACHER') {
        if (!formData.schoolId.trim()) {
          newErrors.schoolId = 'School is required';
        }
      } else if (userRole === 'SCHOOL') {
        if (!formData.schoolName.trim()) {
          newErrors.schoolName = 'School name is required';
        }
      }
    }
    
    if (step === 3) {
      // Validate optional connections
      if (userRole === 'STUDENT') {
        if (formData.parentEmail && !formData.parentEmail.includes('@')) {
          newErrors.parentEmail = 'Please enter a valid email address';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Request parental consent
  const handleRequestConsent = async () => {
    if (!parentConsentEmail.includes('@')) {
      setErrors(prev => ({ ...prev, parentConsentEmail: 'Please enter a valid email address' }));
      return;
    }
    
    setLoading(true);
    try {
      // Here would be the API call to send consent email
      // Mocked for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConsentRequested(true);
      setErrors(prev => ({ ...prev, parentConsentEmail: '' }));
    } catch (error) {
      console.error('Error requesting consent:', error);
      setErrors(prev => ({ ...prev, parentConsentEmail: 'Failed to send consent email. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // Create student profile and points account
  const createStudentProfile = async () => {
    try {
      // 1. Create student profile
      const studentProfileRes = await authService.createStudentProfile({
        grade: parseInt(formData.grade)
      });
      
      if (!studentProfileRes.data || !studentProfileRes.data._id) {
        throw new Error('Failed to create student profile');
      }
      
      const studentId = studentProfileRes.data._id;
      
      // 2. Create points account
      const pointsAccountRes = await fetch(`${API_URL}/points/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getToken()}`
        },
        body: JSON.stringify({ studentId })
      });
      
      if (!pointsAccountRes.ok) {
        throw new Error('Failed to create points account');
      }
      
      const pointsAccountData = await pointsAccountRes.json();
      
      // 3. Update student profile with points account ID
      if (pointsAccountData.data && pointsAccountData.data._id) {
        await fetch(`${API_URL}/students/${studentId}/points-account`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await authService.getToken()}`
          },
          body: JSON.stringify({ pointsAccountId: pointsAccountData.data._id })
        });
      }
      
      // 4. Handle parent connection if provided
      if (formData.parentLinkCode) {
        try {
          await authService.linkWithParent(formData.parentLinkCode);
        } catch (error) {
          console.error('Error linking with parent:', error);
        }
      } else if (formData.parentEmail) {
        try {
          await authService.requestParentLink(formData.parentEmail);
        } catch (error) {
          console.error('Error requesting parent link:', error);
        }
      }
      
      // 5. Handle school connection if provided
      if (formData.schoolCode) {
        try {
          await authService.linkWithSchool(formData.schoolCode);
        } catch (error) {
          console.error('Error linking with school:', error);
        }
      }
      
      return studentProfileRes.data;
    } catch (error) {
      console.error('Error in student profile creation:', error);
      throw error;
    }
  };

  // Create parent profile
  const createParentProfile = async () => {
    try {
      // Create parent profile
      const parentProfileRes = await authService.createParentProfile();
      
      // Handle adding child if provided
      if (formData.childName || formData.childEmail) {
        try {
          await authService.addChild({
            childName: formData.childName,
            childEmail: formData.childEmail,
            childAge: formData.childAge ? parseInt(formData.childAge) : undefined,
            grade: formData.childGrade ? parseInt(formData.childGrade) : undefined
          });
        } catch (error) {
          console.error('Error adding child:', error);
        }
      }
      
      return parentProfileRes.data;
    } catch (error) {
      console.error('Error in parent profile creation:', error);
      throw error;
    }
  };

  // Create teacher profile
  const createTeacherProfile = async () => {
    try {
      // Create teacher profile
      const teacherProfileRes = await authService.createTeacherProfile({
        schoolId: formData.schoolId,
        subjectsTaught: formData.subjectsTaught.split(',').map(subject => subject.trim()).filter(Boolean)
      });
      
      return teacherProfileRes.data;
    } catch (error) {
      console.error('Error in teacher profile creation:', error);
      throw error;
    }
  };

  // Create school profile
  const createSchoolProfile = async () => {
    try {
      // Create school profile
      const schoolProfileRes = await authService.createSchool({
        name: formData.schoolName,
        address: formData.schoolAddress,
        city: formData.schoolCity,
        state: formData.schoolState,
        zipCode: formData.schoolZipCode,
        country: formData.schoolCountry,
        phone: formData.schoolPhone,
        email: formData.schoolEmail,
        website: formData.schoolWebsite,
        logo: formData.schoolLogo
      });
      
      return schoolProfileRes.data;
    } catch (error) {
      console.error('Error in school profile creation:', error);
      throw error;
    }
  };

  // Create social worker profile
  const createSocialWorkerProfile = async () => {
    try {
      // Create social worker profile
      const socialWorkerProfileRes = await authService.createSocialWorkerProfile({
        organization: formData.organization,
        caseloadLimit: formData.caseloadLimit ? parseInt(formData.caseloadLimit) : undefined
      });
      
      return socialWorkerProfileRes.data;
    } catch (error) {
      console.error('Error in social worker profile creation:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async () => {
    try {
      // Only update fields that are provided
      const updateData = {};
      
      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth.toISOString().split('T')[0];
      }
      
      if (formData.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      
      // Avatar would need to be uploaded separately
      if (formData.avatar && formData.avatar !== userDataRef.current?.avatar) {
        // Upload avatar code would go here
        // For now, we'll just console log
        console.log('Avatar would be uploaded here:', formData.avatar);
      }
      
      // Only make the API call if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await authService.updateUserProfile(updateData);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Submit profile
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Step 1: Update user profile with additional details
      await updateUserProfile();
      
      // Step 2: Create role-specific profile
      let profileData;
      
      if (userRole === 'STUDENT') {
        profileData = await createStudentProfile();
      } else if (userRole === 'PARENT') {
        profileData = await createParentProfile();
      } else if (userRole === 'TEACHER') {
        profileData = await createTeacherProfile();
      } else if (userRole === 'SCHOOL') {
        profileData = await createSchoolProfile();
      } else if (userRole === 'SOCIAL_WORKER') {
        profileData = await createSocialWorkerProfile();
      }
      
      // Success! Navigate to the appropriate dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('Error creating profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Render the account info step
  const renderAccountInfoStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Complete Your Profile</Text>
        <Text style={styles.stepDescription}>Let's add some basic details to get started</Text>
        
        <View style={styles.form}>
          {/* Avatar */}
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => handleImagePick('avatar')}
          >
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <MaterialCommunityIcons name="account" size={50} color="rgba(255, 255, 255, 0.7)" />
              </View>
            )}
            <View style={styles.avatarEdit}>
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Profile Picture (Optional)</Text>
          
          {/* First Name */}
          <View style={styles.inputContainer}>
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
          
          {/* Last Name */}
          <View style={styles.inputContainer}>
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
          
          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.dateOfBirth 
                  ? formData.dateOfBirth.toLocaleDateString()
                  : 'Select Date of Birth (Optional)'}
              </Text>
              <MaterialCommunityIcons name="calendar" size={24} color="white" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Phone Number (Optional)"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
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
          </View>
          
          {/* Parental Consent for Under 13 */}
          {isUnder13 && !parentConsent && (
            <View style={styles.consentContainer}>
              <Text style={styles.consentTitle}>Parental Consent Required</Text>
              <Text style={styles.consentText}>
                Because you're under 13, we need your parent or guardian's consent before you can use all features.
              </Text>
              
              {!consentRequested ? (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Parent's Email Address"
                      value={parentConsentEmail}
                      onChangeText={setParentConsentEmail}
                      style={styles.input}
                      error={!!errors.parentConsentEmail}
                      mode="outlined"
                      keyboardType="email-address"
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
                    {errors.parentConsentEmail ? (
                      <HelperText type="error" visible={!!errors.parentConsentEmail} style={styles.helperText}>
                        {errors.parentConsentEmail}
                      </HelperText>
                    ) : null}
                  </View>
                  
                  <TouchableOpacity
                    onPress={handleRequestConsent}
                    disabled={loading}
                    style={styles.consentButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.consentButtonText}>Request Parent's Consent</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={20} 
                    color="#0F766E" 
                    style={styles.messageIcon}
                  />
                  <Text style={styles.successText}>
                    Consent request sent! Ask your parent to check their email.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render student details step
  const renderStudentDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Student Details</Text>
        <Text style={styles.stepDescription}>Tell us a bit more about your education</Text>
        
        <View style={styles.form}>
          {/* Grade Level */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Grade Level"
              value={formData.grade}
              onChangeText={(text) => handleChange('grade', text)}
              style={styles.input}
              error={!!errors.grade}
              mode="outlined"
              keyboardType="number-pad"
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
            {errors.grade ? (
              <HelperText type="error" visible={!!errors.grade} style={styles.helperText}>
                {errors.grade}
              </HelperText>
            ) : (
              <HelperText style={styles.helperTextNeutral}>
                Enter your current grade level (1-12)
              </HelperText>
            )}
          </View>
          
          {/* Fun graphic for students */}
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="school" size={60} color={colors.primary.lavender} />
            <Text style={styles.illustrationText}>Ready to learn and earn points!</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render parent connection step
  const renderParentConnectionStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Connect with Parent</Text>
        <Text style={styles.stepDescription}>Optional: Link your account with a parent</Text>
        
        <View style={styles.form}>
          <View style={styles.connectionOptions}>
            <TouchableOpacity 
              style={[styles.connectionOption, formData.parentLinkCode ? styles.connectionOptionSelected : null]}
              onPress={() => {
                setFormData(prev => ({
                  ...prev, 
                  parentEmail: '',
                  parentLinkCode: prev.parentLinkCode || ''
                }));
              }}
            >
              <MaterialCommunityIcons 
                name="link" 
                size={30} 
                color={formData.parentLinkCode ? colors.primary.lavender : "white"} 
              />
              <Text style={styles.connectionOptionTitle}>Use a Link Code</Text>
              <Text style={styles.connectionOptionDescription}>
                If your parent has a code, use it here to link accounts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.connectionOption, formData.parentEmail ? styles.connectionOptionSelected : null]}
              onPress={() => {
                setFormData(prev => ({
                  ...prev, 
                  parentLinkCode: '',
                  parentEmail: prev.parentEmail || ''
                }));
              }}
            >
              <MaterialCommunityIcons 
                name="email-outline" 
                size={30} 
                color={formData.parentEmail ? colors.primary.lavender : "white"} 
              />
              <Text style={styles.connectionOptionTitle}>Send an Invitation</Text>
              <Text style={styles.connectionOptionDescription}>
                Invite your parent via email to connect accounts
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Conditional inputs based on selected option */}
          {formData.parentLinkCode !== '' && (
            <View style={styles.inputContainer}>
              <TextInput
                label="Parent's Link Code"
                value={formData.parentLinkCode}
                onChangeText={(text) => handleChange('parentLinkCode', text)}
                style={styles.input}
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
              <HelperText style={styles.helperTextNeutral}>
                Enter the 6-character code your parent gave you
              </HelperText>
            </View>
          )}
          
          {formData.parentEmail !== '' && (
            <View style={styles.inputContainer}>
              <TextInput
                label="Parent's Email Address"
                value={formData.parentEmail}
                onChangeText={(text) => handleChange('parentEmail', text)}
                style={styles.input}
                error={!!errors.parentEmail}
                mode="outlined"
                keyboardType="email-address"
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
              {errors.parentEmail ? (
                <HelperText type="error" visible={!!errors.parentEmail} style={styles.helperText}>
                  {errors.parentEmail}
                </HelperText>
              ) : (
                <HelperText style={styles.helperTextNeutral}>
                  We'll send an invitation to your parent to connect
                </HelperText>
              )}
            </View>
          )}
          
          <TouchableOpacity
            onPress={() => {
              setFormData(prev => ({ ...prev, parentLinkCode: '', parentEmail: '' }));
              handleNextStep();
            }}
            onMouseEnter={() => Platform.OS === 'web' && setSkipHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setSkipHovered(false)}
            style={[
              styles.skipButton,
              skipHovered && styles.skipButtonHovered
            ]}
          >
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render school connection step
  const renderSchoolConnectionStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Connect with School</Text>
        <Text style={styles.stepDescription}>Optional: Link your account with your school</Text>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              label="School Code"
              value={formData.schoolCode}
              onChangeText={(text) => handleChange('schoolCode', text)}
              style={styles.input}
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
            <HelperText style={styles.helperTextNeutral}>
              Enter the code provided by your school or teacher
            </HelperText>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              setFormData(prev => ({ ...prev, schoolCode: '' }));
              handleSubmit();
            }}
            onMouseEnter={() => Platform.OS === 'web' && setSkipHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setSkipHovered(false)}
            style={[
              styles.skipButton,
              skipHovered && styles.skipButtonHovered
            ]}
          >
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render parent details step
  const renderParentDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Parent Details</Text>
        <Text style={styles.stepDescription}>Set up your parent account</Text>
        
        <View style={styles.form}>
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="account-child-circle" size={60} color={colors.primary.peach} />
            <Text style={styles.illustrationText}>
              Ready to help support your child's education journey!
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <MaterialCommunityIcons 
              name="information-outline" 
              size={24} 
              color="white" 
              style={{ marginRight: 12 }}
            />
            <Text style={styles.infoText}>
              Your parent account has been set up. You'll be able to add your children from your dashboard after completing setup.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render add children step for parents
  const renderAddChildrenStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Add a Child</Text>
        <Text style={styles.stepDescription}>Optional: Add your child's information</Text>
        
        <View style={styles.form}>
          {/* Child's Name */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Child's Name"
              value={formData.childName}
              onChangeText={(text) => handleChange('childName', text)}
              style={styles.input}
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
          </View>
          
          {/* Child's Email (optional) */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Child's Email (optional)"
              value={formData.childEmail}
              onChangeText={(text) => handleChange('childEmail', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
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
            <HelperText style={styles.helperTextNeutral}>
              If your child already has an account, enter their email
            </HelperText>
          </View>
          
          {/* Child's Age */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Child's Age (optional)"
              value={formData.childAge}
              onChangeText={(text) => handleChange('childAge', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="number-pad"
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
          </View>
          
          {/* Child's Grade */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Child's Grade (optional)"
              value={formData.childGrade}
              onChangeText={(text) => handleChange('childGrade', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="number-pad"
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
          </View>
          
          <TouchableOpacity
            onPress={() => {
              setFormData(prev => ({ 
                ...prev, 
                childName: '', 
                childEmail: '',
                childAge: '',
                childGrade: ''
              }));
              handleSubmit();
            }}
            onMouseEnter={() => Platform.OS === 'web' && setSkipHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setSkipHovered(false)}
            style={[
              styles.skipButton,
              skipHovered && styles.skipButtonHovered
            ]}
          >
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render teacher details step
  const renderTeacherDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Teacher Details</Text>
        <Text style={styles.stepDescription}>Tell us about your teaching role</Text>
        
        <View style={styles.form}>
          {/* School ID */}
          <View style={styles.inputContainer}>
            <TextInput
              label="School ID"
              value={formData.schoolId}
              onChangeText={(text) => handleChange('schoolId', text)}
              style={styles.input}
              error={!!errors.schoolId}
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
            {errors.schoolId ? (
              <HelperText type="error" visible={!!errors.schoolId} style={styles.helperText}>
                {errors.schoolId}
              </HelperText>
            ) : (
              <HelperText style={styles.helperTextNeutral}>
                Enter the ID of your school
              </HelperText>
            )}
          </View>
          
          {/* Subjects Taught */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Subjects Taught (Optional, comma-separated)"
              value={formData.subjectsTaught}
              onChangeText={(text) => handleChange('subjectsTaught', text)}
              style={styles.input}
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
            <HelperText style={styles.helperTextNeutral}>
              E.g., Math, Science, English
            </HelperText>
          </View>
          
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="human-male-board" size={60} color={colors.primary.lavender} />
            <Text style={styles.illustrationText}>Ready to inspire your students!</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render school admin details step
  const renderSchoolDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>School Details</Text>
        <Text style={styles.stepDescription}>Tell us about your school</Text>
        
        <View style={styles.form}>
          {/* School Name */}
          <View style={styles.inputContainer}>
            <TextInput
              label="School Name"
              value={formData.schoolName}
              onChangeText={(text) => handleChange('schoolName', text)}
              style={styles.input}
              error={!!errors.schoolName}
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
            {errors.schoolName ? (
              <HelperText type="error" visible={!!errors.schoolName} style={styles.helperText}>
                {errors.schoolName}
              </HelperText>
            ) : null}
          </View>
          
          {/* Address */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Address (Optional)"
              value={formData.schoolAddress}
              onChangeText={(text) => handleChange('schoolAddress', text)}
              style={styles.input}
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
          </View>
          
          {/* City, State layout */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <TextInput
                label="City (Optional)"
                value={formData.schoolCity}
                onChangeText={(text) => handleChange('schoolCity', text)}
                style={styles.input}
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
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <TextInput
                label="State (Optional)"
                value={formData.schoolState}
                onChangeText={(text) => handleChange('schoolState', text)}
                style={styles.input}
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
            </View>
          </View>
          
          {/* ZIP, Country layout */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <TextInput
                label="ZIP Code (Optional)"
                value={formData.schoolZipCode}
                onChangeText={(text) => handleChange('schoolZipCode', text)}
                style={styles.input}
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
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <TextInput
                label="Country (Optional)"
                value={formData.schoolCountry}
                onChangeText={(text) => handleChange('schoolCountry', text)}
                style={styles.input}
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
            </View>
          </View>
          
          {/* Contact Information */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Phone Number (Optional)"
              value={formData.schoolPhone}
              onChangeText={(text) => handleChange('schoolPhone', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
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
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="School Email (Optional)"
              value={formData.schoolEmail}
              onChangeText={(text) => handleChange('schoolEmail', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
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
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              label="Website (Optional)"
              value={formData.schoolWebsite}
              onChangeText={(text) => handleChange('schoolWebsite', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="url"
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
          </View>
        </View>
      </View>
    );
  };

  // Render school logo step
  const renderSchoolLogoStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>School Logo</Text>
        <Text style={styles.stepDescription}>Add your school's logo (Optional)</Text>
        
        <View style={styles.form}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => handleImagePick('schoolLogo')}
          >
            {formData.schoolLogo ? (
              <Image source={{ uri: formData.schoolLogo }} style={styles.schoolLogo} />
            ) : (
              <View style={styles.schoolLogoPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={50} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.schoolLogoPlaceholderText}>Tap to add logo</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setFormData(prev => ({ ...prev, schoolLogo: null }));
              handleSubmit();
            }}
            onMouseEnter={() => Platform.OS === 'web' && setSkipHovered(true)}
            onMouseLeave={() => Platform.OS === 'web' && setSkipHovered(false)}
            style={[
              styles.skipButton,
              skipHovered && styles.skipButtonHovered
            ]}
          >
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render social worker details step
  const renderSocialWorkerDetailsStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Social Worker Details</Text>
        <Text style={styles.stepDescription}>Tell us about your professional background</Text>
        
        <View style={styles.form}>
          {/* Organization */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Organization"
              value={formData.organization}
              onChangeText={(text) => handleChange('organization', text)}
              style={styles.input}
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
          </View>
          
          {/* Caseload Limit */}
          <View style={styles.inputContainer}>
            <TextInput
              label="Caseload Limit (Optional)"
              value={formData.caseloadLimit}
              onChangeText={(text) => handleChange('caseloadLimit', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="number-pad"
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
            <HelperText style={styles.helperTextNeutral}>
              Maximum number of children you can manage
            </HelperText>
          </View>
          
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="account-group" size={60} color="#64B5F6" />
            <Text style={styles.illustrationText}>Ready to make a difference in students' lives!</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (userRole) {
      case 'STUDENT':
        if (currentStep === 1) return renderAccountInfoStep();
        if (currentStep === 2) return renderStudentDetailsStep();
        if (currentStep === 3) return renderParentConnectionStep();
        if (currentStep === 4) return renderSchoolConnectionStep();
        break;
      case 'PARENT':
        if (currentStep === 1) return renderAccountInfoStep();
        if (currentStep === 2) return renderParentDetailsStep();
        if (currentStep === 3) return renderAddChildrenStep();
        break;
      case 'TEACHER':
        if (currentStep === 1) return renderAccountInfoStep();
        if (currentStep === 2) return renderTeacherDetailsStep();
        if (currentStep === 3) return renderTeacherDetailsStep(); // Placeholder
        break;
      case 'SCHOOL':
        if (currentStep === 1) return renderAccountInfoStep();
        if (currentStep === 2) return renderSchoolDetailsStep();
        if (currentStep === 3) return renderSchoolLogoStep();
        break;
      case 'SOCIAL_WORKER':
        if (currentStep === 1) return renderAccountInfoStep();
        if (currentStep === 2) return renderSocialWorkerDetailsStep();
        if (currentStep === 3) return renderSocialWorkerDetailsStep(); // Placeholder
        break;
      default:
        return renderAccountInfoStep();
    }
  };

  // Progress bar calculation
  const progress = (currentStep / getTotalSteps()) * 100;

  // Decide if we should show next, back, or submit buttons
  const isLastStep = currentStep === getTotalSteps();
  const isFirstStep = currentStep === 1;

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
          {loadingUser ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.lavender} />
              <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
          ) : (
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Step {currentStep} of {getTotalSteps()}
                </Text>
              </View>
              
              {/* Step Content */}
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <View style={styles.buttonContainer}>
                {!isFirstStep && (
                  <TouchableOpacity
                    onPress={handlePreviousStep}
                    style={styles.backButton}
                  >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={isLastStep ? handleSubmit : handleNextStep}
                  disabled={loading}
                  activeOpacity={0.9}
                  onMouseEnter={() => Platform.OS === 'web' && setButtonHovered(true)}
                  onMouseLeave={() => Platform.OS === 'web' && setButtonHovered(false)}
                  style={[
                    styles.nextButton,
                    buttonHovered && styles.hoveredButton,
                    loading && styles.disabledButton
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>
                        {isLastStep ? 'Complete Setup' : 'Continue'}
                      </Text>
                      {!isLastStep && <MaterialCommunityIcons name="arrow-right" size={24} color="white" />}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'white',
    marginTop: 20,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingVertical: 40,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9CE9',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  stepContainer: {
    marginBottom: 40,
  },
  stepTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 28,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  stepDescription: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#AD56C4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarLabel: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  helperTextNeutral: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  datePickerText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  consentContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  consentTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  consentText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  consentButton: {
    backgroundColor: '#FF9CE9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentButtonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#0F766E',
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
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  illustrationText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_600SemiBold' : 'Nunito-SemiBold',
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 250,
  },
  connectionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  connectionOption: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  connectionOptionSelected: {
    borderColor: '#FF9CE9',
    backgroundColor: 'rgba(255, 156, 233, 0.1)',
  },
  connectionOptionTitle: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 16,
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectionOptionDescription: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  schoolLogo: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  schoolLogoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  schoolLogoPlaceholderText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_400Regular' : 'OpenSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#AD56C4',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
    } : {})
  },
  hoveredButton: {
    transform: [{scale: 1.03}],
    backgroundColor: '#9548A8',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    } : {})
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontFamily: Platform.OS === 'web' ? 'Nunito_700Bold' : 'Nunito-Bold',
    fontSize: 16,
    color: 'white',
    marginRight: 8,
    fontWeight: 'bold',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
    ...(Platform.OS === 'web' ? {
      transition: 'opacity 0.2s ease',
    } : {})
  },
  skipButtonHovered: {
    opacity: 0.8,
  },
  skipButtonText: {
    fontFamily: Platform.OS === 'web' ? 'OpenSans_600SemiBold' : 'OpenSans-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});

export default ProfileCreationScreen;