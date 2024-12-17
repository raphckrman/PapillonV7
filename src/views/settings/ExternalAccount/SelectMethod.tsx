import React from "react";
import { ScrollView, } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useCurrentAccount } from "@/stores/account";

const ExternalAccountSelectMethod: Screen<"ExternalAccountSelectMethod"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <PapillonShineBubble
        message={`Sélectionnez votre méthode de connexion au service ${route.params.service === "Other" ? "(autre)" : AccountService[route.params.service]}`}
        width={300}
        numberOfLines={2}
        offsetTop={insets.top}
      />

      <NativeList>
        {/*
          PRONOTE can be already linked to that account and
          we may have a way to connect using that link directly.
          */}
        {account.service === AccountService.Pronote && (
          <NativeItem
            trailing={
              <Star
                color={colors.primary}
                style={{ marginRight: 5 }}
              />
            }
            disabled
          >
            <NativeText>
              Connexion via PRONOTE
            </NativeText>
            <NativeText variant="subtitle">
              Connexion automatique via PRONOTE
            </NativeText>
          </NativeItem>
        )}

        <NativeItem onPress={() => {
          switch (route.params.service) {
            case AccountService.Turboself:
              navigation.navigate("ExternalTurboselfLogin");
              break;
            case AccountService.ARD:
              navigation.navigate("ExternalArdLogin");
              break;
            case AccountService.Izly:
              navigation.navigate("ExternalIzlyLogin");
              break;
            case AccountService.Alise:
              navigation.navigate("ExternalAliseLogin");
              break;
          }
        }}>
          <NativeText>
            Connexion manuelle
          </NativeText>
          <NativeText variant="subtitle">
            Entrez vos identifiants manuellement
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

export default ExternalAccountSelectMethod;
