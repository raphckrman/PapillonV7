import notifee, { EventType } from "@notifee/react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";

import { fetchNews } from "./data/News";
import { log } from "@/utils/logger/logger";
import { getAccounts, getSwitchToFunction } from "./utils/accounts";
import { fetchHomeworks } from "./data/Homeworks";
import { fetchGrade } from "./data/Grades";
import { fetchLessons } from "./data/Lessons";
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

/**
 * Background fetch function that fetches all the data
 * @warning This task should not last more than 30 seconds
 * @returns BackgroundFetchResult.NewData
 */
const backgroundFetch = async () => {
  log("[background fetch]", "Running background fetch");

  const accounts = getAccounts();
  const switchTo = getSwitchToFunction();

  for (const account of accounts) {
    await switchTo(account);
    await Promise.all([
      fetchNews(),
      fetchHomeworks(),
      fetchGrade(),
      fetchLessons(),
      fetchAttendance(),
      fetchEvaluation(),
    ]);
  }

  log("[background fetch]", "Finish background fetch");
  return BackgroundFetchResult.NewData;
};

const registerBackgroundTasks = async () => {
  expoGoWrapper(async () => {
    TaskManager.defineTask("background-fetch", backgroundFetch);

    BackgroundFetch?.registerTaskAsync("background-fetch", {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });

    log("[background fetch]", "Registered background fetch");
  });
};

const unsetBackgroundFetch = async () => {
  BackgroundFetch.unregisterTaskAsync("background-fetch");
  log("[background fetch]", "Unregistered background fetch");
};

export {
  registerBackgroundTasks,
  unsetBackgroundFetch,
};
