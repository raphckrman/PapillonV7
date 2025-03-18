import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function formatDate (date: string): string {
  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) {
    return "Date invalide";
  }
  let formattedDate = formatDistanceToNow(messageDate, { addSuffix: true, locale: fr });

  if (formattedDate === "dans 1 jour") {
    return "demain";
  }
  if (formattedDate === "il y a 1 jour") {
    return "hier";
  }

  if (isToday(messageDate)) {
    return "aujourd’hui";
  }

  return formattedDate;
}

export default formatDate;
