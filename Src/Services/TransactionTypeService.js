const TRANSACTION_API_URL = "https://scheme.jaigurujewellers.com/api/v1/account/getTranType";

/**
 * Fetch transaction types from API
 * @returns {Promise<Array>} Array of transaction types
 */
export const getTransactionTypes = async () => {
  try {
    const response = await fetch(TRANSACTION_API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch transaction types");
    }

    const data = await response.json();
    return data; // Returns array of transaction types
  } catch (error) {
    console.error("Error fetching transaction types:", error);
    throw error;
  }
};
