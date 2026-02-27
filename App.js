import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  setupNotificationListeners,
} from './Src/Helpers/NotificationHelper';
import StackNavigator from './Src/Navigations/StackNavigator';
import useFonts from './Src/Utills/Fonts';
import { checkForAppUpdate } from './Src/Utills/VersionChecker';

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // ✅ LOAD FONTS
  const fontsLoaded = useFonts();

  useEffect(() => {
    checkForAppUpdate();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        // ✅ Only setup listeners, don't register for token
        setupNotificationListeners();
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppReady(true);
      }
    };

    initApp();
  }, []);

  // Show loading until fonts are loaded and app is ready
  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StackNavigator />
          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});