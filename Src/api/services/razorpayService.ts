// Src/api/services/razorpayService.ts
import { callApi } from '../apiClient';
import { RAZORPAY } from '../endpoints';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '../../types/Razorpay/Razorpay';

export const razorpayService = {
  /** POST /razorpay/create-order */
  createOrder: (amount: number, regNo: string | number, groupCode: string) =>
    callApi<CreateOrderRequest, CreateOrderResponse>({
      method: 'post',
      url: RAZORPAY.CREATE_ORDER,
      data: { AMOUNT: amount, REGNO: String(regNo), GROUPCODE: groupCode },
    }),

  /** POST /razorpay/verify-payment */
  verifyPayment: (payload: VerifyPaymentRequest) =>
    callApi<VerifyPaymentRequest, VerifyPaymentResponse>({
      method: 'post',
      url: RAZORPAY.VERIFY_PAYMENT,
      data: payload,
    }),
};
