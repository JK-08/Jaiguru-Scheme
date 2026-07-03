// Src/types/Razorpay/Razorpay.ts
//
// Shapes for the webhook-based payment flow (backend: RazorpayController /
// RazorpayService). Order creation now "parks" the member/installment
// payload in a temp table and only writes it into the real DB once the
// payment is confirmed — either by the app calling /verify-payment after
// checkout, or by Razorpay's server-to-server /webhook call, whichever
// arrives first (idempotent, race-safe on the backend).
import { CreateMemberPayload } from '../Member/Member';

export interface CreateOrderRequest {
  AMOUNT: number;
  REGNO: string;
  GROUPCODE: string;
  // Present when NEWJOIN=true — full new-member + first-payment payload.
  // Backend creates the member automatically once payment is confirmed.
  NMDATA?: CreateMemberPayload;
  // Present when NEWJOIN=false — installment payload for an existing
  // member. Backend inserts the installment automatically once payment
  // is confirmed.
  SCHEMEDETAILS?: Record<string, any>;
}

export interface CreateOrderResponse {
  orderId?: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  [key: string]: unknown;
}

export interface VerifyPaymentResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}
