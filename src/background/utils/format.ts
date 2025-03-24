export const formatHoursMinutes = (timestamp: number) => {
  const LAdate = new Date(timestamp);
  const heures = LAdate.getHours().toString().padStart(2, "0");
  const minutes = LAdate.getUTCMinutes().toString().padStart(2, "0");

  return `${heures}:${minutes}`;
};
