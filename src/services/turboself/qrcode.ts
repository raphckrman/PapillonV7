import type { TurboselfAccount } from "@/stores/account/types";

export const getQRCode = async (account: TurboselfAccount): Promise<number | null> => {
  return account.authentication.session.host?.cardNumber ?? null;
};