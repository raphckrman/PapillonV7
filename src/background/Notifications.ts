import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import notifee, {
  AuthorizationStatus,
  Notification,
} from "@notifee/react-native";
import { Platform } from "react-native";

const requestNotificationPermission = async () => {
  const settings = await notifee.requestPermission();
  if (Platform.OS === "ios") {
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      return true;
    }
    return false;
  } else {
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      return true;
    }
    return false;
  }
};

const createChannelNotification = async () => {
  await notifee.createChannelGroup({
    id: "Papillon",
    name: "Notifications Scolaires",
    description: "Permet de ne rien rater de ta vie scolaire",
  });

  await notifee.createChannel({
    id: "News",
    groupId: "Papillon",
    name: "Actualités",
    description: "Te notifie lorsque tu as de nouvelles actualités",
    sound: "default",
  });

  await notifee.createChannel({
    id: "Homeworks",
    groupId: "Papillon",
    name: "Nouveau Devoir",
    description: "Te notifie lorsque tu as de nouveaux devoirs",
    sound: "default",
  });
};

const papillonNotify = async (
  props: Notification,
  channelId: "News" | "Homeworks"
) => {
  return expoGoWrapper(async () => {
    const statut = await requestNotificationPermission();
    if (statut) {
      // Add timestamp for Android
      const timestamp = new Date().getTime();

      // Display a notification
      await notifee.displayNotification({
        ...props,
        android: {
          channelId,
          timestamp,
          showTimestamp: true,
          smallIcon: "@mipmap/ic_launcher_foreground",
          color: "#32AB8E",
        },
      });
    }
  });
};

export {
  requestNotificationPermission,
  createChannelNotification,
  papillonNotify,
};
