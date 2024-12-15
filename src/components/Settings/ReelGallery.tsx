import React, { useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { NativeText } from "@/components/Global/NativeComponents";
import { Reel } from "@/services/shared/Reel";

interface ReelModalProps {
  reel: Reel;
  visible: boolean;
  onClose: () => void;
}

// Calculer la largeur de l'écran et définir les constantes de mise en page
const { width: WINDOW_WIDTH } = Dimensions.get("window");
const PADDING = 16; // Padding sur les côtés
const GAP = 8;

const ReelModal: React.FC<ReelModalProps> = ({ reel, visible, onClose }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background + "f0" }]}>
        <TouchableOpacity
          style={styles.modalCloseArea}
          activeOpacity={1}
          onPress={onClose}
        >
          <Reanimated.View style={[styles.modalContent, animatedStyle]}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${reel.image}` }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={[styles.modalInfo, { backgroundColor: colors.card }]}>
              <NativeText style={[styles.modalMessage, { color: colors.text }]}>
                {reel.message}
              </NativeText>
              <View style={styles.gradeContainer}>
                <NativeText style={[styles.gradeText, { color: colors.text }]}>
                  Test
                </NativeText>
                <NativeText style={[styles.dateText, { color: colors.text }]}>
                  {new Date(reel.timestamp).toLocaleDateString()}
                </NativeText>
              </View>
            </View>
          </Reanimated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const ReelGallery: React.FC<{ reels: Reel[] }> = ({ reels }) => {
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const { colors } = useTheme();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {reels.map((reel, index) => (
          <TouchableOpacity
            key={reel.id}
            style={[
              styles.item,
              { backgroundColor: colors.card },
              // Ajouter une marge à droite pour les éléments de gauche (index pair)
              index % 2 === 0 && styles.itemMarginRight,
            ]}
            onPress={() => setSelectedReel(reel)}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${reel.image}` }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>

      {selectedReel && (
        <ReelModal
          reel={selectedReel}
          visible={!!selectedReel}
          onClose={() => setSelectedReel(null)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: 160,
    height: 200,
    marginBottom: GAP,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemMarginRight: {
    marginRight: GAP,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  grade: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: 300,
  },
  modalInfo: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 8,
  },
  gradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
  },
});

export default ReelGallery;