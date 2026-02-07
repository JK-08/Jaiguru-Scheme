import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHash } from 'react-native-otp-verify';

import useAuth from '../../../Hooks/useRegister';
import Header from '../../../Components/CommonHeader/CommonHeader';
import { saveAuthData } from '../../../Utills/AsynchStorageHelper';
import theme from '../../../Utills/AppTheme';
import styles from './GoogleStyles';
import { useToast } from '../../../Components/Toast/Toast';

const GoogleContactVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { googleData } = route.params || {};
  
  const { requestGoogleOtp, loading, error, clearError } = useAuth();
  
  // Initialize toast
  const { showToast, hideToast, Toast } = useToast();
  
  const [contactNumber, setContactNumber] = useState('');
  const [contactError, setContactError] = useState('');
  const [appHash, setAppHash] = useState('');
  const [isRetryingHash, setIsRetryingHash] = useState(false);
  const inputRef = useRef(null);

  // Show toast when error changes
  useEffect(() => {
    if (error) {
      showToast({
        message: error,
        type: 'error',
        title: 'Verification Error',
        duration: 4000,
        position: 'top',
        animationType: 'slide'
      });
    }
  }, [error]);

  // Get app hash on component mount with retry logic
  useEffect(() => {
    const fetchAppHash = async (retryCount = 0) => {
      try {
        setIsRetryingHash(true);
        
        if (Platform.OS === 'android') {
          const hash = await getHash();
          console.log('📱 App Hash fetched:', hash);
          
          if (hash && hash.length > 0) {
            // Clean and format the hash key
            const cleanHash = hash[0].trim();
            console.log('✅ Cleaned Hash Key:', cleanHash);
            setAppHash(cleanHash);
            
            // Show toast for hash success
            showToast({
              message: `SMS auto-read enabled (Hash: ${cleanHash.substring(0, 8)}...)`,
              type: 'success',
              title: 'Device Ready',
              duration: 3000,
              position: 'bottom'
            });
          } else {
            throw new Error('Empty hash received');
          }
        } else {
          // For iOS, set a placeholder or generate a hash
          const iosHash = 'iOS-' + Date.now().toString(36);
          setAppHash(iosHash);
          console.log('📱 iOS Hash:', iosHash);
          
          showToast({
            message: 'Manual OTP entry required on iOS',
            type: 'info',
            title: 'iOS Device',
            duration: 3000
          });
        }
      } catch (error) {
        console.log('❌ Error fetching app hash:', error);
        
        // Retry logic (max 2 retries)
        if (retryCount < 2) {
          console.log(`🔄 Retrying hash fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => fetchAppHash(retryCount + 1), 1000);
          return;
        }
        
        // Fallback hash for Android if getHash fails
        if (Platform.OS === 'android') {
          const fallbackHash = 'android-fallback-' + Date.now().toString(36);
          setAppHash(fallbackHash);
          console.log('🔄 Using fallback hash:', fallbackHash);
          
          showToast({
            message: 'SMS auto-read may not work. Manual entry required.',
            type: 'warning',
            title: 'Hash Generation Failed',
            duration: 4000,
            showCloseButton: true
          });
        }
      } finally {
        setIsRetryingHash(false);
      }
    };

    fetchAppHash();
  }, []);

  const validateContactNumber = () => {
    const trimmedContact = contactNumber.trim();
    
    if (!trimmedContact) {
      setContactError('Contact number is required');
      showToast({
        message: 'Contact number is required',
        type: 'warning',
        title: 'Missing Information',
        duration: 3000
      });
      return false;
    }
    
    if (!/^\d{10}$/.test(trimmedContact)) {
      setContactError('Please enter a valid 10-digit contact number');
      showToast({
        message: 'Please enter a valid 10-digit contact number',
        type: 'warning',
        title: 'Invalid Format',
        duration: 3000
      });
      return false;
    }
    
    setContactError('');
    return true;
  };

  const handleSubmitContactNumber = async () => {
    if (!validateContactNumber()) {
      return;
    }

    try {
      clearError();
      
      // Check if we have a valid hash key
      if (!appHash || appHash.includes('fallback')) {
        showToast({
          message: 'SMS auto-read not available. You may need to enter OTP manually.',
          type: 'warning',
          title: 'Hash Key Issue',
          duration: 4000,
          onActionPress: () => {
            // Continue anyway
            proceedWithOTPRequest();
          },
          actionText: 'Continue Anyway'
        });
      } else {
        proceedWithOTPRequest();
      }
    } catch (err) {
      console.log('❌ Submit error:', err);
      hideToast();
      showToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
        title: 'Error',
        duration: 3000
      });
    }
  };

  const proceedWithOTPRequest = async () => {
    // Show loading toast
    const progressToastId = showToast({
      message: 'Sending OTP...',
      type: 'progress',
      title: 'Please wait',
      showProgress: true,
      progress: 30,
      duration: 0
    });

    try {
      const trimmedContact = contactNumber.trim();
      console.log('📤 Preparing OTP request...');
      console.log('📱 Hash Key to send:', appHash);
      console.log('📱 Contact Number:', trimmedContact);
      console.log('👤 User ID:', googleData?.userId || googleData?.id);

      const payload = {
        userId: googleData?.userId || googleData?.id || googleData?.userId,
        newContactNumber: trimmedContact,
        hashKey: appHash,
      };

      console.log('📤 Final Payload:', payload);
      
      const result = await requestGoogleOtp(payload);
      
      console.log('✅ Backend Response:', result);
      
      hideToast(); // Hide progress toast
      
      // Handle backend response
      if (result) {
        // Check for specific error cases
        if (result.error) {
          handleBackendError(result.error);
          return;
        }
        
        // Check for success cases
        if (result.message && result.message.toLowerCase().includes('otp sent')) {
          handleSuccessResponse(result);
        } else if (result.otp) {
          handleSuccessResponse(result);
        } else if (result.success) {
          handleSuccessResponse(result);
        } else {
          // Generic error handling
          const errorMsg = result.message || 
                          result.errorMessage || 
                          'Failed to send OTP. Please try again.';
          handleBackendError(errorMsg);
        }
      } else {
        handleBackendError('No response from server');
      }
    } catch (err) {
      console.log('❌ OTP Request Error:', err);
      hideToast();
      
      // Extract error message from different possible formats
      let errorMessage = 'Failed to send OTP';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check for specific error messages
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      handleBackendError(errorMessage);
    }
  };

  const handleBackendError = (error) => {
    console.log('⚠️ Handling backend error:', error);
    
    // Set the error in the contact error field
    setContactError(error);
    
    // Show appropriate toast
    if (error.toLowerCase().includes('already exists') || 
        error.toLowerCase().includes('already registered')) {
      showToast({
        message: error,
        type: 'error',
        title: 'Contact Number Exists',
        duration: 5000,
        position: 'top',
        showCloseButton: true,
        actionText: 'Try Different Number',
        onActionPress: () => {
          setContactNumber('');
          setContactError('');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      });
    } else if (error.includes('hash') || error.includes('Hash')) {
      showToast({
        message: 'Hash key issue. SMS auto-read may not work.',
        type: 'warning',
        title: 'Device Compatibility',
        duration: 4000,
        showCloseButton: true,
        actionText: 'Retry Hash',
        onActionPress: () => {
          // Retry hash generation
          const fetchHashAgain = async () => {
            try {
              if (Platform.OS === 'android') {
                const newHash = await getHash();
                if (newHash && newHash[0]) {
                  setAppHash(newHash[0].trim());
                  showToast({
                    message: 'Hash updated successfully',
                    type: 'success',
                    duration: 2000
                  });
                }
              }
            } catch (e) {
              console.log('Retry hash failed:', e);
            }
          };
          fetchHashAgain();
        }
      });
    } else {
      showToast({
        message: error,
        type: 'error',
        title: 'Request Failed',
        duration: 5000,
        showCloseButton: true,
        actionText: 'Retry',
        onActionPress: proceedWithOTPRequest
      });
    }
  };

  const handleSuccessResponse = (result) => {
    console.log('🎉 Success response received:', result);
    
    // Show success toast
    const successMessage = result.message || 'OTP sent successfully!';
    showToast({
      message: successMessage,
      type: 'success',
      title: 'Success',
      duration: 2000,
      animationType: 'bounce'
    });

    // Prepare navigation data
    const navigationData = {
      newContactNumber: contactNumber.trim(),
      email: result.email || googleData?.email || '',
      username: result.username || googleData?.name || '',
      otpType: 'google',
      googleData: {
        ...googleData,
        contactNumber: contactNumber.trim(),
      },
      appHash: appHash,
      serverOtp: result.otp,
      status: result.status || 'pending',
      responseData: result,
      timestamp: Date.now(),
    };

    console.log('📍 Navigation data:', navigationData);

    // Navigate after a short delay
    setTimeout(() => {
      navigation.navigate('VerifyOTP', navigationData);
    }, 1500);
  };

  const handleSkip = async () => {
    // Custom confirmation with premium toast style
    showToast({
      message: 'You can add contact number later from profile settings',
      type: 'warning',
      title: 'Skip Contact Number?',
      duration: 4000,
      actionText: 'Skip',
      onActionPress: async () => {
        try {
          // Show loading toast for skip process
          showToast({
            message: 'Setting up your account...',
            type: 'progress',
            title: 'Processing',
            showProgress: true,
            progress: 50,
            duration: 0
          });

          // Prepare user data without contact number
          const userData = {
            ...googleData,
            contactNumber: null,
            isGoogleSignIn: true,
            registrationCompleted: false,
          };

          // Save auth data
          const saveResult = await saveAuthData(userData);
          
          hideToast(); // Hide progress toast
          
          if (saveResult.success) {
            // Show success toast
            showToast({
              message: 'Account created successfully!',
              type: 'success',
              title: 'Welcome!',
              duration: 2000,
              animationType: 'scale'
            });

            // Navigate after a short delay
            setTimeout(() => {
              navigation.replace('Home');
            }, 1500);
          } else {
            showToast({
              message: 'Failed to save user data',
              type: 'error',
              title: 'Save Error',
              duration: 3000
            });
          }
        } catch (error) {
          console.log('❌ Error skipping contact:', error);
          hideToast(); // Hide progress toast
          showToast({
            message: 'Failed to skip. Please try again.',
            type: 'error',
            title: 'Error',
            duration: 3000
          });
        }
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Using Header Component */}
      <Header
        title="Google Contact Update"
        onBackPress={() => {
          showToast({
            message: 'Navigating back...',
            type: 'info',
            duration: 1500
          });
          setTimeout(() => navigation.goBack(), 500);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            {/* User Info Card */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userAvatar}>
                <Icon name="google" size={32} color={theme.COLORS.googleRed} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.userName}>{googleData?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{googleData?.email}</Text>
              </View>
            </View>

            {/* Contact Number Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Contact Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              
              {/* Hash Key Status */}
              {appHash && (
                <View style={styles.hashStatusContainer}>
                  <Icon 
                    name={appHash.includes('fallback') ? "alert" : "check-circle"} 
                    size={14} 
                    color={appHash.includes('fallback') ? theme.COLORS.warning : theme.COLORS.success} 
                  />
                  <Text style={styles.hashStatusText}>
                    {appHash.includes('fallback') 
                      ? 'Manual OTP entry required' 
                      : 'SMS auto-read ready'}
                  </Text>
                </View>
              )}
              
              <View style={styles.inputWrapper}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    contactError && styles.inputError
                  ]}
                  value={contactNumber}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setContactNumber(numericValue);
                    if (contactError) setContactError('');
                  }}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={theme.COLORS.textTertiary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus={true}
                  editable={!loading}
                />
              </View>
              
              {contactError && (
                <View style={styles.errorMessageContainer}>
                  <Icon 
                    name={contactError.includes('already') ? "account-alert" : "alert-circle"} 
                    size={16} 
                    color={theme.COLORS.error} 
                  />
                  <Text style={styles.errorTextSmall}>{contactError}</Text>
                </View>
              )}
              
              <Text style={styles.hintText}>
                An OTP will be sent to this number for verification
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={handleSubmitContactNumber}
                disabled={loading || !contactNumber.trim() || contactNumber.length !== 10}
                style={[
                  styles.submitButton,
                  (loading || !contactNumber.trim() || contactNumber.length !== 10) && styles.submitButtonDisabled
                ]}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.COLORS.white} size="small" />
                ) : (
                  <>
                    <Icon name="message-text-outline" size={20} color={theme.COLORS.white} />
                    <Text style={styles.submitButtonText}>Send OTP</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>

            {/* Additional Information */}
            <View style={styles.infoBox}>
              <Icon name="information" size={20} color={theme.COLORS.info} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoTitle}>Why verify contact number?</Text>
                <Text style={styles.infoText}>
                  • Secure account recovery{'\n'}
                  • Important notifications{'\n'}
                  • Better service experience
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Toast Component */}
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default GoogleContactVerificationScreen;