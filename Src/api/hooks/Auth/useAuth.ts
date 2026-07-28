// Src/api/hooks/Auth/useAuth.ts
//
// Ported from Src/Hooks/useRegister.js (default export useAuth) — same
// method names/signatures so screens can switch the import path without
// changing call sites.
import { useState } from 'react';
import { authService } from '../../services/authService';
import { AuthApiResponse } from '../../../types/auth';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleApi = async (
    apiFn: () => Promise<AuthApiResponse>,
    successCallback?: (result: AuthApiResponse) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn();
      if (successCallback) successCallback(result);
      return result;
    } catch (err: any) {
      const backendError = err?.data?.error || err?.data?.message || err?.message || 'Something went wrong';
      setError(backendError);
      return { error: backendError, status: err?.status } as any;
    } finally {
      setLoading(false);
    }
  };

  const applyAuthResult = (result: AuthApiResponse) => {
    if (result?.token) {
      setToken(result.token);
      setUser((result as any).user || (result as any).data?.user || {});
    }
  };

  const signUp = (payload: Parameters<typeof authService.register>[0]) => handleApi(() => authService.register(payload));

  const verifyNormalOtp = (payload: Parameters<typeof authService.verifyOtp>[0]) =>
    handleApi(() => authService.verifyOtp(payload), applyAuthResult);

  const login = (payload: Parameters<typeof authService.login>[0]) =>
    handleApi(() => authService.login(payload), applyAuthResult);

  const sendForgotPassword = (payload: Parameters<typeof authService.forgotPassword>[0]) =>
    handleApi(() => authService.forgotPassword(payload));

  const updatePassword = (payload: Parameters<typeof authService.resetPassword>[0]) =>
    handleApi(() => authService.resetPassword(payload));

  const loginWithGoogle = (payload: Record<string, unknown>) =>
    handleApi(() => authService.googleLogin(payload), (result) => {
      if (!(result as any)?.needsContactVerification && result?.token) applyAuthResult(result);
    });

  const loginWithApple = (payload: Record<string, unknown>) =>
    handleApi(() => authService.appleLogin(payload), (result) => {
      if (!(result as any)?.needsContactVerification && result?.token) applyAuthResult(result);
    });

  const requestGoogleOtp = (payload: Parameters<typeof authService.requestGoogleContactOtp>[0]) =>
    handleApi(() => authService.requestGoogleContactOtp(payload));

  const verifyGoogleOtp = (payload: Parameters<typeof authService.verifyGoogleContactOtp>[0]) =>
    handleApi(() => authService.verifyGoogleContactOtp(payload), applyAuthResult);

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  return {
    loading,
    error,
    user,
    token,
    signUp,
    verifyNormalOtp,
    login,
    loginWithGoogle,
    loginWithApple,
    requestGoogleOtp,
    verifyGoogleOtp,
    sendForgotPassword,
    updatePassword,
    logout,
    clearError: () => setError(null),
  };
};

export default useAuth;
