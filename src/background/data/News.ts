import { updateNewsState, getNews } from "../utils/news";
import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import parse_news_resume from "@/utils/format/format_pronote_news";
import { Information } from "@/services/shared/Information";

const getDifferences = (
  currentNews: Information[],
  updatedNews: Information[]
): Information[] => {
  return updatedNews.filter(
    (updatedItem) =>
      !currentNews.some(
        (item) =>
          item.author === updatedItem.author &&
          item.content === updatedItem.content
      )
  );
};

const fetchNews = async (): Promise<Information[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const currentNews = getNews();
  await updateNewsState(account);
  const updatedNews = getNews();

  const differences = getDifferences(currentNews, updatedNews);

  if (
    notificationsTypesPermissions?.enabled &&
    notificationsTypesPermissions?.news
  ) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        papillonNotify({
          id: `${account.name}-news`,
          title: `[${account.name}] Nouvelle actualité`,
          subtitle: differences[0].title,
          body:
            differences[0].content && !differences[0].content.includes("<img")
              ? `${parse_news_resume(differences[0].content).slice(0, 100)}...`
              : "Aucun résumé disponible.",
          ios: {
            categoryId: account.name,
          },
        });
        break;
      default:
        papillonNotify({
          id: `${account.name}-news`,
          title: `[${account.name}] Nouvelles actualités`,
          body: differences.flatMap((element) => {
            return element.title ?? "Sans titre";
          }).join("<br />"),
          ios: {
            categoryId: account.name,
          },
        });
        break;
    }
  }

  return updatedNews;
};

export { fetchNews };
