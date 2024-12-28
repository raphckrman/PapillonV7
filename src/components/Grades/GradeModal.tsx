import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform
} from "react-native";
import { Download, Trash, Maximize2, Share, Delete } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ScrollView } from "react-native-gesture-handler";

interface GradeModalProps {
  isVisible: boolean;
  imageBase64: string;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  DeleteGrade: () => void;
}

const GradeModal: React.FC<GradeModalProps> = ({
  isVisible,
  imageBase64,
  onClose,
  onDownload,
  DeleteGrade,
  onShare
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={100}
        tint="dark"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 20,
            alignItems: "center",
            flexDirection: "column",
            paddingTop: insets.top,
          }}
        >
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
            style={{
              width: "90%",
              height: 500,
              objectFit: "contain",
            }}
          />
          <ScrollView
            horizontal
            contentContainerStyle={{
              width: "100%",
              height: 100,
              padding: 20,
              flexDirection: "row",
              gap: 20,
            }}
          >
            {onDownload && (
              <TouchableOpacity
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 7,
                }}
                onPress={onDownload}
              >
                <View
                  style={{
                    padding: 15,
                    borderRadius: 100,
                    backgroundColor: "#000000",
                  }}
                >
                  <Download color="white" size={25} />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontFamily: "semibold",
                    textAlign: "center",
                    textAlignVertical: "center"
                  }}
                >
                  Télécharger
                </Text>
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 7,
                }}
                onPress={onShare}
              >
                <View
                  style={{
                    padding: 15,
                    borderRadius: 100,
                    backgroundColor: "#000000",
                  }}
                >
                  <Share color="white" size={25} />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontFamily: "semibold",
                    textAlign: "center",
                    textAlignVertical: "center"
                  }}
                >
                  Partager
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              gap: 20,
              paddingHorizontal: 20,
              position: "absolute",
              bottom: insets.bottom+50,
              left: 0,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 20,
              }}
              onPress={DeleteGrade}
            >
              <Trash color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingHorizontal: 10,
                paddingVertical: 20,
                backgroundColor: "#FFFFFF50",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
              }}
              onPress={onClose}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontFamily: "semibold",
                  textAlign: "center",
                  textAlignVertical: "center"
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default GradeModal;