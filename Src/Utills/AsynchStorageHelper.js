import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE: 'appLanguage',
  FIRST_LAUNCH: 'firstLaunch',
};

/**
 * Normalizes API response (Normal OTP / Google OTP)
 */
const normalizeAuthResponse = (response) => {
  if (!response) return null;

  // Extract all possible fields
  const token = response.token || response.accessToken || response.data?.token || null;
  
  if (!token) {
    console.log('No token found in response:', response);
    return null;
  }

  return {
    token,
    user: {
      id: response.id || response.userId || response.data?.id,
      username: response.username || response.name || response.data?.username,
      email: response.email || response.data?.email,
      contactNumber: response.contactNumber || response.mobileNumber || response.data?.contactNumber,
      referralCode: response.referralCode || response.data?.referralCode,
      referralLink: response.referralLink || response.data?.referralLink,
      walletBalance: response.walletBalance || response.data?.walletBalance || 0,
      playStoreLink: response.playStoreLink || response.data?.playStoreLink,
      socialMedia: response.socialMedia || response.data?.socialMedia,
      picture: response.picture || response.avatar || response.data?.picture,
      // Metadata
      lastLogin: new Date().toISOString(),
      isActive: true,
    },
  };
};

/**
 * Save auth data globally
 */
export const saveAuthData = async (apiResponse) => {
  try {
    const normalized = normalizeAuthResponse(apiResponse);
    
    if (!normalized) {
      throw new Error('Invalid response format');
    }

    if (!normalized.token) {
      throw new Error('Authentication token is required');
    }

    // Clean user data (remove undefined/null values)
    const cleanUserData = Object.fromEntries(
      Object.entries(normalized.user).filter(([_, value]) => value != null)
    );

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, normalized.token],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(cleanUserData)],
      [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
    ]);

    console.log('Auth data saved successfully');
    return { success: true, user: cleanUserData };
  } catch (error) {
    console.error('saveAuthData error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get auth token anywhere in app
 */
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  } catch (error) {
    console.error('getAuthToken error:', error);
    return null;
  }
};

/**
 * Get logged-in user data
 */
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('getUserData error:', error);
    return null;
  }
};

/**
 * Update specific user fields
 */
export const updateUserData = async (updates) => {
  try {
    const currentData = await getUserData();
    if (!currentData) {
      throw new Error('No user data found');
    }

    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedData));
    return { success: true, data: updatedData };
  } catch (error) {
    console.error('updateUserData error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  try {
    const loggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    const token = await getAuthToken();
    return loggedIn === 'true' && token !== null;
  } catch (error) {
    console.error('isLoggedIn error:', error);
    return false;
  }
};

/**
 * Get complete auth session
 */
export const getAuthSession = async () => {
  try {
    const [token, userData, loggedIn] = await Promise.all([
      getAuthToken(),
      getUserData(),
      AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
    ]);

    return {
      isAuthenticated: loggedIn === 'true' && token !== null,
      token,
      user: userData,
    };
  } catch (error) {
    console.error('getAuthSession error:', error);
    return {
      isAuthenticated: false,
      token: null,
      user: null,
    };
  }
};

/**
 * Logout (clear everything)
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);
    
    console.log('Auth data cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('clearAuthData error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if it's first app launch
 */
export const checkFirstLaunch = async () => {
  try {
    const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    if (firstLaunch === null) {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      return true;
    }
    return false;
  } catch (error) {
    console.error('checkFirstLaunch error:', error);
    return true;
  }
};

/**
 * Save app settings
 */
export const saveAppSettings = async (settings) => {
  try {
    await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    console.error('saveAppSettings error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get app settings
 */
export const getAppSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('appSettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('getAppSettings error:', error);
    return null;
  }
};

// Export all functions
export default {
  saveAuthData,
  getAuthToken,
  getUserData,
  updateUserData,
  isLoggedIn,
  getAuthSession,
  clearAuthData,
  checkFirstLaunch,
  saveAppSettings,
  getAppSettings,
  STORAGE_KEYS,
};