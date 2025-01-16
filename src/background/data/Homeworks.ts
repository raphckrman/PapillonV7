import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getHomeworks, updateHomeworksState } from "../utils/homeworks";
import { Homework } from "@/services/shared/Homework";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

const getDifferences = (
  currentHomeworks: Homework[],
  updatedHomeworks: Homework[]
): Homework[] => {
  return updatedHomeworks.filter(
    (updatedItem) =>
      !currentHomeworks.some(
        (item) =>
          item.due === updatedItem.due && item.content === updatedItem.content
      )
  );
};

const fetchHomeworks = async (): Promise<Homework[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  // @ts-expect-error
  let firstDate = account.instance?.instance?.firstDate || null;
  if (!firstDate) {
    firstDate = new Date();
    firstDate.setMonth(8);
    firstDate.setDate(1);
  }
  const firstDateEpoch = dateToEpochWeekNumber(firstDate);

  const SemaineAct = dateToEpochWeekNumber(new Date());
  const currentHomeworks = getHomeworks()[SemaineAct];
  await updateHomeworksState(account);
  const updatedHomeworks = getHomeworks()[SemaineAct];

  const differences = getDifferences(currentHomeworks, updatedHomeworks);

  if (
    notificationsTypesPermissions?.enabled &&
    notificationsTypesPermissions?.homeworks
  ) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        papillonNotify(
          {
            id: `${account.name}-homeworks`,
            title: `[${account.name}] Nouveau devoir`,
            subtitle: `Semaine ${(
              ((SemaineAct - (firstDateEpoch % 52)) % 52) +
              1
            ).toString()}`,
            body: `Un nouveau devoir en ${differences[0].subject} a été publié`,
            ios: {
              categoryId: account.name,
            },
          },
          "Homeworks"
        );
        break;
      default:
        papillonNotify(
          {
            id: `${account.name}-homeworks`,
            title: `[${account.name}] Nouveaux devoirs`,
            subtitle: `Semaine ${(
              ((SemaineAct - (firstDateEpoch % 52)) % 52) +
              1
            ).toString()}`,
            body: `
            ${differences.length} nouveaux devoirs ont été publiés :<br />
            ${differences
              .flatMap((element) => {
                return `- ${element.subject}`;
              })
              .join("<br />")}
            `,
            ios: {
              categoryId: account.name,
            },
          },
          "Homeworks"
        );
        break;
    }
  }

  return updatedHomeworks;
};

export { fetchHomeworks };
