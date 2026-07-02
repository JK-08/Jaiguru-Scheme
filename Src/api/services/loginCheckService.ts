// Src/api/services/loginCheckService.ts
import { callApi } from '../apiClient';
import { LOGIN_CHECK } from '../endpoints';

export interface LoginCheckRegisterPayload {
  username: string;
  mobileNumber: string;
}

export const loginCheckService = {
  /** POST /logincheck/register */
  register: (payload: LoginCheckRegisterPayload) =>
    callApi<LoginCheckRegisterPayload, unknown>({
      method: 'post',
      url: LOGIN_CHECK.REGISTER,
      data: payload,
    }),

  /** GET /logincheck/get?date= */
  list: (date: string) =>
    callApi<null, { data?: unknown[] }>({
      method: 'get',
      url: LOGIN_CHECK.LIST(date),
    }),
};
