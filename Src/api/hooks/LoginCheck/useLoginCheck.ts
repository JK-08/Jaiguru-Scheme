// Src/api/hooks/LoginCheck/useLoginCheck.ts
//
// Ported from Src/Hooks/useLoginCheck.js for structural completeness. Note:
// the "LoginCheck" screen that used this was removed from the app (it was
// gated only by a hardcoded admin/admin password baked into the client,
// exposing every user's data to anyone who opened the drawer menu — see
// the app-wide audit). Don't wire this back into navigation without real,
// server-verified admin auth.
import { useEffect, useState } from 'react';
import { loginCheckService } from '../../services/loginCheckService';

export const useRegisterLoginCheckUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const register = async (username: string, mobileNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      return await loginCheckService.register({ username, mobileNumber });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

export const useLoginCheckList = (date: string) => {
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginCheckService.list(date);
      setUsers(res?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchUsers();
  }, [date]);

  return { users, loading, error, refetch: fetchUsers };
};
