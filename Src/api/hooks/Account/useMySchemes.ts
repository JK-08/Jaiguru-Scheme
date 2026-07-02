// Src/api/hooks/Account/useMySchemes.ts
//
// Ported from Src/Hooks/useGetAllDetails.js (useAccountDetails). Renamed to
// match the Dhanapal reference's naming, but kept the exact same return
// shape (accounts/primaryAccount/loading/error/refetch) so it's a drop-in
// swap when screens are migrated.
import { useEffect, useState, useCallback } from 'react';
import { getUserData } from '../../../Utills/AsynchStorageHelper';
import { accountService } from '../../services/accountService';
import { Account } from '../../../types/Account/Account';

export function useMySchemes() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccountDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await getUserData();
      const phoneNo = userData?.contactNumber || userData?.mobile;
      if (!phoneNo) throw new Error('Phone number not found in user data');

      const data = await accountService.getPhoneDetails(phoneNo);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load account details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccountDetails();
  }, [loadAccountDetails]);

  return {
    accounts,
    primaryAccount: accounts[0] || null,
    loading,
    error,
    refetch: loadAccountDetails,
  };
}

// Back-compat alias matching the original hook's exported name.
export const useAccountDetails = useMySchemes;
