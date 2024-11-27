import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const HomeStack = createNativeStackNavigator<RouteParameters>();

export const screenOptions: NativeStackNavigationOptions = {
  headerBackTitleStyle: {
    fontFamily: "medium",
  },
  headerTitleStyle: {
    fontFamily: "semibold",
  },
  headerBackTitle: "Retour",
};

import { useCurrentAccount } from "@/stores/account";
import createScreen from "@/router/helpers/create-screen";
import Home from "@/views/account/Home/Home";
import type { RouteParameters, Screen } from "@/router/helpers/types";

const HomeStackScreen = ({ accountScreens }: {
  accountScreens: Array<ReturnType<typeof createScreen>>
}) => {
  const account = useCurrentAccount(store => store.account);
  let newAccountScreens = accountScreens;

  if (account?.personalization.tabs) {
    let newTabs = account.personalization.tabs;
    newTabs = newTabs.filter(tab => !tab.enabled);

    newAccountScreens = newTabs.map(tab => {
      const tabData = accountScreens.find(t => t.name === tab.name);
      if (tabData) {
        tabData.options = {
          ...tabData.options,
          tabEnabled: tab.enabled,
          presentation: "modal",
        };

        return tabData;
      }
    }).filter(Boolean) as Array<ReturnType<typeof createScreen>>; // filter out undefined
  }
  else {
    for (const screen of newAccountScreens) {
      screen.options.tabEnabled = true;
    }
  }

  // Add Home as the first tab.
  newAccountScreens.unshift(
    createScreen("HomeScreen", Home, {
      headerShown: false
    }) as ReturnType<typeof createScreen>
  );

  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      {newAccountScreens.map((screen) => (
        <HomeStack.Screen
          key={screen.name+"_tabrt3"}
          {...screen}
          initialParams={{
            outsideNav: true
          }}
        />
      ))}
    </HomeStack.Navigator>
  );
};

export default HomeStackScreen;