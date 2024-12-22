import React, { useEffect, useMemo, useState } from "react";
import Reanimated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { TimetableClass } from "@/services/shared/Timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import MissingItem from "@/components/Global/MissingItem";
import { TimetableItem } from "../../Lessons/Atoms/Item";

interface TimetableElementProps {
  onImportance: (value: number) => unknown;
}

const TimetableElement: React.FC<TimetableElementProps> = ({ onImportance }) => {
  const account = useCurrentAccount((store) => store.account!);
  const timetables = useTimetableStore((store) => store.timetables);

  const [nextCourses, setNextCourses] = useState<TimetableClass[]>([]);
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentWeekNumber = useMemo(() => dateToEpochWeekNumber(new Date()), []);

  const ImportanceHandler = (nextCourses: TimetableClass[]) => {
    if (nextCourses.length > 0) {
      let difference = new Date(nextCourses[0].startTimestamp).getHours() - new Date().getHours();
      if (difference < 0) {
        difference = 0;
      }
      onImportance(6 - difference);
    } else {
      onImportance(0);
    }
  };

  const isToday = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = () => {
    const today = new Date().getDay();
    return today === 6 || today === 0; // 6 = Saturday, 0 = Sunday
  };

  const isVacation = (courses: TimetableClass[]) =>
    courses.length === 1 && courses[0].type === "vacation";

  const fetchTimetable = async () => {
    if (!timetables[currentWeekNumber] && account.instance) {
      setLoading(true);
      try {
        await updateTimetableForWeekInCache(account, currentWeekNumber);
      } finally {
        setLoading(false);
      }
    }
  };

  const updateNextCourses = () => {
    if (!account.instance || !timetables[currentWeekNumber]) {
      return;
    }

    const weekCourses = timetables[currentWeekNumber];
    const now = Date.now();

    const upcomingCourses = weekCourses
      .filter((c) => c.startTimestamp > now)
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .slice(0, 3);

    setNextCourses(upcomingCourses);
    ImportanceHandler(upcomingCourses);
    setHidden(upcomingCourses.length === 0);
  };

  useEffect(() => {
    fetchTimetable();
  }, [currentWeekNumber, account.instance]);

  useEffect(() => {
    updateNextCourses();
    const intervalId = setInterval(updateNextCourses, 60000);
    return () => clearInterval(intervalId);
  }, [account.instance, timetables, currentWeekNumber]);

  if (loading) {
    return (
      <NativeList
        animated
        key="loadingCourses"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem
            emoji="⏳"
            title="Chargement de l'emploi du temps"
            description="Veuillez patienter..."
          />
        </NativeItem>
      </NativeList>
    );
  }

  if (isWeekend()) {
    return (
      <NativeList
        animated
        key="weekend"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem
            emoji="🌴"
            title="C'est le week-end !"
            description="Profitez de votre week-end, il n'y a pas de cours aujourd'hui."
          />
        </NativeItem>
      </NativeList>
    );
  }

  if (isVacation(nextCourses)) {
    return (
      <NativeList
        animated
        key="vacation"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem
            emoji="🏝️"
            title="C'est les vacances !"
            description="Profitez de vos vacances, à bientôt."
          />
        </NativeItem>
      </NativeList>
    );
  }

  if (hidden || nextCourses.length === 0) {
    return (
      <NativeList
        animated
        key="emptyCourses"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem
            emoji="📚"
            title="Aucun cours à venir"
            description="Il n'y a pas de cours à venir pour les prochains jours."
          />
        </NativeItem>
      </NativeList>
    );
  }

  const label = isToday(nextCourses[0].startTimestamp)
    ? "Emploi du temps"
    : "Prochains cours";

  return (
    <>
      <NativeListHeader
        animated
        label={label}
        trailing={<RedirectButton navigation={PapillonNavigation.current} redirect="Lessons" />}
      />
      <Reanimated.View layout={LinearTransition} style={{ marginTop: 24, gap: 10 }}>
        {nextCourses.map((course, index) => (
          <React.Fragment key={course.id || index}>
            <TimetableItem item={course} index={index} small />
          </React.Fragment>
        ))}
      </Reanimated.View>
    </>
  );
};

export default TimetableElement;
