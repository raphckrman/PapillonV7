import { updateNewsState, getNews } from "../utils/news";
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import uuid from "@/utils/uuid-v4";
import parse_news_resume from "@/utils/format/format_pronote_news";
import { Information } from "@/services/shared/Information";

const getDifferences = (currentNews: Information[], updatedNews: Information[]): Information[] => {
  return updatedNews.filter((updatedItem) => {
    const currentItem = currentNews.find((item) => item.id === updatedItem.id);
    return !currentItem || JSON.stringify(currentItem) !== JSON.stringify(updatedItem);
  });
};

const fetchNews = async (): Promise<Information[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account?.personalization.notifications;

  const currentNews = getNews();
  await updateNewsState(account);
  const updatedNews = getNews();

  const differences = getDifferences(currentNews, updatedNews);

  if (notificationsTypesPermissions?.enabled && notificationsTypesPermissions?.news) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        papillonNotify({
          id: `${account?.localID}-${differences[0].id}-news`,
          title: `[${account?.name}] Nouvelle information`,
          subtitle: differences[0].title,
          body: differences[0].content
            ? parse_news_resume(differences[0].content)
            : "Aucun résumé disponible.",
          ios: {
            categoryId: account?.localID,
          },
        });
        break;
      default:
        papillonNotify({
          id: `${account?.localID}-${uuid()}-news`,
          title: `[${account?.name}] Nouvelles informations`,
          body: `Vous avez ${differences.length} nouvelles informations.`,
          ios: {
            categoryId: account?.localID,
          },
        });
        break;
    }
  }

  return updatedNews;
};

export { fetchNews };
