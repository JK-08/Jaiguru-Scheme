// services/loginCheckService.js

import { API_BASE_URL } from '../Config/BaseUrl';

// 🔹 Register User
export const registerUser = async (username, mobileNumber) => {
  try {
    const payload = { username, mobileNumber };
    console.log('registerUser payload:', payload);

    const response = await fetch(
      `${API_BASE_URL}/logincheck/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await response.json();
    console.log('registerUser response:', response.status, json);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return json;
  } catch (error) {
    console.error('Register User Error:', error);
    throw error;
  }
};

// 🔹 Get Users List
export const getUsersList = async (
  mobileNumber,
  fromDate,
  toDate
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/logincheck/list?mobileNumber=${mobileNumber}&fromDate=${fromDate}&toDate=${toDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json?.data || [];
  } catch (error) {
    console.error('Get Users List Error:', error);
    throw error;
  }
};