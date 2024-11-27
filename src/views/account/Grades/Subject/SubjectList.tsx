import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Reanimated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import SubjectTitle from "./SubjectTitle";
import { type Grade, type GradesPerSubject } from "@/services/shared/Grade";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";

interface SubjectItemProps {
  subject: GradesPerSubject;
  allGrades: Grade[];
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>;
}

const SubjectItem: React.FC<SubjectItemProps> = ({
  subject,
  allGrades,
  navigation,
}) => {
  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(subject.average.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [subject.average.subjectName]);

  if (!subjectData) {
    return null;
  }

  return (
    <NativeList
      animated


    >
      <SubjectTitle
        navigation={navigation}
        subject={subject}
        subjectData={subjectData}
        allGrades={allGrades}
      />

      {subject.grades.map((grade: Grade, index: number) => (
        <Reanimated.View
          key={grade.id + index + "subjectlistname"}
          entering={animPapillon(FadeInDown).delay(50 * index + 100)}
          exiting={animPapillon(FadeOutUp).delay(50 * index)}
        >
          <NativeItem
            separator={index < subject.grades.length - 1}
            chevron={false}
            onPress={() =>
              navigation.navigate("GradeDocument", { grade, allGrades })
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <NativeText variant="default" numberOfLines={1}>
                  {grade.description || "Note sans titre"}
                </NativeText>
                <NativeText variant="subtitle" numberOfLines={1}>
                  {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </NativeText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                }}
              >
                <NativeText
                  style={{
                    fontSize: 17,
                    lineHeight: 20,
                    fontFamily: "medium",
                  }}
                >
                  {typeof grade.student.value === "number"
                    ? grade.student.value.toFixed(2)
                    : "N. not"}
                </NativeText>
                <NativeText
                  style={{
                    fontSize: 15,
                    lineHeight: 15,
                    opacity: 0.6,
                  }}
                >
                  /{grade.outOf.value?.toFixed(0) ?? "??"}
                </NativeText>
              </View>
            </View>
          </NativeItem>
        </Reanimated.View>
      ))}
    </NativeList>
  );
};

export default SubjectItem;
