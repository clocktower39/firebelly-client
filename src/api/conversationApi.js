import { apiFetch } from "./client";

export const conversationApi = {
  getConversations: () => apiFetch("/conversation/getConversations"),

  sendMessage: ({ conversationId, message }) =>
    apiFetch("/conversation/message/send", {
      method: "POST",
      body: { conversationId, message },
    }),

  deleteMessage: ({ conversationId, messageId }) =>
    apiFetch("/conversation/message/delete", {
      method: "POST",
      body: { conversationId, messageId },
    }),
};

