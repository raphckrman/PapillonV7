import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "@/views/account/Home/Home";
import Lessons from "@/views/account/Lessons/Lessons";
import Grades from "@/views/account/Grades/Grades";

const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={{ headerTitle: "Accueil" }} />
      <Stack.Screen name="Lessons" component={Lessons} options={{ headerTitle: "Cours" }} />
      <Stack.Screen name="Grades" component={Grades} options={{ headerTitle: "Notes" }} />
    </Stack.Navigator>
  );
};

export default AccountStack;
