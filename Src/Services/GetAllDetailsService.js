// import { API_BASE_URL } from "../Config/BaseUrl";
import { getUserData } from "../Utills/AsynchStorageHelper"; // adjust path if needed

/**
 * Fetch account details using phone number from AsyncStorage
 */
export async function fetchAccountByPhone({ signal } = {}) {

  const API_BASE_URL=`https://scheme.bmgjewellers.com/v1/api`;
  const userData = await getUserData();

  if (!userData?.contactNumber && !userData?.mobile) {
    throw new Error("Phone number not found in user data");
  }

  const phoneNo = userData.contactNumber || userData.mobile;

  const url = `${API_BASE_URL}/account/phone_details?phoneNo=${phoneNo}`;

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
