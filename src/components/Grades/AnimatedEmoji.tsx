import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";

const AnimatedEmoji = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const emojis = ["😍", "🙄", "😭", "🥳", "😱", "😳"];
  const [currentEmoji, setCurrentEmoji] = React.useState(emojis[0]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const changeEmoji = () => {
    scale.value = withSequence(
      withSpring(0.5, {
        damping: 10,
        stiffness: 100,
      }),
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );

    opacity.value = withSequence(
      withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(1, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      })
    );

    setTimeout(() => {
      const nextIndex = (emojis.indexOf(currentEmoji) + 1) % emojis.length;
      setCurrentEmoji(emojis[nextIndex]);
    }, 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      changeEmoji();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentEmoji]);

  return (
    <Animated.Text
      style={[
        {
          color: "#FFFFFF",
          fontSize: 18,
          fontFamily: "semibold",
          textAlign: "center",
          textAlignVertical: "center",
          marginTop: -2,
        },
        animatedStyle,
      ]}
    >
      {currentEmoji}
    </Animated.Text>
  );
};

export default AnimatedEmoji;