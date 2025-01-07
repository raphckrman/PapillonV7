import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import parse_homeworks_resume from "@/utils/format/format_pronote_news";
import { getHomeworks, updateHomeworksState } from "../utils/homeworksUpdate";
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
        papillonNotify({
          id: `${account.name}-homeworks`,
          title: `[${account.name}] Nouveau devoir`,
          subtitle: differences[0].subject,
          body: differences[0].content
            ? parse_homeworks_resume(differences[0].content)
            : "Aucun résumé disponible.",
          ios: {
            categoryId: account.name,
          },
        });
        break;
      default:
        papillonNotify({
          id: `${account.name}-homeworks`,
          title: `[${account.name}] Nouveaux devoirs`,
          body: `Vous avez ${differences.length} nouveaux devoirs.`,
          ios: {
            categoryId: account.name,
          },
        });
        break;
    }
  }

  return updatedHomeworks;
};

export { fetchHomeworks };
