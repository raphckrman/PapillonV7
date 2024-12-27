import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { StyleSheet } from "react-native";

import pronote from "pawnote";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, PronoteAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/pronote/default-personalization";
import LoginView from "@/components/Templates/LoginView";
import extract_pronote_name from "@/utils/format/extract_pronote_name";

const PronoteCredentials: Screen<"PronoteCredentials"> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const accountID = uuid();

      const session = pronote.createSessionHandle();
      const refresh = await pronote.loginCredentials(session, {
        url: route.params.instanceURL,
        kind: pronote.AccountKind.STUDENT,
        username,
        password,
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

      const account: PronoteAccount = {
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
        personalization: await defaultPersonalization(session),

        identity: {}
      };

      pronote.startPresenceInterval(session);
      createStoredAccount(account);
      setLoading(false);
      switchTo(account);

      // We need to wait a tick to make sure the account is set before navigating.
      queueMicrotask(() => {
        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
    catch (error) {
      setLoading(false);

      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Erreur inconnue");
      }
    }
  };

  return (
    <LoginView
      serviceIcon={require("@/../assets/images/service_pronote.png")}
      serviceName="Pronote"
      onLogin={(username, password) => handleLogin(username, password)}
      loading={loading}
      error={error}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },

  serviceContainer: {
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },

  serviceLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    marginBottom: 10,
  },

  serviceName: {
    fontSize: 15,
    fontFamily: "medium",
    opacity: 0.6,
    textAlign: "center",
  },

  serviceSchool: {
    fontSize: 18,
    fontFamily: "semibold",
    textAlign: "center",
  },

  textInputContainer: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  textInput: {
    fontFamily: "medium",
    fontSize: 16,
    flex: 1,
  },
});

export default PronoteCredentials;
