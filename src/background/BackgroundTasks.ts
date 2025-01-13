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
    ]);
  }

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

    console.log("[background fetch] Registered background fetch");
  });
};

const unsetBackgroundFetch = async () => {
  BackgroundFetch.unregisterTaskAsync("background-fetch");
  console.log("[background fetch] Unregistered background fetch");
};

export {
  registerBackgroundTasks,
  unsetBackgroundFetch,
};
