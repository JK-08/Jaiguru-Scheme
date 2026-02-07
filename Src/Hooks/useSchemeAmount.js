import { useState, useEffect } from "react";
import { getSchemesById } from "../Services/SchemeAmountService";

/**
 * Custom hook to fetch schemes and get a single scheme amount
 * @param {number|string} schemeId
 */
export const useSchemes = (schemeId) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schemeId) return;

    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSchemesById(schemeId);
        setSchemes(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [schemeId]);

  /**
   * Get amount for a specific group code
   * @param {string} groupCode
   * @returns {number|null} Amount
   */
  const getAmount = (groupCode) => {
    const scheme = schemes.find((s) => s.GROUPCODE === groupCode);
    return scheme ? scheme.AMOUNT : null;
  };

  return { schemes, loading, error, getAmount };
};
