export const timestampToString = (timestamp: number) => {
  if (!timestamp || Number.isNaN(timestamp)) {
    return "Date invalide";
  }

  const date = new Date(timestamp);
  const today = new Date();
  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const dayDifference = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const yearDifference = date.getFullYear() - today.getFullYear();
  const monthDifference =
    yearDifference * 12 + (date.getMonth() - today.getMonth());

  let formattedDate: string;

  if (dayDifference === 0) {
    formattedDate = "Aujourd'hui";
  } else if (dayDifference === 1) {
    formattedDate = "Demain";
  } else if (dayDifference === 2) {
    formattedDate = "Après-demain";
  } else if (dayDifference === -1) {
    formattedDate = "Hier";
  } else if (dayDifference === -2) {
    formattedDate = "Avant-hier";
  } else if (dayDifference > 0 && dayDifference < 30) {
    formattedDate = `Dans ${dayDifference} jours`;
  } else if (monthDifference === 1) {
    formattedDate = "Dans 1 mois";
  } else if (monthDifference > 1 && monthDifference < 12) {
    formattedDate = `Dans ${monthDifference} mois`;
  } else if (yearDifference === 1) {
    formattedDate = "Dans 1 an";
  } else if (yearDifference > 1) {
    formattedDate = `Dans ${yearDifference} ans`;
  } else if (dayDifference < 0 && dayDifference > -30) {
    formattedDate = `Il y a ${Math.abs(dayDifference)} jours`;
  } else if (monthDifference === -1) {
    formattedDate = "Il y a 1 mois";
  } else if (monthDifference < 0 && monthDifference > -12) {
    formattedDate = `Il y a ${Math.abs(monthDifference)} mois`;
  } else if (yearDifference === -1) {
    formattedDate = "Il y a 1 an";
  } else {
    formattedDate = `Il y a ${Math.abs(yearDifference)} ans`;
  }

  return formattedDate;
};
