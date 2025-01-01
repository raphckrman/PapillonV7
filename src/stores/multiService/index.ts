import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { log } from "@/utils/logger/logger";
import {MultiServiceSpace, MultiServiceStore} from "@/stores/multiService/types";
import {useAccounts} from "@/stores/account";


/**
 * Store for the MultiService settings & states.
 * Persisted, as we want to keep the virtual spaces between app restarts.
 */
export const useMultiService = create<MultiServiceStore>()(
  persist(
    (set, get) => ({
      // When opening the app for the first time, it's null.
      enabled: undefined as (boolean | undefined),

      spaces: <Array<MultiServiceSpace>>[],

      // When creating, we don't want the "instance" to be stored.
      create: (space, linkAccount) => {
        log(`creating a virtual MultiService space with account id ${linkAccount.localID} (${space.name})`, "multiService:create");

        set((state) => ({
          spaces: [...state.spaces, space]
        }));

        log(`stored ${space.name}, with account ${linkAccount.localID}`, "multiService:create");
      },

      remove: (localID) => {
        log(`removing virtual MultiService space ${localID}`, "multiService:remove");

        set((state) => ({
          spaces: state.spaces.filter(
            (space) => space.accountLocalID !== localID
          )
        }));

        log(`removed ${localID}`, "multiService:remove");
      },

      toggleEnabledState: () => {
        set((state) => ({
          enabled: !state.enabled
        }));
      },

      /**
       * Mutates a given property for a given space
       * and return the updated space.
       */
      update: (localID, key, value) => {
        // Find the account to update in the storage.
        const space = get().spaces.find((space) => space.accountLocalID === localID);
        if (!space) return null;

        let spaceMutated: MultiServiceSpace;

        // Mutate only featureServices and name properties.
        if (key in ["featureServices", "name"]) {
          spaceMutated = {
            ...space,
            [key]: value
          };
        }

        // Save the update in the store and storage.
        set((state) => ({
          spaces: state.spaces.map((space) =>
            space.accountLocalID === localID
              ? spaceMutated
              : space
          )
        }));
      },

      getFeatureAccount: (feature, spaceLocalID) => {
        // Find the account to update in the storage.
        const space = get().spaces.find((space) => space.accountLocalID === spaceLocalID);
        if (!space) return null;

        return space.featuresServices[feature];
      },
    }),
    {
      name: "multiservice-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
