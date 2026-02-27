/* =========================
   VERIFY OTP (COMMON)
========================= */
export const verifyOtp = ({ contactNumber, otp, newPassword }) => {
  const queryParams = new URLSearchParams({
    contactNumber,
    otp,
    ...(newPassword && { newPassword }),
  }).toString();

  const url = `${API_BASE_URL}/user/verify-otp?${queryParams}`;

  return apiRequest(url, {
    method: "POST",
  });
};