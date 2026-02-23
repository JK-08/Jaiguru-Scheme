// import { API_BASE_URL } from "../Config/BaseUrl";
import { getUserData } from "../Utills/AsynchStorageHelper"; // adjust path if needed
import { API_BASE_URL } from "../Config/BaseUrl";

/**
 * Fetch account details using phone number from AsyncStorage
 */

const BASE_URL = "https://scheme.bmgjewellers.com/v1/api"; // Ensure this is defined in your Config/BaseUrl.js
export async function fetchAccountByPhone({ signal } = {}) {

  const userData = await getUserData();

  if (!userData?.contactNumber && !userData?.mobile) {
    throw new Error("Phone number not found in user data");
  }

  const phoneNo = userData.contactNumber || userData.mobile;

  const url = `${BASE_URL}/account/phone_details?phoneNo=${phoneNo}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch account details (${response.status}): ${text}`
    );
  }

  const data = await response.json();

  // API returns an array
  return Array.isArray(data) ? data : [];
}
