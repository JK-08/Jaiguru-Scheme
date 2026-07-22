// Src/Screens/Auth/Login/hooks/useLogin.ts
// -----------------------------------------------------------------------------
// Encapsulates ALL login behaviour so the screen/components stay presentational:
//   • form state + validation (loginSchema)
//   • Remember-me persistence (AsyncStorage)
//   • real credential login (useAuth) + MPIN routing
//   • Google Sign-In (unchanged from the original screen)
//   • Guest entry + navigation helpers + toasts
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import useAuth from '../../../../api/hooks/Auth/useAuth';
import { saveAuthData, getMpinStatus } from '../../../../Utills/AsynchStorageHelper';
import { useToast } from '../../../../Components/Toast/Toast';
import {
  validateField,
  validateLogin,
  type LoginErrors,
  type LoginValues,
} from '../validation/loginSchema';

const REMEMBER_KEY = 'rememberedMobile';
const GOOGLE_WEB_CLIENT_ID =
  '985006297869-9mpqikboqvnesffmb9okfbuope80pg16.apps.googleusercontent.com';

type TouchedMap = Record<keyof LoginValues, boolean>;

export interface UseLogin {
  // values
  mobile: string;
  password: string;
  showPassword: boolean;
  remember: boolean;
  errors: LoginErrors;
  // status
  loading: boolean;
  googleLoading: boolean;
  isBusy: boolean;
  // change handlers
  onChangeMobile: (v: string) => void;
  onChangePassword: (v: string) => void;
  onBlurField: (field: keyof LoginValues) => void;
  toggleShowPassword: () => void;
  toggleRemember: () => void;
  // actions
  submit: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  goToForgotPassword: () => void;
  goToRegister: () => void;
  // toast element to render once
  Toast: React.FC;
}

export function useLogin(): UseLogin {
  const navigation = useNavigation<any>();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  const { showToast, Toast } = useToast();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<TouchedMap>({ mobile: false, password: false });

  const isBusy = loading || googleLoading;

  // ---- One-time setup: Google + restore remembered mobile -------------------
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true,
    });

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(REMEMBER_KEY);
        if (saved) {
          setMobile(saved);
          setRemember(true);
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, []);

  // Surface auth errors as toasts.
  useEffect(() => {
    if (error) showToast({ message: error, type: 'error' });
  }, [error, showToast]);

  // ---- Field change / blur --------------------------------------------------
  const revalidate = useCallback(
    (field: keyof LoginValues, value: string) => {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    },
    [],
  );

  const onChangeMobile = useCallback(
    (v: string) => {
      const digits = v.replace(/\D/g, '').slice(0, 10);
      setMobile(digits);
      if (touched.mobile) revalidate('mobile', digits);
    },
    [touched.mobile, revalidate],
  );

  const onChangePassword = useCallback(
    (v: string) => {
      setPassword(v);
      if (touched.password) revalidate('password', v);
    },
    [touched.password, revalidate],
  );

  const onBlurField = useCallback(
    (field: keyof LoginValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      revalidate(field, field === 'mobile' ? mobile : password);
    },
    [mobile, password, revalidate],
  );

  const toggleShowPassword = useCallback(() => setShowPassword((s) => !s), []);
  const toggleRemember = useCallback(() => setRemember((r) => !r), []);

  // ---- Post-auth routing ----------------------------------------------------
  const routeAfterAuth = useCallback(async () => {
    const hasMpin = await getMpinStatus();
    if (hasMpin) navigation.replace('MpinVerify');
    else navigation.replace('MpinCreate');
  }, [navigation]);

  // ---- Credential login -----------------------------------------------------
  const submit = useCallback(async () => {
    setTouched({ mobile: true, password: true });
    const result = validateLogin({ mobile, password });
    setErrors(result.errors);
    if (!result.success) {
      showToast({ message: 'Please fix the highlighted fields', type: 'warning' });
      return;
    }

    try {
      clearError();
      showToast({ message: 'Logging in securely...', type: 'info' });

      if (remember) await AsyncStorage.setItem(REMEMBER_KEY, mobile);
      else await AsyncStorage.removeItem(REMEMBER_KEY);

      const res: any = await login({ contactOrEmailOrUsername: mobile, password });
      console.log('=== LOGIN RESPONSE ===', JSON.stringify(res, null, 2));

      if (res?.success !== false && res?.token) {
        await saveAuthData({ ...res, contactNumber: res.contactNumber || res.contact || mobile, loginType: 'NORMAL' });
        showToast({ message: 'Login successful!', type: 'success' });
        setTimeout(routeAfterAuth, 1200);
      } else {
        const msg = res?.message || res?.error || 'Invalid credentials';
        showToast({ message: msg, type: 'error' });
        setErrors((prev) => ({ ...prev, password: 'Invalid mobile number or password' }));
      }
    } catch (err: any) {
      showToast({ message: err?.message || 'Network error. Please try again.', type: 'error' });
      setErrors((prev) => ({ ...prev, password: 'Network error. Please try again.' }));
    }
  }, [mobile, password, remember, login, clearError, showToast, routeAfterAuth]);

  // ---- Google Sign-In (unchanged logic) -------------------------------------
  const signInWithGoogle = useCallback(async () => {
    try {
      setGoogleLoading(true);
      clearError();
      showToast({ message: 'Connecting to Google...', type: 'info' });

      const hasPlay = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      if (!hasPlay) throw new Error('Google Play Services unavailable');

      await GoogleSignin.signOut().catch(() => {});

      // google-signin v13+ (this project uses 16.x) returns a SignInResponse:
      //   { type: 'success', data: { idToken, user, ... } }  or  { type: 'cancelled' }
      // Older versions returned the User object directly. Support both shapes.
      const signInResponse: any = await GoogleSignin.signIn();
      console.log('=== GOOGLE signIn() RAW RESPONSE ===', JSON.stringify(signInResponse, null, 2));

      if (signInResponse?.type === 'cancelled') {
        showToast({ message: 'Google sign-in cancelled', type: 'info' });
        return;
      }

      // v16 → data lives under `.data`; older → the response itself is the User.
      const data: any = signInResponse?.data ?? signInResponse;
      const googleUser = data?.user;
      console.log('=== GOOGLE USER PROFILE ===', JSON.stringify(googleUser, null, 2));

      // Prefer the idToken returned by signIn(); fall back to getTokens().
      let idToken: string | null = data?.idToken ?? null;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        console.log('=== GOOGLE getTokens() ===', JSON.stringify(tokens, null, 2));
        idToken = tokens?.idToken ?? null;
      }

      if (!idToken) {
        console.log('❌ No ID token from Google. Response was:', signInResponse);
        throw new Error('No ID token received from Google');
      }
      console.log('✅ Google ID token acquired (length):', idToken.length);

      showToast({ message: 'Authenticating with server...', type: 'info' });
      // Backend controller expects @RequestBody Map<String,String> and reads only
      // "idToken" (it extracts email/name/picture from the verified token itself).
      // Sending a nested object (e.g. userInfo) makes Spring reject the body as 400,
      // so we send a flat { idToken } payload.
      const res: any = await loginWithGoogle({ idToken });
      console.log('=== BACKEND /google-login RESPONSE ===', JSON.stringify(res, null, 2));

      if (res?.success !== false) {
        const { id, email, username, contactNumber, token } = res;
        const normalized = {
          ...res,
          id: id || res.userId,
          userId: id || res.userId,
          email,
          username,
          contactNumber: contactNumber || res.contact || '',
          token,
          loginType: 'GOOGLE',
        };
        await saveAuthData(normalized);
        showToast({ message: 'Login successful with Google!', type: 'success' });

        if (!normalized.contactNumber?.trim()) {
          navigation.navigate('GoogleContactVerification', {
            userId: id,
            email,
            username,
            token,
            picture: googleUser?.photo,
            isLogin: true,
          });
        } else {
          await routeAfterAuth();
        }
      } else {
        showToast({ message: res?.error || 'Google authentication failed', type: 'error' });
      }
    } catch (err: any) {
      console.log('=== GOOGLE SIGN-IN ERROR ===', {
        code: err?.code,
        message: err?.message,
        raw: err,
      });
      let msg = 'Google sign-in failed';
      switch (err?.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          msg = 'Google sign-in cancelled';
          break;
        case statusCodes.IN_PROGRESS:
          msg = 'Google sign-in already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          msg = 'Google Play Services unavailable';
          break;
        default:
          msg = `Google sign-in failed: ${err?.message || 'Try again'}`;
      }
      showToast({ message: msg, type: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  }, [clearError, loginWithGoogle, navigation, routeAfterAuth, showToast]);

  // ---- Guest + navigation ---------------------------------------------------
  const continueAsGuest = useCallback(() => {
    navigation.replace('MainDrawer');
  }, [navigation]);

  const goToForgotPassword = useCallback(
    () => navigation.navigate('ForgotPassword', { mode: 'forgot' }),
    [navigation],
  );
  const goToRegister = useCallback(() => navigation.navigate('Register'), [navigation]);

  return useMemo(
    () => ({
      mobile,
      password,
      showPassword,
      remember,
      errors,
      loading,
      googleLoading,
      isBusy,
      onChangeMobile,
      onChangePassword,
      onBlurField,
      toggleShowPassword,
      toggleRemember,
      submit,
      signInWithGoogle,
      continueAsGuest,
      goToForgotPassword,
      goToRegister,
      Toast,
    }),
    [
      mobile,
      password,
      showPassword,
      remember,
      errors,
      loading,
      googleLoading,
      isBusy,
      onChangeMobile,
      onChangePassword,
      onBlurField,
      toggleShowPassword,
      toggleRemember,
      submit,
      signInWithGoogle,
      continueAsGuest,
      goToForgotPassword,
      goToRegister,
      Toast,
    ],
  );
}

export default useLogin;
