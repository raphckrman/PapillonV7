import React, {useEffect, useRef, useState} from "react";
import {
  FlatList, Image, KeyboardAvoidingView,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import type { ChatMessage } from "@/services/shared/Chat";
import { getChatMessages } from "@/services/chats";
import {ChevronLeft, Send} from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import {getProfileColorByName} from "@/services/local/default-personalization";
import InitialIndicator from "@/components/News/InitialIndicator";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import RenderHTML from "react-native-render-html";

const Chat: Screen<"Chat"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const account = useCurrentAccount(state => state.account!);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useEffect(() => {
    void async function () {
      const messages = await getChatMessages(account, route.params.handle);
      setMessages(messages.reverse());
    }();
  }, [route.params.handle]);

  return (
    <View style={{flex: 1, paddingBottom: insets.bottom}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="padding"
      >
        <PapillonModernHeader outsideNav={false}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <ChevronLeft color={colors.text + "80"} size={26} onPress={() => navigation.goBack()} />
            <InitialIndicator
              initial={parse_initials(route.params.handle.recipient)}
              color={getProfileColorByName(route.params.handle.recipient).bright}
              textColor={getProfileColorByName(route.params.handle.recipient).dark}
              size={38}
            />
            <View>
              <NativeText variant="subtitle">{route.params.handle.subject ? route.params.handle.recipient: "Conversation avec"}</NativeText>
              <NativeText variant="title">{route.params.handle.subject || route.params.handle.recipient}</NativeText>
            </View>
          </View>
        </PapillonModernHeader>
        <FlatList
          data={messages || []}
          ref={flatListRef}
          contentContainerStyle={{
            padding: 20,
            paddingTop: insets.top + 70,
          }}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToOffset({
              animated: false,
              offset: 1000 * (messages?.length || 0),
            });
          }}
          renderItem={item  => (
            <View
              style={{
                marginTop: messages[item.index - 1] ?
                  (messages[item.index - 1].isAuthor === item.item.isAuthor ? -6 : 10)
                  : 0,
              }}
            >
              <View style={{
                width: "85%",
                marginLeft: item.item.isAuthor ? "auto":0,
                alignItems: item.item.isAuthor ? "flex-end": "flex-start",
                gap: 6,
                marginTop: 10,
              }}>
                {
                  (
                    item.index === 0 ||
                      (
                        messages[item.index - 1] &&
                        messages[item.index - 1].isAuthor !== item.item.isAuthor
                      )
                  )
                    && (
                      <View
                        style={{
                          flexDirection: item.item.isAuthor ? "row" : "row-reverse",
                          alignItems: "center",
                          gap: 7
                        }}
                      >
                        <NativeText variant={"subtitle"}>
                          {
                            item.item.date.toLocaleString("fr-FR", {
                              month: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            })
                          }
                        </NativeText>
                        <View style={{height: 5, width: 5, backgroundColor: colors.text, borderRadius: 5, opacity: 0.6}} />
                        <NativeText variant={"subtitle"}>
                          {item.item.isAuthor ? "Vous": item.item.author.replaceAll("Mme ", "").replaceAll("M. ", "")}
                        </NativeText>
                        {item.item.isAuthor ? (
                          <Image
                            source={(account.personalization.profilePictureB64 && account.personalization.profilePictureB64.trim() !== "") ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service)}
                            style={{
                              height: 25,
                              width: 25,
                              borderRadius: 25 / 2,
                            }}
                          />
                        ) : (
                          <InitialIndicator
                            initial={parse_initials(item.item.author)}
                            color={getProfileColorByName(item.item.author).bright}
                            textColor={getProfileColorByName(item.item.author).dark}
                            size={25}
                          />
                        )}
                      </View>
                    )}
                <View
                  style={{
                    backgroundColor: item.item.isAuthor ? "#0099D1": colors.background,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    borderRadius: 25,
                    borderWidth: item.item.isAuthor ? 0: 1,
                    borderColor: colors.text + "22",
                    shadowRadius: 6,
                    shadowColor: "#000",
                    shadowOffset: {width: 0, height: 5},
                    shadowOpacity: item.item.isAuthor ? 0 : 0.04,
                    //FOR RECIPIENT
                    borderTopStartRadius: !item.item.isAuthor ?
                      (
                        messages[item.index - 1] ?
                          (messages[item.index - 1].isAuthor ? 25 : 5)
                          : 25
                      )
                      : 25,
                    borderBottomStartRadius: !item.item.isAuthor ?
                      (
                        messages[item.index + 1] ?
                          (messages[item.index + 1].isAuthor ? 25 : 5)
                          : 25
                      )
                      : 25,
                    //FOR AUTHOR
                    borderTopEndRadius: item.item.isAuthor ?
                      (
                        messages[item.index - 1] ?
                          (messages[item.index - 1].isAuthor ? 5 : 25)
                          : 25
                      )
                      : 25,
                    borderBottomEndRadius: item.item.isAuthor ?
                      (
                        messages[item.index + 1] ?
                          (messages[item.index + 1].isAuthor ? 5 : 25)
                          : 25
                      )
                      : 25,
                  }}
                >
                  <RenderHTML
                    source={{html: item.item.content}}
                    contentWidth={300}
                    defaultTextProps={{
                      style: {
                        color: item.item.isAuthor ? "#FFF": colors.text,
                        fontFamily: "medium",
                        fontSize: 16,
                        lineHeight: 22,
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          )}
        />
        <View style={{
          minHeight: 66,
          maxHeight: 120,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
        }}>
          <TextInput
            placeholder={"Écrivez un message..."}
            style={{
              backgroundColor: colors.background,
              borderRadius: 25,
              flex: 1,
              marginRight: 10,
              fontSize: 16,
              color: colors.text,
            }}
            multiline={true}
            onFocus={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  animated: true,
                  offset: 1000 * (messages?.length || 0),
                });
              }, 100);
            }}
          />

          <TouchableOpacity
            style={{
              backgroundColor: "#0099D1",
              width: 56,
              height: 40,
              borderRadius: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Send color={"#FFF"} size={24} style={{marginTop: 1, marginLeft: -3}}/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


export default Chat;
