// Src/api/services/razorpayService.ts
import { callApi } from '../apiClient';
import { RAZORPAY } from '../endpoints';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '../../types/Razorpay/Razorpay';
import { CreateMemberPayload } from '../../types/Member/Member';

export interface CreateOrderParams {
  amount: number;
  regNo: string | number;
  groupCode: string;
  /** true = new member + first payment (NMDATA), false = installment on an existing member (SCHEMEDETAILS) */
  newJoin: boolean;
  nmData?: CreateMemberPayload;
  schemeDetails?: Record<string, any>;
}

export const razorpayService = {
  /**
   * POST /razorpay/create-order?NEWJOIN=true|false
   *
   * The member/installment payload is parked server-side against the
   * order id and only committed to the real DB once payment is verified
   * (webhook or /verify-payment) — see RazorpayService.processPendingPayment.
   */
  createOrder: ({ amount, regNo, groupCode, newJoin, nmData, schemeDetails }: CreateOrderParams) =>
    callApi<CreateOrderRequest, CreateOrderResponse>({
      method: 'post',
      url: RAZORPAY.CREATE_ORDER,
      params: { NEWJOIN: newJoin },
      data: {
        AMOUNT: amount,
        REGNO: String(regNo),
        GROUPCODE: groupCode,
        ...(newJoin ? { NMDATA: nmData } : { SCHEMEDETAILS: schemeDetails }),
      },
    }),

  /** POST /razorpay/verify-payment */
  verifyPayment: (payload: VerifyPaymentRequest) =>
    callApi<VerifyPaymentRequest, VerifyPaymentResponse>({
      method: 'post',
      url: RAZORPAY.VERIFY_PAYMENT,
      data: payload,
    }),

  /** GET /razorpay/payment/receipt/{receipt} */
  getPaymentByReceipt: (receipt: string) =>
    callApi<null, VerifyPaymentResponse>({
      method: 'get',
      url: RAZORPAY.PAYMENT_BY_RECEIPT(receipt),
    }),

  /** POST /razorpay/payment-failed — explicitly mark an order as failed (e.g. user dismissed checkout) */
  markFailed: (razorpayOrderId: string) =>
    callApi<{ razorpay_order_id: string }, VerifyPaymentResponse>({
      method: 'post',
      url: RAZORPAY.PAYMENT_FAILED,
      data: { razorpay_order_id: razorpayOrderId },
    }),
};
