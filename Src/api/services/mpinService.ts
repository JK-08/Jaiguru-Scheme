// Src/api/services/mpinService.ts
//
// All MPIN endpoints require auth (handled automatically by
// axiosInstance's request interceptor) and take their arguments as query
// params, matching the original Src/Services/MpinService.js behavior.
import { callApi } from '../apiClient';
import { MPIN } from '../endpoints';
import { MpinApiResponse } from '../../types/Mpin/Mpin';

export const mpinService = {
  create: (mpin: string) =>
    callApi<null, MpinApiResponse>({ method: 'post', url: MPIN.CREATE, params: { mpin } }),

  verify: (enteredMpin: string) =>
    callApi<null, MpinApiResponse>({ method: 'post', url: MPIN.VERIFY, params: { enteredMpin } }),

  resetWithOld: (oldMpin: string, newMpin: string) =>
    callApi<null, MpinApiResponse>({
      method: 'post',
      url: MPIN.RESET_WITH_OLD,
      params: { oldMpin, newMpin },
    }),

  resetDirect: (oldMpin: string, newMpin: string) =>
    callApi<null, MpinApiResponse>({
      method: 'post',
      url: MPIN.RESET_DIRECT,
      params: { oldMpin, newMpin },
    }),

  forgotSendOtp: () =>
    callApi<null, MpinApiResponse>({ method: 'post', url: MPIN.FORGOT_SEND_OTP }),

  forgotVerify: (otp: string, newMpin: string) =>
    callApi<null, MpinApiResponse>({
      method: 'post',
      url: MPIN.FORGOT_VERIFY,
      params: { otp, newMpin },
    }),
};
