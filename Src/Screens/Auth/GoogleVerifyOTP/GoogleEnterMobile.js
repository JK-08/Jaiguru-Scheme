import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHash } from 'react-native-otp-verify'; // Import getHash for hashkey

import useAuth from '../../../Hooks/useRegister';
import Header from '../../../Components/CommonHeader/CommonHeader'; // Import Header component
import { saveAuthData } from '../../../Utills/AsynchStorageHelper'; // For skip functionality
import theme from '../../../Utills/AppTheme'; // Import theme for consistency
import styles from './GoogleStyles'; // Your styles file

const GoogleContactVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { googleData } = route.params || {};
  
  const { requestGoogleOtp, loading, error, clearError } = useAuth();
  
  const [contactNumber, setContactNumber] = useState('');
  const [contactError, setContactError] = useState('');
  const [appHash, setAppHash] = useState(''); // State for hashkey

  // Get app hash on component mount
  useEffect(() => {
    const fetchAppHash = async () => {
      try {
        if (Platform.OS === 'android') {
          const hash = await getHash();
          console.log('📱 App Hash:', hash);
          setAppHash(hash?.[0] || ''); // Take first hash if array
        }
      } catch (error) {
        console.log('❌ Error fetching app hash:', error);
      }
    };

    fetchAppHash();
  }, []);

  const validateContactNumber = () => {
    const trimmedContact = contactNumber.trim();
    
    if (!trimmedContact) {
      setContactError('Contact number is required');
      return false;
    }
    
    if (!/^\d{10}$/.test(trimmedContact)) {
      setContactError('Please enter a valid 10-digit contact number');
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
      
      // Prepare payload with hashkey
      const payload = {
        userId: googleData.userId || googleData.id,
        newContactNumber: contactNumber.trim(),
        hashKey: appHash, // Send hashkey for SMS auto-read
       
      };

      console.log('📤 Requesting Google OTP with payload:', payload);
      
      const result = await requestGoogleOtp(payload);
      
      console.log('✅ Google OTP request result:', result);
      
      // Check if OTP was successfully sent
      if (result.success || result.message || result.otp || result.otpSent) {
        // Navigate to OTP verification screen
        navigation.navigate('VerifyOTP', {
          newContactNumber: contactNumber.trim(),
          email: googleData?.email || '',
          username: googleData?.name || '',
          otpType: 'google',
          googleData: {
            ...googleData,
            contactNumber: contactNumber.trim(),
          },
          appHash: appHash, // Pass hashkey to OTP screen if needed
        });
      } else {
        const errorMsg = result.errorMessage || result.error || 'Failed to send OTP. Please try again.';
        Alert.alert(
          'Error',
          errorMsg,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.log('❌ Google OTP request error:', err);
      Alert.alert(
        'Error',
        err.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSkip = async () => {
    Alert.alert(
      'Skip Contact Number',
      'Are you sure? You can add contact number later from profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip for Now',
          onPress: async () => {
            try {
              // Prepare user data without contact number
              const userData = {
                ...googleData,
                contactNumber: null,
                isGoogleSignIn: true,
                registrationCompleted: false, // Mark as incomplete registration
              };

              // Save auth data using your StorageHelper
              const saveResult = await saveAuthData(userData);
              
              if (saveResult.success) {
                // Navigate to Home or Profile setup screen
                navigation.replace('Home');
              } else {
                Alert.alert('Error', 'Failed to save user data');
              }
            } catch (error) {
              console.log('❌ Error skipping contact:', error);
              Alert.alert('Error', 'Failed to skip. Please try again.');
            }
          }
        }
      ]
    );
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
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.closeButton}>
                <Icon name="close" size={20} color={theme.COLORS.gray500} />
              </TouchableOpacity>
            </View>
          )}

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
              <View style={styles.inputWrapper}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    contactError && styles.inputError
                  ]}
                  value={contactNumber}
                  onChangeText={(value) => {
                    // Allow only numbers
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setContactNumber(numericValue);
                    if (contactError) setContactError('');
                  }}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={theme.COLORS.textTertiary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus={true}
                />
              </View>
              
              {contactError && (
                <View style={styles.errorMessageContainer}>
                  <Icon name="alert-circle" size={16} color={theme.COLORS.error} />
                  <Text style={styles.errorTextSmall}>{contactError}</Text>
                </View>
              )}
              
              <Text style={styles.hintText}>
                An OTP will be sent to this number for verification
              </Text>
              
              {appHash && Platform.OS === 'android' && (
                <Text style={styles.hashInfoText}>
                  SMS auto-read enabled ✓
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={handleSubmitContactNumber}
                disabled={loading || !contactNumber.trim()}
                style={[
                  styles.submitButton,
                  (loading || !contactNumber.trim()) && styles.submitButtonDisabled
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
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GoogleContactVerificationScreen;