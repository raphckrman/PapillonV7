import { useTheme } from "@react-navigation/native";
import { Calendar } from "lucide-react-native";
import { ActivityIndicator, Platform, Text } from "react-native";

import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp
} from "react-native-reanimated";

const HomeworksLoading = () => {
  const colors = useTheme().colors;

  return (
    <Reanimated.View
      
      
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size={20} />

      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          textAlign: "center",
          fontFamily: "semibold",
          marginTop: 10,
        }}
      >
        Chargement des cours...
      </Text>

      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          textAlign: "center",
          fontFamily: "medium",
          marginTop: 4,
          opacity: 0.5,
        }}
      >
        Veuillez patienter
      </Text>
    </Reanimated.View>
  );
};

export default HomeworksLoading;