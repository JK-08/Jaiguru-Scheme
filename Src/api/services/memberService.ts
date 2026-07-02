// Src/api/services/memberService.ts
import { callApi } from '../apiClient';
import { MEMBER } from '../endpoints';
import { CreateMemberPayload, CreateMemberResponse } from '../../types/Member/Member';

export const memberService = {
  /** POST /member/create */
  createMember: (payload: CreateMemberPayload) =>
    callApi<CreateMemberPayload, CreateMemberResponse>({
      method: 'post',
      url: MEMBER.CREATE,
      data: payload,
    }),
};
