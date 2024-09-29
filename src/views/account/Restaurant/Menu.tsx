import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  Clock2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react-native";

import type { Screen } from "@/router/helpers/types";
import RestaurantCard from "@/components/Restaurant/RestaurantCard";
import { HorizontalList, Item } from "@/components/Restaurant/ButtonList";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import TabAnimatedTitle from "@/components/Global/TabAnimatedTitle";
import { Balance } from "@/services/shared/Balance";
import { balanceFromExternal } from "@/services/balance";
import { QRCodeFromExternal } from "@/services/qrcode";

const Menu: Screen<"Menu"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const linkedAccounts = useCurrentAccount((store) => store.linkedAccounts);

  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / (screenWidth - 200));
    setActiveIndex(Math.max(0, Math.min(index, balances ? balances.length - 1 : 0)));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      ...TabAnimatedTitle({ theme, route, navigation }),
    });
  }, [navigation, route.params, theme.colors.text]);

  const [balances, setBalances] = useState<Balance[] | null>(null);
  const [qrCodes, setQrCodes] = useState<number[] | null>(null);

  useEffect(() => {
    void async function () {
      const balances: Balance[] = [];
      const qrCodes: number[] = [];
      for (const account of linkedAccounts) {
        const balance = await balanceFromExternal(account);
        const qrcode = await QRCodeFromExternal(account);
        balances.push(...balance);
        if (qrcode !== null) {
          qrCodes.push(qrcode);
        }
      }

      setBalances(balances);
      setQrCodes(qrCodes);
    }();
  }, [linkedAccounts]);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        onScroll={handleScroll}
        decelerationRate="fast"
        scrollEnabled={(balances ?? []).length > 1}
        contentContainerStyle={{ alignItems: "center", gap: 16 }}
      >
        {balances?.map((item, index) => (
          <View style={{ width: screenWidth - 32 }}>
            <RestaurantCard
              theme={theme}
              solde={item.amount}
              repas={item.remaining}
              accountName={item.label ?? null}
            />
          </View>
        ))}
      </ScrollView>

      {balances && balances.length > 1 && (
        <View style={styles.dotsContainer}>
          {balances.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? { backgroundColor: colors.text } : { backgroundColor: colors.text + "25" },
              ]}
            />
          ))}
        </View>
      )}


      <HorizontalList style={styles.horizontalList}>
        <Item
          title="Historique"
          icon={<Clock2 color={colors.text} />}
          onPress={() => navigation.navigate("RestaurantHistory")}
        />
        <Item
          title="QR-Code"
          icon={<QrCode color={colors.text} />}
          onPress={() => navigation.navigate("RestaurantQrCode", { qrCodes: qrCodes ? qrCodes : [] })}
          enable={qrCodes?.length !== 0}
        />
      </HorizontalList>

      <View style={styles.calendarContainer}>
        <TouchableOpacity style={styles.calendarButton}>
          <ChevronLeft color={colors.text + "70"} />
        </TouchableOpacity>
        <View
          style={[styles.calendarTextContainer, { backgroundColor: colors.primary + "22" }]}
        >
          <Calendar size={20} color={colors.primary} />
          <Text style={[styles.calendarText, { color: colors.primary }]}>
            vendredi 03 avril
          </Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <ChevronRight color={colors.text + "70"} />
        </TouchableOpacity>
      </View>

      <NativeListHeader label="Menus du jour" />
      <NativeList>
        <NativeItem>
          <NativeText variant="subtitle">Entrée</NativeText>
          <NativeText variant="title">Salade de tomates</NativeText>
          <NativeText variant="title">Kebab maison</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Plat</NativeText>
          <NativeText variant="title">Poulet rôti</NativeText>
          <NativeText variant="title">Pâtes</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Dessert</NativeText>
          <NativeText variant="title">Yaourt</NativeText>
          <NativeText variant="title">Fruit</NativeText>
        </NativeItem>
        <NativeItem>
          <NativeText variant="subtitle">Boisson</NativeText>
          <NativeText variant="title">Eau</NativeText>
          <NativeText variant="title">Coca-Cola</NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
    gap: 16,
  },
  horizontalList: {
    marginTop: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: -10,
    gap: 10,
  },
  calendarButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  calendarTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
  },
  calendarText: {
    fontFamily: "semibold",
    fontSize: 17,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    marginHorizontal: 4,
  }
});

export default Menu;
