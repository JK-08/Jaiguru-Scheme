import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

// 1️⃣ Handle notifications in foreground (Expo SDK latest)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // Show banner in foreground
    shouldShowList: true,     // Show in notification list (Android)
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2️⃣ Register device and get Expo push token
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
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
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId,
    });
    token = tokenData.data;
  } catch (e) {
    console.warn('getExpoPushTokenAsync failed:', e);
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
  }

  console.log('✅ Expo Push Token:', token);

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

// 3️⃣ Setup listeners for notifications
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

// 4️⃣ Send local test notification
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
