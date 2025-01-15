import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import {
  CalendarCheck,
  BookCheck,
  TrendingUp,
  Newspaper,
  Info,
  NotepadText,
  BookPlus
} from "lucide-react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText
} from "@/components/Global/NativeComponents";
import NotificationContainerCard from "@/components/Settings/NotificationContainerCard";
import { createChannelNotification, requestNotificationPermission } from "@/background/Notifications";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { useCurrentAccount } from "@/stores/account";
import { PressableScale } from "react-native-pressable-scale";
import { useAlert } from "@/providers/AlertProvider";

const SettingsNotifications: Screen<"SettingsNotifications"> = ({
  navigation
}) => {
  const theme = useTheme();
  const { colors } = theme;

  // User data
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const notifications = account.personalization.notifications;

  // Global state
  const [enabled, setEnabled] = useState<boolean | null>(
    notifications?.enabled || false
  );
  useEffect(() => {
    const test = async () => {
      const statut = await requestNotificationPermission();
      if (!statut) {
        setEnabled(null);
        setTimeout(() => {
          mutateProperty("personalization", {
            notifications: { ...notifications, enabled: false }
          });
        }, 1500);
      } else if (enabled !== null) {
        if (enabled) createChannelNotification();
        setTimeout(() => {
          mutateProperty("personalization", {
            notifications: { ...notifications, enabled }
          });
        }, 1500);
      }
    };

    test();
  }, [enabled]);

  // Animation states
  const opacity = useSharedValue(0);
  const invertedOpacity = useSharedValue(1);
  const borderRadius = useSharedValue(20);
  const width = useSharedValue("90%");
  const marginBottom = useSharedValue(0);

  // Animation effects
  useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0, { duration: 200 });
    invertedOpacity.value = withTiming(enabled ? 0 : 1, { duration: 200 });
    borderRadius.value = withTiming(enabled ? 20 : 13, { duration: 200 });
    width.value = withTiming(enabled ? "90%" : "80%", { duration: 300 });
    marginBottom.value = withTiming(enabled ? 0 : -10, { duration: 200 });
  }, [enabled]);

  const askEnabled = async (newValue: boolean) => {
    if (isExpoGo()) {
      alertExpoGo();
      return;
    }

    setEnabled(newValue);
  };

  // Schoolary notifications
  const notificationSchoolary = [
    {
      icon: <NativeIcon icon={<CalendarCheck />} color={colors.primary} />,
      title: "Modification de cours",
      message: "Le cours de mathématiques (10h-11h) a été annulé",
      personalizationValue: "timetable",
    },
    {
      icon: <NativeIcon icon={<BookCheck />} color={colors.primary} />,
      title: "Nouveau devoir",
      message: "Nouveau devoir : \"Apporter le manuel\"",
      personalizationValue: "homeworks",
    },
    {
      icon: <NativeIcon icon={<TrendingUp />} color={colors.primary} />,
      title: "Nouvelle note",
      message: "Nouvelle note publiée en histoire",
      personalizationValue: "grades",
    },
    {
      icon: <NativeIcon icon={<Newspaper />} color={colors.primary} />,
      title: "Nouvelle actualité",
      message: "Nouvelle actualité : \"Les élèves de 3ème partent en voyage scolaire\"",
      personalizationValue: "news",
    },
    {
      icon: <NativeIcon icon={<NotepadText />} color={colors.primary} />,
      title: "Nouvelle événement sur la Vie Scolaire",
      message: "Tu as été en retard de 5 min à 11h10",
      personalizationValue: "attendance",
    },
    {
      icon: <NativeIcon icon={<BookPlus />} color={colors.primary} />,
      title: "Nouvelle compétence",
      message: "Nouvelle compétence publiée en histoire",
      personalizationValue: "evaluation",
    },
  ];

  const { showAlert } = useAlert();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NotificationContainerCard
        theme={theme}
        isEnable={enabled}
        setEnabled={askEnabled}
        navigation={navigation}
      />

      {enabled && (
        <>
          <NativeListHeader label={"Notifications scolaires"} />
          <NativeList>
            {notificationSchoolary.map((notification, index) => (
              <NativeItem
                key={index}
                leading={notification.icon}
                trailing={
                  <Switch
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    value={
                      account.personalization.notifications?.[
                        notification.personalizationValue as keyof typeof notifications
                      ] ?? false
                    }
                    onValueChange={(value) => {
                      mutateProperty("personalization", {
                        notifications: {
                          ...notifications,
                          [notification.personalizationValue]: value,
                        },
                      });
                    }}
                    style={{
                      marginRight: 10,
                    }}
                  />
                }
              >
                <NativeText variant="title">
                  {notification.title}
                  {notification.personalizationValue === "timetable" && (
                    <PressableScale
                      onPress={() => {
                        if (Platform.OS === "ios") {
                          Alert.alert("Information", "Pour le moment, tu es prévenu de ton emploi du temps uniquement 15 minutes avant le 1er cours de la journée.", [
                            {
                              text: "OK",
                            },
                          ]);
                        } else {
                          showAlert({
                            title: "Information",
                            message: "Pour le moment, tu es prévenu de ton emploi du temps uniquement 15 minutes avant le 1er cours de la journée.",
                            actions: [
                              {
                                title: "OK",
                                onPress: () => {},
                                backgroundColor: theme.colors.card,
                              },
                            ],
                          });
                        }
                      }}
                    >
                      <Info
                        size={24}
                        color={colors.primary}
                        style={{
                          marginLeft: 10,
                          marginBottom: -5,
                        }}
                      />
                    </PressableScale>
                  )}
                </NativeText>
                <NativeText
                  style={{
                    color: colors.text + "80",
                  }}
                >
                  {notification.message}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        </>
      )}
    </ScrollView>
  );
};

export default SettingsNotifications;
