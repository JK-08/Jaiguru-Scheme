import { useState } from 'react';
import {
  registerUser,
  verifyOtp,
  loginUser,
  googleLogin,
  requestGoogleContactOtp,
  verifyGoogleContactOtp,
  forgotPassword,          // ✅ added
  resetPassword            // ✅ added
} from '../Services/RegisterService';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  /* =========================
     COMMON API HANDLER
  ========================= */
  const handleApi = async (apiFn, successCallback = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn();

      if (successCallback) {
        successCallback(result);
      }

      return result;

    } catch (err) {
      const backendError =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        'Something went wrong';

      setError(backendError);

      return {
        error: backendError,
        status: err?.status,
      };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     NORMAL AUTH
  ========================= */

  const signUp = (payload) =>
    handleApi(() => registerUser(payload));

  const verifyNormalOtp = (payload) =>
    handleApi(() => verifyOtp(payload), (result) => {
      if (result?.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  const login = (payload) =>
    handleApi(() => loginUser(payload), (result) => {
      if (result?.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  /* =========================
     PASSWORD
  ========================= */

  const sendForgotPassword = (payload) =>
    handleApi(() => forgotPassword(payload));

  const updatePassword = (payload) =>
    handleApi(() => resetPassword(payload));

  /* =========================
     GOOGLE AUTH
  ========================= */

  const loginWithGoogle = (payload) =>
    handleApi(() => googleLogin(payload), (result) => {
      if (!result?.needsContactVerification && result?.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
      return result;
    });

  const requestGoogleOtp = (payload) =>
    handleApi(() => requestGoogleContactOtp(payload));

  const verifyGoogleOtp = (payload) =>
    handleApi(() => verifyGoogleContactOtp(payload), (result) => {
      if (result?.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  /* =========================
     LOGOUT
  ========================= */

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
    requestGoogleOtp,
    verifyGoogleOtp,

    sendForgotPassword,
    updatePassword,

    logout,
    clearError: () => setError(null),
  };
};

export default useAuth;