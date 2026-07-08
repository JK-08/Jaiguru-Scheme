import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { notificationEmitter } from '../Components/NotificationBanner/NotificationBanner';

const FCM_TOKEN_KEY = 'fcmToken';

// ─── Permission ───────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  // Android 13+ requires explicit POST_NOTIFICATIONS permission
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

// ─── Token ────────────────────────────────────────────────────────────────────
export async function getFCMToken(): Promise<string | null> {
  try {
    // Always request permission first (shows dialog if not yet asked)
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const stored = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (stored) return stored;

    const token = await messaging().getToken();
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    console.log('✅ FCM Token:', token);
    return token;
  } catch (error) {
    console.error('getFCMToken error:', error);
    return null;
  }
}

export async function clearFCMToken(): Promise<void> {
  await AsyncStorage.removeItem(FCM_TOKEN_KEY);
}

// ─── Android notification channel ─────────────────────────────────────────────
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#023c69',
    sound: 'default',
  });
}

// ─── Listeners ────────────────────────────────────────────────────────────────
export function setupNotificationListeners(): () => void {
  // Foreground message
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('📩 FCM foreground message:', remoteMessage);
    notificationEmitter.emit('show', {
      title: remoteMessage.notification?.title ?? 'Notification',
      body: remoteMessage.notification?.body ?? '',
      imageUrl: remoteMessage.notification?.android?.imageUrl,
    });
  });

  // Token refresh
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
    console.log('🔄 FCM token refreshed:', token);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}

// ─── Background / Quit handler (call once at module level in index.ts) ────────
export function setupBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📦 FCM background message:', remoteMessage);
  });
}
