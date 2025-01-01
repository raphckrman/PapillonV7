import React from "react";
import { ScrollView, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import MultiServiceContainerCard from "@/components/Settings/MultiServiceContainerCard";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { PlugZap } from "lucide-react-native";
import {useAccounts} from "@/stores/account";
import {useMultiService} from "@/stores/multiService";

const SettingsMultiService: Screen<"SettingsMultiService"> = ({ navigation }) => {
  const theme = useTheme();
  const toggleMultiService = useMultiService(store => store.toggleEnabledState);
  const multiServiceEnabled = useMultiService(store => store.enabled);
  const accounts = useAccounts();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
    >
      <MultiServiceContainerCard theme={theme} />

      <NativeListHeader label="Options" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={multiServiceEnabled ?? false}
              onValueChange={() => toggleMultiService()}
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
            Activer le multiservice te permet de créer ton premier espace virtuel.
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsMultiService;
