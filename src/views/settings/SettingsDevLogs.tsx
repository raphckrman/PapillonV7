import type { Screen } from "@/router/helpers/types";
import { ActivityIndicator, Alert, Platform, ScrollView, TouchableOpacity } from "react-native";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { get_logs, Log, delete_logs } from "@/utils/logger/logger";
import {
  CircleAlert,
  CircleX,
  Code,
  Delete,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { useAlert } from "@/providers/AlertProvider";
import MissingItem from "@/components/Global/MissingItem";

const SettingsDevLogs: Screen<"SettingsDevLogs"> = ({ navigation }) => {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    get_logs().then((logs) => {
      setLogs(
        logs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
      setLoading(false);
    });

    navigation.setOptions({
      headerRight: (props) => (
        <PressableScale
          onPress={() => delete_logs()}
        >
          <Delete />
        </PressableScale>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 16 + insets.bottom,
        paddingTop: 0,
      }}
    >
      <NativeListHeader
        animated
        label="Logs des 2 dernières semaines"
        trailing={
          logs.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "ios") {
                  Alert.alert(
                    "Supprimer les logs ?",
                    "Es-tu sûr de vouloir supprimer toutes les logs ?", [
                      {
                        text: "Annuler",
                        style: "cancel",
                      },
                      {
                        text: "Supprimer",
                        style: "destructive",
                        onPress: () => {
                          delete_logs();
                          setLogs([]);
                        },
                      },
                    ]
                  );
                } else {
                  showAlert({
                    title: "Supprimer les logs ?",
                    message: "Es-tu sûr de vouloir supprimer toutes les logs ?",
                    actions: [
                      {
                        title: "Annuler",
                        onPress: () => {},
                        backgroundColor: colors.card,
                        icon: <X color={colors.text} />,
                      },
                      {
                        title: "Supprimer",
                        primary: true,
                        onPress: () => {
                          delete_logs();
                          setLogs([]);
                        },
                        backgroundColor: "#CF0029",
                        icon: <Trash2 color="#FFFFFF" />,
                      },
                    ],
                  });
                }
              }}
              style={{
                padding: 5,
                borderRadius: 100,
                backgroundColor: colors.text + "20",
              }}
            >
              <Trash2
                size={25}
                strokeWidth={2}
                color="red"
              />
            </TouchableOpacity>
          )
        }
      />

      {loading ? (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem
            leading={
              <ActivityIndicator />
            }
            animated
          >
            <NativeText variant="title">
              Obtention des logs...
            </NativeText>
            <NativeText variant="subtitle">
              Cela peut prendre plusieurs secondes, patiente s'il te plaît.
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : logs.length > 0 ? (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          {logs.map((log, index) => (
            <NativeItem
              animated
              key={index}
              leading={
                <NativeIcon
                  icon={
                    log.type === "ERROR" ? (
                      <CircleX />
                    ) : log.type === "WARN" ? (
                      <TriangleAlert />
                    ) : log.type === "INFO" ? (
                      <CircleAlert />
                    ) : (
                      <Code />
                    )
                  }
                  color={
                    log.type === "ERROR"
                      ? "#BE0B00"
                      : log.type === "WARN"
                        ? "#CF6B0F"
                        : log.type === "INFO"
                          ? "#0E7CCB"
                          : "#AAA"
                  }
                  style={{
                    marginLeft: -6,
                  }}
                />
              }
            >
              <NativeText variant="title">{log.message}</NativeText>
              <NativeText variant="subtitle">{log.date}</NativeText>
              <NativeText variant="subtitle">{log.from}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
      ) : (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem
              emoji="💾"
              title="Aucune log enregistrée"
              description="Il n'y a pas de logs à te présenter."
            />
          </NativeItem>
        </NativeList>
      )}
    </ScrollView>
  );
};

export default SettingsDevLogs;
