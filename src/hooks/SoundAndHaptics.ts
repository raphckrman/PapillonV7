import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function useSoundAndHaptics () {
  const [enableSon, setEnableSon] = useState<boolean | undefined>(undefined);
  const [enableHaptics, setEnableHaptics] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    if (enableSon === undefined) {
      AsyncStorage.getItem("son").then((value) => {
        if (value) {
          setEnableSon(value === "true");
        } else {
          setEnableSon(true);
        }
      });
    }

    if (enableHaptics === undefined) {
      AsyncStorage.getItem("haptics").then((value) => {
        if (value) {
          setEnableHaptics(value === "true");
        } else {
          setEnableHaptics(true);
        }
      });
    }
  }, []);

  return {
    enableSon,
    enableHaptics,
  };
}