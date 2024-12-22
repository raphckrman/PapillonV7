export const getHolidayEmoji = (date: Date = new Date()): string => {
  const year = date.getFullYear();

  const holidays = [
    { start: new Date(`${year}-01-01`), end: new Date(`${year}-01-01`), emoji: "🎉" }, // Nouvel An
    { start: new Date(`${year}-05-01`), end: new Date(`${year}-05-01`), emoji: "🌹" }, // Fête du Travail
    { start: new Date(`${year}-05-08`), end: new Date(`${year}-05-08`), emoji: "🇫🇷" }, // Armistice 1945
    { start: new Date(`${year}-07-14`), end: new Date(`${year}-07-14`), emoji: "🎇" }, // Fête Nationale
    { start: new Date(`${year}-11-01`), end: new Date(`${year}-11-01`), emoji: "🕯️" }, // Toussaint
    { start: new Date(`${year}-11-11`), end: new Date(`${year}-11-11`), emoji: "🕊️" }, // Armistice
    { start: new Date(`${year}-12-25`), end: new Date(`${year}-12-25`), emoji: "🎄" }, // Noël
  ];

  const schoolHolidays = [
    { start: new Date(`${year}-10-19`), end: new Date(`${year}-11-04`), emoji: "🍂" }, // Vacances de la Toussaint
    { start: new Date(`${year}-12-21`), end: new Date(`${year + 1}-01-06`), emoji: "❄️" }, // Vacances de Noël
    { start: new Date(`${year + 1}-02-08`), end: new Date(`${year + 1}-03-10`), emoji: "⛷️" }, // Vacances d'hiver
    { start: new Date(`${year + 1}-04-05`), end: new Date(`${year + 1}-04-28`), emoji: "🌸" }, // Vacances de printemps
    { start: new Date(`${year + 1}-07-05`), end: new Date(`${year + 1}-09-01`), emoji: "🏖️" }, // Grandes vacances
  ];

  const allPeriods = [...holidays, ...schoolHolidays];

  for (const period of allPeriods) {
    if (date >= period.start && date <= period.end) {
      return period.emoji;
    }
  }

  return "🏝️"; // Emoji par défaut
};
