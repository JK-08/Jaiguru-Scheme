import { getAuthToken } from "../Utills/AsynchStorageHelper";
import { MPIN_API_BASE_URL } from "../Config/BaseUrl";

/**
 * Common POST Request
 */
const postRequest = async (endpoint, params = {}, asBody = false) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.log("❌ No Auth Token Found");
      throw new Error("Authorization token not found");
    }

    let url = `${MPIN_API_BASE_URL}${endpoint}`;

    if (!asBody) {
      const queryString = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");
      if (queryString) url += `?${queryString}`;
    }

    console.log("===================================");
    console.log("📤 API Request URL:", url);
    console.log("📤 Request Params:", params);
    console.log("📤 Token:", token);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: asBody ? JSON.stringify(params) : undefined,
    });

    console.log("📥 Raw Response Status:", response.status);

    let data;
const text = await response.text();

try {
  data = JSON.parse(text);
} catch (e) {
  console.log("⚠️ Response is not JSON, raw text:", text);
  data = { message: text }; // fallback
}

    console.log("📥 Response Data:", data);
    console.log("===================================");

    if (!response.ok) {
      throw {
        message: data?.message || "Request failed",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    console.log("🚨 API Error:", error);
    throw error;
  }
};
/** -----------------------------
 * EXISTING MPIN APIs
 * ----------------------------- */

export const createMpin = (mpin) =>
  postRequest("/create", { mpin });

export const verifyMpin = (enteredMpin) =>
  postRequest("/verify", { enteredMpin });

export const resetMpinWithOld = (oldMpin, newMpin) =>
  postRequest("/resetMpin", { oldMpin, newMpin });

export const resetMpinDirect = (oldMpin, newMpin) =>
  postRequest("/reset", { oldMpin, newMpin }, false);

/** -----------------------------
 * 🔑 FORGOT MPIN APIs
 * ----------------------------- */

/** Send OTP for Forgot MPIN */
export const sendForgotOtp = () =>
  postRequest("/forgot/send-otp");

/** Verify OTP & Reset MPIN */
export const verifyForgotOtp = (otp, newMpin) =>
  postRequest("/forgot/verify", { otp, newMpin });