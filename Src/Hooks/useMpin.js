import { useState } from "react";
import {
  createMpin,
  verifyMpin,
  resetMpinWithOld,
  resetMpinDirect,
} from "../Services/MpinService";

export const useMpin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const normalizeError = (err) => {
    // Default error shape
    const normalizedError = {
      message: err?.message || "Something went wrong",
      status: err?.status,
      code: err?.code,
    };

    // 🔑 MPIN NOT FOUND (from your current service)
    if (err?.message === "MPIN not found") {
      normalizedError.code = "MPIN_NOT_FOUND";
      normalizedError.status = 404;
    }

    return normalizedError;
  };

  const handleRequest = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const responseText = await apiCall();
      setMessage(responseText || "Success");

      return responseText;
    } catch (err) {
      const normalizedError = normalizeError(err);

      setError(normalizedError.message);
      throw normalizedError; // 🔥 always throw normalized error
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
