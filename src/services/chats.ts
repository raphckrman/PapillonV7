import { type Account, AccountService } from "@/stores/account/types";
import type { Chat, ChatMessage, ChatRecipient } from "./shared/Chat";
import type { Recipient } from "./shared/Recipient";

export const getChats = async <T extends Account> (account: T): Promise<Array<Chat>> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChats } = await import("./pronote/chats");
      return getChats(account);
    }
    case AccountService.EcoleDirecte: {
      const {getChats} = await import("./ecoledirecte/chats");
      return await getChats(account);
    }
    default:
      console.info(`[getChats]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const getChatRecipients = async <T extends Account> (account: T, chat: Chat): Promise<ChatRecipient[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChatRecipients } = await import("./pronote/chats");
      return await getChatRecipients(account, chat);
    }
    case AccountService.EcoleDirecte: {
      // TODO
      return [];
    }
    default:
      console.info(`[getChatRecipients]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const sendMessageInChat = async <T extends Account> (account: T, chat: Chat, content: string): Promise<void> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { sendMessageInChat } = await import("./pronote/chats");
      await sendMessageInChat(account, chat, content);
    }
    case AccountService.EcoleDirecte: {
      // TODO
    }
    default:
      console.info("[sendMessageInChat]: Not Implementend.");
  }
};

export const getChatMessages = async <T extends Account> (account: T, chat: Chat): Promise<ChatMessage[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { getChatMessages } = await import("./pronote/chats");
      return await getChatMessages(account, chat);
    }
    case AccountService.EcoleDirecte: {
      const { getChatMessages } = await import("./ecoledirecte/chats");
      return [await getChatMessages(account, chat)];
    }
    default:
      console.info(`[getChatMessages]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const createDiscussionRecipients = async <T extends Account> (account: T): Promise<Recipient[]> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { createDiscussionRecipients } = await import("./pronote/chats");
      return createDiscussionRecipients(account);
    }
    default:
      console.info(`[createDiscussionRecipients]: returning empty since ${account.service} not implemented.`);
      return [];
  }
};

export const createDiscussion = async <T extends Account> (account: T, subject: string, content: string, recipients: Recipient[]): Promise<void> => {
  switch (account.service) {
    case AccountService.Pronote: {
      const { createDiscussion } = await import("./pronote/chats");
      createDiscussion(account, subject, content, recipients);
      break;
    }
    default:
      console.info(`[createDiscussion]: doing nothing since ${account.service} is not implemented.`);
  }
};
