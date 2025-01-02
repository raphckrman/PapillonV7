import React, {useRef, useState} from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  FlatList, View, Text
} from "react-native";
import {useTheme} from "@react-navigation/native";
import type {Screen} from "@/router/helpers/types";
import {NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {Camera, ChevronDown, TextCursorInput, User2, Type, Trash2, CircleAlert} from "lucide-react-native";
import {useAccounts} from "@/stores/account";
import { AccountService, PrimaryAccount} from "@/stores/account/types";
import * as ImagePicker from "expo-image-picker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useMultiService} from "@/stores/multiService";
import {MultiServiceFeature} from "@/stores/multiService/types";
import LottieView from "lottie-react-native";
import {anim2Papillon} from "@/utils/ui/animations";
import Reanimated, {FadeOut, ZoomIn} from "react-native-reanimated";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";

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
      updateMultiServiceSpace(space.accountLocalID, "image", img);
      // @ts-expect-error
      accounts.update(space.accountLocalID, "personalization", {
        profilePictureB64: img
      });
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

  const selectFeatureAccount = (feature: MultiServiceFeature) => {

  };


  const lottieRef = React.useRef<LottieView>(null);

  const features = [
    {
      name: "Notes",
      feature: MultiServiceFeature.Grades,
      icon: require("@/../assets/lottie/tab_chart.json")
    },
    {
      name: "Emploi du temps",
      feature: MultiServiceFeature.Timetable,
      icon: require("@/../assets/lottie/tab_calendar.json")
    },
    {
      name: "Devoirs",
      feature: MultiServiceFeature.Homeworks,
      icon: require("@/../assets/lottie/tab_book_2.json")
    },
    {
      name: "Vie scolaire",
      feature: MultiServiceFeature.Attendance,
      icon: require("@/../assets/lottie/tab_check.json")
    },
    {
      name: "Actualités",
      feature: MultiServiceFeature.News,
      icon: require("@/../assets/lottie/tab_news.json")
    }
  ];

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
            leading={(selectedImage || space.image) &&
                    <Image
                      source={{ uri: selectedImage || space.image }}
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 90,
                        // @ts-expect-error : borderCurve is not in the Image style
                        borderCurve: "continuous",
                      }}
                    />
            }
            icon={!(selectedImage || space.image) && <Camera />}
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
                // @ts-expect-error
                accounts.update(space.accountLocalID, "identityProvider", {
                  name: text
                });
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
        <NativeText style={{ paddingLeft: 7, paddingTop: 15 }} variant="subtitle">Accède à plus d'options en sélectionnant l'espace virtuel, et en personnalisant ton profil dans les paramètres.</NativeText>


        <NativeListHeader label="Configuration" />
        <NativeList
          style={{
          }}
        >
          {features.map((feature, index) => (
            <>
              <NativeItem
                icon={
                  <Reanimated.View
                    entering={anim2Papillon(ZoomIn)}
                    exiting={anim2Papillon(FadeOut)}
                    style={[
                      {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.colors.primary + "22",
                        borderRadius: 8,
                        borderCurve: "continuous",
                      },
                    ]}
                  >
                    <LottieView
                      ref={lottieRef}
                      source={feature.icon}
                      colorFilters={[{
                        keypath: "*",
                        color: theme.colors.primary,
                      }]}
                      style={[
                        {
                          width: 30,
                          height: 30,
                        }
                      ]}
                    />
                  </Reanimated.View>}
                onPress={() => selectFeatureAccount(feature.feature)}
                trailing={<ChevronDown color={theme.colors.primary}/>}
                chevron={false}
              >
                <NativeText variant="title">{feature.name}</NativeText>
              </NativeItem>
              {space.featuresServices[feature.feature] ? (
                <NativeItem
                  icon={<Image
                    source={space.featuresServices[feature.feature]?.personalization.profilePictureB64 ? { uri: space.featuresServices[feature.feature]?.personalization.profilePictureB64 } : defaultProfilePicture(space.featuresServices[feature.feature]?.service || AccountService.Local, space.featuresServices[feature.feature]?.identityProvider?.name || "")}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 80,
                    }}
                    resizeMode="cover"
                  />}
                  separator={true}
                >
                  <View style={{ flexDirection: "row", flexWrap: "nowrap", minWidth: "90%", maxWidth: "75%" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "semibold",
                        color: theme.colors.text,
                        flexShrink: 1
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {space.featuresServices[feature.feature]?.studentName?.first || "Utilisateur"}{" "}
                      {space.featuresServices[feature.feature]?.studentName?.last || ""}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: theme.colors.text + "50",
                      fontFamily: "medium",
                      maxWidth: "70%",
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {AccountService[space.featuresServices[feature.feature]?.service || AccountService.Local] !== "Local" ?
                      AccountService[space.featuresServices[feature.feature]?.service || AccountService.Local] :
                      space.featuresServices[feature.feature]?.identityProvider ?
                        space.featuresServices[feature.feature]?.identityProvider?.name :
                        "Compte local"
                    }
                  </Text>
                </NativeItem>
              ): (
                <NativeItem
                  icon={<CircleAlert />}
                  separator={true}
                >
                  <NativeText>Pas de service sélectionné</NativeText>
                </NativeItem>
              )}
            </>
          ))}
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
