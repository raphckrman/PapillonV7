
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { Homework, HomeworkReturnType } from "@/services/shared/Homework";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";
import HTMLView from "react-native-htmlview";
import { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import { AutoFileIcon } from "@/components/Global/FileIcon";
import { Paperclip, CircleAlert, PencilLine, MoreHorizontal, Trash2, CalendarClock } from "lucide-react-native";
import LinkFavicon, { getURLDomain } from "@/components/Global/LinkFavicon";
import { timestampToString } from "@/utils/format/DateHelper";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import PapillonPicker from "@/components/Global/PapillonPicker";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import HomeworkItem from "./Atoms/Item";
import { Picker } from "@react-native-picker/picker";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getSubjectData } from "@/services/shared/Subject";

const MemoizedNativeItem = React.memo(NativeItem);
const MemoizedNativeList = React.memo(NativeList);
const MemoizedNativeText = React.memo(NativeText);

const HomeworksDocument: Screen<"HomeworksDocument"> = ({ navigation, route }) => {
  const theme = useTheme();
  const stylesText = StyleSheet.create({
    body: {
      color: theme.colors.text,
      fontFamily: "medium",
      fontSize: 16,
      lineHeight: 22,
    },
    a: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
    },
  });

  const account = useCurrentAccount((store) => store.account!);
  const localSubjects = account.personalization.subjects ?? {};
  const [selectedPretty, setSelectedPretty] = useState(
    Object.entries(localSubjects || {})[0]?.[1] ?? null
  );

  // Création de devoirs personnalisés
  const [showCreateHomework, setShowCreateHomework] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idHomework, setIdHomework] = useState(NaN);
  const [contentHomework, setContentHomework] = useState<string | null>(null);
  const [dateHomework, setDateHomework] = useState(Date.now());

  const [homework, setHomework] = useState<Homework>(route.params.homework || {});

  useEffect(() => {
    const pretty = Object.entries(localSubjects || {}).find(
      (element) => element[1].pretty === homework.subject
    )?.[1];

    if (pretty) setSelectedPretty(pretty);

    setIdHomework(parseInt(homework.id));
    setContentHomework(homework.content);
    setDateHomework(homework.due);
  }, [homework]);


  const openUrl = (url: string) => {
    if (
      account.service === AccountService.EcoleDirecte &&
			Platform.OS === "ios"
    ) {
      getAndOpenFile(account, url);
    } else {
      WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: theme.colors.primary,
      });
    }
  };

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [homework.subject]);

  return (
    <View style={{ flex: 1 }}>
      <PapillonModernHeader native outsideNav={true}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              marginRight: 4,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                textAlign: "center",
                width: "100%",
                marginLeft: 2,
              }}
            >
              {subjectData.emoji}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <NativeText variant="title" numberOfLines={1}>
              {subjectData.pretty}
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              {timestampToString(new Date(homework.due).getTime())}
            </NativeText>
          </View>
          <View>
            {homework.returnType && (
              <View
                style={{
                  backgroundColor: "#D10000",
                  borderRadius: 100,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 8,
                  paddingHorizontal: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      homework.returnType === "file_upload"
                        ? "Tu dois rendre ce devoir sur ton ENT"
                        : homework.returnType === "paper"
                          ? "Tu dois rendre ce devoir en classe"
                          : "Ce devoir est à rendre",
                      homework.returnType === "file_upload"
                        ? "Papillon ne permet pas de rendre des devoirs sur l'ENT. Tu dois le faire sur l'ENT de ton établissement"
                        : homework.returnType === "paper"
                          ? "Ton professeur t'indiquera comment rendre ce devoir"
                          : "Ton professeur t'indiquera comment rendre ce devoir",
                    );
                  }}
                >
                  <NativeText
                    variant="subtitle"
                    style={{ color: "#FFF", opacity: 1 }}
                  >
                    {homework.returnType === HomeworkReturnType.FileUpload
                      ? "A rendre sur l'ENT"
                      : homework.returnType === HomeworkReturnType.Paper
                        ? "A rendre en classe"
                        : null}
                  </NativeText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {homework.personalizate && (
            <PapillonPicker
              animated
              direction="right"
              delay={0}
              data={[
                {
                  icon: <PencilLine />,
                  label: "Modifier le devoir",
                  onPress: () => setShowCreateHomework(true),
                },
                {
                  icon: <Trash2 />,
                  label: "Supprimer le devoir",
                  onPress: () => {
                    Alert.alert(
                      "Supprimer le devoir",
                      "Veux-tu vraiment supprimer ce devoir ?",
                      [
                        {
                          text: "Annuler",
                          isPreferred: true,
                        },
                        {
                          text: "Continuer",
                          style: "destructive",
                          onPress: () => {
                            useAccounts.getState().removeHomework(account.localID, homework.id);
                            navigation.goBack();
                          }
                        }
                      ]
                    );
                  },
                },
              ]}
            >
              <TouchableOpacity>
                <MoreHorizontal size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </PapillonPicker>
          )}
        </View>
      </PapillonModernHeader>

      <BottomSheet
        key={idHomework}
        opened={showCreateHomework}
        setOpened={(bool: boolean) => {
          setShowCreateHomework(bool);
          if (!bool) {
            setSelectedPretty(Object.entries(localSubjects || {})[0]?.[1] ?? null);
            setIdHomework(NaN);
            setContentHomework(null);
            setContentHomework(null);
            setDateHomework(Date.now());
          }
          setHomework(homework);
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }}
      >
        <View style={{ alignSelf: "center", marginTop: 15, flexDirection: "row", gap: 16 }}>
          <MemoizedNativeText variant="titleLarge" numberOfLines={2}>
            Modifier un devoir
          </MemoizedNativeText>
        </View>

        <MemoizedNativeList style={{ marginTop: 16 }}>
          <MemoizedNativeItem>
            <MemoizedNativeText variant="subtitle" numberOfLines={1}>
              Aperçu
            </MemoizedNativeText>
            <View style={{ marginHorizontal: -20, marginTop: 5, marginBottom: -10 }}>
              <HomeworkItem
                homework={{
                  ...homework,
                  subject: selectedPretty.pretty,
                  color: selectedPretty.color,
                  content: contentHomework ?? "Écris le contenu du devoir juste en-dessous :)",
                  due: dateHomework,
                }}
                index={idHomework}
                key={idHomework}
                // @ts-expect-error
                navigation={navigation}
                onDonePressHandler={() => undefined}
                total={1}
              />
            </View>
          </MemoizedNativeItem>
        </MemoizedNativeList>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <MemoizedNativeList style={{ marginTop: 16, width: "49%" }}>
            <MemoizedNativeItem
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setShowDatePicker(true)}
              chevron={false}
            >
              <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                Date du devoir
              </MemoizedNativeText>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "10%",
                }}
              >
                <CalendarClock color={theme.colors.text} />
                <MemoizedNativeText>
                  {new Date(dateHomework).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </MemoizedNativeText>
              </View>
            </MemoizedNativeItem>
          </MemoizedNativeList>

          <MemoizedNativeList style={{ marginTop: 16, flex: 1, width: "50%" }}>
            <MemoizedNativeItem>
              <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                Nom de la matière
              </MemoizedNativeText>
              <View
                style={{
                  marginTop: 5,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={selectedPretty?.pretty}
                  onValueChange={(itemValue) => {
                    const selectedSubject = Object.entries(localSubjects).find(
                      ([, subject]) => subject.pretty === itemValue
                    );

                    if (selectedSubject) {
                      setSelectedPretty(selectedSubject[1]);
                    }
                  }}
                  style={{
                    color: theme.colors.text,
                  }}
                >
                  {Object.entries(localSubjects).map(([key, subject]) => (
                    <Picker.Item
                      key={key}
                      label={subject.pretty}
                      value={subject.pretty}
                    />
                  ))}
                </Picker>
              </View>
            </MemoizedNativeItem>
          </MemoizedNativeList>
        </View>

        <MemoizedNativeList style={{ marginTop: 16 }}>
          <MemoizedNativeItem>
            <MemoizedNativeText variant="subtitle" numberOfLines={3}>
              Contenu du devoir
            </MemoizedNativeText>
            <ResponsiveTextInput
              style={{
                fontFamily: "medium",
                fontSize: 16,
                color: theme.colors.text,
              }}
              value={contentHomework ?? ""}
              onChangeText={(input) => {
                if (input === "") {
                  setContentHomework(null);
                } else {
                  setContentHomework(input);
                }
              }}
            />
          </MemoizedNativeItem>
        </MemoizedNativeList>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(dateHomework)}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                selectedDate.setHours(0, 0, 0, 0);
                setDateHomework(selectedDate.getTime());
              }
            }}
          />
        )}

        <ButtonCta
          value="Valider"
          onPress={() => {
            if (!selectedPretty || !contentHomework) {
              Alert.alert("Veuillez remplir tous les champs avant de valider.");
              return;
            }

            // Créez un objet représentant le devoir
            const newHomework: Homework = {
              ...homework,
              subject: selectedPretty.pretty,
              color: selectedPretty.color,
              content: contentHomework,
              due: dateHomework,
            };

            useAccounts.getState().updateHomework(account.localID, homework.id, newHomework);

            setShowCreateHomework(false);
            setSelectedPretty(Object.entries(localSubjects || {})[0]?.[1] ?? null);
            setIdHomework(NaN);
            setContentHomework(null);
            setDateHomework(Date.now());
            setHomework(newHomework);
          }}
          style={{
            minWidth: undefined,
            maxWidth: undefined,
            width: "50%",
            alignSelf: "center",
            marginTop: 15,
          }}
        />
      </BottomSheet>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 70 + 16,
          paddingBottom: useSafeAreaInsets().bottom + 16,
        }}
        style={{ flex: 1 }}
      >
        <NativeList>
          {homework.exam ? (
            <NativeItem icon={<CircleAlert />}>
              <NativeText variant="default">{"Évaluation"}</NativeText>
            </NativeItem>
          ) : (
            <></>
          )}

          <NativeItem>
            <HTMLView
              value={`<body>${parse_homeworks(homework.content)}</body>`}
              stylesheet={stylesText}
              onLinkPress={(url) => openUrl(url)}
            />
          </NativeItem>
        </NativeList>

        {homework.attachments.length > 0 && (
          <View>
            <NativeListHeader label="Pièces jointes" icon={<Paperclip />} />

            <NativeList>
              {homework.attachments.map((attachment, index) => (
                <NativeItem
                  key={index}
                  onPress={() => openUrl(attachment.url)}
                  icon={attachment.type === "file" ? <AutoFileIcon filename={attachment.name} /> : <LinkFavicon url={attachment.url} />}
                >
                  <NativeText variant="title" numberOfLines={2}>
                    {attachment.name || getURLDomain(attachment.url, true)}
                  </NativeText>
                  <NativeText variant="subtitle" numberOfLines={1}>
                    {attachment.url}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeworksDocument;
