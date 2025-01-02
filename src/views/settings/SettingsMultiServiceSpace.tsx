import React, {useRef, useState} from "react";
import {ActivityIndicator, Image, ScrollView, Switch, TextInput, KeyboardAvoidingView, Alert} from "react-native";
import {useTheme} from "@react-navigation/native";
import type {Screen} from "@/router/helpers/types";
import {NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {Camera, PlugZap, TextCursorInput, User2, Type, Trash2} from "lucide-react-native";
import {useAccounts} from "@/stores/account";
import { AccountService, PrimaryAccount} from "@/stores/account/types";
import * as ImagePicker from "expo-image-picker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useMultiService} from "@/stores/multiService";

const SettingsMultiServiceSpace: Screen<"SettingsMultiServiceSpace"> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const space = route.params.space;
  const accounts = useAccounts();
  const availableAccounts = accounts.accounts.filter(account => !account.isExternal && !(account.service == AccountService.PapillonMultiService));
  const deleteMultiServiceSpace = useMultiService(store => store.remove);
  const updateMultiServiceSpace = useMultiService(store => store.update);

  const linkedAccount = accounts.accounts.find(account => account.localID === space.accountLocalID) as PrimaryAccount | undefined;

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const spaceNameRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState(linkedAccount?.studentName?.first ?? "");
  const [lastName, setLastName] = useState(linkedAccount?.studentName?.last ?? "");
  const [spaceName, setSpaceName] = useState(space.name);

  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const selectPicture = async () => {
    setLoadingImage(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const img = "data:image/jpeg;base64," + result.assets[0].base64;
      setSelectedImage(img);
    }

    setLoadingImage(false);
  };

  const deleteSpace = () => {
    Alert.alert("Êtes-vous sur ?", "Cette action entrainera la suppression de votre espace multi-service.", [ { text: "Annuler", style: "cancel" }, { text: "Confirmer", style: "destructive", onPress: () => {
      accounts.remove(space.accountLocalID);
      deleteMultiServiceSpace(space.accountLocalID);
      navigation.goBack();
    }}]);
  };
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 44}>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 16 + insets.bottom,
        }}
      >

        <NativeListHeader
          label="Image"
        />

        <NativeList>
          <NativeItem
            chevron={true}
            onPress={() => selectPicture()}
            leading={selectedImage &&
                    <Image
                      source={{ uri: selectedImage }}
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 90,
                        // @ts-expect-error : borderCurve is not in the Image style
                        borderCurve: "continuous",
                      }}
                    />
            }
            icon={!selectedImage && <Camera />}
            trailing={
              <ActivityIndicator animating={loadingImage} />
            }
          >
            <NativeText variant="title">
              {selectedImage ? "Changer la photo" : "Ajouter une photo"}
            </NativeText>
            {!selectedImage ? (
              <NativeText variant="subtitle">
                Personnalisez votre espace en ajoutant une photo.
              </NativeText>
            ) : (
              <NativeText variant="subtitle">
                La photo de l'espace reste sur votre appareil.
              </NativeText>
            )}
          </NativeItem>
        </NativeList>

        <NativeListHeader
          label="Titre de l'espace"
        />

        <NativeList>

          <NativeItem
            onPress={() => spaceNameRef.current?.focus()}
            chevron={false}
            icon={<Type />}
          >
            <NativeText variant="subtitle">
              Titre
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Mon super espace"
              placeholderTextColor={theme.colors.text + "80"}
              value={spaceName}
              onChangeText={(text: string) => {
                updateMultiServiceSpace(space.accountLocalID, "name", text);
                setSpaceName(text);
              }}
              ref={spaceNameRef}
            />
          </NativeItem>


        </NativeList>

        <NativeListHeader
          label="Profil de l'espace"
        />

        <NativeList>

          <NativeItem
            onPress={() => firstNameRef.current?.focus()}
            chevron={false}
            icon={<User2 />}
          >
            <NativeText variant="subtitle">
              Prénom
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Théo"
              placeholderTextColor={theme.colors.text + "80"}
              value={firstName}
              onChangeText={(text: string) => {
                // @ts-expect-error
                accounts.update(space.accountLocalID, "studentName", {
                  first: text,
                  last: lastName
                });
                setFirstName(text);
              }}
              ref={firstNameRef}
            />
          </NativeItem>

          <NativeItem
            onPress={() => lastNameRef.current?.focus()}
            chevron={false}
            icon={<TextCursorInput />}
          >
            <NativeText variant="subtitle">
              Nom de famille
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Dubois"
              placeholderTextColor={theme.colors.text + "80"}
              value={lastName}
              onChangeText={(text: string) => {
                // @ts-expect-error
                accounts.update(space.accountLocalID, "studentName", {
                  first: firstName,
                  last: text
                });
                setLastName(text);
              }}
              ref={lastNameRef}
            />
          </NativeItem>

        </NativeList>


        <NativeListHeader label="Actions" />
        <NativeList>
          <NativeItem
            onPress={() => deleteSpace()}
            leading={
              <Trash2 color="#CF0029" />
            }
          >
            <NativeText variant="title">
              Supprimer
            </NativeText>
            <NativeText variant="subtitle">
              Supprimer l'environnement
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



export default SettingsMultiServiceSpace;
