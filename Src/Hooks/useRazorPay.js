import { useState, useCallback } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { createOrderApi, verifyPaymentApi } from "../Services/RazorPayService";

// Constants
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

  const resetState = useCallback(() => {
    setLoading(false);
    setPaymentStep(PAYMENT_STEPS.IDLE);
    setError(null);
  }, []);

  const startPayment = useCallback(async (amount, userDetails, regNo, groupCode) => {
    // Input validation
    if (!amount || amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    if (!regNo || !groupCode) {
      return { success: false, message: 'Missing registration details' };
    }

    setLoading(true);
    setPaymentStep(PAYMENT_STEPS.CREATING_ORDER);
    setError(null);

    try {
      console.log('🚀 Starting payment flow:', { amount, regNo, groupCode });

      // Step 1: Create order
      const orderResponse = await createOrderApi(amount, regNo, groupCode);
      
      if (!orderResponse?.success) {
        throw new Error(orderResponse?.message || 'Order creation failed');
      }

      const backendOrder = orderResponse.data;
      if (!backendOrder?.order_id) {
        throw new Error('Invalid order response from backend');
      }

      setPaymentStep(PAYMENT_STEPS.PROCESSING_PAYMENT);

      // Step 2: Prepare Razorpay options
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
        theme: { color: "#F37254" },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setPaymentStep(PAYMENT_STEPS.IDLE);
          }
        }
      };

      console.log('💳 Opening Razorpay with order:', backendOrder.order_id);

      // Step 3: Open Razorpay
      const paymentData = await RazorpayCheckout.open(options);
      
      console.log('✅ Payment received:', paymentData);
      setPaymentStep(PAYMENT_STEPS.VERIFYING);

      // Step 4: Verify payment
      const verifyResponse = await verifyPaymentApi({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (!verifyResponse?.success) {
        throw new Error(verifyResponse?.message || 'Payment verification failed');
      }

      setPaymentStep(PAYMENT_STEPS.SUCCESS);
      
      return {
        success: true,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        data: verifyResponse
      };

    } catch (error) {
      console.error('🔥 Payment Error:', error);
      setPaymentStep(PAYMENT_STEPS.FAILED);
      setError(error?.description || error?.message || 'Payment failed');
      
      return {
        success: false,
        message: error?.description || error?.message || 'Payment failed',
        error: error
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, 
    paymentStep,
    error,
    startPayment,
    resetState,
    PAYMENT_STEPS 
  };
};