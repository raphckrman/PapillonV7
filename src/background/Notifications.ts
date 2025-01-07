import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import notifee, { Notification } from "@notifee/react-native";

const requestNotificationPermission = async () => {
  return expoGoWrapper(async () => {
    return await notifee.requestPermission();
  }, true);
};

const createChannelNotification = async () => {
  return await notifee.createChannel({
    id: "default",
    name: "Default Channel",
  });
};

const papillonNotify = async (props: Notification) => {
  return expoGoWrapper(async () => {
    // Required for iOS
    await requestNotificationPermission();

    // Channel, required for Android
    const channelId = await createChannelNotification();

    // Display a notification
    await notifee.displayNotification({
      ...props,
      android: {
        channelId,
      }
    });
  });
};

export {
  requestNotificationPermission,
  papillonNotify,
};
