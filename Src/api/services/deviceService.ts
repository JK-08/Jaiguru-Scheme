// Src/api/services/deviceService.ts
//
// Ported from the sendPushTokenToServer/generateDeviceId methods of
// Src/Services/PushNotificationService.js (the only two methods of that
// class still in use — register()/listen()/remove() were dead code,
// superseded by Src/Helpers/NotificationHelper.js's registration flow).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApi } from '../apiClient';
import { DEVICE } from '../endpoints';

const DEVICE_ID_KEY = 'deviceId';

const generateDeviceId = async (): Promise<string> => {
  const saved = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (saved) return saved;

  const newId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
};

export const deviceService = {
  /** POST /device/register — registers (or re-registers) this device's Expo push token. */
  registerDevice: async (expoToken: string, userId: string | number): Promise<boolean> => {
    try {
      const deviceId = await generateDeviceId();

      await callApi<Record<string, unknown>, unknown>({
        method: 'post',
        url: DEVICE.REGISTER,
        data: {
          deviceId,
          deviceType: 'mobile',
          expoToken,
          fcmToken: '',
          userId,
        },
      });

      return true;
    } catch (err) {
      console.error('❌ Token send failed:', err);
      return false;
    }
  },
};
