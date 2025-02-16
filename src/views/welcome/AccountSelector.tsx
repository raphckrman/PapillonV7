import { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import React, { useEffect } from "react";
import { Image, useColorScheme } from "react-native";

import * as SplashScreen from "expo-splash-screen";

const AccountSelector: Screen<"AccountSelector"> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const accounts = useAccounts((store) => store.accounts);
  const currentAccount = useCurrentAccount((store) => store.account);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  useEffect(() => {
    void async function () {
      if (!useAccounts.persist.hasHydrated()) return;

      // If there are no accounts, redirect the user to the first installation page.
      if (accounts.filter((account) => !account.isExternal).length === 0) {
        // Use the `reset` method to clear the navigation stack.
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstInstallation" }],
        });

        SplashScreen.hideAsync();
      }

      const selectedAccount = accounts.find((account) => !account.isExternal) as PrimaryAccount | undefined;
      if (selectedAccount && currentAccount?.localID !== selectedAccount.localID) {
        switchTo(selectedAccount);

        navigation.reset({
          index: 0,
          routes: [{ name: "AccountStack" }],
        });

        SplashScreen.hideAsync();
      }
    }();
  }, [accounts]);

  return (
    <Image
      source={colorScheme === "dark" ? require("../../../assets/launch/splash-dark.png") : require("../../../assets/launch/splash.png")}
      style={{ flex: 1, resizeMode: "cover" }}
    />
  );
};

export default AccountSelector;