import notifee, { EventType } from "@notifee/react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";

import { fetchNews } from "./data/News";
import { log, error, warn } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
// import { fetchLessons } from "./data/Lessons";
import { fetchAttendance } from "./data/Attendance";
import { fetchEvaluation } from "./data/Evaluation";

// Gestion des notifs quand app en arrière-plan
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  switch (type) {
    case EventType.ACTION_PRESS:
      console.log(`[Notifee] Action press: ${pressAction?.id}`);
      /*
      Ici on va gérer les redirections vers une page de l'app
      par exemple quand on clique sur une notification

      if (pressAction?.id === "open_lessons") {
        console.log("Open lessons screen");
      }
      */
      break;

    case EventType.DISMISSED:
      console.log(`[Notifee] Notification dismissed: ${notification?.id}`);
      break;

    default:
      console.log(`[Notifee] Background event type: ${type}`);
  }
});

let isBackgroundFetchRunning = false;

const backgroundFetch = async () => {
  if (isBackgroundFetchRunning) {
    log("⚠️ Background fetch already running. Skipping...", "BackgroundEvent");
    return BackgroundFetchResult.NoData;
  }

  isBackgroundFetchRunning = true;
  log("Running background fetch", "BackgroundEvent");

  try {
    const accounts = getAccounts();
    const switchTo = getSwitchToFunction();

    for (const account of accounts) {
      await switchTo(account);
      const notificationsTypesPermissions = account.personalization.notifications;

      if (notificationsTypesPermissions?.enabled) {
        await fetchNews();
        await fetchHomeworks();
        await fetchGrade();
        // await fetchLessons(); // Disabled for now
        await fetchAttendance();
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
  }
};

TaskManager.defineTask("background-fetch", backgroundFetch);

const unsetBackgroundFetch = async () => {
  await BackgroundFetch.unregisterTaskAsync("background-fetch");
  log("✅ Background task unregistered", "BackgroundEvent");
};

const registerBackgroundTasks = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    "background-fetch"
  );

  if (isRegistered) {
    warn(
      "⚠️ Background task already registered. Unregister background task...",
      "BackgroundEvent"
    );
    await unsetBackgroundFetch();
  }

  try {
    await BackgroundFetch.registerTaskAsync("background-fetch", {
      minimumInterval: 60 * 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    log("✅ Background task registered", "BackgroundEvent");
  } catch (err) {
    error(`❌ Failed to register background task: ${err}`, "BackgroundEvent");
  }
};

export { registerBackgroundTasks, unsetBackgroundFetch };
