// hooks/useCreateMember.js
import { useState } from "react";
import { createMember } from "../Services/MemberCreateService";

export const useCreateMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const create = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createMember(payload);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, data };
};
