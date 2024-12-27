import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "@/views/welcome/FirstInstallation";
import AccountSelector from "@/views/welcome/AccountSelector";

const Stack = createNativeStackNavigator();

const WelcomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="AccountSelector">
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountSelector"
        component={AccountSelector}
        options={{ headerTitle: "Choix du Compte" }}
      />
    </Stack.Navigator>
  );
};

export default WelcomeStack;
