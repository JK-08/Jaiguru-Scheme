import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  setupNotificationListeners,
  setupAndroidChannel,
} from './Src/Helpers/NotificationHelper';
import StackNavigator from './Src/Navigations/StackNavigator';
import useFonts from './Src/Utills/Fonts';
import { checkForAppUpdate } from './Src/Utills/VersionChecker';
import appLogo from './Src/Assets/Company/logo.png';
import { COLORS } from './Src/Utills/AppTheme';
import ErrorBoundary from './Src/Components/ErrorBoundary';
import { AppToastProvider } from './Src/Components/ui/appcomponents';
import NotificationBanner from './Src/Components/NotificationBanner/NotificationBanner';

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
        await setupAndroidChannel();
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppReady(true);
      }
    };

    initApp();
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  // Show loading until fonts are loaded and app is ready
  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={appLogo} style={styles.loadingLogo} resizeMode="contain" />
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingSpinner} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ErrorBoundary>
            <AppToastProvider>
              <StackNavigator />
            </AppToastProvider>
          </ErrorBoundary>
          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
      <NotificationBanner />
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
  loadingLogo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  loadingSpinner: {
    marginTop: 8,
  },
});
