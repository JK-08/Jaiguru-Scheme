import { API_BASE_URL } from "../Config/BaseUrl";

export const getCompanyDetails = async () => {
  try {
    const url = `${API_BASE_URL}/company/all`;
    console.log("Fetching company details from:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch company details");
    }

    const data = await response.json();
    return data; // <-- this is an ARRAY
  } catch (error) {
    console.error("Error in getCompanyDetails:", error);
    throw error;
  }
};
