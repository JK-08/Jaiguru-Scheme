// hooks/useLoginCheck.js

import { useEffect, useState } from 'react';
import {
  registerUser,
  getUsersList,
} from '../Services/LoginCheckService';

// 🔹 Register Hook
export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (username, mobileNumber) => {
    try {
      setLoading(true);
      setError(null);

      const data = await registerUser(
        username,
        mobileNumber
      );

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
};

// 🔹 Get Users Hook
export const useUsersList = (
  mobileNumber,
  fromDate,
  toDate
) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsersList(
        mobileNumber,
        fromDate,
        toDate
      );

      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mobileNumber && fromDate && toDate) {
      fetchUsers();
    }
  }, [mobileNumber, fromDate, toDate]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
};