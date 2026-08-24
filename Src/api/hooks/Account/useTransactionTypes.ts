// Src/api/hooks/Account/useTransactionTypes.ts
import { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { TransactionType, OnlinePayMode } from '../../../types/TransactionType/TransactionType';

/** Maps CARDTYPE string code to its numeric chqBankCode equivalent */
const CARDTYPE_BANK_CODE: Record<string, number> = { R: 4 };

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

  /** Returns payment fields for the ONLINE entry (CARDTYPE R / code 4) */
  const onlinePayMode: OnlinePayMode | null = (() => {
    const entry = transactionTypes.find(
      (t) => t.NAME.trim().toUpperCase() === 'ONLINE' && t.CARDTYPE === 'R'
    );
    if (!entry) return null;
    const code = CARDTYPE_BANK_CODE[entry.CARDTYPE] ?? 4;
    return { accCode: entry.ACCOUNT, modePay: entry.CARDTYPE, chqBankCode: code };
  })();

  return { transactionTypes, loading, error, onlinePayMode };
};
