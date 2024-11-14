import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Modal, Alert, KeyboardAvoidingView, TextInput, Pressable } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { CameraView, Camera } from "expo-camera";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Haptics from "expo-haptics";

import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { QrCode } from "lucide-react-native";

import Reanimated, { LinearTransition, FadeOutUp, FadeInUp } from "react-native-reanimated";
import pronote from "pawnote";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { Account, AccountService } from "@/stores/account/types";
import { Audio } from "expo-av";
import defaultPersonalization from "@/services/pronote/default-personalization";
import extract_pronote_name from "@/utils/format/extract_pronote_name";

const makeUUID = (): string => {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

const PronoteQRCode: Screen<"PronoteQRCode"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const { colors } = theme;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [inputFocus, setInputFocus] = useState(false);

  const [QRValidationCode, setQRValidationCode] = useState("");
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const codeInput = React.createRef<TextInput>();
  const [QRData, setQRData] = useState<string | null>(null);

  async function loginQR () {
    setScanned(false);
    setLoadingModalVisible(true);

    if (QRValidationCode === "" || QRValidationCode.length !== 4) {
      Alert.alert("Code invalide", "Veuillez entrer un code à 4 chiffres.");
      return;
    }

    const accountID = makeUUID();

    try {
      let decodedJSON = JSON.parse(QRData!);

      const data = {
        jeton : decodedJSON.jeton,
        login : decodedJSON.login,
        url : decodedJSON.url,
      };

      const session = pronote.createSessionHandle();
      const refresh = await pronote.loginQrCode(session, {
        qr: data,
        pin: QRValidationCode,
        deviceUUID: accountID
      }).catch((error) => {
        if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          navigation.navigate("Pronote2FA_Auth", {
            session,
            error,
            accountID
          });
        } else {
          throw error;
        }
      });

      if (!refresh) throw pronote.AuthenticateError;

      const user = session.user.resources[0];
      const name = user.name;

      const account: Account = {
        instance: session,

        localID: accountID,
        service: AccountService.Pronote,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name,
        className: user.className,
        schoolName: user.establishmentName,
        studentName: {
          first: extract_pronote_name(name).givenName,
          last: extract_pronote_name(name).familyName
        },

        authentication: { ...refresh, deviceUUID: accountID },
        personalization: await defaultPersonalization(session)
      };

      pronote.startPresenceInterval(session);
      createStoredAccount(account);
      switchTo(account);

      setTimeout(() => {
        setLoadingModalVisible(false);

        queueMicrotask(() => {
          // Reset the navigation stack to the "Home" screen.
          // Prevents the user from going back to the login screen.
          playSound();
          navigation.reset({
            index: 0,
            routes: [{ name: "AccountCreated" }],
          });
        });
      }, 1000);
    } catch (error) {
      console.error(error);

      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion.");
      return;
    }
  }

  React.useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/../assets/sound/4.wav")
      );
      setSound(sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQRData(data);
    setPinModalVisible(true);
  };

  // on modal close, setScanned to false
  useEffect(() => {
    if (!pinModalVisible) {
      setScanned(false);
      setQRData(null);
    }
  }, [pinModalVisible]);

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={loadingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }} />

          <ActivityIndicator
            size="large"
          />

          <Text
            style={{
              fontFamily: "semibold",
              color: colors.text,
              fontSize: 18,
              marginTop: 16,
            }}
          >
            Connexion en cours...
          </Text>

          <Text
            style={{
              fontFamily: "medium",
              color: colors.text + "80",
              fontSize: 16,
              marginTop: 4,
            }}
          >
            Cela peut prendre quelques instants...
          </Text>

          <View style={{ flex: 1 }} />

          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              paddingBottom: insets.bottom,
              gap: 8,
            }}
          >
            <ButtonCta
              value="Annuler"
              onPress={() => {
                setLoadingModalVisible(false);
                navigation.goBack();
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={pinModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setPinModalVisible(!pinModalVisible);
        }}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
          behavior="padding"
          keyboardVerticalOffset={insets.top}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              gap: 10,
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomColor: colors.border,
              borderBottomWidth: 0.5,
            }}
          >
            <QrCode size={24} color={colors.text} />
            <Text
              style={{
                fontFamily: "semibold",
                color: colors.text,
                fontSize: 17,
              }}
            >
              Validation du QR code
            </Text>
          </View>

          <Reanimated.View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}

            layout={LinearTransition}
          >
            {!inputFocus && (
              <Reanimated.View
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(150)}
                style={{ zIndex: 9999 }}
                layout={LinearTransition}
              >
                <PapillonShineBubble
                  message="Indiquez le code à 4 chiffres que vous venez de créer sur PRONOTE"
                  width={250}
                  numberOfLines={3}
                  noFlex
                />
              </Reanimated.View>
            )}

            <Pressable style={{ flex: 1, width: "100%" }} onPress={() => codeInput.current?.blur()} />

            <View
              style={{
                width: "100%",
                paddingHorizontal: 16,
                marginVertical: 20,
                borderCurve: "continuous",
              }}
            >
              <TextInput
                style={{
                  width: "100%",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  fontFamily: "medium",
                  color: colors.text,
                  fontSize: 24,
                  textAlign: "center",
                  borderColor: colors.border,
                  borderWidth: 2,
                }}
                placeholderTextColor={colors.text + "80"}
                placeholder="Code à 4 chiffres"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={QRValidationCode}
                onChangeText={(text) => setQRValidationCode(text)}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                ref={codeInput}
              />
            </View>

            <Pressable style={{ flex: 1, width: "100%" }} onPress={() => codeInput.current?.blur()} />

            <View
              style={{
                width: "100%",
                paddingHorizontal: 16,
                paddingBottom: insets.bottom,
                gap: 8,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <ButtonCta
                  value="Annuler"
                  onPress={() => {
                    setPinModalVisible(false);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ButtonCta
                  value="Confirmer"
                  primary
                  onPress={() => {
                    setPinModalVisible(false);
                    loginQR();
                  }}
                />
              </View>
            </View>
          </Reanimated.View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={[styles.explainations,
        { top: insets.top + 48 + 10 }
      ]}>
        <QrCode size={32} color={"#fff"} />
        <Text style={styles.title}>
          Connexion à PRONOTE
        </Text>
        <Text style={styles.text}>
          Scannez le QR code de votre établissement pour vous connecter.
        </Text>
      </View>

      <MaskedView
        style={StyleSheet.absoluteFillObject}
        maskElement={
          <View style={styles.maskContainer}>
            <View style={styles.transparentSquare} />
          </View>
        }
      >
        <View
          style={styles.maskContainer}
        />
        {hasPermission === true && (
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {hasPermission === true && (
          <View style={styles.transparentSquareBorder} />
        )}
      </MaskedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  maskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  transparentSquare: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "30%",
  },
  transparentSquareBorder: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "30%",
  },

  explainations: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    gap: 4,
    zIndex: 9999,
  },
  title: {
    fontFamily: "semibold",
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  text: {
    fontFamily: "medium",
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.8,
  },
});

export default PronoteQRCode;
