export const timestampToString = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const difference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return difference === 0
    ? "Aujourd'hui"
    : difference === 1
      ? "Demain"
      : difference === 2
        ? "Après-demain"
        : difference === -1
          ? "Hier"
          : difference === -2
            ? "Avant-hier"
            : difference < 0
              ? `Il y a ${0 - difference} jours`
              : `Dans ${difference} jours`;
};
