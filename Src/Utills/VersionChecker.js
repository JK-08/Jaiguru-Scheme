import * as Application from "expo-application";
import * as Updates from "expo-updates";
import { Alert, Linking, Platform } from "react-native";

/**
 * Compare semantic versions (e.g. 1.1.1)
 * Returns true if current < target
 */
const isVersionLower = (current, target) => {
  const c = current.split(".").map(Number);
  const t = target.split(".").map(Number);

  for (let i = 0; i < t.length; i++) {
    if ((c[i] || 0) < t[i]) return true;
    if ((c[i] || 0) > t[i]) return false;
  }
  return false;
};

export const checkForAppUpdate = async () => {
  try {
    const localVersion = Application.nativeApplicationVersion;
    console.log("Installed version:", localVersion);

    /* ----------------------------------
       1️⃣ OTA UPDATE (ONLY IN PROD)
    ----------------------------------- */
    if (!__DEV__ && Updates.isEnabled) {
      const otaUpdate = await Updates.checkForUpdateAsync();
      if (otaUpdate.isAvailable) {
        console.log("OTA update available, fetching...");
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return;
      }
    }

    /* ----------------------------------
       2️⃣ PLAY STORE VERSION CHECK
    ----------------------------------- */
    const response = await fetch(
      "https://raw.githubusercontent.com/JK-08/Jaiguru-Scheme/Dev/app-version.json?ts=" +
        Date.now()
    );

    if (!response.ok) {
      throw new Error("Failed to fetch version config");
    }

    const text = await response.text();
    console.log("Version config response:", text);

    let config;
    try {
      config = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON in app-version.json");
    }

    if (Platform.OS === "android") {
      const { latestVersion, minSupportedVersion, playStoreUrl } = config.android;
      console.log("Latest version:", latestVersion, "Min supported:", minSupportedVersion);

      // 🚨 FORCE UPDATE
      if (isVersionLower(localVersion, minSupportedVersion)) {
        Alert.alert(
          "Update Required 🚨",
          `Your version (${localVersion}) is no longer supported.\nPlease update to version ${minSupportedVersion} or higher to continue using Jaiguru DigiGold.`,
          [
            {
              text: "Update",
              onPress: () => Linking.openURL(playStoreUrl),
            },
          ],
          { cancelable: false } // User cannot dismiss
        );
        return;
      }

      // ✨ OPTIONAL UPDATE
      if (isVersionLower(localVersion, latestVersion)) {
        Alert.alert(
          "New Version Available ✨",
          `A new version (${latestVersion}) is available.\nYou're using ${localVersion}.`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "Update",
              onPress: () => Linking.openURL(playStoreUrl),
            },
          ]
        );
        return;
      }

      // ✅ App is up to date
      console.log("App is up to date. Installed:", localVersion);
    }
  } catch (error) {
    console.log("Version check failed:", error.message || error);
  }
};
