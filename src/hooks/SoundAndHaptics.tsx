import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SoundHapticsContext = createContext({
  enableSon: true,
  enableHaptics: true,
  setEnableSon: (value: boolean) => {},
  setEnableHaptics: (value: boolean) => {},
});

export const SoundHapticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [enableSon, setEnableSon] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("son").then((value) =>
      setEnableSon(value === "true" || value === null)
    );
    AsyncStorage.getItem("haptics").then((value) =>
      setEnableHaptics(value === "true" || value === null)
    );
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("son", String(enableSon));
  }, [enableSon]);

  useEffect(() => {
    AsyncStorage.setItem("haptics", String(enableHaptics));
  }, [enableHaptics]);

  return (
    <SoundHapticsContext.Provider
      value={{ enableSon, enableHaptics, setEnableSon, setEnableHaptics }}
    >
      {children}
    </SoundHapticsContext.Provider>
  );
};

export const useSoundAndHaptics = () => useContext(SoundHapticsContext);
