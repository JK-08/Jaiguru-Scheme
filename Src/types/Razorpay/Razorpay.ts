// Src/types/Razorpay/Razorpay.ts
//
// Shapes used by Src/Services/RazorPayService.js /
// Src/Hooks/useRazorPay.js.

export interface CreateOrderRequest {
  AMOUNT: number;
  REGNO: string;
  GROUPCODE: string;
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
