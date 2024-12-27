import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Settings from "@/views/settings/Settings";
import Notifications from "@/views/settings/SettingsNotifications";

const Stack = createNativeStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name="Settings" component={Settings} options={{ headerTitle: "Paramètres" }} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ headerTitle: "Notifications" }} />
    </Stack.Navigator>
  );
};

export default SettingsStack;
