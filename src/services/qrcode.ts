import { AccountService, type ExternalAccount } from "@/stores/account/types";
import type { Balance } from "./shared/Balance";

export const QRCodeFromExternal = async (account: ExternalAccount): Promise<number | null> => {
  switch (account.service) {
    case AccountService.Turboself: {
      const { getQRCode } = await import("./turboself/qrcode");
      const qrcode = await getQRCode(account);
      return qrcode;
    }
    case AccountService.ARD: {
      return null;
    }
  }
};