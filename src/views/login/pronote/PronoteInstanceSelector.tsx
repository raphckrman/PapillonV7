import React, { useEffect, useState } from "react";
import type { Screen } from "@/router/helpers/types";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  KeyboardEvent,
  Text
} from "react-native";
import pronote from "pawnote";
import Reanimated, { LinearTransition, FlipInXDown, FadeInUp, FadeOutUp, ZoomIn, ZoomOut, Easing, ZoomInEasyDown } from "react-native-reanimated";
import determinateAuthenticationView from "@/services/pronote/determinate-authentication-view";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";

import { Search, X, GraduationCap, } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import { Audio } from "expo-av";
import getInstancesFromDataset from "@/services/pronote/dataset_geolocation";

const PronoteInstanceSelector: Screen<"PronoteInstanceSelector"> = ({
  route: { params },
  navigation,
}) => {
  // `null` when loading, `[]` when no instances found.
  const [instances, setInstances] = useState<pronote.GeolocatedInstance[] | null>(null);
  const [originalInstances, setOriginalInstances] = useState<pronote.GeolocatedInstance[] | null>(null);

  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();

  const [search, setSearch] = useState("");
  const searchInputRef = React.createRef<TextInput>();

  const [hasSearched, setHasSearched] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const keyboardDidShow = (event: KeyboardEvent) => {
    setKeyboardOpen(true);
    setKeyboardHeight(event.endCoordinates.height);
  };

  const keyboardDidHide = () => {
    setKeyboardOpen(false);
    setKeyboardHeight(0);
  };

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/../assets/sound/3.wav")
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


  useEffect(() => {
    if (params) {
      void async function () {
        const dataset_instances = await getInstancesFromDataset(params.longitude, params.latitude);
        const pronote_instances = await pronote.geolocation(params);

        // On calcule la distance entre les instances et l'utilisateur.
        let instances = pronote_instances.map((instance) => {
          const toRadians = (degrees: number) => degrees * (Math.PI / 180);
          const R = 6371; // Earth's radius in kilometers

          const lat1 = toRadians(params.latitude);
          const lon1 = toRadians(params.longitude);
          const lat2 = toRadians(instance.latitude);
          const lon2 = toRadians(instance.longitude);

          const dLat = lat2 - lat1;
          const dLon = lon2 - lon1;

          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return {
            ...instance,
            distance, // Distance in kilometers
          };
        });

        // On limite à 20 instances.
        instances.splice(20);

        // On ajoute les instances trouvées par l'API adresse.
        instances.push(...dataset_instances);

        // On trie par distance.
        instances.sort((a, b) => a.distance - b.distance);

        // On met à jour les instances.
        setInstances(instances);
        setOriginalInstances(instances);
      }();
    }
  }, [params]);

  useEffect(() => {
    if (originalInstances) {
      const newInstances = originalInstances.filter((instance) =>
        instance.name.toLowerCase().includes(search.toLowerCase())
      );

      setInstances(newInstances);
      setHasSearched(true);
    }
  }, [search, originalInstances]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        }
      ]}
    >
      <MaskStars />

      <View style={{height: insets.top}} />

      {!keyboardOpen &&
        <Reanimated.View
          style={{ zIndex: 9999 }}
          layout={LinearTransition}
        >
          <PapillonShineBubble
            message={"Voici les établissements que j'ai trouvé !"}
            numberOfLines={2}
            width={250}
            noFlex
            style={{ marginTop: 0, zIndex: 9999 }}
          />
        </Reanimated.View>
      }

      <Reanimated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.text + "15",
            // @ts-expect-error
            color: colors.text,
            borderColor: colors.border,
          }
        ]}
        layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
      >
        <Search
          size={24}
          color={colors.text + "55"}
          style={{
            marginTop: 7.5,
          }}
        />

        <TextInput
          ref={searchInputRef}
          placeholder="Rechercher un établissement"
          placeholderTextColor={colors.text + "55"}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              color: colors.text,
            }
          ]}
        />

        {search.length > 0 && (
          <Reanimated.View
            layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
          >
            <TouchableOpacity onPress={() => {
              setSearch("");
            }}>
              <X size={24} color={colors.text + "55"} />
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </Reanimated.View>

      {instances === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <Reanimated.View
          style={styles.overScrollContainer}
          layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
        >

          <LinearGradient
            pointerEvents="none"
            colors={[
              colors.background + "00",
              colors.background,
            ]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              zIndex: 999,
            }}
          />

          <Reanimated.ScrollView
            style={styles.overScroll}
            layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
          >
            {instances.length === 0 && (
              <Reanimated.Text
                style={{
                  color: colors.text + "88",
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "medium",
                  fontSize: 16,
                }}
              >
                Aucun établissement trouvé.
              </Reanimated.Text>
            )}

            <Reanimated.View
              style={[styles.list,
                {
                  paddingBottom: keyboardHeight + insets.bottom + (keyboardHeight > 0 ? 0 : 20),
                }
              ]}
              layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
            >
              {instances.map((instance, index) => (
                <Reanimated.View
                  style={{ width: "100%" }}
                  layout={LinearTransition.springify().mass(1).stiffness(150).damping(20)}
                  entering={
                    index < 10 &&
                    !hasSearched ?
                      FlipInXDown.springify().delay(100 * index)
                      // @ts-expect-error
                      : ZoomInEasyDown.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1)).delay(30 * index)
                  }
                  exiting={index < 10 ? FadeOutUp : void 0}
                  key={instance.url + "instanceurlindex"}
                >
                  <DuoListPressable
                    leading={
                      <GraduationCap
                        size={24}
                        color={colors.text + "88"}
                      />
                    }
                    onPress={async () => {
                      determinateAuthenticationView(
                        instance.url,
                        navigation,
                        showAlert
                      );
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "medium",
                          width: "100%",
                          color: colors.text + "88"
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {instance.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "medium",
                          width: "100%",
                          color: colors.text + "55",
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {`à ${instance.distance.toFixed(2)}km de toi`}
                      </Text>
                    </View>
                  </DuoListPressable>
                </Reanimated.View>
              ))}
            </Reanimated.View>
          </Reanimated.ScrollView>
        </Reanimated.View>

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingTop: -40,
  },

  overScrollContainer: {
    flex: 1,
    width: "100%",
  },

  overScroll: {
    width: "100%",
    marginTop: -20,
  },

  list: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 60,
    paddingTop: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  searchContainer: {
    marginHorizontal: 16,

    flexDirection: "row",

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 300,
    gap: 12,

    zIndex: 9999,
    marginTop: -10,
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "medium",
  }
});

export default PronoteInstanceSelector;
