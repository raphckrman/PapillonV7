import React, { useEffect, useState } from "react";
import { Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

const ButtonCta: React.FC<{
  value: string
  primary?: boolean
  disabled?: boolean
  onPress?: () => void,
  style?: StyleProp<ViewStyle>,
  backgroundColor?: string,
  icon?: React.ReactElement
}> = ({
  value,
  primary,
  onPress,
  style,
  disabled,
  backgroundColor,
  icon,
}) => {
  const { colors } = useTheme();

  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  if (!backgroundColor) {
    backgroundColor = primary ? colors.primary : "transparent";
  }

  const newIcon = icon ? React.cloneElement(icon, {
    color: (primary && !disabled) ? "#fff" : colors.text,
    size: 24,
  }) : null;

  useEffect(() => {
    if (pressed) {
      scale.value = withTiming(1, { duration: 0, easing: Easing.linear });
      scale.value = withTiming(0.95, { duration: 50, easing: Easing.linear });
      opacity.value = withTiming(0.7, { duration: 10, easing: Easing.linear });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    else {
      scale.value = withTiming(1, { duration: 100, easing: Easing.linear });
      opacity.value = withTiming(1, { duration: 100, easing: Easing.linear });
    }
  }, [pressed]);

  return (
    <Reanimated.View
      style={{
        transform: [{ scale }],
        opacity
      }}
    >
      <Pressable
        style={[
          styles.button,
          primary ? void 0 : styles.secondary,
          { backgroundColor: backgroundColor },
          {
            borderColor: colors.border,
          },
          disabled && { opacity: 0.5, backgroundColor: colors.border },
          style
        ]}
        onPress={!disabled ? onPress : undefined}
        onPressIn={() => !disabled ? setPressed(true) : undefined}
        onPressOut={() => !disabled ? setPressed(false) : undefined}
      >
        {icon && newIcon}

        <Text style={[styles.text, { color: (primary && !disabled) ? "#ffffff" : colors.text}]}>
          {value}
        </Text>
      </Pressable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: "100%",
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
  },

  secondary: {
    borderWidth: 2,
    opacity: 0.5 ,
  },

  text: {
    fontSize: 16,
    fontFamily: "semibold",
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "center",
    textAlign: "center",
  },
});

export default ButtonCta;
