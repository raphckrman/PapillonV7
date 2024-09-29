import { AddonPlacementManifest } from "@/addons/types";
import type { Chat } from "@/services/shared/Chat";
import type { Grade } from "@/services/shared/Grade";
import { Homework } from "@/services/shared/Homework";
import type { AccountService } from "@/stores/account/types";
import { Log } from "@/utils/logger/logger";
import type { CurrentPosition } from "@/utils/native/location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type pronote from "pawnote";
import type React from "react";
import type { School as SkolengoSchool} from "scolengo-api/types/models/School";

export type RouteParameters = {
  // welcome.index
  AccountSelector?: { shouldCreateAccount: boolean };
  FirstInstallation: undefined;
  ColorSelector?: { settings: boolean };
  DevMenu: undefined;
  AccountCreated: undefined;
  ChangelogScreen: undefined;

  // login.index
  ServiceSelector: undefined;

  // login.pronote
  PronoteAuthenticationSelector: undefined;
  PronoteGeolocation: undefined;
  PronoteManualLocation: undefined;
  PronoteInstanceSelector: CurrentPosition;
  PronoteCredentials: { instanceURL: string, information: pronote.Instance };
  PronoteManualURL?: { url?: string; method?: string };
  PronoteQRCode: undefined;
  PronoteWebview: { instanceURL: string };
  PronoteV6Import: {
    data: {
      username: string
      deviceUUID: string
      instanceUrl: string
      nextTimeToken: string
    }
  };

  // login.ecoledirecte
  EcoleDirecteCredentials: undefined;

  // login.identityProvider
  IdentityProviderSelector: undefined;
  UnivRennes1_Login: undefined;
  UnivRennes2_Login: undefined;
  UnivLimoges_Login: undefined;
  UnivSorbonneParisNord_login: undefined;

  // login.skolengo
  SkolengoAuthenticationSelector: undefined;
  SkolengoGeolocation: undefined;
  SkolengoInstanceSelector: { pos: CurrentPosition | null };
  SkolengoWebview: { school: SkolengoSchool };
  // account.index
  Home: undefined
  HomeScreen?: { onboard: boolean };
  NoteReaction: undefined;

  Lessons?: { outsideNav?: boolean };
  LessonsImportIcal: {
    ical?: string;
    title?: string;
    autoAdd?: boolean;
  };
  LessonDocument: { lesson: Homework };

  Homeworks?: { outsideNav?: boolean };
  HomeworksDocument: { homework: Homework };

  News?: { outsideNav?: boolean };
  NewsItem: undefined;

  Grades?: { outsideNav?: boolean };
  GradeSubject: undefined;
  GradeDocument: {
    grade: Grade,
    allGrades?: Grade[]
  };

  Attendance: undefined;

  // settings.externalAccount
  SelectMethod: undefined;

  // settings.index
  SettingStack: any;
  Settings?: {
    view: keyof RouteParameters
  };
  SettingsNotifications: undefined;
  SettingsTrophies: undefined;
  SettingsProfile: undefined;
  SettingsTabs: undefined;
  SettingsAbout: undefined;
  SettingsIcons: undefined;
  SettingsSubjects: undefined;
  SettingsExternalServices: undefined;
  SettingsMagic: undefined;
  SettingsFlags: undefined;
  SettingsFlagsInfos: undefined;
  SettingsAddons: undefined;
  SettingsDevLogs: undefined;
  SettingsDonorsList: undefined;

  Menu?: undefined;
  RestaurantQrCode: { qrCodes: number[] };
  RestaurantHistory: undefined;

  Messages: undefined;
  ChatCreate: undefined;
  Chat: { handle: Chat };

  AccountStack: { onboard: boolean };
  ExternalAccountSelectMethod: { service: AccountService | "Other" }
  ExternalAccountSelector: undefined;
  ExternalTurboselfLogin: undefined
  ExternalArdLogin: undefined
  QrcodeAnswer: undefined
  QrcodeScanner: { accountID: string }
  PriceDetectionOnboarding: undefined
  PriceBeforeScan: undefined

  AddonSettingsPage: {
    addon: AddonPlacementManifest
    from: keyof RouteParameters
  };
  AddonLogs: {
    logs: Log[],
    name: string
  };
  AddonPage: undefined;
};

export type RouterScreenProps<ScreenName extends keyof RouteParameters> =
  NativeStackScreenProps<RouteParameters, ScreenName>;
export type Screen<ScreenName extends keyof RouteParameters> = React.FC<
  RouterScreenProps<ScreenName>
>;
