import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Alert, Linking, Platform } from 'react-native';
import { API_BASE_URL } from '../Config/BaseUrl';

const isVersionLower = (current: string, target: string): boolean => {
  const c = current.split('.').map(Number);
  const t = target.split('.').map(Number);
  for (let i = 0; i < t.length; i++) {
    if ((c[i] || 0) < t[i]) return true;
    if ((c[i] || 0) > t[i]) return false;
  }
  return false;
};

export const checkForAppUpdate = async (): Promise<void> => {
  try {
    const localVersion = Application.nativeApplicationVersion as string;
    console.log('Installed version:', localVersion);

    // OTA update (production only)
    if (!__DEV__ && Updates.isEnabled) {
      const otaUpdate = await Updates.checkForUpdateAsync();
      if (otaUpdate.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return;
      }
    }

    const response = await fetch(`${API_BASE_URL}/app-config/all`);
    if (!response.ok) throw new Error('Failed to fetch app config');

    const data: any[] = await response.json();
    const config = data?.[0];
    if (!config) throw new Error('Empty app config response');

    console.log('App config:', config);

    // Maintenance is handled in App.tsx before the navigator loads.
    // Only check for version update here.
    const latestVersion: string = config.VERSION;
    const storeUrl: string | null =
      Platform.OS === 'ios' ? config.APPSTORE_URL ?? null : config.STORE_URL ?? null;

    console.log('Latest version:', latestVersion, '| Store URL:', storeUrl);

    if (isVersionLower(localVersion, latestVersion)) {
      if (!storeUrl) {
        Alert.alert(
          'New Version Available ✨',
          `A new version (${latestVersion}) is available.
Please update the app from the store.`,
          [{ text: 'OK' }]
        );
        return;
      }
      Alert.alert(
        'New Version Available ✨',
        `A new version (${latestVersion}) is available.
You're using ${localVersion}.`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Update', onPress: () => Linking.openURL(storeUrl) },
        ]
      );
    } else {
      console.log('App is up to date. Installed:', localVersion);
    }
  } catch (error: any) {
    console.log('Version check failed:', error.message || error);
  }
};
