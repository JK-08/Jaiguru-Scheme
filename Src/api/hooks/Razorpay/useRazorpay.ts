// Src/api/hooks/Razorpay/useRazorpay.ts
//
// Ported from Src/Hooks/useRazorPay.js (useRazorpayPayment) with the exact
// same 3-step flow (create-order -> WebView checkout -> verify-payment) and
// return shape, just retyped and calling the new razorpayService.
import { useState, useCallback, useRef } from 'react';
import { razorpayService } from '../../services/razorpayService';
import { COLORS } from '../../../Utills/AppTheme';

export const PAYMENT_STEPS = {
  IDLE: 'idle',
  CREATING_ORDER: 'creating_order',
  PROCESSING_PAYMENT: 'processing_payment',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type PaymentStep = (typeof PAYMENT_STEPS)[keyof typeof PAYMENT_STEPS];

export interface UserDetails {
  name?: string;
  email?: string;
  phone?: string;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  paymentId?: string;
  orderId?: string;
  data?: unknown;
  error?: unknown;
}

export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>(PAYMENT_STEPS.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState<Record<string, any> | null>(null);
  const resolveRef = useRef<((result: PaymentResult) => void) | null>(null);

  const resetState = useCallback(() => {
    setLoading(false);
    setPaymentStep(PAYMENT_STEPS.IDLE);
    setError(null);
    setWebViewVisible(false);
    setRazorpayOptions(null);
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentData: any) => {
    setWebViewVisible(false);

    if (paymentData?.failed) {
      setPaymentStep(PAYMENT_STEPS.FAILED);
      const errMsg = paymentData.error?.description || 'Payment failed';
      setError(errMsg);
      setLoading(false);
      resolveRef.current?.({ success: false, message: errMsg });
      return;
    }

    setPaymentStep(PAYMENT_STEPS.VERIFYING);

    try {
      const verifyPayload = {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      };
      console.log('[Razorpay] verifyPayment PARAMS:', verifyPayload);
      const verifyResponse: any = await razorpayService.verifyPayment(verifyPayload);
      console.log('[Razorpay] verifyPayment RESPONSE:', verifyResponse);

      if (!verifyResponse?.success) throw new Error(verifyResponse?.message || 'Payment verification failed');

      setPaymentStep(PAYMENT_STEPS.SUCCESS);
      setLoading(false);
      const successResult = {
        success: true,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        data: verifyResponse,
      };
      console.log('[Razorpay] Payment SUCCESS result:', successResult);
      resolveRef.current?.(successResult);
    } catch (err: any) {
      setPaymentStep(PAYMENT_STEPS.FAILED);
      setError(err?.message);
      setLoading(false);
      resolveRef.current?.({ success: false, message: err?.message, error: err });
    }
  }, []);

  const handlePaymentDismiss = useCallback(() => {
    setWebViewVisible(false);
    setPaymentStep(PAYMENT_STEPS.IDLE);
    setLoading(false);
    resolveRef.current?.({ success: false, message: 'Payment cancelled by user' });
  }, []);

  const startPayment = useCallback(
    (amount: number, userDetails: UserDetails, regNo: string | number, groupCode: string): Promise<PaymentResult> => {
      if (!amount || amount <= 0) return Promise.resolve({ success: false, message: 'Invalid amount' });
      if (!regNo || !groupCode) return Promise.resolve({ success: false, message: 'Missing registration details' });

      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setLoading(true);
        setPaymentStep(PAYMENT_STEPS.CREATING_ORDER);
        setError(null);

        (async () => {
          try {
            console.log('[Razorpay] createOrder PARAMS:', { amount, regNo, groupCode });
            const orderResponse: any = await razorpayService.createOrder(amount, regNo, groupCode);
            console.log('[Razorpay] createOrder RESPONSE:', orderResponse);
            if (!orderResponse?.success) throw new Error(orderResponse?.message || 'Order creation failed');

            const backendOrder = orderResponse.data;
            if (!backendOrder?.order_id) throw new Error('Invalid order response from backend');

            setPaymentStep(PAYMENT_STEPS.PROCESSING_PAYMENT);

            const options = {
              description: 'Gold Scheme Payment',
              currency: backendOrder.currency || 'INR',
              key: backendOrder.key,
              amount: backendOrder.amount,
              order_id: backendOrder.order_id,
              name: 'Jai Guru Jewellers',
              prefill: {
                email: backendOrder.email || userDetails?.email || '',
                contact: backendOrder.contact || userDetails?.phone || '',
                name: backendOrder.name || userDetails?.name || '',
              },
              theme: { color: COLORS.primary },
            };

            setRazorpayOptions(options);
            setWebViewVisible(true);
          } catch (err: any) {
            setPaymentStep(PAYMENT_STEPS.FAILED);
            setError(err?.message);
            setLoading(false);
            resolve({ success: false, message: err?.message, error: err });
          }
        })();
      });
    },
    []
  );

  return {
    loading,
    paymentStep,
    error,
    startPayment,
    resetState,
    PAYMENT_STEPS,
    webViewVisible,
    razorpayOptions,
    handlePaymentSuccess,
    handlePaymentDismiss,
  };
};
