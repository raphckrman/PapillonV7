export const timestampToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  let formattedDate: string;

  let dateDifference = [
    date.getFullYear() - today.getFullYear(),
    date.getMonth() - today.getMonth(),
    date.getDate() - today.getDate(),
  ];

  let yearDifference = Math.trunc(
    dateDifference[0] + dateDifference[1] / 12 + dateDifference[2] / 365,
  );

  let monthDifference = Math.trunc(
    dateDifference[0] * 12 +
      dateDifference[1] + dateDifference[2] / 30.4,
  );

  let dayDifference = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (yearDifference === 0) {
    if (monthDifference === 0) {
      if (Math.abs(dayDifference) > 2) {
        let prefix = dayDifference < 0 ? "Il y a " : "Dans ";
        let suffix = " jours";
        formattedDate = prefix + Math.abs(dayDifference) + suffix;
      } else {
        switch (dayDifference) {
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
            formattedDate = "";
            break;
        }
      }
    } else {
      let prefix = monthDifference < 0 ? "Il y a " : "Dans ";
      let suffix = " mois";
      formattedDate = prefix + Math.abs(monthDifference) + suffix;
    }
  } else {
    let prefix = yearDifference < 0 ? "Il y a " : "Dans ";
    let suffix = " an" + (Math.abs(yearDifference) > 1 ? "s" : "");
    formattedDate = prefix + Math.abs(yearDifference) + suffix;
  }

  return formattedDate;
};