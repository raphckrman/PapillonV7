import { useTheme } from "@react-navigation/native";
import { ChevronRight } from "lucide-react-native";
import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DevMenu: Screen<"DevMenu"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  // add button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => __DEV__ && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AccountSelector");
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 0,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "medium",
              fontSize: 17.5,
            }}
          >
            Appli
          </Text>

          <ChevronRight
            size={32}
            color={colors.primary}
            style={{ marginLeft: 0, marginRight: -8 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
      }}
    >
      {__DEV__ && (
        <View
          style={{
            backgroundColor: colors.text + "16",
            borderRadius: 10,
            borderCurve: "continuous",
            padding: 16,
            gap: 4,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontFamily: "bold",
            }}
          >
            Menu pour les développeurs
          </Text>


          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              lineHeight: 20,
              fontFamily: "medium",
              opacity: 0.7,
            }}
          >
            Intégrez vos options et paramètres de développement ici.
          </Text>
        </View>
      )}

      {__DEV__ && (
        <View>
          <NativeListHeader label="Application debug" />

          <NativeList>

            <NativeItem
              onPress={() => navigation.navigate("AccountSelector")}
            >
              <NativeText>
                Go to Account Selector
              </NativeText>
            </NativeItem>

            <NativeItem
              onPress={() => navigation.navigate("NoteReaction")}
            >
              <NativeText>
                NoteReaction
              </NativeText>
            </NativeItem>

            <NativeItem
              onPress={() => navigation.navigate("ColorSelector")}
            >
              <NativeText>
                ColorSelector
              </NativeText>
            </NativeItem>

            <NativeItem
              onPress={() => navigation.navigate("AccountCreated")}
            >
              <NativeText>
                AccountCreated
              </NativeText>
            </NativeItem>

          </NativeList>
        </View>
      )}

      <View>
        <NativeListHeader label="Options de développement" />

        <NativeList>
          <NativeItem
            onPress={() => {
              navigation.navigate("SettingStack", {
                view: "SettingsFlags"
              });
            }}
          >
            <NativeText
            >
              Gérer les flags
            </NativeText>
          </NativeItem>
          <NativeItem
            onPress={() => {
              navigation.navigate("SettingStack", {
                view: "SettingsDevLogs"
              });
            }}
          >
            <NativeText
            >
              Logs de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      </View>

      <View>
        <NativeListHeader label="Actions destructives" />

        <NativeList>

          <NativeItem
            onPress={() => {
              Alert.alert(
                "Réinitialisation de Papillon",
                "Êtes-vous sûr de vouloir réinitialiser toutes les données de l'application ?",
                [
                  {
                    text: "Annuler",
                    style: "cancel",
                  },
                  {
                    text: "Réinitialiser",
                    style: "destructive",
                    onPress: () => {
                      AsyncStorage.clear();
                      navigation.popToTop();
                    },
                  },
                ],
              );
            }}
          >
            <NativeText
              style={{
                color: "#E91E63",
                fontFamily: "semibold",
              }}
            >
              Réinitialiser toutes les données
            </NativeText>
            <NativeText variant="subtitle">
              Supprime toutes les données de l'application
            </NativeText>
          </NativeItem>
        </NativeList>
      </View>

    </ScrollView>
  );
};

export default DevMenu;