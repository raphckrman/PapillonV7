import React, { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { RefreshCw, Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeList,
  NativeItem,
  NativeListHeader,
  NativeIconGradient,
} from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import SoundHapticsContainerCard from "@/components/Settings/SoundHapticsContainerCard";

const SettingsApparence: Screen<"SettingsSoundHaptics"> = () => {
  const insets = useSafeAreaInsets();

  const [defaultSon, setDefaultSon] = useState<boolean>(true);
  const [playSon, setPlaySon] = useState<boolean>(true);
  const [defaultHaptics, setDefaultHaptics] = useState<boolean>(true);
  const [playHaptics, setPlayHaptics] = useState<boolean>(true);
  const [hasUserChanged, setHasUserChanged] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("son").then((value) => {
      if (value) {
        setDefaultSon(Boolean(value));
        setPlaySon(Boolean(value));
      }
    });

    AsyncStorage.getItem("haptics").then((value) => {
      if (value) {
        setDefaultHaptics(Boolean(value));
        setPlayHaptics(Boolean(value));
      }
    });
  }, []);

  useEffect(() => {
    setHasUserChanged(playSon !== defaultSon);
    AsyncStorage.setItem("son", playSon.toString());
  }, [playSon]);

  useEffect(() => {
    setHasUserChanged(playHaptics !== defaultHaptics);
    AsyncStorage.setItem("haptics", playHaptics.toString());
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
            <Switch
              value={playSon}
              onValueChange={(value) => setPlaySon(value)}
            />
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
            <Switch
              value={playHaptics}
              onValueChange={(value) => setPlayHaptics(value)}
            />
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

      {hasUserChanged && (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
          <NativeList>
            <NativeItem
              leading={
                <NativeIconGradient
                  icon={<RefreshCw />}
                  colors={["#000", "#000"]}
                />
              }
              style={{ backgroundColor: "#C53424" }}
            >
              <NativeText variant="title">Redémarrer l'application</NativeText>
              <NativeText variant="subtitle">
                Pour que les modifications soient prises en compte, un
                redémarrage de l'application est recommandé
              </NativeText>
            </NativeItem>
          </NativeList>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default SettingsApparence;
