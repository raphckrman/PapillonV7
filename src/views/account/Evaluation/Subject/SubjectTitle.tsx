import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeText } from "@/components/Global/NativeComponents";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {type RouteParameters, Screen} from "@/router/helpers/types";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";
import type {Grade, GradesPerSubject} from "@/services/shared/Grade";
import { getPronoteAverage, getSubjectAverage } from "@/utils/grades/getAverages";
import {Evaluation, EvaluationsPerSubject} from "@/services/shared/Evaluation";

type SubjectTitleParameters = {
  subjectData: {
    color: string
    pretty: string
    emoji: string
  }
};

const SubjectTitle = ({ subjectData }: SubjectTitleParameters) => {

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: subjectData.color + "11",
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <NativeText
          style={{
            fontSize: 18,
            lineHeight: 24,
          }}
        >
          {subjectData.emoji}
        </NativeText>
        <NativeText
          style={{
            flex: 1,
          }}
          numberOfLines={1}
          variant="overtitle"
        >
          {subjectData.pretty}
        </NativeText>
      </View>
    </View>
  );
};

export default SubjectTitle;
