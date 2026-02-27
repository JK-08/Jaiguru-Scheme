import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1️⃣ Handle notifications in foreground (Expo SDK latest)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // Show banner in foreground
    shouldShowList: true,     // Show in notification list (Android)
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Store token in AsyncStorage to avoid re-registering
const STORAGE_KEYS = {
  PUSH_TOKEN: 'pushToken',
  TOKEN_SENT: 'tokenSentToServer'
};

// 2️⃣ Check if we already have a token
export async function getStoredPushToken() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error('Error reading stored token:', error);
    return null;
  }
}

// 3️⃣ Check if token was already sent to server
export async function wasTokenSent() {
  try {
    const sent = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_SENT);
    return sent === 'true';
  } catch (error) {
    console.error('Error checking token sent status:', error);
    return false;
  }
}

// 4️⃣ Mark token as sent
export async function markTokenAsSent() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_SENT, 'true');
  } catch (error) {
    console.error('Error marking token as sent:', error);
  }
}

// 5️⃣ Register for push token (call this from Home screen)
export async function registerForPushNotificationsAsync(userId) {
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
  }

  // First check if we already have a token stored
  const existingToken = await getStoredPushToken();
  if (existingToken) {
    console.log('📱 Using existing push token:', existingToken);
    
    // Check if we need to send this token to server
    const tokenSent = await wasTokenSent();
    if (!tokenSent && userId) {
      // Token exists but wasn't sent to server, send it now
      return existingToken;
    }
    return existingToken;
  }

  if (!Device.isDevice) {
    console.log('Running on emulator/simulator — push may not work fully');
  }

  let { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    finalStatus = status;
  }

  if (Platform.OS === 'android' && finalStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Failed to get permission for notifications');
    return null;
  }

  let token;
  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('No projectId found, trying without');
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } else {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      token = tokenData.data;
    }
  } catch (e) {
    console.warn('getExpoPushTokenAsync failed:', e);
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } catch (error) {
      console.error('Failed to get token even without projectId:', error);
      return null;
    }
  }

  console.log('✅ New Expo Push Token generated:', token);
  
  // Store the token
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    // Reset sent status for new token
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_SENT, 'false');
  } catch (error) {
    console.error('Error storing token:', error);
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// 6️⃣ Setup listeners for notifications
export function setupNotificationListeners() {
  const subscriptionReceived = Notifications.addNotificationReceivedListener(notification => {
    console.log('📩 Notification received in foreground:', notification);

    // Optional: show native alert while app is open
    Alert.alert(
      notification.request.content.title || 'Notification',
      notification.request.content.body || ''
    );
  });

  const subscriptionResponse = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    // Handle deep linking / navigation here
  });

  return () => {
    subscriptionReceived.remove();
    subscriptionResponse.remove();
  };
}

// 7️⃣ Send local test notification
export async function sendTestNotification() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Notifications permission not granted!');
    return;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚀 Test Notification',
        body: 'This is a local notification — should appear in 5 seconds!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { test: '123' },
      },
      trigger: {
        type: 'time',
        seconds: 5,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });

    console.log('📝 Local notification scheduled with ID:', id);
  } catch (err) {
    console.error('Failed to schedule notification:', err);
  }
}