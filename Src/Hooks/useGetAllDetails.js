import { useEffect, useState } from "react";
import { fetchAccountByPhone } from "../Services/GetAllDetailsService";

export function useAccountDetails() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccountDetails() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAccountByPhone({
          signal: controller.signal,
        });

        setAccounts(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load account details");
        }
      } finally {
        setLoading(false);
      }
    }

    loadAccountDetails();

    return () => controller.abort();
  }, []);

  return {
    accounts,        // full array
    primaryAccount: accounts[0] || null, // convenience
    loading,
    error,
  };
}
