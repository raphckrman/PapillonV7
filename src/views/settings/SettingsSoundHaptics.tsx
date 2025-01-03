import React, { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeList,
  NativeItem,
  NativeListHeader,
  NativeIconGradient,
} from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SoundHapticsContainerCard from "@/components/Settings/SoundHapticsContainerCard";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

const SettingsApparence: Screen<"SettingsSoundHaptics"> = () => {
  const insets = useSafeAreaInsets();

  const [playSon, setPlaySon] = useState<boolean | undefined>(undefined);
  const [playHaptics, setPlayHaptics] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    if (playHaptics === undefined) {
      AsyncStorage.getItem("son").then((value) => {
        if (value) {
          setPlaySon(value === "true");
        } else {
          setPlaySon(true);
        }
      });
    }

    if (playHaptics === undefined) {
      AsyncStorage.getItem("haptics").then((value) => {
        if (value) {
          setPlayHaptics(value === "true");
        } else {
          setPlayHaptics(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (playSon === undefined) return;
    AsyncStorage.setItem("son", String(playSon));
  }, [playSon]);

  useEffect(() => {
    if (playHaptics === undefined) return;
    AsyncStorage.setItem("haptics", String(playHaptics));
  }, [playHaptics]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <SoundHapticsContainerCard />

      <NativeListHeader label="Son" />
      <NativeList>
        <NativeItem
          trailing={
            playSon !== undefined ? (
              <Switch
                value={playSon}
                onValueChange={(value) => setPlaySon(value)}
              />
            ) : (
              <PapillonSpinner size={30} color="#04ACDC" />
            )
          }
          leading={
            <NativeIconGradient
              icon={<Volume2 />}
              colors={["#04ACDC", "#6FE3CD"]}
            />
          }
        >
          <NativeText variant="title">Jouer du son</NativeText>
          <NativeText variant="subtitle">
            Un son est joué lors de l'ouverture de différentes pages
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Vibration" />
      <NativeList>
        <NativeItem
          trailing={
            playHaptics !== undefined ? (
              <Switch
                value={playHaptics}
                onValueChange={(value) => setPlayHaptics(value)}
              />
            ) : (
              <PapillonSpinner size={30} color="#FFD700" />
            )
          }
          leading={
            <NativeIconGradient
              icon={<Vibrate />}
              colors={["#FFD700", "#FF8C00"]}
            />
          }
        >
          <NativeText variant="title">Jouer des vibrations</NativeText>
          <NativeText variant="subtitle">
            Des vibrations ont lieu lors de la navigation, lorsqu'on coche des
            devoirs...
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

export default SettingsApparence;
