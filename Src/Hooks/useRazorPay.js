import { useState, useCallback, useRef } from 'react';
import { createOrderApi, verifyPaymentApi } from "../Services/RazorPayService";
import { COLORS } from "../Utills/AppTheme";

const PAYMENT_STEPS = {
  IDLE: 'idle',
  CREATING_ORDER: 'creating_order',
  PROCESSING_PAYMENT: 'processing_payment',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  FAILED: 'failed'
};

export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(PAYMENT_STEPS.IDLE);
  const [error, setError] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  const resolveRef = useRef(null); // ✅ ref instead of state - no stale closure

  const resetState = useCallback(() => {
    setLoading(false);
    setPaymentStep(PAYMENT_STEPS.IDLE);
    setError(null);
    setWebViewVisible(false);
    setRazorpayOptions(null);
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentData) => {
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
      const verifyResponse = await verifyPaymentApi({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (!verifyResponse?.success) throw new Error(verifyResponse?.message || 'Payment verification failed');

      setPaymentStep(PAYMENT_STEPS.SUCCESS);
      setLoading(false);
      resolveRef.current?.({
        success: true,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        data: verifyResponse
      });
    } catch (err) {
      setPaymentStep(PAYMENT_STEPS.FAILED);
      setError(err.message);
      setLoading(false);
      resolveRef.current?.({ success: false, message: err.message, error: err });
    }
  }, []);

  const handlePaymentDismiss = useCallback(() => {
    setWebViewVisible(false);
    setPaymentStep(PAYMENT_STEPS.IDLE);
    setLoading(false);
    resolveRef.current?.({ success: false, message: 'Payment cancelled by user' });
  }, []);

  const startPayment = useCallback((amount, userDetails, regNo, groupCode) => {
    if (!amount || amount <= 0) return Promise.resolve({ success: false, message: 'Invalid amount' });
    if (!regNo || !groupCode) return Promise.resolve({ success: false, message: 'Missing registration details' });

    return new Promise(async (resolve) => {
      resolveRef.current = resolve; // ✅ store in ref immediately
      setLoading(true);
      setPaymentStep(PAYMENT_STEPS.CREATING_ORDER);
      setError(null);

      try {
        const orderResponse = await createOrderApi(amount, regNo, groupCode);
        if (!orderResponse?.success) throw new Error(orderResponse?.message || 'Order creation failed');

        const backendOrder = orderResponse.data;
        if (!backendOrder?.order_id) throw new Error('Invalid order response from backend');

        setPaymentStep(PAYMENT_STEPS.PROCESSING_PAYMENT);

        const options = {
          description: "Gold Scheme Payment",
          currency: backendOrder.currency || 'INR',
          key: backendOrder.key,
          amount: backendOrder.amount,
          order_id: backendOrder.order_id,
          name: "Jai Guru Jewellers",
          prefill: {
            email: backendOrder.email || userDetails?.email || '',
            contact: backendOrder.contact || userDetails?.phone || '',
            name: backendOrder.name || userDetails?.name || '',
          },
          theme: { color: COLORS.primary },
        };

        setRazorpayOptions(options);
        setWebViewVisible(true);
      } catch (err) {
        setPaymentStep(PAYMENT_STEPS.FAILED);
        setError(err.message);
        setLoading(false);
        resolve({ success: false, message: err.message, error: err });
      }
    });
  }, []);

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
