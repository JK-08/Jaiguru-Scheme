import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from './Src/Helpers/NotificationHelper';

import StackNavigator from './Src/Navigations/StackNavigator';
import useFonts from './Src/Utills/Fonts';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);

  // ✅ LOAD FONTS
  const fontsLoaded = useFonts();

  useEffect(() => {
    const registerToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.log('Expo Push Token:', token);
      }
    };

    registerToken();
    const removeListeners = setupNotificationListeners();

    return () => {
      removeListeners();
    };
  }, []);

  // ⛔ Wait until fonts are loaded
  if (!fontsLoaded) {
    return null; // or <ActivityIndicator />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StackNavigator />
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
