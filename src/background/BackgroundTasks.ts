import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { isExpoGo } from "@/utils/native/expoGoAlert";

import { fetchNews } from "./data/News";
import { log, error, warn, info } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
import { fetchLessons } from "./data/Lessons";
import { fetchAttendance } from "./data/Attendance";
import { fetchEvaluation } from "./data/Evaluation";
import { papillonNotify } from "./Notifications";

const notifeeEvent = async () => {
  const notifee = (await import("@notifee/react-native")).default;
  const EventType = (await import("@notifee/react-native")).EventType;

  // Gestion des badges quand app en arrière-plan
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    switch (type) {
      case EventType.ACTION_PRESS:
        console.log(`[Notifee] Action press: ${pressAction?.id}`);

      case EventType.DISMISSED:
        let badgeCount = await notifee.getBadgeCount();
        badgeCount--;
        await notifee.setBadgeCount(badgeCount);
        break;
    }
  });

  // Gestion des badges quand app en premier plan
  notifee.onForegroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    switch (type) {
      case EventType.ACTION_PRESS:
        console.log(`[Notifee] Action press: ${pressAction?.id}`);

      case EventType.DISMISSED:
        let badgeCount = await notifee.getBadgeCount();
        badgeCount--;
        await notifee.setBadgeCount(badgeCount);
        break;
    }
  });
};

if (!isExpoGo()) notifeeEvent();

let isBackgroundFetchRunning = false;

const backgroundFetch = async () => {
  const notifee = (await import("@notifee/react-native")).default;

  if (isBackgroundFetchRunning) {
    warn("⚠️ Background fetch already running. Skipping...", "BackgroundEvent");
    return BackgroundFetchResult.NoData;
  }

  isBackgroundFetchRunning = true;
  await papillonNotify(
    {
      id: "statusBackground",
      body: "Récupération des données des comptes les plus récentes en arrière-plan...",
      android: {
        progress: {
          indeterminate: true,
        },
      },
    },
    "Status"
  );

  try {
    const accounts = getAccounts();
    const switchTo = getSwitchToFunction();

    for (const account of accounts) {
      await switchTo(account);
      const notificationsTypesPermissions =
        account.personalization.notifications;

      if (notificationsTypesPermissions?.enabled) {
        info("▶️ Running background News", "BackgroundEvent");
        await fetchNews();
        info("▶️ Running background Homeworks", "BackgroundEvent");
        await fetchHomeworks();
        info("▶️ Running background Grades", "BackgroundEvent");
        await fetchGrade();
        info("▶️ Running background Lessons", "BackgroundEvent");
        await fetchLessons();
        info("▶️ Running background Attendance", "BackgroundEvent");
        await fetchAttendance();
        info("▶️ Running background Evaluation", "BackgroundEvent");
        await fetchEvaluation();
      }
    }

    log("✅ Finish background fetch", "BackgroundEvent");
    return BackgroundFetchResult.NewData;
  } catch (ERRfatal) {
    error(`❌ Task failed: ${ERRfatal}`, "BackgroundEvent");
    return BackgroundFetchResult.Failed;
  } finally {
    isBackgroundFetchRunning = false;
    notifee.cancelNotification("statusBackground");
  }
};

if (!isExpoGo()) TaskManager.defineTask("background-fetch", backgroundFetch);

const unsetBackgroundFetch = async () =>
  await BackgroundFetch.unregisterTaskAsync("background-fetch");

const setBackgroundFetch = async () =>
  await BackgroundFetch.registerTaskAsync("background-fetch", {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });

const registerBackgroundTasks = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    "background-fetch"
  );

  if (isRegistered) {
    warn(
      "⚠️ Background task already registered. Unregister background task...",
      "BackgroundEvent"
    );
    await unsetBackgroundFetch()
      .then(() => log("✅ Background task unregistered", "BackgroundEvent"))
      .catch((ERRfatal) =>
        error(
          `❌ Failed to unregister background task: ${ERRfatal}`,
          "BackgroundEvent"
        )
      );
  }

  await setBackgroundFetch()
    .then(() => log("✅ Background task registered", "BackgroundEvent"))
    .catch((ERRfatal) =>
      error(
        `❌ Failed to register background task: ${ERRfatal}`,
        "BackgroundEvent"
      )
    );
};

export { registerBackgroundTasks, unsetBackgroundFetch };
