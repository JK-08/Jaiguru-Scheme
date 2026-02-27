import { useState } from "react";
import {
  createMpin,
  verifyMpin,
  resetMpinWithOld,
  resetMpinDirect,
  sendForgotOtp,
  verifyForgotOtp,
} from "../Services/MpinService";

export const useMpin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const normalizeError = (err) => {
    return {
      message: err?.message || "Something went wrong",
      status: err?.status,
      code: err?.code,
    };
  };

  const handleRequest = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await apiCall();

      setMessage(response?.message || "Success");

      return response;
    } catch (err) {
      const normalizedError = normalizeError(err);
      setError(normalizedError.message);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    message,

    /** Create MPIN */
    createMpin: (mpin) =>
      handleRequest(() => createMpin(mpin)),

    /** Verify MPIN */
    verifyMpin: (mpin) =>
      handleRequest(() => verifyMpin(mpin)),

    /** Reset with old MPIN */
    resetMpinWithOld: (oldMpin, newMpin) =>
      handleRequest(() => resetMpinWithOld(oldMpin, newMpin)),

    /** Direct reset */
    resetMpinDirect: (newMpin) =>
      handleRequest(() => resetMpinDirect(newMpin)),

    /** 🔑 Send Forgot OTP */
    sendForgotOtp: () =>
      handleRequest(() => sendForgotOtp()),

    /** 🔑 Verify OTP & Reset MPIN */
    verifyForgotOtp: (otp, newMpin) =>
      handleRequest(() => verifyForgotOtp(otp, newMpin)),
  };
};