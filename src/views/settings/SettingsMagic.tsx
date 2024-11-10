import React from "react";
import { ScrollView, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MagicContainerCard from "@/components/Settings/MagicContainerCard";
import { NativeIcon, NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { ArrowUpNarrowWide, Brain } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";

const SettingsMagic: Screen<"SettingsMagic"> = ({ navigation }) => {
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
      <MagicContainerCard theme={theme} />

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
              icon={<ArrowUpNarrowWide />}
              color={colors.primary}
            />
          }
        >
          <NativeText variant="title">
            Actualités Intelligentes
          </NativeText>
          <NativeText variant="subtitle">
            Trie les actualités en fonction de leur importance et place en haut de la page celles jugées importantes
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <Switch
              value={account?.personalization?.MagicHomeworks ?? false}
              onValueChange={(value) => mutateProperty("personalization", { MagicHomeworks: value })}
            />
          }
          leading={
            <NativeIcon
              icon={<Brain />}
              color={colors.primary}
            />
          }
        >
          <NativeText variant="title">
            Devoirs Intelligents
          </NativeText>
          <NativeText variant="subtitle">
            Détecte automatiquement la présence d'une évaluation ou d'une tâche finale parmi les devoirs.
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsMagic;
