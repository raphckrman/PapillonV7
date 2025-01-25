import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert, ScrollView
} from "react-native";
import {Download, Trash, Share, Trash2, Dot, Ellipsis} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import {PressableScale} from "react-native-pressable-scale";
import {NativeText} from "@/components/Global/NativeComponents";
interface GradeModalProps {
  isVisible: boolean;
  imageBase64: string;
  onClose: () => void;
  DeleteGrade: () => void;
}

const GradeModal: React.FC<GradeModalProps> = ({
  isVisible,
  imageBase64,
  onClose,
  DeleteGrade,
}) => {
  const insets = useSafeAreaInsets();

  const shareImage = async () => {
    try {
      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      await FileSystem.writeAsStringAsync(fileUri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Failed to share image:", error);
    }
  };

  const saveimage = async () => {
    try {
      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      await FileSystem.writeAsStringAsync(fileUri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Alert.alert("Image sauvegardée", "L'image a été sauvegardée dans ta galerie.");
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={95}
        tint="systemThickMaterialDark"
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          gap: 20,
        }}
      >
        <Image
          source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
          style={{
            flex: 1,
            objectFit: "contain",
            paddingHorizontal: 20,
          }}
        />
        <ScrollView
          horizontal={true}
          style={{
            flex: 1,
            maxHeight: 100,
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            justifyContent: "center",
            gap: 16,
          }}
        >
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={saveimage}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#000",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <Download color="white" size={24} />
            </View>
            <NativeText style={{color: "#FFF", fontSize: 15}}>Enregistrer</NativeText>
          </PressableScale>
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={shareImage}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#FFF",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <Ellipsis color="#000" size={24} />
            </View>
            <NativeText style={{color: "#FFF", fontSize: 15}}>Autre</NativeText>
          </PressableScale>
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            gap: 10,
            paddingHorizontal: 20,
          }}
        >
          <PressableScale
            style={{
              width: 85,
              height: 55,
              backgroundColor: "#FFFFFF10",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 100,
            }}
            onPress={DeleteGrade}
          >
            <Trash2 color="white" size={24} />
          </PressableScale>
          <PressableScale
            style={{
              flex: 1,
              height: 55,
              backgroundColor: "#FFFFFF40",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 100,
            }}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                letterSpacing: 1,
                textTransform: "uppercase",
                textAlign: "center",
                color: "#FFFFFF",
              }}
            >
              Fermer
            </Text>
          </PressableScale>
        </View>
      </BlurView>
    </Modal>
  );
};

export default GradeModal;