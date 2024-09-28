import type { TurboselfAccount } from "@/stores/account/types";
import type { Balance } from "../shared/Balance";

export const getBalance = async (account: TurboselfAccount): Promise<Balance[]> => {
  const balances = await account.authentication.session.balances ?? [];
  const mealPrice = await account.authentication.session.host?.lunchPrice;

  const result: Balance[] = [];
  for (const balance of balances) {
    result.push({
      amount: balance.amount / 100,
      currency: "€",
      remaining: Math.floor(balance.amount / (mealPrice ?? 0)),
      label: balance.label
    });
  }

  return result as Balance[];
};