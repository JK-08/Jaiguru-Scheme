import { getAuthToken } from '../Utills/AsynchStorageHelper';
import { MPIN_API_BASE_URL } from '../Config/BaseUrl';

const postRequest = async (endpoint, params = {}) => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authorization token not found');
  }

  // Build URL with query parameters
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `${MPIN_API_BASE_URL}${endpoint}?${queryString}`;
  
  console.log('API Request URL:', url);
  console.log('API Headers:', { Authorization: `Bearer ${token}` });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  console.log('API Response Status:', response.status);
  console.log('API Response Text:', text);

  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return text;
};

/** Create MPIN */
export const createMpin = (mpin) => {
  return postRequest('/create', { mpin });
};

/** Verify MPIN */
export const verifyMpin = (enteredMpin) => {
  return postRequest('/verify', { enteredMpin });
};

/** Reset MPIN with old MPIN */
export const resetMpinWithOld = (oldMpin, newMpin) => {
  return postRequest('/resetMpin', { oldMpin, newMpin });
};

/** Reset MPIN directly (no old MPIN) */
export const resetMpinDirect = (newMpin) => {
  return postRequest('/reset', { newMpin });
};