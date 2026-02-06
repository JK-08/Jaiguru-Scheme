import {API_BASE_URL} from "../Config/BaseUrl"
/**
 * Fetch all schemes from API
 * @returns {Promise<Array>} Array of schemes
 */
export const fetchSchemes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/scheme`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching schemes:", error.message);
    throw error;
  }
};
