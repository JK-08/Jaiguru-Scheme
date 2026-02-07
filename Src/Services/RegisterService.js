import { API_BASE_URL } from "../Config/BaseUrl";

/* =========================
   SHARED FETCH HELPER
========================= */
const apiRequest = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
    console.log('API Response:', url, data);
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      data?.errorMessage ||
      'Request failed';

    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;

};

/* =========================
   NORMAL REGISTER
========================= */
export const registerUser = (payload) => {
  return apiRequest(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/* =========================
   NORMAL OTP VERIFY
========================= */
export const verifyOtp = (payload) => {
  const queryParams = new URLSearchParams(payload).toString();
  const url = `${API_BASE_URL}/user/verify-otp?${queryParams}`;

  return apiRequest(url, {
    method: 'POST',
  });
};

/* =========================
   NORMAL LOGIN
========================= */
export const loginUser = (payload) => {
  return apiRequest(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLogin = (payload) => {
  return apiRequest(`${API_BASE_URL}/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/* =========================
   REQUEST GOOGLE CONTACT OTP
========================= */
export const requestGoogleContactOtp = ({ userId, newContactNumber, hashKey }) => {
  const queryParams = new URLSearchParams({
    userId: String(userId),
    newContactNumber,
    ...(hashKey && { hashKey }),
  }).toString();

  const url = `${API_BASE_URL}/request-google-contact-update?${queryParams}`;

  return apiRequest(url, {
    method: 'POST',
  });
};

/* =========================
   VERIFY GOOGLE CONTACT OTP
========================= */
export const verifyGoogleContactOtp = ({ newContactNumber, otp, userId }) => {
  const queryParams = new URLSearchParams({
    newContactNumber,
    otp,
    ...(userId && { userId }),
  }).toString();

  const url = `${API_BASE_URL}/verify-google-contact-otp?${queryParams}`;

  return apiRequest(url, {
    method: 'POST',
  });
};
