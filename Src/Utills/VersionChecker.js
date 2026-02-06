import * as Application from "expo-application";
import * as Updates from "expo-updates";
import { Alert, Linking, Platform } from "react-native";

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

    /* ----------------------------------
       1️⃣ OTA UPDATE (ONLY IN PROD)
    ----------------------------------- */
    if (!__DEV__ && Updates.isEnabled) {
      const otaUpdate = await Updates.checkForUpdateAsync();
      if (otaUpdate.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return;
      }
    }

    /* ----------------------------------
       2️⃣ PLAY STORE VERSION CHECK
    ----------------------------------- */
    const response = await fetch(
  "https://raw.githubusercontent.com/jk-08/app-config/main/app-version.json"
);

const text = await response.text();
console.log("Version config response:", text);

// 🚨 Guard against non-JSON
if (!response.ok) {
  throw new Error("Failed to fetch version config");
}

let config;
try {
  config = JSON.parse(text);
} catch (e) {
  throw new Error("Invalid JSON in app-version.json");
}

    // const config = await response.json();

    if (Platform.OS === "android") {
      const {
        latestVersion,
        minSupportedVersion,
        playStoreUrl
      } = config.android;

      // 🚨 FORCE UPDATE
      if (isVersionLower(localVersion, minSupportedVersion)) {
        Alert.alert(
          "Update Required 🚨",
          "Please update the app to continue using Jaiguru DigiGold.",
          [
            {
              text: "Update Now",
              onPress: () => Linking.openURL(playStoreUrl)
            }
          ],
          { cancelable: false }
        );
        return;
      }

      // 🚀 OPTIONAL UPDATE
      if (isVersionLower(localVersion, latestVersion)) {
        Alert.alert(
          "Update Available 🚀",
          "A newer version is available for a better experience.",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Update",
              onPress: () => Linking.openURL(playStoreUrl)
            }
          ]
        );
      }
    }
  } catch (error) {
    console.log("Version check failed:", error);
  }
};
