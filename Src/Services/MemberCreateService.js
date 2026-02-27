const BASE_URL = "https://scheme.jaigurujewellers.com/api/v1";

/**
 * Common POST API Handler (With Full Debug Logs)
 */
const postRequest = async (endpoint, payload) => {
  console.log("====================================");
  console.log("📤 API REQUEST");
  console.log("➡️ Endpoint:", `${BASE_URL}${endpoint}`);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));
  console.log("====================================");

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const contentType = response.headers.get("content-type");

    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    console.log("====================================");
    console.log("📥 API RESPONSE");
    console.log("✅ Status:", status);
    console.log("📄 Response Data:", responseData);
    console.log("====================================");

    if (!response.ok) {
      throw new Error(
        typeof responseData === "string"
          ? responseData
          : responseData?.message || "Request failed"
      );
    }

    return responseData;

  } catch (error) {
    console.log("====================================");
    console.log("❌ API ERROR");
    console.log("📍 Endpoint:", endpoint);
    console.log("💥 Error Message:", error.message);
    console.log("====================================");

    throw error;
  }
};

/**
 * Create Member API
 */
export const createMember = (payload) =>
  postRequest("/member/create", payload);

/**
 * Insert Installment API
 */
export const insertInstallment = (payload) =>
  postRequest("/account/insert", payload);