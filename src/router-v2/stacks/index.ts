import Account from "./AccountStack";
import Settings from "./SettingsStack";
import Welcome from "./WelcomeStack";
// import Login from "./LoginStack";
import Views from "./ViewsStack";
import createScreen from "../helpers/create-screen";

export default [
  createScreen("AccountStack", Account, {
    headerShown: false,
    gestureEnabled: false,
    // animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100,
  }),

  createScreen("SettingStack", Settings, {
    headerShown: false,
    presentation: "modal",
    // animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100
  }),

  createScreen("WelcomeStack", Welcome, {
    headerShown: false,
    gestureEnabled: false,
    // animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100,
  }),

  // createScreen("LoginStack", Account, {
  //   headerShown: false,
  //   gestureEnabled: false,
  //   // animation: Platform.OS === "android" ? "slide_from_right" : "default",
  //   animationDuration: 100,
  // }),

  createScreen("ViewsStack", Views, {
    headerShown: false,
    gestureEnabled: false,
    // animation: Platform.OS === "android" ? "slide_from_right" : "default",
    animationDuration: 100,
  }),
] as const;
