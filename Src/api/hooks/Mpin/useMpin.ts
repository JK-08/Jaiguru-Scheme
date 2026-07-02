// Src/api/hooks/Mpin/useMpin.ts
//
// Ported from Src/Hooks/useMpin.js — identical shape/behavior, now backed
// by mpinService + the shared axiosInstance instead of a bespoke
// postRequest() in MpinService.js.
import { useState } from 'react';
import { mpinService } from '../../services/mpinService';

interface NormalizedError {
  message: string;
  status?: number;
  code?: string;
}

export const useMpin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const normalizeError = (err: any): NormalizedError => ({
    message: err?.message || 'Something went wrong',
    status: err?.statusCode ?? err?.status,
    code: err?.code,
  });

  const handleRequest = async <T,>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await apiCall();
      setMessage((response as any)?.message || 'Success');
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

    createMpin: (mpin: string) => handleRequest(() => mpinService.create(mpin)),
    verifyMpin: (mpin: string) => handleRequest(() => mpinService.verify(mpin)),
    resetMpinWithOld: (oldMpin: string, newMpin: string) =>
      handleRequest(() => mpinService.resetWithOld(oldMpin, newMpin)),
    resetMpinDirect: (oldMpin: string, newMpin: string) =>
      handleRequest(() => mpinService.resetDirect(oldMpin, newMpin)),
    sendForgotOtp: () => handleRequest(() => mpinService.forgotSendOtp()),
    verifyForgotOtp: (otp: string, newMpin: string) => handleRequest(() => mpinService.forgotVerify(otp, newMpin)),
  };
};
