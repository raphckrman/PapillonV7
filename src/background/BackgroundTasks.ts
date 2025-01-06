import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BackgroundFetchResult } from "expo-background-fetch";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import { useAccounts, useCurrentAccount } from "@/stores/account";

import { fetchNews } from "./data/News";
import {PrimaryAccount} from "@/stores/account/types";
import { log } from "@/utils/logger/logger";

const getAccounts = () => {
  return useAccounts.getState().accounts.filter((account) => !account.isExternal);
};

const getSwitchToFunction = () => {
  return useCurrentAccount.getState().switchTo;
};


/**
 * Background fetch function that fetches all the data
 * @warning This task should not last more than 30 seconds
 * @returns BackgroundFetchResult.NewData
 */
const backgroundFetch = async () => {
  log("[background fetch]", "Running background fetch");

  const accounts = getAccounts() as PrimaryAccount[];
  const switchTo = getSwitchToFunction();

  for (const account of accounts) {
    await switchTo(account);
    await fetchNews();
  }

  return BackgroundFetchResult.NewData;
};

const registerBackgroundTasks = async () => {
  expoGoWrapper(async () => {
    TaskManager.defineTask("background-fetch", backgroundFetch);

    BackgroundFetch?.registerTaskAsync("background-fetch", {
      minimumInterval: 60, // 15 minutes
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });

    backgroundFetch();

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
