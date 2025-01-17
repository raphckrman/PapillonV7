export const timestampToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const difference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let formattedDate: string;

  switch (difference) {
    case -2:
      formattedDate = "Avant-hier";
      break;
    case -1:
      formattedDate = "Hier";
      break;
    case 0:
      formattedDate = "Aujourd'hui";
      break;
    case 1:
      formattedDate = "Demain";
      break;
    case 2:
      formattedDate = "Après-demain";
      break;
    default:
      if (difference < 0) {
        formattedDate = `Il y a ${0 - difference} jours`;
      } else {
        formattedDate = `Dans ${difference} jours`;
      }
      break;
  }

  return formattedDate;
};
