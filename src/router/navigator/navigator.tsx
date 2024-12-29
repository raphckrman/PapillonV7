import { BottomTabView } from "@react-navigation/bottom-tabs";
import { createNavigatorFactory, TabRouter, useNavigationBuilder } from "@react-navigation/native";
import PapillonNavigatorTabs from "./tabs";
import { useEffect } from "react";

const BottomTabNavigator: React.ComponentType<any> = ({
  initialRouteName,
  backBehavior,
  children,
  screenOptions,
  ...rest
}) => {

  const {
    state,
    descriptors,
    navigation,
    NavigationContent
  } = useNavigationBuilder(TabRouter, {
    initialRouteName,
    backBehavior,
    children,
    screenOptions,
  });

  return (
    <NavigationContent>
      <BottomTabView
        {...rest}
        state={state}
        navigation={navigation}
        descriptors={descriptors}
      />

      <PapillonNavigatorTabs
        state={state}
        descriptors={descriptors}
        navigation={navigation}
      />
    </NavigationContent>
  );
};

export default createNavigatorFactory(BottomTabNavigator);