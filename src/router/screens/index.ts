import welcome from "@/router/screens/welcome";
import login from "@/router/screens/login";
import views from "@/router/screens/views";
import createScreen from "../helpers/create-screen";

import { SettingsScreen } from "./settings/navigator";
import AccountScreen from "./account/stack";
import { Platform } from "react-native";

export default [
  ...welcome,
  ...login,
  ...views,

  createScreen("SettingStack", SettingsScreen, {
    headerShown: false,
    presentation: "modal",
    animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100
  }),

  createScreen("AccountStack", AccountScreen, {
    headerShown: false,
    gestureEnabled: false,
    animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100,
  }),
] as const;
