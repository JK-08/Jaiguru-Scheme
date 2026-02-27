import { useState } from "react";
import { createMember, insertInstallment } from "../Services/MemberCreateService";

export const useMemberActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Create Member
   */
  const handleCreateMember = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createMember(payload);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Insert Installment
   */
  const handleInsertInstallment = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await insertInstallment(payload);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreateMember,
    handleInsertInstallment,
    loading,
    error,
    data,
  };
};