import { API_BASE_URL } from "../Config/BaseUrl";

/* =========================
   SHARED FETCH HELPER
========================= */
const apiRequest = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      console.log('No JSON response');
    }

    console.log("API:", url);
    console.log("Status:", res.status);
    console.log("Response:", data);

    if (!res.ok) {
      const message =
        data?.error ||
        data?.message ||
        data?.errorMessage ||
        "Request failed";

      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;

  } catch (error) {
    console.log("API ERROR:", error);
    throw error;
  }
};

/* =========================
   NORMAL REGISTER
========================= */
export const registerUser = (payload) =>
  apiRequest(`${API_BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

/* =========================
   NORMAL OTP VERIFY
========================= */
export const verifyOtp = (payload) => {
  const queryParams = new URLSearchParams(payload).toString();
  return apiRequest(
    `${API_BASE_URL}/user/verify-otp?${queryParams}`,
    { method: "POST" }
  );
};

/* =========================
   NORMAL LOGIN
========================= */
export const loginUser = (payload) =>
  apiRequest(`${API_BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = (payload) =>
  apiRequest(`${API_BASE_URL}/user/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = ({ contactNumber, otp, newPassword }) => {
  const queryParams = new URLSearchParams({
    contactNumber,
    otp,
    newPassword,
  }).toString();

  return apiRequest(
    `${API_BASE_URL}/user/verify-otp?${queryParams}`,
    { method: "POST" }
  );
};

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLogin = (payload) =>
  apiRequest(`${API_BASE_URL}/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

/* =========================
   REQUEST GOOGLE CONTACT OTP
========================= */
export const requestGoogleContactOtp = ({
  userId,
  newContactNumber,
  hashKey,
}) => {
  const queryParams = new URLSearchParams({
    userId: String(userId),
    newContactNumber,
    ...(hashKey && { hashKey }),
  }).toString();

return apiRequest(
  `${API_BASE_URL}/request-google-contact-update?${queryParams}`,
  { 
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }
);
};

/* =========================
   VERIFY GOOGLE CONTACT OTP
========================= */
export const verifyGoogleContactOtp = ({
  newContactNumber,
  otp,
  userId,
}) => {
  const queryParams = new URLSearchParams({
    newContactNumber,
    otp,
    ...(userId && { userId }),
  }).toString();

  return apiRequest(
    `${API_BASE_URL}/verify-google-contact-otp?${queryParams}`,
    { method: "POST" }
  );
};