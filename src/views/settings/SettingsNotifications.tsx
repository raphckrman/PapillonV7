import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Switch, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import {
  // CalendarCheck,
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
import { createChannelNotification, papillonNotify, requestNotificationPermission } from "@/background/Notifications";
import { useCurrentAccount } from "@/stores/account";
import { PressableScale } from "react-native-pressable-scale";
import { useAlert } from "@/providers/AlertProvider";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

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
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleNotificationPermission = async () => {
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

    handleNotificationPermission();
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
    setEnabled(newValue);
  };

  // Schoolary notifications
  const notificationSchoolary = [
    // {
    //   icon: <NativeIcon icon={<CalendarCheck />} color={colors.primary} />,
    //   title: "Emploi du temps du jour modifié",
    //   message: "Le cours de Musique (10:00-11:00) a été annulé",
    //   personalizationValue: "timetable",
    // },
    {
      icon: <NativeIcon icon={<BookCheck />} color={colors.primary} />,
      title: "Nouveau devoir",
      message: "Un nouveau devoir en Mathématiques a été publié",
      personalizationValue: "homeworks",
    },
    {
      icon: <NativeIcon icon={<TrendingUp />} color={colors.primary} />,
      title: "Nouvelle note",
      message: "Une nouvelle note en Anglais a été publiée",
      personalizationValue: "grades",
    },
    {
      icon: <NativeIcon icon={<Newspaper />} color={colors.primary} />,
      title: "Nouvelle actualité",
      message: "Chers élèves, chers collègues, Dans le cadre du prix \"Non au harcèlement\", 9 affiches ont été réa...",
      personalizationValue: "news",
    },
    {
      icon: <NativeIcon icon={<NotepadText />} color={colors.primary} />,
      title: "Vie Scolaire",
      message: "Tu as été en retard de 5 min à 11:10",
      personalizationValue: "attendance",
    },
    {
      icon: <NativeIcon icon={<BookPlus />} color={colors.primary} />,
      title: "Nouvelle compétence",
      message: "Une nouvelle compétence en Histoire a été publiée",
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
          <View>
            <NativeList inline>
              <NativeItem icon={<Info />}>
                <NativeText variant="body">
                  Toutes les 15 minutes, Papillon va se connecter à ton compte
                  et te notifie en fonction des paramètres ci-dessous
                </NativeText>
              </NativeItem>
            </NativeList>
          </View>
          <NativeListHeader label="Autre" />
          <ButtonCta
            value="Test des notifications"
            icon={
              loading ? (
                <View>
                  <PapillonSpinner
                    strokeWidth={3}
                    size={22}
                    color={theme.colors.text}
                  />
                </View>
              ) : undefined
            }
            primary={!loading}
            style={{
              marginTop: 14,
              minWidth: null,
              maxWidth: null,
              width: "75%",
              alignSelf: "center",
            }}
            onPress={async () => {
              setLoading(true);
              await papillonNotify(
                {
                  id: `${account.name}-test`,
                  title: `[${account.name}] Coucou, c'est Papillon 👋`,
                  subtitle: "Test",
                  body: "Si tu me vois, c'est que tout fonctionne correctement !",
                  ios: {
                    categoryId: account.name,
                  },
                },
                "Test"
              );
              setTimeout(() => {
                setLoading(false);
              }, 500);
            }}
          />
          <NativeListHeader label="Notifications scolaires" />
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
                          Alert.alert(
                            "Information",
                            "Pour le moment, tu es prévenu de ton emploi du temps modifié uniquement 15 minutes avant le 1er cours de la journée.",
                            [
                              {
                                text: "OK",
                              }
                            ]
                          );
                        } else {
                          showAlert({
                            title: "Information",
                            message: "Pour le moment, tu es prévenu de ton emploi du temps modifié uniquement 15 minutes avant le 1er cours de la journée.",
                            actions: [
                              {
                                title: "OK",
                                onPress: () => {},
                                primary: true,
                              },
                            ],
                          });
                        }
                      }}
                    >
                      <Info
                        size={20}
                        color={colors.primary}
                        style={{
                          marginLeft: 5,
                          marginBottom: -3,
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
