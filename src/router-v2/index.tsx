import React from "react";
import * as Linking from "expo-linking";
import { useColorScheme } from "react-native";
import { BottomTabNavigationOptions, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCurrentAccount } from "@/stores/account";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PapillonDark, PapillonLight } from "./helpers/themes";
import {
  NavigationContainer,
  NavigationState,
  PartialState,
  Theme,
} from "@react-navigation/native";
import AlertProvider from "@/providers/AlertProvider";
import { navigate } from "@/utils/logger/logger";
import screens from "./stacks";

const Tab = createBottomTabNavigator();
const prefix = Linking.createURL("/");
const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      PronoteManualURL: "url",
      DevMenu: "dev",
    },
  },
};

const buildNavigationPath = (
  state?: NavigationState | PartialState<NavigationState>,
  path = ""
): string => {
  if (!state || !state.routes || state.index === undefined) return path;
  const route = state.routes[state.index];
  const subState = route.state as NavigationState | undefined;
  return buildNavigationPath(subState, path + "/" + route.name);
};

const AppRouter = () => {
  const scheme = useColorScheme();
  const account = useCurrentAccount((store) => store.account!);

  const [theme, setTheme] = React.useState<Theme>(
    scheme === "dark" ? PapillonDark : PapillonLight
  );

  React.useEffect(() => {
    let newTheme = scheme === "dark" ? PapillonDark : PapillonLight;
    if (account?.personalization?.color?.hex?.primary) {
      newTheme = {
        ...newTheme,
        colors: {
          ...newTheme.colors,
          primary: account.personalization.color.hex.primary,
        },
      };
    }
    setTheme(newTheme);
  }, [scheme, account]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={theme}
          linking={linking}
          onStateChange={(state) => {
            const path = buildNavigationPath(state);
            navigate(path);
          }}
        >
          <AlertProvider>
            <Tab.Navigator initialRouteName="WelcomeStack">
              {screens.map((screen) => (
                <Tab.Screen
                  key={screen.name + "_scr"}
                  name={screen.name}
                  component={screen.component}
                  options={screen.options as BottomTabNavigationOptions}
                />
              ))}
            </Tab.Navigator>
          </AlertProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppRouter;
