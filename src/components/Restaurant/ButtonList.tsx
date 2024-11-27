import React, { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  GestureResponderEvent,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { PressableScale } from "@/components/Global/PressableScale";

interface ItemProps {
  title: string;
  icon: ReactNode;
  enable?: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

const Item: React.FC<ItemProps> = ({ title, icon, onPress, enable = true }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pressableScale,
        { borderColor: colors.border, opacity: enable ? 1 : 0.5 },
      ]}
      disabled={!enable}
    >
      <View style={styles.item}>
        {icon}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface HorizontalListProps {
  children: ReactNode;
  style?: ViewStyle;
}

const HorizontalList: React.FC<HorizontalListProps> = ({ children, style }) => {
  return (
    <View style={style}>
      <View style={styles.horizontalListContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 15,
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "semibold",
  },
  pressableScale: {
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalListContent: {
    flexDirection: "row",
    gap: 10,
  },
});

export { Item, HorizontalList };
