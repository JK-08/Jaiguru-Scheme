import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import PushNotificationService from "../Services/PushNotificationService";

const usePushNotifications = (userId) => {
  const navigation = useNavigation();
  const listenersRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const initPush = async () => {
      await PushNotificationService.register(userId);
      listenersRef.current =
        PushNotificationService.listen(navigation);
    };

    initPush();

    return () => {
      PushNotificationService.remove(listenersRef.current);
    };
  }, [userId]);

  return null;
};

export default usePushNotifications;