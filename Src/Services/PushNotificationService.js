import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { API_BASE_URL } from "../Config/BaseUrl";

/* =====================================================
   ANDROID CHANNEL
===================================================== */
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default Notifications",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

/* =====================================================
   FOREGROUND HANDLER
===================================================== */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  /* ==============================
     Generate Device ID
  ============================== */
  async generateDeviceId() {
    const saved = await AsyncStorage.getItem("deviceId");
    if (saved) return saved;

    const newId = `dev-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    await AsyncStorage.setItem("deviceId", newId);
    return newId;
  }

  /* ==============================
     Send Token To Backend
  ============================== */
async sendPushTokenToServer(expoToken, userId) {
  try {
    const deviceId = await this.generateDeviceId();

    const payload = {
      deviceId,
      deviceType: "mobile",
      expoToken,
      fcmToken: "",
      userId,
    };

    const res = await fetch(`${API_BASE_URL}/device/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.text();

    if (!res.ok) {
      console.error("❌ Backend error:", data);
      return false;
    }

    console.log("✅ Token registered successfully:", data);
    return true;
  } catch (err) {
    console.error("❌ Token send failed:", err);
    return false;
  }
}

  /* ==============================
     Register For Push (Optional - kept for compatibility)
  ============================== */
  async register(userId) {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } =
          await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Notifications Disabled",
          "Enable notifications to receive updates."
        );
        return null;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.error("❌ Expo projectId missing");
        return null;
      }

      const tokenResponse =
        await Notifications.getExpoPushTokenAsync({
          projectId,
        });

      const expoToken = tokenResponse.data;

      console.log("📨 Expo Push Token:", expoToken);

      if (userId) {
        await this.sendPushTokenToServer(expoToken, userId);
      }

      return expoToken;
    } catch (error) {
      console.error("❌ Push registration error:", error);
      return null;
    }
  }

  /* ==============================
     Listen For Notifications
  ============================== */
  listen(navigation) {
    const notificationListener =
      Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "📦 Notification Received:",
            notification.request.content
          );
        }
      );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data =
            response.notification.request.content.data;

          console.log("🖱 Notification tapped:", data);

          if (data?.type === "payment") {
            navigation?.navigate("Payments");
          }

          if (data?.type === "rate_update") {
            navigation?.navigate("Rates");
          }
        }
      );

    return { notificationListener, responseListener };
  }

  /* ==============================
     Remove Listeners
  ============================== */
  remove(listeners) {
    if (listeners?.notificationListener) {
      Notifications.removeNotificationSubscription(
        listeners.notificationListener
      );
    }

    if (listeners?.responseListener) {
      Notifications.removeNotificationSubscription(
        listeners.responseListener
      );
    }
  }
}

export default new PushNotificationService();