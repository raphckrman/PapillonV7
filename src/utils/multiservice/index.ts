import {MultiServiceFeature} from "@/stores/multiService/types";
import {useAccounts} from "@/stores/account";
import {useMultiService} from "@/stores/multiService";
import {PrimaryAccount} from "@/stores/account/types";

export function getFeatureAccount (feature: MultiServiceFeature, spaceLocalID: string) {
  const accounts = useAccounts().accounts;
  const accountId = useMultiService().getFeatureAccountId(feature, spaceLocalID);
  const space = useMultiService().spaces.find(space => space.accountLocalID === spaceLocalID);
  const featureAccount = accounts.find(account => account.localID === accountId) as PrimaryAccount;

  if (!space || !featureAccount || !accountId) return undefined;

  featureAccount.authentication = space.authentication[accountId].authentication;
  featureAccount.instance = space.authentication[accountId].instance;
  return featureAccount;
}
