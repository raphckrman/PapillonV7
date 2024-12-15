import React from "react";
import { ScrollView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { useGradesStore } from "@/stores/grades";
import ReelGallery from "@/components/Settings/ReelGallery";

const SettingsReactions: Screen<"SettingsReactions"> = () => {
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <ReelGallery reels={reels} />
    </ScrollView>
  );
};

export default SettingsReactions;