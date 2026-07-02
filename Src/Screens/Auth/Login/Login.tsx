import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';

import useAuth from '../../../api/hooks/Auth/useAuth';
import { useCompany } from '../../../api/hooks/Company/useCompany';
import theme from '../../../Utills/AppTheme';
import defaultLogo from '../../../Assets/Company/logo.png';
import { useToast } from '../../../Components/Toast/Toast';
import { saveAuthData, getMpinStatus, debugAsyncStorage } from '../../../Utills/AsynchStorageHelper';
import { AppInput, AppText, AppButton } from '../../../Components/ui/appcomponents';

interface FieldErrors {
  contactOrEmailOrUsername: string;
  password: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { company, loading: companyLoading } = useCompany();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  const { showToast, Toast } = useToast();

  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const companyLogoUrl = company?.CompanyLogoUrl ?? null;

  const [contactOrEmailOrUsername, setContactOrEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState({ contactOrEmailOrUsername: false, password: false });
  const [errors, setErrors] = useState<FieldErrors>({ contactOrEmailOrUsername: '', password: '' });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '985006297869-9mpqikboqvnesffmb9okfbuope80pg16.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (company) {
      setLogoError(false);
      setLogoLoading(true);
    }
  }, [company]);

  useEffect(() => {
    if (error) showToast({ message: error, type: 'error' });
  }, [error]);

  useEffect(() => {
    console.log('=== LOGIN SCREEN MOUNTED ===');
    debugAsyncStorage();
  }, []);

  const isValidEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    return emailRegex.test(value) || phoneRegex.test(value.replace(/\D/g, ''));
  };

  const validateField = (fieldName: keyof FieldErrors, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'contactOrEmailOrUsername':
        if (!value.trim()) {
          newErrors.contactOrEmailOrUsername = 'Please enter email or phone number';
        } else if (!isValidEmailOrPhone(value)) {
          newErrors.contactOrEmailOrUsername = 'Please enter a valid email or phone number';
        } else {
          newErrors.contactOrEmailOrUsername = '';
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Please enter password';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          newErrors.password = '';
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (fieldName: keyof FieldErrors, value: string) => {
    if (fieldName === 'contactOrEmailOrUsername') setContactOrEmailOrUsername(value);
    else setPassword(value);
    if (touched[fieldName]) validateField(fieldName, value);
  };

  const handleFieldBlur = (fieldName: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, fieldName === 'contactOrEmailOrUsername' ? contactOrEmailOrUsername : password);
  };

  const handleImageError = () => {
    console.log('Failed to load company logo from URL:', companyLogoUrl);
    setLogoError(true);
    setLogoLoading(false);
  };

  const handleImageLoad = () => {
    setLogoLoading(false);
    setLogoError(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      clearError();

      console.log('=== GOOGLE SIGN-IN STARTED ===');
      showToast({ message: 'Connecting to Google...', type: 'info' });

      const hasPlayServices = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      if (!hasPlayServices) throw new Error('Google Play Services unavailable');

      await GoogleSignin.signOut().catch(() => {});

      const userInfo: any = await GoogleSignin.signIn();
      console.log('✅ Google User Info:', userInfo);

      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens?.idToken || userInfo?.idToken;
      if (!idToken) throw new Error('No ID token from Google');

      console.log('✅ Google ID Token received');
      showToast({ message: 'Authenticating with server...', type: 'info' });

      const payload = { idToken, userInfo: userInfo.user };
      const result: any = await loginWithGoogle(payload);

      console.log('=== GOOGLE LOGIN API RESPONSE ===', result);

      if (result.success !== false) {
        const { id, email, username, contactNumber, token } = result;

        const normalizedData = {
          ...result,
          id: id || result.userId,
          userId: id || result.userId,
          email: email || result.email,
          username: username || result.username,
          contactNumber: contactNumber || result.contactNumber || result.contact || '',
          token: token || result.token,
          loginType: 'GOOGLE',
        };

        await saveAuthData(normalizedData);
        showToast({ message: 'Login successful with Google!', type: 'success' });

        if (!normalizedData.contactNumber || normalizedData.contactNumber.trim() === '') {
          navigation.navigate('GoogleContactVerification', {
            userId: id,
            email,
            username,
            token,
            picture: userInfo?.user?.photo,
            isLogin: true,
          });
        } else {
          const hasMpin = await getMpinStatus();
          if (hasMpin) navigation.replace('MpinVerify');
          else navigation.replace('MpinCreate');
        }
      } else {
        showToast({ message: result.error || 'Google authentication failed', type: 'error' });
      }
    } catch (err: any) {
      console.log('=== GOOGLE SIGN-IN ERROR ===');
      console.log('Error Code:', err.code);
      console.log('Error Message:', err.message);
      handleGoogleSignInError(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignInError = (err: any) => {
    let errorMessage = 'Google sign-in failed';

    switch (err.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        errorMessage = 'Google sign-in cancelled';
        break;
      case statusCodes.IN_PROGRESS:
        errorMessage = 'Google sign-in already in progress';
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        errorMessage = 'Google Play Services unavailable';
        break;
      case '12500':
      case statusCodes.SIGN_IN_REQUIRED:
        errorMessage = 'Google sign-in failed. Please check your configuration.';
        break;
      default:
        errorMessage = `Google sign-in failed: ${err.message || 'Try again'}`;
    }

    showToast({ message: errorMessage, type: 'error' });
  };

  const handleLogin = async () => {
    setTouched({ contactOrEmailOrUsername: true, password: true });

    validateField('contactOrEmailOrUsername', contactOrEmailOrUsername);
    validateField('password', password);

    const hasErrors =
      Object.values(errors).some((e) => e !== '') || !contactOrEmailOrUsername || !password;

    if (hasErrors) {
      showToast({ message: 'Please fix all errors before submitting', type: 'warning' });
      return;
    }

    try {
      clearError();
      showToast({ message: 'Logging in...', type: 'info' });

      const result: any = await login({ contactOrEmailOrUsername, password });

      if (result.success !== false && result.token) {
        const normalizedData = {
          ...result,
          contactNumber: result.contactNumber || result.contact || '',
          loginType: 'NORMAL',
        };

        await saveAuthData(normalizedData);
        showToast({ message: 'Login successful!', type: 'success' });

        const hasMpin = await getMpinStatus();
        setTimeout(() => {
          if (hasMpin) navigation.replace('MpinVerify');
          else navigation.replace('MpinCreate');
        }, 1500);
      } else {
        const serverMessage = result?.message || result?.error || 'Invalid credentials';
        showToast({ message: serverMessage, type: 'error' });
        setErrors((prev) => ({ ...prev, password: 'Invalid email/phone or password' }));
      }
    } catch (err: any) {
      console.log('Login error:', err);
      showToast({ message: err.message || 'Network error. Please try again.', type: 'error' });
      setErrors((prev) => ({ ...prev, password: 'Network error. Please try again.' }));
    }
  };

  const navigateToForgotPassword = () => navigation.navigate('ForgotPassword', { mode: 'forgot' });
  const navigateToRegister = () => navigation.navigate('Register');

  const isLoading = loading || googleLoading;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                    style={styles.logo}
                    resizeMode="contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    defaultSource={defaultLogo}
                  />
                ) : (
                  <Image
                    source={defaultLogo}
                    style={styles.logo}
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
            <AppText variant="h1" color={theme.COLORS.primary} align="center">
              Welcome Back
            </AppText>
            <AppText variant="bodySmall" align="center" style={{ marginTop: theme.SIZES.sm }}>
              Sign in to continue
            </AppText>
          </View>

          <View style={styles.formContainer}>
            <AppInput
              label="Email or Phone"
              required
              value={contactOrEmailOrUsername}
              onChangeText={(value) => handleFieldChange('contactOrEmailOrUsername', value)}
              onBlur={() => handleFieldBlur('contactOrEmailOrUsername')}
              placeholder="Enter email or phone"
              autoCapitalize="none"
              editable={!isLoading}
              error={errors.contactOrEmailOrUsername}
              leftIcon="mail-outline"
              containerStyle={styles.fieldContainer}
            />

            <AppInput
              label="Password"
              required
              value={password}
              onChangeText={(value) => handleFieldChange('password', value)}
              onBlur={() => handleFieldBlur('password')}
              placeholder="Enter password"
              isPassword
              editable={!isLoading}
              error={errors.password}
              leftIcon="lock-closed-outline"
              containerStyle={styles.fieldContainer}
            />

            <TouchableOpacity
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordContainer}
              disabled={isLoading}
            >
              <AppText variant="caption" color={theme.COLORS.goldPrimary}>
                Forgot Password?
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={styles.loginButton} activeOpacity={0.8}>
              <LinearGradient
                colors={(theme.COLORS.gradient as any).brand || ['#FFD700', '#FFC400']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={theme.COLORS.white} size="small" />
                ) : (
                  <AppText variant="buttonLarge" color={theme.COLORS.white}>
                    Login
                  </AppText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <AppText variant="bodySmall" style={{ marginHorizontal: theme.SIZES.md }}>
                or continue with
              </AppText>
              <View style={styles.divider} />
            </View>

            <AppButton
              label="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="secondary"
              size="lg"
              loading={googleLoading}
              disabled={isLoading}
              style={styles.googleButton}
              textStyle={{ color: theme.COLORS.textPrimary }}
            />

            <View style={styles.registerContainer}>
              <AppText variant="body" color={theme.COLORS.textSecondary}>
                Don't have an account?{' '}
              </AppText>
              <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
                <AppText variant="bodyBold" color={theme.COLORS.goldPrimary}>
                  Register
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {(loading || googleLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.COLORS.primary} />
            <AppText variant="body" color={theme.COLORS.white} style={{ marginTop: theme.SIZES.sm }}>
              {googleLoading ? 'Signing in with Google...' : 'Processing...'}
            </AppText>
          </View>
        )}

        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    paddingTop: theme.SIZES.sm,
    paddingBottom: theme.SIZES.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.SIZES.md,
    marginTop: theme.SIZES.xs,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.SIZES.lg,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -theme.SIZES.sm,
    marginBottom: theme.SIZES.xs,
  },
  loginButton: {
    borderRadius: theme.SIZES.radius.button,
    height: theme.SIZES.button.height.lg,
    marginTop: theme.SIZES.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.SIZES.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.COLORS.gray300,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: theme.COLORS.gray300,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.SIZES.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default LoginScreen;
