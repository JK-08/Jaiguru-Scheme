// Src/api/hooks/Member/useMemberCreate.ts
import { useState } from 'react';
import { memberService } from '../../services/memberService';
import { accountService } from '../../services/accountService';
import { CreateMemberPayload } from '../../../types/Member/Member';

export const useMemberActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  const handleCreateMember = async (payload: CreateMemberPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await memberService.createMember(payload);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err?.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleInsertInstallment = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountService.insertInstallment(payload);
      setData(response);
      return response;
    } catch (err: any) {
      setError(err?.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleCreateMember, handleInsertInstallment, loading, error, data };
};
