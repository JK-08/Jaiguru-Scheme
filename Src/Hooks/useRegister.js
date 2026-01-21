import { useState } from 'react';
import {
  registerUser,
  verifyOtp,
  loginUser,
  googleLogin,
  requestGoogleContactOtp,
  verifyGoogleContactOtp
} from '../Services/RegisterService';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

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
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Normal Signup
  const signUp = (payload) =>
    handleApi(() => registerUser(payload));

  // Normal OTP Verify
  const verifyNormalOtp = (payload) =>
    handleApi(() => verifyOtp(payload), (result) => {
      if (result.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  // Normal Login
  const login = (payload) =>
    handleApi(() => loginUser(payload), (result) => {
      if (result.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  // Google Login
  const loginWithGoogle = (payload) =>
    handleApi(() => googleLogin(payload), (result) => {
      // If user needs contact verification, don't set token/user yet
      if (!result.needsContactVerification && result.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
      return result;
    });

  // Google Contact OTP Request
  const requestGoogleOtp = (payload) =>
    handleApi(() => requestGoogleContactOtp(payload));

  // Google Contact OTP Verify
  const verifyGoogleOtp = (payload) =>
    handleApi(() => verifyGoogleContactOtp(payload), (result) => {
      if (result.token) {
        setToken(result.token);
        setUser(result.user || result.data?.user || {});
      }
    });

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
  };

  return {
    // State
    loading,
    error,
    user,
    token,
    
    // Normal Auth
    signUp,
    verifyNormalOtp,
    login,
    
    // Google Auth
    loginWithGoogle,
    requestGoogleOtp,
    verifyGoogleOtp,
    
    // Common
    logout,
    clearError: () => setError(null),
  };
};

export default useAuth;