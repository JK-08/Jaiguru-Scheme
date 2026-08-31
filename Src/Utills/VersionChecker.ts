import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export const isVersionLower = (current: string, target: string): boolean => {
  const c = current.split('.').map(Number);
  const t = target.split('.').map(Number);
  for (let i = 0; i < t.length; i++) {
    if ((c[i] || 0) < t[i]) return true;
    if ((c[i] || 0) > t[i]) return false;
  }
  return false;
};

export interface ForceUpdateInfo {
  required: boolean;
  currentVersion: string;
  latestVersion?: string;
  storeUrl?: string | null;
}

// Silently applies same-binary JS (OTA) updates in the background. Does not
// gate rendering — a store-version update is handled separately via
// getForceUpdateInfo, which blocks the app until the user updates.
export const applyOTAUpdateIfAvailable = async (): Promise<void> => {
  try {
    if (!__DEV__ && Updates.isEnabled) {
      const otaUpdate = await Updates.checkForUpdateAsync();
      if (otaUpdate.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    }
  } catch (error: any) {
    console.log('OTA update check failed:', error.message || error);
  }
};

// Compares the installed native version against the app-config response and
// reports whether a mandatory update is required. Every available update is
// treated as compulsory — callers must block the app (e.g. ForceUpdateScreen)
// until the user updates. Skipped in development builds so local/dev-client
// builds (which are typically behind the published store version) never get
// blocked.
export const getForceUpdateInfo = async (config: any): Promise<ForceUpdateInfo> => {
  const currentVersion = (Application.nativeApplicationVersion as string) || '0';

  if (__DEV__) {
    return { required: false, currentVersion };
  }

  const latestVersion: string | undefined = config?.VERSION;
  const storeUrl: string | null =
    Platform.OS === 'ios' ? config?.APPSTORE_URL ?? null : config?.STORE_URL ?? null;

  if (!latestVersion) {
    return { required: false, currentVersion };
  }

  return {
    required: isVersionLower(currentVersion, latestVersion),
    currentVersion,
    latestVersion,
    storeUrl,
  };
};
