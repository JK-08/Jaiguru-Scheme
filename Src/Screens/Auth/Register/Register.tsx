import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  StyleSheet,
  Image,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getHash } from 'react-native-otp-verify';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useToast } from '../../../Components/Toast/Toast';
import useAuth from '../../../api/hooks/Auth/useAuth';
import { useCompany } from '../../../api/hooks/Company/useCompany';
import theme from '../../../Utills/AppTheme';
import defaultLogo from '../../../Assets/Company/logo.png';
import { AppInput, AppText, AppButton } from '../../../Components/ui/appcomponents';

GoogleSignin.configure({
  webClientId: '985006297869-9mpqikboqvnesffmb9okfbuope80pg16.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

interface FormData {
  username: string;
  password: string;
  contactNumber: string;
  email: string;
  referralCode: string;
  hashKey: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { company, loading: companyLoading } = useCompany();
  const { showToast, hideToast, Toast } = useToast();

  useEffect(() => {
    if (company) {
      console.log('Company details in RegisterScreen:', {
        companyName: (company as any).COMPANYNAME,
        logoUrl: company.CompanyLogoUrl,
        baseUrl: (company as any).BASEURL,
        logoField: (company as any).LOGO,
      });
    }
  }, [company]);

  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const companyLogoUrl = company?.CompanyLogoUrl ?? null;

  const { signUp, loginWithGoogle, loading, error, clearError } = useAuth();

  const [showReferral, setShowReferral] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appSignature, setAppSignature] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    contactNumber: '',
    email: '',
    referralCode: '',
    hashKey: 'd4riq2SwBaq',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getAppHash();
  }, []);

  const getAppHash = async () => {
    try {
      const hash = await getHash();
      if (hash && hash.length > 0) {
        setAppSignature(hash[0]);
        setFormData((prev) => ({ ...prev, hashKey: hash[0] || 'd4riq2SwBaq' }));
      }
    } catch (err) {
      console.log('Error getting app hash:', err);
    }
  };

  useEffect(() => {
    if (company) {
      console.log('Company changed, resetting logo state. Logo URL:', company.CompanyLogoUrl);
      setLogoError(false);
      setLogoLoading(true);
    }
  }, [company]);

  const handleImageError = () => {
    console.log('Failed to load company logo from URL:', companyLogoUrl);
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleImageLoad = () => {
    setLogoLoading(false);
    setLogoError(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      errors.contactNumber = 'Please enter a valid 10-digit contact number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNormalRegister = async () => {
    if (!validateForm()) {
      showToast({
        message: 'Please fix the highlighted errors before continuing',
        title: 'Invalid Form',
        type: 'error',
        duration: 4000,
        position: 'top',
        animationType: 'slide',
      });
      return;
    }

    try {
      clearError();

      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        mobileNumber: formData.contactNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        hashKey: formData.hashKey || appSignature || 'd4riq2SwBaq',
        ...(showReferral && formData.referralCode.trim() && { referralCode: formData.referralCode.trim() }),
      };

      console.log('Registration payload:', payload);

      const result: any = await signUp(payload);

      console.log('Registration response:', result);

      if (
        result?.message?.includes('OTP sent') ||
        result?.errorMessage?.includes('OTP sent') ||
        result?.otp ||
        result?.whatsappLink
      ) {
        showToast({
          message: 'OTP sent successfully to your mobile number',
          title: 'Registration Successful',
          type: 'success',
          duration: 3000,
          position: 'top',
          animationType: 'slide',
        });

        setTimeout(() => {
          navigation.navigate('VerifyOTP', {
            mobileNumber: formData.contactNumber.trim(),
            email: formData.email.trim().toLowerCase(),
            username: formData.username.trim(),
            registrationData: payload,
            otpType: 'normal',
          });

          resetForm();
        }, 1500);
      } else {
        let errorTitle = 'Registration Failed';
        let errorMessage = 'Something went wrong. Please try again.';

        const serverMessage = result?.message || result?.errorMessage || '';

        if (
          serverMessage.toLowerCase().includes('email already exists') ||
          serverMessage.toLowerCase().includes('email exists')
        ) {
          errorTitle = 'Email Already Registered';
          errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
        } else if (
          serverMessage.toLowerCase().includes('username exists') ||
          serverMessage.toLowerCase().includes('username already')
        ) {
          errorTitle = 'Username Taken';
          errorMessage = 'This username is already taken. Please choose a different username.';
        } else if (
          serverMessage.toLowerCase().includes('mobile number') ||
          serverMessage.toLowerCase().includes('contact') ||
          serverMessage.toLowerCase().includes('phone')
        ) {
          errorTitle = 'Mobile Number Exists';
          errorMessage = 'This mobile number is already registered. Please use a different number or try logging in.';
        } else if (
          serverMessage.toLowerCase().includes('invalid') ||
          serverMessage.toLowerCase().includes('invalid data')
        ) {
          errorTitle = 'Invalid Data';
          errorMessage = 'Please check your information and try again.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }

        showToast({
          message: errorMessage,
          title: errorTitle,
          type: 'error',
          duration: 4000,
          position: 'top',
          animationType: 'slide',
        });
      }
    } catch (err: any) {
      console.log('Registration error:', err.message);

      let errorTitle = 'Registration Failed';
      let errorMessage = err.message || 'Something went wrong. Please try again.';

      if (
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('email exists')
      ) {
        errorTitle = 'Email Already Registered';
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      } else if (
        errorMessage.toLowerCase().includes('username exists') ||
        errorMessage.toLowerCase().includes('username already')
      ) {
        errorTitle = 'Username Taken';
        errorMessage = 'This username is already taken. Please choose a different username.';
      } else if (
        errorMessage.toLowerCase().includes('mobile number') ||
        errorMessage.toLowerCase().includes('contact') ||
        errorMessage.toLowerCase().includes('phone')
      ) {
        errorTitle = 'Mobile Number Exists';
        errorMessage = 'This mobile number is already registered. Please use a different number or try logging in.';
      }

      showToast({
        message: errorMessage,
        title: errorTitle,
        type: 'error',
        duration: 4000,
        position: 'top',
        animationType: 'slide',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo: any = await GoogleSignin.signIn();
      console.log('Google User Info:', userInfo);

      const idToken = userInfo.data?.idToken || userInfo.idToken;
      console.log('Google ID Token:', idToken ? 'Token received' : 'No token');

      if (!idToken) {
        showToast({
          message: 'Failed to get authentication token. Please try again.',
          title: 'Error',
          type: 'error',
          duration: 4000,
          position: 'top',
          animationType: 'slide',
        });
        return;
      }

      showToast({
        message: 'Signing in with Google...',
        title: 'Please wait',
        type: 'info',
        duration: 0,
        position: 'top',
        animationType: 'slide',
        showProgress: true,
        progress: 0,
      });

      console.log('Calling loginWithGoogle API...');
      const result: any = await loginWithGoogle({ idToken });
      console.log('Google Login Response:', result);

      hideToast();

      if (!result.contactNumber || result.contactNumber === null) {
        showToast({
          message: 'Please verify your contact number to continue',
          title: 'Contact Verification Required',
          type: 'info',
          duration: 3000,
          position: 'top',
          animationType: 'slide',
        });

        console.log('Navigating to GoogleContactVerification');
        setTimeout(() => {
          navigation.navigate('GoogleContactVerification', {
            googleData: {
              userId: result.id,
              email: result.email,
              name: result.username,
              picture: result.picture,
              referralCode: result.referralCode,
              token: result.token,
              socialMedia: result.socialMedia,
            },
          });
        }, 1000);
      } else {
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            id: result.id,
            username: result.username,
            email: result.email,
            contactNumber: result.contactNumber,
            picture: result.picture,
            referralCode: result.referralCode,
            socialMedia: result.socialMedia,
          })
        );

        showToast({
          message: 'Welcome back! Redirecting to MPIN verification...',
          title: 'Login Successful',
          type: 'success',
          duration: 2000,
          position: 'top',
          animationType: 'bounce',
        });

        console.log('Google login successful, navigating to Mpin verification');
        setTimeout(() => {
          navigation.replace('MpinVerify');
        }, 1500);
      }
    } catch (err: any) {
      console.log('Full Google Sign-In Error:', err);
      console.log('Error code:', err.code);
      console.log('Error message:', err.message);

      let errorMessage = 'Google Sign-In failed. Please try again.';

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled by user';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available or outdated';
      } else if (err.message?.includes('JSON Parse error')) {
        errorMessage = 'Server error. Please check your internet connection or try again later.';
      } else if (err.message?.includes('Unexpected character')) {
        errorMessage = 'Server returned an unexpected response. Please contact support.';
      }

      hideToast();

      showToast({
        message: errorMessage,
        title: 'Error',
        type: 'error',
        duration: 4000,
        position: 'top',
        animationType: 'slide',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      contactNumber: '',
      email: '',
      referralCode: '',
      hashKey: appSignature || 'd4riq2SwBaq',
    });
    setValidationErrors({});
    setShowReferral(false);
    setShowPassword(false);
    clearError();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
        <View style={styles.logoContainer}>
          {companyLoading ? (
            <ActivityIndicator size="small" color={theme.COLORS.primary} />
          ) : (
            <View style={styles.imageContainer}>
              {logoLoading && !logoError && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.COLORS.primary} />
                </View>
              )}

              {!logoError && companyLogoUrl ? (
                <Image
                  source={{ uri: companyLogoUrl }}
                  style={styles.logo as ImageStyle}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  defaultSource={defaultLogo}
                />
              ) : (
                <Image
                  source={defaultLogo}
                  style={styles.logo as ImageStyle}
                  resizeMode="contain"
                  onLoad={() => {
                    setLogoLoading(false);
                    setLogoError(false);
                  }}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.headerContainer}>
          <AppText variant="bodySmall" align="center" style={styles.subtitle}>
            Join our premium community and get exclusive benefits
          </AppText>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color={theme.COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Icon name="close" size={20} color={theme.COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formContainer}>
          <AppInput
            label="Username"
            required
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Enter your username"
            autoCapitalize="words"
            editable={!loading && !googleLoading}
            error={validationErrors.username}
            leftIcon="person-outline"
            containerStyle={styles.fieldContainer}
          />

          <AppInput
            label="Email Address"
            required
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !googleLoading}
            error={validationErrors.email}
            leftIcon="mail-outline"
            containerStyle={styles.fieldContainer}
          />

          <AppInput
            label="Contact Number"
            required
            value={formData.contactNumber}
            onChangeText={(value) => handleInputChange('contactNumber', value)}
            placeholder="Enter 10-digit contact number"
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading && !googleLoading}
            error={validationErrors.contactNumber}
            leftIcon="call-outline"
            containerStyle={styles.fieldContainer}
          />

          <AppInput
            label="Password"
            required
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Create a strong password"
            isPassword
            editable={!loading && !googleLoading}
            error={validationErrors.password}
            hint={!validationErrors.password ? 'Must be at least 6 characters' : undefined}
            leftIcon="lock-closed-outline"
            containerStyle={styles.fieldContainer}
          />

          <View style={styles.referralSection}>
            <TouchableOpacity
              style={styles.referralToggle}
              onPress={() => setShowReferral(!showReferral)}
              disabled={loading || googleLoading}
            >
              <Text style={[styles.referralToggleText, (loading || googleLoading) && { opacity: 0.5 }]}>
                Have a referral code?
              </Text>
              <Switch
                value={showReferral}
                onValueChange={setShowReferral}
                trackColor={{ false: theme.COLORS.gray300, true: theme.COLORS.warning }}
                thumbColor={theme.COLORS.white}
                disabled={loading || googleLoading}
              />
            </TouchableOpacity>

            {showReferral && (
              <AppInput
                label="Referral Code"
                value={formData.referralCode}
                onChangeText={(value) => handleInputChange('referralCode', value)}
                placeholder="Enter referral code (optional)"
                editable={!loading && !googleLoading}
                containerStyle={styles.referralInputContainer}
              />
            )}
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By registering, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        <AppButton
          label="Create Account"
          onPress={handleNormalRegister}
          disabled={loading || googleLoading}
          loading={loading}
          variant="gold"
          size="lg"
          style={styles.submitButton}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={googleLoading || loading}
          style={[styles.googleButton, (googleLoading || loading) && styles.submitButtonDisabled]}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={theme.COLORS.textPrimary} size="small" />
          ) : (
            <>
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading || googleLoading} activeOpacity={0.7}>
            <Text style={[styles.loginLink, (loading || googleLoading) && { opacity: 0.5 }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.white },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.padding.container,
    paddingTop: theme.SIZES.sm,
    paddingBottom: theme.SIZES.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.SIZES.md,
    marginTop: theme.SIZES.xs,
  },
  imageContainer: { position: 'relative', width: 100, height: 100 },
  logo: { width: 100, height: 100, borderRadius: 20 },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.backgroundTertiary,
    borderRadius: 10,
    zIndex: 1,
  },
  headerContainer: { alignItems: 'center', marginBottom: theme.SIZES.lg },
  subtitle: { paddingHorizontal: theme.SIZES.lg },
  errorContainer: {
    ...theme.COMMON_STYLES.row,
    backgroundColor: `${theme.COLORS.error}15`,
    padding: theme.SIZES.padding.md,
    borderRadius: theme.SIZES.radius.sm,
    marginBottom: theme.SIZES.lg,
    borderWidth: 1,
    borderColor: `${theme.COLORS.error}30`,
  } as ViewStyle,
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
    padding: theme.SIZES.padding.xs,
    marginBottom: theme.SIZES.xl,
    ...theme.SHADOWS.md,
  },
  fieldContainer: { marginBottom: theme.SIZES.xs, width: '90%', alignContent: 'center', alignSelf: 'center' } as ViewStyle,
  referralSection: { marginTop: theme.SIZES.xs, marginBottom: theme.SIZES.xs },
  referralToggle: {
    ...theme.COMMON_STYLES.rowBetween,
    paddingVertical: theme.SIZES.xs,
    width: '90%',
    alignContent: 'center',
    alignSelf: 'center',
  } as ViewStyle,
  referralToggleText: { ...theme.FONTS.body, color: theme.COLORS.textSecondary },
  referralInputContainer: { marginTop: theme.SIZES.xs, width: '90%', alignContent: 'center', alignSelf: 'center' },
  termsContainer: { marginTop: theme.SIZES.sm, width: '90%', alignContent: 'center', alignSelf: 'center' },
  termsText: {
    ...theme.FONTS.caption,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: theme.SIZES.font.sm * 1.6,
  },
  termsLink: { ...theme.FONTS.captionBold, color: theme.COLORS.goldPrimary },
  submitButton: { width: '90%', alignSelf: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  googleButton: {
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
    marginBottom: theme.SIZES.xs,
    marginHorizontal: theme.SIZES.padding.container,
    ...theme.SHADOWS.sm,
  },
  googleButtonText: { ...theme.FONTS.bodyMedium, color: theme.COLORS.textPrimary, marginLeft: theme.SIZES.sm },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.SIZES.md, marginHorizontal: theme.SIZES.padding.container },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.COLORS.gray300 },
  dividerText: { ...theme.FONTS.bodySmall, color: theme.COLORS.textSecondary, marginHorizontal: theme.SIZES.md },
  loginContainer: { ...theme.COMMON_STYLES.rowCenter, marginTop: theme.SIZES.sm, marginBottom: theme.SIZES.lg } as ViewStyle,
  loginText: { ...theme.FONTS.body, color: theme.COLORS.textSecondary },
  loginLink: { ...theme.FONTS.bodyBold, color: theme.COLORS.goldPrimary },
});

export default RegisterScreen;
