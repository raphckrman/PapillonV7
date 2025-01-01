import React from "react";
import { Text, ScrollView, View, StyleSheet, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import important_json from "@/utils/magic/regex/important.json"; // Ensure this file contains valid regex patterns
import MagicContainerCard from "@/components/Settings/MagicContainerCard";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { PlugZap } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";

const SettingsMultiService: Screen<"SettingsMultiService"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
    >
      {/*<MagicContainerCard theme={theme} />*/}

      <NativeListHeader label="Options" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.MagicNews ?? false}
              onValueChange={(value) => mutateProperty("personalization", { MagicNews: value })}
            />
          }
          leading={
            <NativeIcon
              icon={<PlugZap />}
              color="#cb7712"
            />
          }
        >
          <NativeText variant="title">
            Multiservice
          </NativeText>
          <NativeText variant="subtitle">
            Connecte plusieurs services différents en un seul environnement virtuel, en associant chaque fonctionnalité à un service connecté.
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsMultiService;
