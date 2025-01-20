const numericDateFormatter = new Intl.RelativeTimeFormat("fr", {
  numeric: "always",
  style: "long",
});
const dateFormatter = new Intl.RelativeTimeFormat("fr", {
  numeric: "auto",
  style: "long",
});

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
      formattedDate = dateFormatter.format(dayDifference, "days");
    } else {
      formattedDate = numericDateFormatter.format(monthDifference, "months");
    }
  } else {
    formattedDate = numericDateFormatter.format(yearDifference, "years");
  }

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};
