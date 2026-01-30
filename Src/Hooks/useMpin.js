import { useState } from 'react';
import {
  createMpin,
  verifyMpin,
  resetMpinWithOld,
  resetMpinDirect,
} from '../Services/MpinService';

export const useMpin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleRequest = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const responseText = await apiCall(); // fetch returns text
      setMessage(responseText || 'Success');

      return responseText;
    } catch (err) {
      const apiMessage = err?.message || 'Something went wrong';
      setError(apiMessage);
      throw err; // 🔥 rethrow so screen-level handling works
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

    /** Reset MPIN with old MPIN */
    resetMpinWithOld: (oldMpin, newMpin) =>
      handleRequest(() => resetMpinWithOld(oldMpin, newMpin)),

    /** Reset MPIN directly */
    resetMpinDirect: (newMpin) =>
      handleRequest(() => resetMpinDirect(newMpin)),
  };
};
