// Src/Screens/Auth/Register/hooks/useRegister.ts
// -----------------------------------------------------------------------------
// All Register behaviour: react-hook-form + Zod validation, app-hash retrieval,
// account creation via useAuth.signUp, friendly server-error mapping, success
// state for the button animation, and navigation to OTP verification.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { getHash } from 'react-native-otp-verify';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import useAuth from '../../../../api/hooks/Auth/useAuth';
import { saveAuthData, getMpinStatus } from '../../../../Utills/AsynchStorageHelper';
import { useToast } from '../../../../Components/Toast/Toast';
import type { RegisterPayload } from '../../../../types/auth';
import {
  REGISTER_DEFAULTS,
  registerSchema,
  type RegisterFormValues,
} from '../validation/registerSchema';

const DEFAULT_HASH = 'd4riq2SwBaq';

/** Maps common backend messages to a friendly title/message pair. */
function mapServerError(raw: string): { title: string; message: string } {
  const m = raw.toLowerCase();
  if (m.includes('email')) {
    return { title: 'Email Already Registered', message: 'This email is already in use. Try logging in instead.' };
  }
  if (m.includes('username')) {
    return { title: 'Name Unavailable', message: 'That name is already taken. Please try another.' };
  }
  if (m.includes('mobile') || m.includes('contact') || m.includes('phone')) {
    return { title: 'Mobile Already Registered', message: 'This mobile number is already registered. Try logging in.' };
  }
  return { title: 'Registration Failed', message: raw || 'Something went wrong. Please try again.' };
}

export function useRegister() {
  const navigation = useNavigation<any>();
  const { signUp, loginWithGoogle, loading, clearError } = useAuth();
  const { showToast, Toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const hashRef = useRef<string>(DEFAULT_HASH);

  const GOOGLE_WEB_CLIENT_ID = '985006297869-9mpqikboqvnesffmb9okfbuope80pg16.apps.googleusercontent.com';

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true,
    });
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: REGISTER_DEFAULTS,
    mode: 'onTouched',
  });

  const password = form.watch('password');

  // Retrieve the SMS app-hash so the OTP that follows can be auto-read.
  useEffect(() => {
    (async () => {
      try {
        const hash = await getHash();
        if (hash?.[0]) hashRef.current = hash[0];
      } catch (err) {
        console.log('getHash failed:', err);
      }
    })();
  }, []);

  const onValid = useCallback(
    async (values: RegisterFormValues) => {
      try {
        clearError();
        const email = values.email?.trim().toLowerCase() ?? '';

        const payload: RegisterPayload = {
          username: values.name.trim(),
          password: values.password,
          contactNumber: values.mobile.trim(),
          email,
          hashKey: hashRef.current || DEFAULT_HASH,
          ...(values.referralCode?.trim() ? { referralCode: values.referralCode.trim() } : {}),
        };

        const result: any = await signUp(payload);

        const otpSent =
          result?.message?.includes('OTP sent') ||
          result?.errorMessage?.includes('OTP sent') ||
          result?.otp ||
          result?.whatsappLink;

        if (otpSent) {
          setSuccess(true);
          showToast({ message: 'OTP sent to your mobile number', type: 'success', duration: 2500 });
          setTimeout(() => {
            navigation.navigate('VerifyOTP', {
              mobileNumber: values.mobile.trim(),
              email,
              username: values.name.trim(),
              registrationData: payload,
              otpType: 'normal',
            });
            setSuccess(false);
            form.reset(REGISTER_DEFAULTS);
          }, 1400);
        } else {
          const { title, message } = mapServerError(result?.message || result?.errorMessage || '');
          showToast({ message: `${title}: ${message}`, type: 'error', duration: 4000 });
        }
      } catch (err: any) {
        const { title, message } = mapServerError(err?.message || '');
        showToast({ message: `${title}: ${message}`, type: 'error', duration: 4000 });
      }
    },
    [clearError, signUp, showToast, navigation, form],
  );

  const submit = form.handleSubmit(onValid);

  const signInWithGoogle = useCallback(async () => {
    try {
      setGoogleLoading(true);
      showToast({ message: 'Connecting to Google...', type: 'info' });

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signOut().catch(() => {});

      const signInResponse: any = await GoogleSignin.signIn();
      if (signInResponse?.type === 'cancelled') {
        showToast({ message: 'Google sign-in cancelled', type: 'info' });
        return;
      }

      const data: any = signInResponse?.data ?? signInResponse;
      let idToken: string | null = data?.idToken ?? null;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens?.idToken ?? null;
      }
      if (!idToken) throw new Error('No ID token received from Google');

      showToast({ message: 'Authenticating with server...', type: 'info' });
      const res: any = await loginWithGoogle({ idToken });

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
        showToast({ message: 'Signed in with Google!', type: 'success' });
        if (!normalized.contactNumber?.trim()) {
          navigation.navigate('GoogleContactVerification', {
            userId: id, email, username, token,
            picture: data?.user?.photo,
            isLogin: false,
          });
        } else {
          const hasMpin = await getMpinStatus();
          navigation.replace(hasMpin ? 'MpinVerify' : 'MpinCreate');
        }
      } else {
        showToast({ message: res?.error || 'Google authentication failed', type: 'error' });
      }
    } catch (err: any) {
      let msg = 'Google sign-in failed';
      switch (err?.code) {
        case statusCodes.SIGN_IN_CANCELLED: msg = 'Google sign-in cancelled'; break;
        case statusCodes.IN_PROGRESS: msg = 'Google sign-in already in progress'; break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE: msg = 'Google Play Services unavailable'; break;
        default: msg = `Google sign-in failed: ${err?.message || 'Try again'}`;
      }
      showToast({ message: msg, type: 'error' });
    } finally {
      setGoogleLoading(false);
    }
  }, [navigation, showToast, loginWithGoogle]);

  const goToLogin = useCallback(() => navigation.navigate('Login'), [navigation]);
  const goToTerms = useCallback(() => navigation.navigate('TermsAndConditions'), [navigation]);
  const goToPrivacy = useCallback(() => navigation.navigate('PrivacyPolicy'), [navigation]);

  return {
    form,
    password: password ?? '',
    showPassword,
    showConfirm,
    toggleShowPassword: useCallback(() => setShowPassword((s) => !s), []),
    toggleShowConfirm: useCallback(() => setShowConfirm((s) => !s), []),
    loading,
    googleLoading,
    success,
    submit,
    signInWithGoogle,
    goToLogin,
    goToTerms,
    goToPrivacy,
    Toast,
  };
}

export type UseRegister = ReturnType<typeof useRegister>;
export default useRegister;
