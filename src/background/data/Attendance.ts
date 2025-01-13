import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { Attendance } from "@/services/shared/Attendance";
import { getAttendance, updateAttendanceState } from "../utils/attendance";

const getDifferences = (
  currentAttendance: Attendance,
  updatedAttendance: Attendance
): Attendance => {
  const absFilter = updatedAttendance.absences.filter(
    (updatedItem) =>
      !currentAttendance.absences.some(
        (item) =>
          item.fromTimestamp === updatedItem.fromTimestamp &&
          item.toTimestamp === updatedItem.toTimestamp
      )
  );

  const delFilter = updatedAttendance.delays.filter(
    (updatedItem) =>
      !currentAttendance.delays.some(
        (item) =>
          item.timestamp === updatedItem.timestamp &&
          item.duration === updatedItem.duration
      )
  );

  const obsFilter = updatedAttendance.observations.filter(
    (updatedItem) =>
      !currentAttendance.observations.some(
        (item) =>
          item.timestamp === updatedItem.timestamp &&
          item.sectionName === updatedItem.sectionName
      )
  );

  const punFilter = updatedAttendance.punishments.filter(
    (updatedItem) =>
      !currentAttendance.punishments.some(
        (item) =>
          item.timestamp === updatedItem.timestamp &&
          item.duration === updatedItem.duration
      )
  );

  return {
    absences: absFilter,
    delays: delFilter,
    observations: obsFilter,
    punishments: punFilter,
  };
};

const fetchAttendance = async (): Promise<Attendance> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const { defaultPeriod, attendances } = getAttendance();
  await updateAttendanceState(account, defaultPeriod);
  const updatedAttendance = getAttendance().attendances[defaultPeriod];

  const differences = getDifferences(
    attendances[defaultPeriod],
    updatedAttendance
  );
  const LAdifference =
    differences.absences.length +
    differences.delays.length +
    differences.observations.length +
    differences.punishments.length;

  if (
    notificationsTypesPermissions?.enabled &&
    notificationsTypesPermissions?.attendance
  ) {
    switch (LAdifference) {
      case 0:
        break;
      case 1:
        let thenewevent = "";
        let explication = "";

        if (differences.absences.length === 1) {
          thenewevent = "Nouvelle absence";
          explication = `Tu as été absent de ${differences.absences[0].fromTimestamp} à ${differences.absences[0].toTimestamp}.`;
        } else if (differences.delays.length === 1) {
          thenewevent = "Nouveau retard";
          explication = `Tu as été en retard de ${differences.delays[0].duration} à ${differences.delays[0].timestamp}.`;
        } else if (differences.observations.length === 1) {
          thenewevent = "Nouvelle observation";
          explication = `Tu as eu une observation en ${
            differences.observations[0].subjectName ?? "Matière inconnue"
          } à ${differences.observations[0].timestamp}.`;
        } else {
          thenewevent = "Nouvelle punition";
          explication = "";
        }

        papillonNotify(
          {
            id: `${account.name}-attendance`,
            title: `[${account.name}] ${thenewevent}`,
            subtitle: defaultPeriod,
            body: explication,
            ios: {
              categoryId: account.name,
            },
          },
          "Attendance"
        );
        break;
      default:
        papillonNotify(
          {
            id: `${account.name}-attendance`,
            title: `[${account.name}] Vie Scolaire`,
            subtitle: defaultPeriod,
            body: `
            De nouveaux événements ont été publiés, consulte la vie scolaire pour plus de détails :<br />
            - Nouvelle(s) absence(s) : ${differences.absences.length}<br />
            - Nouveau(x) retard(s) : ${differences.delays.length}<br />
            - Nouvelle(s) observation(s) : ${differences.observations.length}<br />
            - Nouvelle(s) punition(s) : ${differences.punishments.length}
            `,
            ios: {
              categoryId: account.name,
            },
          },
          "Attendance"
        );
        break;
    }
  }

  return updatedAttendance;
};

export { fetchAttendance };
