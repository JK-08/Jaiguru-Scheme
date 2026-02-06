import { API_BASE_URL } from "../Config/BaseUrl";

/**
 * Fetch schemes for a given schemeId
 * @param {number|string} schemeId
 * @returns {Promise<Array>} Array of schemes
 */
export const getSchemesById = async (schemeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/schemeid?schemeId=${schemeId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch schemes");
    }

    const data = await response.json();
    return data; // Returns array of schemes
  } catch (error) {
    console.error("Error fetching schemes:", error);
    throw error;
  }
};

/**
 * Get amount for a single scheme group code
 * @param {number|string} schemeId
 * @param {string} groupCode
 * @returns {Promise<number|null>} Amount if found, otherwise null
 */
export const getSchemeAmount = async (schemeId, groupCode) => {
  const schemes = await getSchemesById(schemeId);
  const scheme = schemes.find((s) => s.GROUPCODE === groupCode);
  return scheme ? scheme.AMOUNT : null;
};
