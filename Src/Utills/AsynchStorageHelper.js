import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  IS_LOGGED_IN: 'isLoggedIn',
  HAS_MPIN: 'hasMpin',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE: 'appLanguage',
  FIRST_LAUNCH: 'firstLaunch',
};

/**
 * Normalizes all types of auth responses (Normal, Google, OTP)
 * This ensures consistent user data structure
 */
const normalizeAuthResponse = (response) => {
  if (!response) return null;

  // Extract token from various possible locations
  const token = response.token || response.accessToken || response.data?.token || null;
  
  if (!token) {
    console.log('No token found in response:', response);
    return null;
  }

  // Create consistent user object from all response types
  return {
    token,
    user: {
      // User identification
      userId: response.id || response.userId || response.data?.id,
      userid: response.id || response.userId || response.data?.id, // Both formats for compatibility
      
      // User info
      username: response.username || response.name || response.data?.username,
      email: response.email || response.data?.email,
      contactNumber: response.contactNumber || response.mobileNumber || response.phone || response.data?.contactNumber,
      
      // Referral info
      referralCode: response.referralCode || response.data?.referralCode,
      referralLink: response.referralLink || response.data?.referralLink,
      
      // App links
      playStoreLink: response.playStoreLink || response.data?.playStoreLink,
      
      // Social media info (for Google login)
      socialMedia: response.socialMedia || response.data?.socialMedia,
      
      // Profile picture (for Google login)
      picture: response.picture || response.avatar || response.data?.picture,
      
      // Metadata
      lastLogin: new Date().toISOString(),
      isActive: true,
      loginType: response.socialMedia || 'normal', // 'normal', 'GOOGLE', etc.
    },
  };
};

/**
 * Save auth data with consistent structure
 */
export const saveAuthData = async (apiResponse) => {
  try {
    console.log('=== SAVE AUTH DATA STARTED ===');
    console.log('Raw API Response:', JSON.stringify(apiResponse, null, 2));
    
    const normalized = normalizeAuthResponse(apiResponse);
    
    if (!normalized) {
      throw new Error('Invalid response format');
    }

    if (!normalized.token) {
      throw new Error('Authentication token is required');
    }

    // Ensure userId/userid is always present
    if (!normalized.user.userId) {
      console.warn('No userId found in response, checking for other IDs...');
      // Try to extract from response directly
      normalized.user.userId = apiResponse.id || apiResponse.userId;
      normalized.user.userid = apiResponse.id || apiResponse.userId;
    }

    // Clean user data (remove undefined/null values)
    const cleanUserData = Object.fromEntries(
      Object.entries(normalized.user).filter(([_, value]) => value != null)
    );

    console.log('Normalized user data:', cleanUserData);
    console.log('Token to save:', normalized.token.substring(0, 20) + '...');

    // Store all auth data
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, normalized.token],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(cleanUserData)],
      [STORAGE_KEYS.IS_LOGGED_IN, 'true'],
    ]);

    console.log('Auth data saved successfully');
    console.log('User ID stored:', cleanUserData.userId);
    console.log('Login type:', cleanUserData.loginType);
    
    return { success: true, user: cleanUserData };
  } catch (error) {
    console.error('saveAuthData error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get auth token
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
 * Get complete user data
 */
export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    
    const userData = JSON.parse(data);
    console.log('Retrieved user data:', {
      userId: userData.userId || userData.userid,
      username: userData.username,
      loginType: userData.loginType,
    });
    
    return userData;
  } catch (error) {
    console.error('getUserData error:', error);
    return null;
  }
};

/**
 * Get a specific user field
 */
export const getUserField = async (field) => {
  try {
    const userData = await getUserData();
    
    // Handle both userId and userid for compatibility
    if (field === 'userId' || field === 'userid') {
      return userData?.userId || userData?.userid || null;
    }
    
    return userData ? userData[field] ?? null : null;
  } catch (error) {
    console.error('getUserField error:', error);
    return null;
  }
};

/**
 * Get user ID (primary method)
 */
export const getUserId = async () => {
  try {
    const userData = await getUserData();
    const userId = userData?.userId || userData?.userid || null;
    console.log('Retrieved User ID:', userId);
    return userId;
  } catch (error) {
    console.error('getUserId error:', error);
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
    const [loggedIn, token] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
      getAuthToken(),
    ]);
    
    const isAuthenticated = loggedIn === 'true' && token !== null;
    console.log('isLoggedIn check:', { loggedIn, hasToken: !!token, isAuthenticated });
    
    return isAuthenticated;
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

    const session = {
      isAuthenticated: loggedIn === 'true' && token !== null,
      token,
      user: userData,
    };
    
    console.log('Auth session retrieved:', {
      isAuthenticated: session.isAuthenticated,
      userId: session.user?.userId || session.user?.userid,
      tokenExists: !!token,
    });
    
    return session;
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
 * Save MPIN status
 */
export const setMpinStatus = async (hasMpin) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_MPIN, hasMpin.toString());
    console.log('MPIN status saved:', hasMpin);
    return { success: true };
  } catch (error) {
    console.error('setMpinStatus error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get MPIN status
 */
export const getMpinStatus = async () => {
  try {
    const hasMpin = await AsyncStorage.getItem(STORAGE_KEYS.HAS_MPIN);
    return hasMpin === 'true';
  } catch (error) {
    console.error('getMpinStatus error:', error);
    return false;
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
 * Debug function to check all AsyncStorage contents
 */
export const debugAsyncStorage = async () => {
  try {
    console.log('=== DEBUG ASYNC STORAGE ===');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('Total keys:', allKeys.length);
    
    const multiData = await AsyncStorage.multiGet(allKeys);
    multiData.forEach(([key, value]) => {
      if (key === STORAGE_KEYS.USER_DATA && value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key}:`, {
            userId: parsed.userId || parsed.userid,
            username: parsed.username,
            email: parsed.email,
            loginType: parsed.loginType,
          });
        } catch (e) {
          console.log(`${key}:`, value);
        }
      } else if (key === STORAGE_KEYS.AUTH_TOKEN && value) {
        console.log(`${key}:`, value.substring(0, 20) + '...');
      } else {
        console.log(`${key}:`, value);
      }
    });
  } catch (error) {
    console.error('debugAsyncStorage error:', error);
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

// Export all functions
export default {
  saveAuthData,
  getAuthToken,
  getUserData,
  getUserField,
  getUserId,
  updateUserData,
  isLoggedIn,
  getAuthSession,
  setMpinStatus,
  getMpinStatus,
  clearAuthData,
  debugAsyncStorage,
  checkFirstLaunch,
  STORAGE_KEYS,
};