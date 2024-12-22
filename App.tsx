import Router from "@/router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox, AppState, AppStateStatus } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { log } from "@/utils/logger/logger";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";
import { atobPolyfill, btoaPolyfill } from "js-base64";

SplashScreen.preventAutoHideAsync();

const BACKGROUND_LIMITS: Record<AccountService | "DEFAULT", number> = {
  [AccountService.EcoleDirecte]: 300000, // 5 minutes
  [AccountService.Pronote]: 300000, // 5 minutes
  [AccountService.Skolengo]: 43200000, // 12 heures
  DEFAULT: 900000,
  // Obliger de mettre 0 pour les services non gérés pour éviter les erreurs de type
  [AccountService.Local]: 0,
  [AccountService.WebResto]: 0,
  [AccountService.Turboself]: 0,
  [AccountService.ARD]: 0,
  [AccountService.Parcoursup]: 0,
  [AccountService.Onisep]: 0,
  [AccountService.Multi]: 0,
  [AccountService.Izly]: 0,
  [AccountService.Alise]: 0
};

export default function App () {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const backgroundStartTime = useRef<number | null>(null);
  const hasHandledBackground = useRef<boolean>(false);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const currentAccount = useCurrentAccount((store) => store.account);

  const [fontsLoaded, fontError] = useFonts({
    light: require("./assets/fonts/FixelText-Light.ttf"),
    regular: require("./assets/fonts/FixelText-Regular.ttf"),
    medium: require("./assets/fonts/FixelText-Medium.ttf"),
    semibold: require("./assets/fonts/FixelText-SemiBold.ttf"),
    bold: require("./assets/fonts/FixelText-Bold.ttf"),
  });

  const getBackgroundTimeLimit = (service: AccountService | undefined): number => {
    if (!service) return BACKGROUND_LIMITS.DEFAULT;
    return BACKGROUND_LIMITS[service] || BACKGROUND_LIMITS.DEFAULT;
  };

  const handleBackgroundState = async () => {
    try {
      if (!backgroundStartTime.current) return;
      if (!currentAccount) {
        log("RefreshToken", "⚠️ No current account found");
        return;
      }

      const timeInBackground = Date.now() - backgroundStartTime.current;
      const timeLimit = getBackgroundTimeLimit(currentAccount.service);

      log(`Time in background: ${Math.floor(timeInBackground / 1000)}s`, "RefreshToken");
      log(`Time limit: ${timeLimit / 1000}s`, "RefreshToken");
      log(`Account type: ${currentAccount.service}`, "RefreshToken");
      log(`Account service time: ${BACKGROUND_LIMITS[currentAccount.service] / 1000}s`, "RefreshToken");

      if (timeInBackground >= timeLimit && !hasHandledBackground.current) {
        log("RefreshToken", `⚠️ Application in background for ${timeLimit / 60000} minutes!`);
        switchTo(currentAccount);

        await AsyncStorage.setItem("@background_timestamp", Date.now().toString());
        hasHandledBackground.current = true;
      }
    } catch (error) {
      log("AppState", `Error handling background state: ${error}`);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setAppState(prevState => {
      if (prevState === nextAppState) return prevState;

      if (nextAppState === "active") {
        log("AppState", "🔄 App is active");
        handleBackgroundState();
        backgroundStartTime.current = null;
        hasHandledBackground.current = false;
      } else if (nextAppState.match(/inactive|background/)) {
        log("AppState", "⏱️ App in background");
        backgroundStartTime.current = Date.now();
      }

      return nextAppState;
    });
  };

  const applyGlobalPolyfills = () => {
    const encoding = require("text-encoding");
    Object.assign(global, {
      TextDecoder: encoding.TextDecoder,
      TextEncoder: encoding.TextEncoder,
      atob: atobPolyfill,
      btoa: btoaPolyfill
    });
  };

  applyGlobalPolyfills();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    LogBox.ignoreLogs([
      "[react-native-gesture-handler]",
      "VirtualizedLists should never be nested",
      "TNodeChildrenRenderer: Support for defaultProps"
    ]);

    expoGoWrapper(async () => {
      const { registerBackgroundTasks } = await import("@/background/BackgroundTasks");
      registerBackgroundTasks();
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Router />;
}