import { useEffect, useState, useCallback } from "react";
import { fetchAccountByPhone } from "../Services/GetAllDetailsService";

export function useAccountDetails() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAccountDetails = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAccountByPhone({ signal });
      setAccounts(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to load account details");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadAccountDetails(controller.signal);
    return () => controller.abort();
  }, [loadAccountDetails]);

  const refetch = useCallback(async () => {
    const controller = new AbortController();
    await loadAccountDetails(controller.signal);
  }, [loadAccountDetails]);

  return {
    accounts,
    primaryAccount: accounts[0] || null,
    loading,
    error,
    refetch,
  };
}