import { formatDistance, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

export const timestampToString = (timestamp: number) => {
  if (isNaN(timestamp)) {
    return;
  }

  if (isToday(timestamp)) {
    return "Aujourd’hui";
  }

  if (isTomorrow(timestamp)) {
    return "Demain";
  }

  return formatDistance(new Date(timestamp), new Date(), {
    locale: fr,
    addSuffix: true,
  });
};
