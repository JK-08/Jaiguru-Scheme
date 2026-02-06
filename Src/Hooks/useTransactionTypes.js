import { useState, useEffect } from "react";
import { getTransactionTypes } from "../Services/TransactionTypeService";

/**
 * Custom hook to get transaction types
 */
export const useTransactionTypes = () => {
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTransactionTypes();
        setTransactionTypes(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionTypes();
  }, []);

  return { transactionTypes, loading, error };
};
