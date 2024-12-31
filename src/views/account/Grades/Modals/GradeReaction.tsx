import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  PermissionStatus,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { X } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { Screen } from "@/router/helpers/types";
import { getSubjectData } from "@/services/shared/Subject";
import { useGradesStore } from "@/stores/grades";
import { Reel } from "@/services/shared/Reel";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

const GradeReaction: Screen<"GradeReaction"> = ({ navigation, route }) => {
  const inset = useSafeAreaInsets();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
        MediaLibrary.usePermissions();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const composerRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const account = useCurrentAccount((store) => store.account);
  const reels = useGradesStore((store) => store.reels);
  const [grade, setGrade] = useState(route.params.grade);

  const updateReels = useGradesStore((state) => ({
    reels: state.reels,
    setReels: (newReels: { [gradeID: string]: Reel }) => {
      state.reels = { ...state.reels, ...newReels };
    }
  }));

  useEffect(() => {
    const setupPermissions = async () => {
      if (mediaLibraryPermission?.status !== PermissionStatus.GRANTED) {
        await requestMediaLibraryPermission();
      }
      if (cameraPermission?.status !== PermissionStatus.GRANTED) {
        await requestCameraPermission();
      }
    };
    setupPermissions();
  }, [
    mediaLibraryPermission,
    cameraPermission,
    requestMediaLibraryPermission,
    requestCameraPermission,
  ]);

  const captureImage = async () => {
    if (cameraPermission?.status !== PermissionStatus.GRANTED) {
      Alert.alert("Permission Error", "Camera permission not granted");
      return;
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setIsLoading(true);
        setTimeout(async () => {
          try {
            const uri = await captureRef(composerRef, {
              format: "png",
              quality: 0.5,
            });

            const responsewithouteffect = await fetch(photo.uri);
            const blobwithouteffect = await responsewithouteffect.blob();
            const base64withouteffect = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blobwithouteffect);
            });

            const response = await fetch(uri);
            const blob = await response.blob();
            const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            const reel: Reel = {
              id: grade.id,
              timestamp: Date.now(),
              image: base64.split(",")[1],
              imagewithouteffect: base64withouteffect.split(",")[1],
              subjectdata: getSubjectData(grade.subjectName),
              grade: {
                value: grade.student.value !== null ? grade.student.value.toString() : "",
                outOf: grade.outOf.value !== null ? grade.outOf.value.toString() : "",
                coef: grade.coefficient !== null ? grade.coefficient.toString() : "",
              }
            };

            useGradesStore.setState((state) => ({
              ...state,
              reels: {
                ...state.reels,
                [grade.id]: reel
              }
            }));

            Alert.alert("Success", "Ta réaction a bien été enregistrée !");
            setIsLoading(false);
            navigation.goBack();
          } catch (error) {
            console.error("Failed to save image:", error);
            setIsLoading(false);
            Alert.alert("Erreur", "Erreur lors de l'enregistrement de l'image");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const saveImage = async () => {
    try {
      const uri = await captureRef(composerRef, {
        format: "png",
        quality: 0.5,
      });

      if (!capturedImage) {
        throw new Error("No image captured");
      }

      const responsewithouteffect = await fetch(capturedImage);
      const blobwithouteffect = await responsewithouteffect.blob();
      const base64withouteffect: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blobwithouteffect);
      });

      const response = await fetch(uri);
      const blob = await response.blob();
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      // Create reel object
      const reel: Reel = {
        id: grade.id,
        timestamp: Date.now(),
        image: base64.split(",")[1],
        imagewithouteffect: base64withouteffect.split(",")[1],
        subjectdata: getSubjectData(grade.subjectName),
        grade: {
          value: grade.student.value !== null ? grade.student.value.toString() : "",
          outOf: grade.outOf.value !== null ? grade.outOf.value.toString() : "",
          coef: grade.coefficient !== null ? grade.coefficient.toString() : "",
        }
      };
      useGradesStore.setState((state) => ({
        ...state,
        reels: {
          ...state.reels,
          [grade.id]: reel
        }
      }));
      Alert.alert("Success", "Ta réaction a bien été enregistrée !");

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save image:", error);
      Alert.alert("Erreur", "Erreur lors de l'enregistrement de l'image");
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    console.log("grade", route.params.grade);
  }, [route.params.grade]);

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(grade.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [grade.subjectName]);

  const getAdjustedGrade = (grade: number | null, outOf: number | null) => {
    if (outOf === 20) {
      return grade;
    }
    return grade !== null && outOf ? (grade / outOf) * 20 : null;
  };

  const adjustedGrade = getAdjustedGrade(grade.student.value, grade.outOf.value);

  return (
    <View style={styles.container}>
      <View
        ref={composerRef}
        style={[styles.cameraContainer, { marginTop: inset.top + 10 }]}
      >
        <Image
          source={require("../../../../../assets/images/mask_logotype.png")}
          tintColor={"#FFFFFF50"}
          resizeMode="contain"
          style={styles.logo}
        />
        {capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            style={styles.capturedImage}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraView}
            facing="front"
          />
        )}
        <View style={styles.infoNoteContainer}>
          <View style={styles.infoNote}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{subjectData.emoji}</Text>
            </View>
            <View>
              <Text
                style={styles.subjectText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subjectData.pretty}
              </Text>
              <Text style={styles.dateText}>
                {new Date(grade.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{grade.student.value}</Text>
              <Text style={styles.maxScoreText}>/{grade.outOf.value}</Text>
            </View>
          </View>
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <PapillonSpinner size={30} color="#FFF"/>
          <Text style={styles.loadingText}>Enregistrement en cours...</Text>
        </View>
      )}
      {!capturedImage && !isLoading && (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureImage}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 50,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    alignSelf: "center",
    width: "90%",
    height: 550,
    borderRadius: 16,
    overflow: "hidden",
  },
  logo: {
    position: "absolute",
    width: 100,
    height: 60,
    zIndex: 40,
    right: 20,
  },
  cameraView: {
    width: "100%",
    height: "100%",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    transform: [{ scaleX: -1 }],
  },
  infoNoteContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoNote: {
    width: "90%",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 25,
  },
  emojiContainer: {
    marginRight: 5,
    marginLeft: -10,
    backgroundColor: "#00000020",
    padding: 5,
    borderRadius: 20,
  },
  subjectText: {
    fontWeight: "600",
    color: "#000000",
    fontSize: 16,
    maxWidth: 150,
  },
  dateText: { color: "#00000090" },
  scoreContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreText: { fontWeight: "700", color: "#000000", fontSize: 20 },
  maxScoreText: { fontWeight: "300", color: "#000000" },
  captureButton: {
    borderRadius: 37.5,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
  },
  captureButtonInner: {
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
  },
  headerRight: {
    padding: 5,
    borderRadius: 50,
    marginRight: 5,
    backgroundColor: "#FFFFFF20",
  },
});

export default GradeReaction;