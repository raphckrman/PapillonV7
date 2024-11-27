import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import type { Screen, RouteParameters } from "@/router/helpers/types";

export const navigatorScreenOptions: NativeStackNavigationOptions = {
  headerBackTitleStyle: {
    fontFamily: "medium",
  },
  headerTitleStyle: {
    fontFamily: "semibold",
  },
  headerBackTitle: "Retour",
};

const createScreen = <ScreenName extends keyof RouteParameters>(
  name: ScreenName,
  component: Screen<ScreenName>,
  options: (NativeStackNavigationOptions & {
    tabBarLabel?: string
    tabBarLottie?: any
    tabEnabled?: boolean
  }) = {},
) => ({
  name,
  component,
  options,
});

export default createScreen;
