import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useHomeworkStore } from "@/stores/homework";
import { useTheme } from "@react-navigation/native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import {
  View,
  FlatList,
  Dimensions,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TextInput,
  ListRenderItem,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { dateToEpochWeekNumber, epochWNToDate } from "@/utils/epochWeekNumber";

import * as StoreReview from "expo-store-review";

import HomeworkItem from "./Atoms/Item";
import { PressableScale } from "react-native-pressable-scale";
import { BookPlus, CalendarClock, CheckSquare, ListFilter, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import Reanimated, { Easing, FadeIn, FadeInLeft, FadeInUp, FadeOut, FadeOutDown, FadeOutLeft, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import * as Haptics from "expo-haptics";
import MissingItem from "@/components/Global/MissingItem";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import {Homework} from "@/services/shared/Homework";
import {AccountService} from "@/stores/account/types";
import {Screen} from "@/router/helpers/types";
import {NativeSyntheticEvent} from "react-native/Libraries/Types/CoreEventTypes";
import {NativeScrollEvent, ScrollViewProps} from "react-native/Libraries/Components/ScrollView/ScrollView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {hasFeatureAccountSetup} from "@/utils/multiservice";
import {MultiServiceFeature} from "@/stores/multiService/types";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const MemoizedHomeworkItem = React.memo(HomeworkItem);
const MemoizedNativeItem = React.memo(NativeItem);
const MemoizedNativeList = React.memo(NativeList);
const MemoizedNativeText = React.memo(NativeText);

const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long"
  });
};

const WeekView: Screen<"Homeworks"> = ({ route, navigation }) => {
  const flatListRef: React.MutableRefObject<FlatList> = useRef(null) as any as React.MutableRefObject<FlatList>;
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const { playHaptics } = useSoundHapticsWrapper();
  const { isOnline } = useOnlineStatus();

  const outsideNav = route.params?.outsideNav;

  const theme = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Homeworks, account.localID) : true;
  const homeworks = useHomeworkStore(store => store.homeworks);
  const localSubjects = account.personalization.subjects ?? {};
  const [selectedPretty, setSelectedPretty] = useState(
    Object.entries(localSubjects || {})[0]?.[1] ?? null
  );

  // @ts-expect-error
  let firstDate = account?.instance?.instance?.firstDate || null;
  if (!firstDate) {
    firstDate = new Date();
    firstDate.setMonth(8);
    firstDate.setDate(1);
  }
  const firstDateEpoch = dateToEpochWeekNumber(firstDate);

  const currentWeek = dateToEpochWeekNumber(new Date());
  const [data, setData] = useState(Array.from({ length: 100 }, (_, i) => currentWeek - 50 + i));

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Filtrer les devoirs
  const [hideDone, setHideDone] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Création de devoirs personnalisés
  const [showCreateHomework, setShowCreateHomework] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idHomework, setIdHomework] = useState(NaN);
  const [contentHomework, setContentHomework] = useState<string | null>(null);
  const [dateHomework, setDateHomework] = useState(Date.now());

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  const keyExtractor = useCallback((item: any) => item.toString(), []);

  const getDayName = (date: string | number | Date): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[new Date(date).getDay()];
  };

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isOnline && loading) {
      setLoading(false);
    }
  }, [isOnline, loading]);

  const [loadedWeeks, setLoadedWeeks] = useState<number[]>([]);

  const updateHomeworks = useCallback(async (force = false, showRefreshing = true, showLoading = true) => {
    if(!account) return;

    if (!force && loadedWeeks.includes(selectedWeek)) {
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    }
    if (showLoading) {
      setLoading(true);
    }
    updateHomeworkForWeekInCache(account, epochWNToDate(selectedWeek))
      .then(() => {
        setLoading(false);
        setRefreshing(false);
        setLoadedWeeks(prev => [...prev, selectedWeek]);
      });
  }, [account, selectedWeek, loadedWeeks]);

  // on page change, load the homeworks
  useEffect(() => {
    updateHomeworks(false, false);
  }, [selectedWeek]);

  const [searchTerms, setSearchTerms] = useState("");

  const renderWeek: ListRenderItem<number> = ({ item }) => {
    const homeworksInWeek = [...(homeworks[item] ?? [])];
    const homeworksPersonalized = account.homeworks ?? [];

    const personalizedForWeek = homeworksPersonalized.filter((element) => {
      const weekHomework = dateToEpochWeekNumber(new Date(element.due));
      return weekHomework === item;
    });

    const combinedHomeworks = [...homeworksInWeek, ...personalizedForWeek];

    const sortedHomework = combinedHomeworks.sort(
      (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()
    );

    const groupedHomework = sortedHomework.reduce((acc, curr) => {
      const dayName = getDayName(curr.due);
      const formattedDate = formatDate(curr.due);
      const day = `${dayName} ${formattedDate}`;

      if (!acc[day]) {
        acc[day] = [curr];
      } else {
        acc[day].push(curr);
      }

      // filter homeworks by search terms
      if (searchTerms.length > 0) {
        acc[day] = acc[day].filter(homework => {
          const content = homework.content.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const subject = homework.subject.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return content.includes(searchTerms.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
                 subject.includes(searchTerms.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        });
      }

      // if hideDone is enabled, filter out the done homeworks
      if (hideDone) {
        acc[day] = acc[day].filter(homework => !homework.done);
      }

      // homework completed downstairs
      acc[day] = acc[day].sort((a, b) => {
        if (a.done === b.done) {
          return 0; // if both have the same status, keep the original order
        }
        return a.done ? 1 : -1; // completed go after
      });

      // remove all empty days
      if (acc[day].length === 0) {
        delete acc[day];
      }

      return acc;
    }, {} as Record<string, Homework[]>);

    const askForReview = async () => {
      StoreReview.isAvailableAsync().then((available) => {
        if (available) {
          StoreReview.requestReview();
        }
      });
    };

    const countCheckForReview = async () => {
      AsyncStorage.getItem("review_checkedHomeworkCount").then((value) => {
        if (value) {
          if (parseInt(value) >= 5) {
            AsyncStorage.setItem("review_checkedHomeworkCount", "0");

            setTimeout(() => {
              AsyncStorage.getItem("review_given").then((value) => {
                if(!value) {
                  askForReview();
                  AsyncStorage.setItem("review_given", "true");
                }
              });
            }, 1000);
          }
          else {
            AsyncStorage.setItem("review_checkedHomeworkCount", (parseInt(value) + 1).toString());
          }
        } else {
          AsyncStorage.setItem("review_checkedHomeworkCount", "1");
        }
      });
    };

    return (
      <ScrollView
        style={{ width, height: "100%" }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: outsideNav ? 72 : insets.top + 56,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => updateHomeworks(true)}
            progressViewOffset={outsideNav ? 72 : insets.top + 56}
          />
        }
      >
        {!isOnline && <OfflineWarning cache={true} />}

        {groupedHomework && Object.keys(groupedHomework).map((day) => (
          <Reanimated.View
            key={day}
            entering={animPapillon(FadeInUp)}
            exiting={animPapillon(FadeOutDown)}
            layout={animPapillon(LinearTransition)}
          >
            <NativeListHeader animated label={day} />

            <NativeList animated>
              {groupedHomework[day].map((homework, idx) => (
                <MemoizedHomeworkItem
                  key={homework.id}
                  index={idx}
                  navigation={navigation}
                  total={groupedHomework[day].length}
                  homework={homework}
                  onDonePressHandler={async () => {
                    if (account.service !== AccountService.Skolengo) {
                      await toggleHomeworkState(account, homework);
                    }
                    await updateHomeworks(true, false, false);
                    await countCheckForReview();
                  }}
                />
              ))}
            </NativeList>
          </Reanimated.View>
        ))}

        {groupedHomework && Object.keys(groupedHomework).length === 0 &&
          <Reanimated.View
            style={{
              marginTop: 24,
              width: "100%",
            }}
            layout={animPapillon(LinearTransition)}
            key={searchTerms + hideDone}
          >
            {searchTerms.length > 0 ? (
              <MissingItem
                emoji="🔍"
                title="Aucun résultat"
                description="Aucun devoir ne correspond à ta recherche."
              />
            ) : hideDone ? (
              <MissingItem
                emoji="🌴"
                title="Il ne reste rien à faire"
                description="Il n'y a aucun devoir non terminé pour cette semaine."
              />
            ) : hasServiceSetup ? (
              <MissingItem
                emoji="📚"
                title="Aucun devoir"
                description="Il n'y a aucun devoir pour cette semaine."
              />
            ) : (
              <MissingItem
                title="Aucun service connecté"
                description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
                emoji="🤷"
              />
            )}
          </Reanimated.View>
        }
      </ScrollView>
    );
  };

  const onEndReached = () => {
    const lastWeek = data[data.length - 1];
    const newWeeks = Array.from({ length: 50 }, (_, i) => lastWeek + i + 1);
    setData(prevData => [...prevData, ...newWeeks]);
  };

  const onStartReached = () => {
    const firstWeek = data[0];
    const newWeeks = Array.from({ length: 50 }, (_, i) => firstWeek - 50 + i);
    setData(prevData => [...newWeeks, ...prevData]);
    flatListRef.current?.scrollToIndex({ index: 50, animated: false });
  };

  const onScroll: ScrollViewProps["onScroll"] = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (nativeEvent.contentOffset.x < width) {
      onStartReached();
    }

    // Update selected week based on scroll position
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const onMomentumScrollEnd = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const [searchHasFocus, setSearchHasFocus] = useState(false);

  const SearchRef: React.MutableRefObject<TextInput> = useRef(null) as any as React.MutableRefObject<TextInput>;

  return (
    <>
      <PapillonModernHeader outsideNav={outsideNav}>
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          entering={animPapillon(FadeIn).delay(100)}
          exiting={animPapillon(FadeOutLeft)}
        >
          <PressableScale
            style={[styles.weekPickerContainer]}
            onPress={() => undefined} // Afficher DatePicker
            onLongPress={() => {
              setHideDone(!hideDone);
              playHaptics("notification", {
                notification: Haptics.NotificationFeedbackType.Success,
              });
            }}
            delayLongPress={200}
          >
            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={[{
                backgroundColor: theme.colors.text + 16,
                overflow: "hidden",
                borderRadius: 80,
              }]}
            >
              <BlurView
                style={[styles.weekPicker, {
                  backgroundColor: "transparent",
                }]}
                tint={theme.dark ? "dark" : "light"}
              >
                <Reanimated.Text style={[styles.weekPickerText, styles.weekPickerTextIntl,
                  {
                    color: theme.colors.text,
                  }
                ]}
                layout={animPapillon(LinearTransition)}
                >
                  {width > 370 ? "Semaine" : "sem."}
                </Reanimated.Text>

                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                >
                  <AnimatedNumber
                    value={((selectedWeek - firstDateEpoch % 52) % 52 + 1).toString()}
                    style={[styles.weekPickerText, styles.weekPickerTextNbr,
                      {
                        color: theme.colors.text,
                      }
                    ]}
                  />
                </Reanimated.View>

                {loading &&
                  <PapillonSpinner
                    size={18}
                    color={theme.colors.text}
                    strokeWidth={2.8}
                    entering={animPapillon(ZoomIn)}
                    exiting={animPapillon(ZoomOut)}
                    style={{
                      marginLeft: 5,
                    }}
                  />
                }
              </BlurView>
            </Reanimated.View>
          </PressableScale>
        </Reanimated.View>

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={{
            flex: 1
          }}
        />

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          entering={animPapillon(FadeInLeft).delay(100)}
          exiting={animPapillon(FadeOutLeft)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background + "ff",
            borderColor: theme.colors.border + "dd",
            borderWidth: 1,
            borderRadius: 800,
            height: 40,
            width: 40,
            gap: 4,
            shadowColor: "#00000022",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setIdHomework(Math.random() * 1000 + 1);
              setShowCreateHomework(true);
            }}
          >
            <BookPlus
              size={20}
              color={theme.colors.text}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Reanimated.View>

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          entering={animPapillon(FadeInLeft).delay(100)}
          exiting={animPapillon(FadeOutLeft)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background + "ff",
            borderColor: theme.colors.border + "dd",
            borderWidth: 1,
            borderRadius: 800,
            height: 40,
            width: 40,
            gap: 4,
            shadowColor: "#00000022",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setShowFilter(true);
            }}
          >
            <ListFilter
              size={20}
              color={theme.colors.text}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Reanimated.View>
      </PapillonModernHeader>

      <BottomSheet
        key="Filter"
        opened={showFilter}
        setOpened={setShowFilter}
        contentContainerStyle={{
          paddingHorizontal: 16,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }}
      >
        <View style={{ alignSelf: "center", marginTop: 15, flexDirection: "row", gap: 16 }}>
          <MemoizedNativeText variant="titleLarge" numberOfLines={2}>
            Filtrer les devoirs
          </MemoizedNativeText>
        </View>

        <MemoizedNativeList style={{ marginTop: 16 }}>
          <MemoizedNativeItem>
            <MemoizedNativeText variant="subtitle" numberOfLines={1}>
              Via Recherche
            </MemoizedNativeText>
            <Reanimated.View
              layout={
                LinearTransition.duration(250).easing(Easing.bezier(0.5, 0, 0, 1).factory())
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.background + "ff",
                borderColor: theme.colors.border + "dd",
                borderWidth: 1,
                borderRadius: 800,
                paddingHorizontal: 14,
                height: 40,
                gap: 4,
                shadowColor: "#00000022",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                marginTop: 5,
                marginHorizontal: -10,
              }}
            >
              <TouchableOpacity onPress={() => SearchRef.current?.focus()}>
                <Search
                  size={20}
                  color={theme.colors.text}
                  strokeWidth={2.5}
                  opacity={0.7}
                />
              </TouchableOpacity>

              <Reanimated.View
                layout={animPapillon(LinearTransition)}
                style={{
                  flex: 1,
                  height: "100%",
                  overflow: "hidden",
                  borderRadius: 80,
                }}
                entering={FadeIn.duration(250).delay(20)}
                exiting={FadeOut.duration(100)}
              >
                <ResponsiveTextInput
                  placeholder={
                    (hideDone && !searchHasFocus) ? "Uniquement devoirs non terminés" :
                      "Rechercher"
                  }
                  value={searchTerms}
                  onChangeText={setSearchTerms}
                  placeholderTextColor={theme.colors.text + "80"}
                  style={{
                    color: theme.colors.text,
                    padding: 8,
                    borderRadius: 80,
                    fontFamily: "medium",
                    fontSize: 16.5,
                    flex: 1,
                  }}
                  onFocus={() => setSearchHasFocus(true)}
                  onBlur={() => setSearchHasFocus(false)}
                  ref={SearchRef}
                />
              </Reanimated.View>

              {searchTerms.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchTerms("")}
                >
                  <Reanimated.View
                    layout={animPapillon(LinearTransition)}
                    entering={FadeIn.duration(100)}
                    exiting={FadeOut.duration(100)}
                  >
                    <X
                      size={20}
                      color={theme.colors.text}
                      strokeWidth={2.5}
                      opacity={0.7}
                    />
                  </Reanimated.View>
                </TouchableOpacity>
              )}
            </Reanimated.View>
          </MemoizedNativeItem>
        </MemoizedNativeList>

        <MemoizedNativeList style={{ marginTop: 16 }}>
          <MemoizedNativeItem
            leading={(
              <Reanimated.View
                layout={animPapillon(LinearTransition)}
                entering={animPapillon(FadeInLeft).delay(100)}
                exiting={animPapillon(FadeOutLeft)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: hideDone ? theme.colors.primary : theme.colors.background + "ff",
                  borderColor: theme.colors.border + "dd",
                  borderWidth: 1,
                  borderRadius: 800,
                  height: 40,
                  width: 40,
                  gap: 4,
                  shadowColor: "#00000022",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setHideDone(!hideDone);
                  }}
                >
                  <CheckSquare
                    size={20}
                    color={hideDone ? "#fff" : theme.colors.text}
                    strokeWidth={2.5}
                    opacity={hideDone ? 1 : 0.7}
                  />
                </TouchableOpacity>
              </Reanimated.View>
            )}
          >
            <MemoizedNativeText numberOfLines={3}>
              {hideDone ? "Afficher tous les devoirs" : "Afficher uniquement les devoirs non faits"}
            </MemoizedNativeText>
          </MemoizedNativeItem>
        </MemoizedNativeList>
      </BottomSheet>

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
            setLoading(false);
          }
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }}
      >
        <View style={{ alignSelf: "center", marginTop: 15, flexDirection: "row", gap: 16 }}>
          <MemoizedNativeText variant="titleLarge" numberOfLines={2}>
            Créer un devoir
          </MemoizedNativeText>
        </View>

        <MemoizedNativeList style={{ marginTop: 16 }}>
          <MemoizedNativeItem>
            <MemoizedNativeText variant="subtitle" numberOfLines={1}>
              Aperçu
            </MemoizedNativeText>
            <View style={{ marginHorizontal: -20, marginTop: 5, marginBottom: -10 }}>
              <MemoizedHomeworkItem
                homework={{
                  attachments: [],
                  color: selectedPretty.color,
                  content: contentHomework ?? "Écris le contenu du devoir juste en-dessous :)",
                  done: false,
                  due: dateHomework,
                  id: String(idHomework),
                  personalizate: true,
                  subject: selectedPretty.pretty,
                  exam: false,
                }}
                index={idHomework}
                key={idHomework}
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
            setLoading(true);

            if (!selectedPretty || !contentHomework) {
              Alert.alert("Veuillez remplir tous les champs avant de valider.");
              setLoading(false);
              return;
            }

            // Créez un objet représentant le devoir
            const newHomework: Homework = {
              id: String(idHomework),
              subject: selectedPretty.pretty,
              color: selectedPretty.color,
              content: contentHomework,
              due: dateHomework,
              done: false,
              personalizate: true,
              attachments: [],
              exam: false,
            };

            useAccounts.getState().addHomework(account.localID, newHomework);

            setShowCreateHomework(false);
            setSelectedPretty(Object.entries(localSubjects || {})[0]?.[1] ?? null);
            setIdHomework(NaN);
            setContentHomework(null);
            setDateHomework(Date.now());
            setLoading(false);
          }}
          primary={!loading}
          icon={loading ? <ActivityIndicator /> : void 0}
          disabled={loading}
          style={{
            minWidth: undefined,
            maxWidth: undefined,
            width: "50%",
            alignSelf: "center",
            marginTop: 15,
          }}
        />
      </BottomSheet>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderWeek}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        initialScrollIndex={50}
        style={{
          height: "100%",
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    top: 0,
    left: 0,
  },

  weekPickerContainer: {},

  weekPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 14.5,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },

  weekButton: {
    overflow: "hidden",
    borderRadius: 80,
    height: 38,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WeekView;
