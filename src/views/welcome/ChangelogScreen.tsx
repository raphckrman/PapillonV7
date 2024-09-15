import React, { useState, useEffect, useLayoutEffect } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import PackageJSON from "../../../package.json";
import datasets from "@/consts/datasets.json";
import uuid from "@/utils/uuid-v4";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { AlertTriangle, Bug, Sparkles, X } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";

import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PressableScale } from "react-native-pressable-scale";

interface Feature {
  title: string;
  subtitle: string;
  image: string;
  navigation: string;
  href: string | null;
  button: string;
}

interface Version {
  version: string;
  title: string;
  subtitle: string;
  illustration: string;
  description: string;
  features: Feature[];
  bugfixes: Feature[];
}

const currentVersion = PackageJSON.version;
const changelogURL = datasets.changelog.replace("[version]", currentVersion);

const ChangelogScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [changelog, setChangelog] = useState<Version|null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if(!changelog) {
      setLoading(true);
      fetch(changelogURL + "#update=" + uuid()) // #TODO : remove, it's for development
        .then((response) => response.json())
        .then((json) => {
          if (json.version) {
            setChangelog(json);
            setLoading(false);
            setNotFound(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          setNotFound(true);
        });
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 32,
            aspectRatio: 1 / 1,
            backgroundColor: theme.colors.text + "18",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 30,
          }}
        >
          <X
            color={theme.colors.text}
            size={20}
            strokeWidth={3}
            opacity={0.7}
          />
        </TouchableOpacity>
      )
    });
  }, [navigation, route.params, theme.colors.text]);

  return (
    <ScrollView
      style={[
        {
          padding: 16,
          paddingTop: 0
        }
      ]}
    >
      {loading && (
        <NativeList
          inline
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutUp)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeItem
            leading={<PapillonSpinner color={theme.colors.primary} size={24} strokeWidth={3.5} />}
          >
            <NativeText variant="title">
              Chargement des nouveautés...
            </NativeText>
            <NativeText variant="subtitle">
              Obtention des dernières nouveautés de l'application Papillon
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {notFound && (
        <NativeList
          inline
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutUp)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeItem
            icon={<AlertTriangle />}
          >
            <NativeText variant="title">
              Impossible de trouver les notes de mise à jour
            </NativeText>
            <NativeText variant="subtitle">
              Vous êtes peut-être hors-ligne ou alors quelque chose ne s'est pas passé comme prévu...
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {changelog && (
        <Reanimated.View
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutUp)}
          layout={animPapillon(LinearTransition)}
        >
          <PressableScale>
            <NativeList animated inline>
              <Image
                source={{uri: changelog.illustration}}
                style={{
                  width: "100%",
                  aspectRatio: 2 / 1
                }}
              />
              <NativeItem pointerEvents="none">
                <NativeText
                  variant="default"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: "semibold"
                  }}
                >
                  Papillon - version {changelog.version}
                </NativeText>
                <NativeText
                  variant="titleLarge"
                >
                  {changelog.title}
                </NativeText>
                <NativeText variant="subtitle">
                  {changelog.subtitle}
                </NativeText>
              </NativeItem>
              <NativeItem pointerEvents="none">
                <NativeText variant="default">
                  {changelog.description}
                </NativeText>
              </NativeItem>
            </NativeList>
          </PressableScale>

          <Reanimated.View>
            <NativeListHeader
              animated
              label="Nouveautés"
              icon={<Sparkles />}
            />

            <Reanimated.ScrollView
              horizontal
              style={{
                width: "100%",
                overflow: "visible",
                marginTop: 9
              }}
              contentContainerStyle={{
                gap: 10
              }}
              showsHorizontalScrollIndicator={false}
            >
              {changelog.features.map((feature: Feature, index) => {
                return (
                  <ChangelogFeature
                    feature={feature}
                    navigation={navigation}
                    theme={theme}
                  />
                );
              })}
            </Reanimated.ScrollView>
          </Reanimated.View>

          <Reanimated.View>
            <NativeListHeader
              animated
              label="Correctifs"
              icon={<Bug />}
            />

            <Reanimated.ScrollView
              horizontal
              style={{
                width: "100%",
                overflow: "visible",
                marginTop: 9
              }}
              contentContainerStyle={{
                gap: 10
              }}
              showsHorizontalScrollIndicator={false}
            >
              {changelog.bugfixes.map((feature: Feature, index) => {
                return (
                  <ChangelogFeature
                    feature={feature}
                    navigation={navigation}
                    theme={theme}
                  />
                );
              })}
            </Reanimated.ScrollView>
          </Reanimated.View>
        </Reanimated.View>
      )}

      <InsetsBottomView />
    </ScrollView>
  );
};

const ChangelogFeature: React.FC<{ feature: Feature, navigation: any, theme: any }> = ({ feature, navigation, theme }) => {
  return (
    <PressableScale>
      <NativeList
        inline
        style={{
          width: 200
        }}
      >
        <Image
          source={{ uri: feature.image }}
          style={{
            width: "100%",
            aspectRatio: 3 / 2
          }}
        />
        <NativeItem pointerEvents="none">
          <NativeText variant="title">
            {feature.title}
          </NativeText>
          <NativeText variant="subtitle">
            {feature.subtitle}
          </NativeText>
        </NativeItem>
        {(feature.href || feature.navigation) && (
          <NativeItem
            onPress={() => {
              if(feature.href) {
                Linking.openURL(feature.href);
              }
              else if(feature.navigation) {
                try {
                  navigation.goBack();
                  navigation.navigate(feature.navigation);
                }
                catch {}
              }
            }}
          >
            <NativeText
              variant="default"
              style={{
                color: theme.colors.primary
              }}
            >
              {feature.button || "En savoir plus"}
            </NativeText>
          </NativeItem>
        )}
      </NativeList>
    </PressableScale>
  );
};

export default ChangelogScreen;