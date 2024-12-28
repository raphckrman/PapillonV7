import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NoteReaction from "@/views/account/NoteReaction";
import SettingsTabs from "@/views/settings/SettingsTabs";
import RestaurantQrCode from "@/views/account/Restaurant/Modals/QrCode";
import NewsItem from "@/views/account/News/Document";
import AddonLogs from "@/views/addon/AddonLogs";
import AddonPage from "@/views/addon/AddonPage";
import GradeSubjectScreen from "@/views/account/Grades/Modals/Subject";
import GradeDocument from "@/views/account/Grades/Document";
import RestaurantHistory from "@/views/account/Restaurant/Modals/History";
import ChatCreate from "@/views/account/Chat/Modals/ChatCreate";
import Chat from "@/views/account/Chat/Modals/Chat";
import HomeworksDocument from "@/views/account/Homeworks/Document";
import LessonsImportIcal from "@/views/account/Lessons/Options/LessonsImportIcal";
import LessonDocument from "@/views/account/Lessons/Document";
import BackgroundIUTLannion from "@/views/login/IdentityProvider/actions/BackgroundIUTLannion";
import EvaluationDocument from "@/views/account/Evaluation/Document";
import BackgroundIdentityProvider from "@/views/login/IdentityProvider/BackgroundIdentityProvider";

const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NoteReaction" component={NoteReaction} options={{ headerTitle: "Note Réaction" }} />
      <Stack.Screen name="SettingsTabs" component={SettingsTabs} options={{ headerTitle: "Settings Tabs" }} />
      <Stack.Screen name="RestaurantQrCode" component={RestaurantQrCode} options={{ headerTitle: "Restaurant QR Code" }} />
      <Stack.Screen name="NewsItems" component={NewsItem} options={{ headerTitle: "News Item" }} />
      <Stack.Screen name="AddonLogs" component={AddonLogs} options={{ headerTitle: "Addon Logs" }} />
      <Stack.Screen name="AddonPage" component={AddonPage} options={{ headerTitle: "Addon Page" }} />
      <Stack.Screen name="GradeSubjectScreen" component={GradeSubjectScreen} options={{ headerTitle: "Grade Subject Screen" }} />
      <Stack.Screen name="GradeDocument" component={GradeDocument} options={{ headerTitle: "Grade Document" }} />
      <Stack.Screen name="RestaurantHistory" component={RestaurantHistory} options={{ headerTitle: "Restaurant History" }} />
      <Stack.Screen name="ChatCreate" component={ChatCreate} options={{ headerTitle: "Chat Create" }} />
      <Stack.Screen name="Chat" component={Chat} options={{ headerTitle: "Chat" }} />
      <Stack.Screen name="HomeworksDocument" component={HomeworksDocument} options={{ headerTitle: "Homeworks Document" }} />
      <Stack.Screen name="LessonImportIcal" component={LessonsImportIcal} options={{ headerTitle: "Lessons Import Ical" }} />
      <Stack.Screen name="LessonsDocument" component={LessonDocument} options={{ headerTitle: "Lessons Document" }} />
      <Stack.Screen name="BackgroundIUTLannion" component={BackgroundIUTLannion} options={{ headerTitle: "Background IUT Lannion" }} />
      <Stack.Screen name="EvaluationDocument" component={EvaluationDocument} options={{ headerTitle: "Evaluation Document" }} />
      <Stack.Screen name="BackgroundIdentityProvider" component={BackgroundIdentityProvider} options={{ headerTitle: "Background Identity Provider" }} />
    </Stack.Navigator>
  );
};

export default AccountStack;
