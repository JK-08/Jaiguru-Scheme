import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useAuth from '../../../Hooks/useRegister';
import theme from '../../../Utills/AppTheme';

GoogleSignin.configure({
  webClientId: '792128292012-161kjb3ap6f2msun0h56d4k8m0kfqs5l.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    contactOrEmailOrUsername: '',
    password: '',
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.contactOrEmailOrUsername || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check if input is a contact number (10 digits)
    if (/^\d{10}$/.test(formData.contactOrEmailOrUsername)) {
      // Validate contact number format
      if (!/^\d{10}$/.test(formData.contactOrEmailOrUsername)) {
        Alert.alert('Error', 'Please enter a valid 10-digit contact number');
        return;
      }
    } else if (formData.contactOrEmailOrUsername.includes('@')) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactOrEmailOrUsername)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }
    }
    // If it's username, no specific format validation needed

    try {
      clearError();
      const result = await login(formData);
      
      console.log('Login result:', result);
      
      if (result.success || result.token) {
        // Store authentication data
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user || result));
        
        // Navigate to home
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', result.errorMessage || 'Invalid credentials');
      }
    } catch (err) {
      console.log('Login error:', err);
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      console.log('Google User Info:', userInfo);

      const idToken = userInfo.data?.idToken || userInfo.idToken;
      console.log('Google ID Token:', idToken ? 'Token received' : 'No token');

      if (!idToken) {
        Alert.alert('Error', 'Failed to get authentication token. Please try again.');
        return;
      }

      // Call your API with the token
      console.log('Calling loginWithGoogle API...');
      const result = await loginWithGoogle({ idToken });
      console.log('Google Login Response:', result);

      // IMPORTANT: Handle contact verification similar to Register screen
      // Check if contactNumber is null, empty, or requires verification
      if (!result.contactNumber || 
          result.contactNumber === null || 
          result.contactNumber === "" ||
          result.requiresContactVerification) {
        
        // User doesn't have contact number or needs verification
        console.log('Navigating to GoogleContactVerification');
        navigation.navigate('GoogleContactVerification', {
          googleData: {
            userId: result.id,
            email: result.email,
            name: result.username,
            picture: result.picture,
            referralCode: result.referralCode,
            token: result.token,
            socialMedia: result.socialMedia,
            // Add any additional data needed for verification
            isLogin: true, // Flag to indicate this is login flow
            existingUser: result.existingUser || false // Indicate if user exists
          }
        });
      } else {
        // User already has verified contact number, login successful
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userData', JSON.stringify({
          id: result.id,
          username: result.username,
          email: result.email,
          contactNumber: result.contactNumber,
          picture: result.picture,
          referralCode: result.referralCode,
          socialMedia: result.socialMedia,
          // Add any additional user data
          ...(result.userData || {})
        }));

        console.log('Google login successful, navigating to Home');
        // Navigate to home
        navigation.replace('Home');
      }
    } catch (error) {
      console.log('Full Google Sign-In Error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);

      let errorMessage = 'Google Sign-In failed. Please try again.';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled by user';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available or outdated';
      } else if (error.message?.includes('JSON Parse error')) {
        errorMessage = 'Server error. Please check your internet connection or try again later.';
      } else if (error.message?.includes('Unexpected character')) {
        errorMessage = 'Server returned an unexpected response. Please contact support.';
      } else if (error.message?.includes('User not found') || 
                 error.message?.includes('User does not exist')) {
        // Handle case where user tries to login but hasn't registered
        errorMessage = 'No account found with this Google account. Please register first.';
        // Optionally navigate to register
        // navigation.navigate('Register', { 
        //   googleEmail: error.email // If available
        // });
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Icon name="close" size={20} color={theme.COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contact, Email or Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.contactOrEmailOrUsername}
              onChangeText={(value) => handleInputChange('contactOrEmailOrUsername', value)}
              placeholder="Enter contact number, email or username"
              placeholderTextColor={theme.COLORS.textTertiary}
              keyboardType="default"
              autoCapitalize="none"
              editable={!loading && !googleLoading}
            />
            <Text style={styles.hintText}>
              Enter your 10-digit contact number, email address, or username
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              placeholderTextColor={theme.COLORS.textTertiary}
              secureTextEntry
              editable={!loading && !googleLoading}
            />
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading || googleLoading}
            >
              <Text style={[
                styles.forgotPasswordText,
                (loading || googleLoading) && { opacity: 0.5 }
              ]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || googleLoading}
            style={[
              styles.loginButton,
              (loading || googleLoading) && styles.buttonDisabled
            ]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={googleLoading || loading}
            style={[
              styles.googleButton,
              (googleLoading || loading) && styles.buttonDisabled
            ]}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color={theme.COLORS.textPrimary} size="small" />
            ) : (
              <>
                <Icon name="google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            disabled={loading || googleLoading}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.registerLink,
              (loading || googleLoading) && { opacity: 0.5 }
            ]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.xl,
    paddingBottom: theme.SIZES.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.SIZES.xl,
  },
  title: {
    ...theme.FONTS.h1,
    color: theme.COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginTop: theme.SIZES.sm,
  },
  errorContainer: {
    ...theme.COMMON_STYLES.row,
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.lg,
    borderWidth: 1,
    borderColor: `${theme.COLORS.error}30`,
  },
  errorText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.error,
    flex: 1,
    marginLeft: theme.SIZES.sm,
    marginRight: theme.SIZES.sm,
  },
  formContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.lg,
    padding: theme.SIZES.padding.md,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
  },
  fieldContainer: {
    marginBottom: theme.SIZES.md,
  },
  label: {
    ...theme.FONTS.label,
    color: theme.COLORS.textPrimary,
    marginBottom: theme.SIZES.xs,
  },
  input: {
    ...theme.COMMON_STYLES.input.default,
    borderColor: theme.COLORS.gray300,
    fontSize: theme.SIZES.font.md,
    fontFamily: theme.FONTS.family.regular,
    color: theme.COLORS.textPrimary,
    height: theme.SIZES.input.height,
  },
  hintText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textTertiary,
    marginTop: theme.SIZES.xs,
    fontStyle: 'italic',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: theme.SIZES.xs,
  },
  forgotPasswordText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.goldPrimary,
  },
  loginButton: {
    backgroundColor: theme.COLORS.goldPrimary,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.SIZES.md,
    ...theme.SHADOWS.gold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...theme.FONTS.buttonLarge,
    color: theme.COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.SIZES.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.COLORS.gray300,
  },
  dividerText: {
    ...theme.FONTS.bodySmall,
    color: theme.COLORS.textSecondary,
    marginHorizontal: theme.SIZES.md,
  },
  googleButton: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    ...theme.SHADOWS.sm,
  },
  googleButtonText: {
    ...theme.FONTS.bodyMedium,
    color: theme.COLORS.textPrimary,
    marginLeft: theme.SIZES.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.SIZES.sm,
  },
  registerText: {
    ...theme.FONTS.body,
    color: theme.COLORS.textSecondary,
  },
  registerLink: {
    ...theme.FONTS.bodyBold,
    color: theme.COLORS.goldPrimary,
  },
});

export default LoginScreen;