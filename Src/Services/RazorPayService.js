import { API_BASE_URL } from "../Config/BaseUrl";
import { getAuthToken } from "../Utills/AsynchStorageHelper";

// Configuration constants
const API_ENDPOINTS = {
  CREATE_ORDER: '/razorpay/create-order',
  VERIFY_PAYMENT: '/razorpay/verify-payment'
};

// Error types for better error handling
class PaymentError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.details = details;
  }
}

// Generic API caller with error handling
const apiCall = async (endpoint, method, body, requireAuth = true) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new PaymentError('User not authenticated', 'AUTH_MISSING');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new PaymentError('Invalid server response', 'INVALID_JSON');
    }

    if (!response.ok) {
      throw new PaymentError(
        data?.message || 'Request failed',
        response.status.toString(),
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    throw new PaymentError(error.message, 'NETWORK_ERROR');
  }
};

export const createOrderApi = async (amount, regNo, groupCode) => {
  console.group('🔵 Create Order API');
  console.log('Payload:', { amount, regNo, groupCode });
  
  try {
    const data = await apiCall(
      API_ENDPOINTS.CREATE_ORDER,
      'POST',
      {
        AMOUNT: amount,
        REGNO: String(regNo),
        GROUPCODE: groupCode,
      },
      true
    );
    
    console.log('Success:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Create Order Error:', error);
    console.groupEnd();
    throw error;
  }
};

export const verifyPaymentApi = async (payload) => {
  console.group('🟢 Verify Payment API');
  console.log('Payload:', payload);
  
  try {
    const data = await apiCall(
      API_ENDPOINTS.VERIFY_PAYMENT,
      'POST',
      payload,
      true
    );
    
    console.log('Success:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Verify Payment Error:', error);
    console.groupEnd();
    throw error;
  }
};