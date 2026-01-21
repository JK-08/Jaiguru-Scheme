import {API_BASE_URL} from '../Config/BaseUrl';

export const fetchOnboardBanners = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/schemebanner/all`,
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
    return json?.banners || [];
  } catch (error) {
    console.error('Fetch Onboard Banners Error:', error);
    throw error;
  }
};
