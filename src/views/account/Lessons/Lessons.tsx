import * as React from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";

import CalendarKit, { CalendarBody, CalendarHeader, DeepPartial, ThemeConfigs } from "@howljs/calendar-kit";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useTheme } from "@react-navigation/native";
import { NativeText } from "@/components/Global/NativeComponents";

const initialLocales: Record<string, Partial<LocaleConfigsProps>> = {
  en: {
    weekDayShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), // Text in day header (Sun, Mon, etc.)
    meridiem: { ante: "am", post: "pm" }, // Hour format (hh:mm a)
    more: "more", // Text for "more" button (All day events)
  },
  fr: {
    weekDayShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_"), // Text in day header (Sun, Mon, etc.)
    meridiem: { ante: "am", post: "pm" }, // Hour format (hh:mm a)
    more: "plus", // Text for "more" button (All day events)
  },
};

const Lessons = () => {
  const theme = useTheme();

  const [events, setEvents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const account = useCurrentAccount((store) => store.account!);
  const mutateProperty = useCurrentAccount((store) => store.mutateProperty);

  const timetables = useTimetableStore((store) => store.timetables);

  const loadedWeeks = React.useRef<Set<number>>(new Set());
  const currentlyLoadingWeeks = React.useRef<Set<number>>(new Set());


  const customTheme: DeepPartial<ThemeConfigs> = {
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      border: theme.colors.border,
      text: theme.colors.text,
      surface: theme.colors.card,
      onPrimary: theme.colors.background,
      onBackground: theme.colors.text,
      onSurface: theme.colors.text,
    }
  };

  useEffect(() => {
    // add all week numbers in timetables to loadedWeeks
    for (const week in timetables) {
      loadedWeeks.current.add(parseInt(week));
    }
  }, [timetables]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pickerDate, setPickerDate] = useState(new Date(today));

  const getWeekFromDate = (date: Date) => {
    const epochWeekNumber = dateToEpochWeekNumber(date);
    return epochWeekNumber;
  };

  const [updatedWeeks, setUpdatedWeeks] = useState(new Set<number>());

  useEffect(() => {
    void (async () => {
      const weekNumber = getWeekFromDate(pickerDate);
      await loadTimetableWeek(weekNumber, false);
      // setWeekFrequency((await getWeekFrequency(account, weekNumber)));
    })();
  }, [pickerDate, account.instance]);

  useEffect(() => {
    loadTimetableWeek(getWeekFromDate(new Date()), true);
  }, [account.personalization.icalURLs]);

  const [loadingWeeks, setLoadingWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTimetableWeek = async (weekNumber: number, force = false) => {
    if (
      (currentlyLoadingWeeks.current.has(weekNumber) ||
          loadedWeeks.current.has(weekNumber)) &&
        !force
    ) {
      return;
    }

    setLoading(true);

    if (force) {
      setLoadingWeeks([...loadingWeeks, weekNumber]);
    }

    try {
      await updateTimetableForWeekInCache(account, weekNumber, force);
      currentlyLoadingWeeks.current.add(weekNumber);
    } finally {
      currentlyLoadingWeeks.current.delete(weekNumber);
      loadedWeeks.current.add(weekNumber);
      setUpdatedWeeks(new Set(updatedWeeks).add(weekNumber));
      setLoadingWeeks(loadingWeeks.filter((w) => w !== weekNumber));
      setLoading(false);
    }
  };

  useEffect(() => {
    if(!events) {
      const events = Object.values(timetables)
        .map((timetable) => timetable)
        .flat();

      const finalEvents = events.map((event) => {
        return {
          id: event.id,
          title: event.title,
          start: {
            dateTime: new Date(event.startTimestamp).toISOString().slice(0, 19) + "Z",
          },
          end: {
            dateTime: new Date(event.endTimestamp).toISOString().slice(0, 19) + "Z",
          },
          color: "#ff0000",
        };
      });

      setEvents(finalEvents);
    }
  }, []);

  const _onDateChanged = async (date: string) => {
    console.log(date);
    // setIsLoading(true);
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <CalendarKit
        theme={customTheme}

        numberOfDays={3}
        events={events}
        isLoading={isLoading}
        onDateChanged={_onDateChanged}

        initialLocales={initialLocales}
        locale="fr"
        hourFormat="HH:mm"

        allowPinchToZoom={true}
        /*hideWeekDays={[6, 7]}*/

        renderEvent={(event) => {
          return (
            <View
              style={{
                backgroundColor: "blue",
                borderRadius: 0,
                padding: 10,
              }}
            >
              <NativeText
                style={{
                  color: "white",
                }}
              >
                {event.title}
              </NativeText>
            </View>
          );
        }}
      >
        <CalendarHeader/>
        <CalendarBody/>
      </CalendarKit>
    </View>
  );
};

export default Lessons;