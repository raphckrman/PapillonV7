import React, { useLayoutEffect } from "react";
import { View } from "react-native";
import screens from ".";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Screen } from "@/router/helpers/types";
import PapillonTabNavigator from "@/router/navigator/navigator";
import * as SplashScreen from "expo-splash-screen";

const AccountStack = PapillonTabNavigator();

const screenOptions: NativeStackNavigationOptions = {
  headerBackTitleStyle: { fontFamily: "medium" },
  headerTitleStyle: { fontFamily: "semibold" },
  headerBackTitle: "Retour",
  tabBarStyle: { position: "absolute" }, // `tabBarStyle` typing is fine; TS ignore not needed
};

const TabBarContainer = () => <View />;

const AccountStackScreen: Screen<"AccountStack"> = () => {
  useLayoutEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AccountStack.Navigator screenOptions={screenOptions} tabBar={TabBarContainer}>
      {screens.map(({ name, component, options }) => (
        <AccountStack.Screen key={name} name={name} component={component} options={options} />
      ))}
    </AccountStack.Navigator>
  );
};

export default AccountStackScreen;