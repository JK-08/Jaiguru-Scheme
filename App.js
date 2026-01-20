import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  sendTestNotification
} from './Src/Helper/NotificationHelper'; // adjust path

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    const registerToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);
    };
    registerToken();

    const removeListeners = setupNotificationListeners();

    return () => {
      removeListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>
        Push & Local Notifications Demo
      </Text>
      <Text style={{ marginBottom: 30, fontSize: 14, textAlign: 'center' }}>
        Expo Push Token:{'\n'}
        {expoPushToken || 'Fetching...'}
      </Text>

      <Button
        title="Send Test Local Notification (in 5s)"
        onPress={() => {
          console.log('Triggering local notification...');
          sendTestNotification();
        }}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});