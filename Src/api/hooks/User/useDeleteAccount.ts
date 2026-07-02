// Src/api/hooks/User/useDeleteAccount.ts
import { useState } from 'react';
import { userService } from '../../services/userService';

export const useDeleteAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async (userId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.deleteAccount(userId);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading, error };
};
