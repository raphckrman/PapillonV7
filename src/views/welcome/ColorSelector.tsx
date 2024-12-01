import React, { useLayoutEffect, useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaskStarsColored from "@/components/FirstInstallation/MaskStarsColored";
import { useTheme } from "@react-navigation/native";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import type { Screen } from "@/router/helpers/types";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentAccount } from "@/stores/account";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import Reanimated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { getIconName, setIconName } from "@candlefinance/app-icon";

import colorsList from "@/utils/data/colors.json";
import { removeColor } from "../settings/SettingsIcons";
import { expoGoWrapper } from "@/utils/native/expoGoAlert";

type Color = typeof colorsList[number];

const ColorSelector: Screen<"ColorSelector"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const settings = route.params?.settings || false;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [sound2, setSound2] = useState<Audio.Sound | null>(null);
  const [selectColor, setSelectColor] = useState<Color>(account?.personalization?.color!);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: settings || false,
      headerBackVisible: true,
      headerTitle: "Choix de la couleur",
    });
  }, [navigation]);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/../assets/sound/6.wav")
      );
      setSound(sound);

      const sound2 = await Audio.Sound.createAsync(
        require("@/../assets/sound/click_003.wav")
      );
      setSound2(sound2.sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (sound2) {
        sound2.unloadAsync();
      }
    };
  });

  useEffect(() => {
    const color = {... selectColor};

    expoGoWrapper(() => {
      getIconName().then((currentIcon) => {
        if (currentIcon.includes("_Dynamic_")) {
          const mainColor = color.hex.primary;
          const colorItem = colorsList.find((color) => color.hex.primary === mainColor);
          const nameIcon = removeColor(currentIcon);

          const iconConstructName = nameIcon + (colorItem ? "_" + colorItem.id : "");

          setIconName(iconConstructName);
        }
      });
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound2();
    mutateProperty("personalization", { color });
  }, [selectColor]);

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  const playSound2 = async () => {
    if (sound) {
      await sound2?.replayAsync();
    }
  };

  const messages = colorsList.map((color) => ({
    [color.hex.primary]: color.description
  })).reduce((acc, cur) => ({ ...acc, ...cur }), {} as { [key: string]: string });

  const ColorButton: React.FC<{ color: Color }> = ({ color }) => (
    <View style={styles.colorButtonContainer}>
      <Pressable
        onPress={() => setSelectColor(color)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? color.hex.primary + "44" : color.hex.primary,
          },
        ]}
      />

      {selectColor.hex.primary === color.hex.primary && (
        <Reanimated.View
          pointerEvents="none"
          style={[
            styles.colorButtonContainer,
            {
              position: "absolute",
              top: -18,
              left: -18,
              width: 60,
              height: 60,
              borderRadius: 200,
              borderColor: color.hex.primary,
              zIndex: 99,
            }
          ]}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Reanimated.View
        key={selectColor.hex.primary || "" + "_bg"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <LinearGradient
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          colors={[selectColor.hex.primary + "22", colors.background]}
          locations={[0, 0.5]}
        />
      </Reanimated.View>

      <PapillonShineBubble
        message={"Quelle est ta couleur préférée ?"}
        numberOfLines={1}
        width={280}
      />
      <MaskStarsColored color={selectColor.hex.primary || colors.text}/>
      <View style={styles.colors}>
        <View style={styles.row}>
          {colorsList.slice(0, 3).map((color) => <ColorButton key={color.id + "_colid"} color={color} />)}
        </View>
        <View style={styles.row}>
          {colorsList.slice(3, 6).map((color) => <ColorButton key={color.id + "_colid"} color={color} />)}
        </View>

        <Reanimated.View
          key={selectColor.hex.primary || "" + "_colprimid"}
          style={[styles.message, {
            backgroundColor: selectColor.hex.primary + "33",
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center"}]}
        >
          <Reanimated.Text
            style={{
              color: selectColor.hex.primary || "",
              fontFamily: "semibold",
              fontSize: 15,
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              width: "100%"
            }}
          >
            {messages[selectColor.hex.primary || ""]}
          </Reanimated.Text>
        </Reanimated.View>
      </View>

      <Reanimated.View
        style={styles.done}
        key={(selectColor.hex.primary || "") + "_btn"}
      >
        <ButtonCta
          primary
          value="Finaliser"
          onPress={async () => {
            if (!settings) {
              await playSound();
            }
            navigation.navigate("AccountStack", {onboard: true});
          }}
          disabled={!account?.personalization?.color}
          style={{
            marginBottom: insets.bottom + 20,
            backgroundColor: selectColor.hex.primary
          }}
        />
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 30,
    margin: 5,
  },
  colors: {
    flex: 1,
    marginTop: -200,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonContainer: {
    borderRadius: 200,
    borderWidth: 5,
    margin: 13,
    borderColor: "transparent",
  },
  message: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 250,
    width: "90%",
  },
  done: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
  },
});

export default ColorSelector;
