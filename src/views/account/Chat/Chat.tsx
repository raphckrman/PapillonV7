import React, {useEffect, useRef, useState} from "react";
import {
  Button,
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
import {createDiscussion, getChatMessages, getChats} from "@/services/chats";
import {ChevronLeft, Send} from "lucide-react-native";
import parse_initials from "@/utils/format/format_pronote_initials";
import {getProfileColorByName} from "@/services/local/default-personalization";
import InitialIndicator from "@/components/News/InitialIndicator";
import {PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import RenderHTML from "react-native-render-html";
import {markDiscussionAsRead, sendDiscussionMessage} from "@/services/pronote/chats";
import Animated, {FadeIn, FadeInDown, FadeOut} from "react-native-reanimated";
import {animPapillon} from "@/utils/ui/animations";
import MissingItem from "@/components/Global/MissingItem";

const Chat: Screen<"Chat"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const account = useCurrentAccount(state => state.account!);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  async function refreshMessages (handlerRefresh = false) {
    if (route.params.handle.id === "new") return;

    if (handlerRefresh) {
      let chats = await getChats(account);
      let chat = chats.find(chat => chat.id === route.params.handle.id);
      if (chat) {
        let messages = await getChatMessages(account, chat);
        setMessages(messages.reverse());
        return;
      }
    }
    const messages = await getChatMessages(account, route.params.handle);
    setMessages(messages.reverse());
    setLoading(false);
  }

  useEffect(() => {
    if (route.params.newData) {
      setLoading(false);
      setMessages([]);
      return;
    }
    var timeout: any;
    refreshMessages()
      .then(() => {
        setIsFirstLoad(false);
        markDiscussionAsRead(account, route.params.handle);
        timeout = setTimeout(() => {
          refreshMessages(true)
            .then(() => {
              timeout = setTimeout(() => {
                refreshMessages(true);
              }, 5000);
            });
        }, 5000);
      });
    return () => clearTimeout(timeout);
  }, [route.params.handle]);

  return (
    <View style={{flex: 1, paddingBottom: insets.bottom}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="padding"
      >
        <PapillonModernHeader outsideNav={false}>
          <View style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft color={colors.text + "80"} size={26}  />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ChatDetails", {handle: route.params.handle})} style={{flexDirection: "row", gap: 10, alignItems: "center"}}>
              <InitialIndicator
                initial={route.params.handle.isGroup ? "group":parse_initials(route.params.handle.recipient)}
                color={getProfileColorByName(route.params.handle.recipient).bright}
                textColor={getProfileColorByName(route.params.handle.recipient).dark}
                size={38}
              />
              <View style={{flex: 1}}>
                <NativeText variant="subtitle" numberOfLines={1}>{route.params.handle.subject ? route.params.handle.recipient: "Conversation avec"}</NativeText>
                <NativeText variant="title" numberOfLines={1}>{route.params.handle.subject || route.params.handle.recipient}</NativeText>
              </View>
            </TouchableOpacity>
          </View>
        </PapillonModernHeader>
        {!loading ? messages.length > 0 ? (
          <FlatList
            data={messages}
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
              <Animated.View
                entering={isFirstLoad ? null:animPapillon(FadeInDown)}
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
                      source={{html: item.item.content ?? "<div></div>"}}
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
                  {item.index === messages.length - 1 && item.item.isAuthor && item.item.id !== "sending_message" && (
                    <Animated.View
                      entering={animPapillon(FadeIn)}
                    >
                      <NativeText variant={"subtitle"} style={{fontSize: 13}}>
                        Distribué
                      </NativeText>
                    </Animated.View>
                  )}

                </View>
              </Animated.View>
            )}
          />
        ):(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <MissingItem
              emoji="💬"
              title="C'est le début de la conversation"
              description="Envoyez un message pour commencer la discussion."
              entering={animPapillon(FadeInDown)}
              exiting={animPapillon(FadeOut)}
              style={{paddingVertical: 26}}
            />
            <Button title={"Rafraîchir"} onPress={refreshMessages} />
          </View>
        ): <View style={{flex: 1}}/>}
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
            onChangeText={(text) => setText(text)}
            value={text}
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
            onPress={async () => {
              if (text.trim() === "") return;
              setText("");
              setMessages([
                ...(messages || []),
                {
                  id: "sending_message",
                  attachments: [],
                  author: account.name,
                  isAuthor: true,
                  date: new Date(),
                  content: text,
                }
              ]);
              if (route.params.newData) {
                let savedChats = await getChats(account);
                await createDiscussion(account, route.params.newData.subject, text, route.params.newData.selectedRecipients);
                let chats = await getChats(account);
                let chat = chats.find(chat => !savedChats.find(savedChat => savedChat.id === chat.id));
                route.params.handle = chat!;
                route.params.newData = undefined;

                refreshMessages()
                  .then(() => {
                    markDiscussionAsRead(account, route.params.handle);
                    fetchingInterval = setInterval(() => {
                      refreshMessages(true);
                    }, 2000);
                  });
                return;
              }
              sendDiscussionMessage(account, route.params.handle, text)
                .then(() => {
                  refreshMessages();
                });
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