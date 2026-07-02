// Src/api/hooks/Account/useTransactionTypes.ts
import { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { TransactionType } from '../../../types/TransactionType/TransactionType';

export const useTransactionTypes = () => {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await accountService.getTransactionTypes();
        setTransactionTypes(data);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionTypes();
  }, []);

  return { transactionTypes, loading, error };
};
