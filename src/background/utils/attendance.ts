import { updateAttendanceInCache } from "@/services/attendance";
import { PrimaryAccount } from "@/stores/account/types";
import { useAttendanceStore } from "@/stores/attendance";

export const getAttendance = () => {
  return {
    defaultPeriod: useAttendanceStore.getState().defaultPeriod,
    attendances: useAttendanceStore.getState().attendances,
  };
};

export const updateAttendanceState = async (
  account: PrimaryAccount,
  period: string
) => {
  await updateAttendanceInCache(account, period);
};
