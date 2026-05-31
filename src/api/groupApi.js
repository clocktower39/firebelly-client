import { apiFetch } from "./client";

export const groupApi = {
  listGroups: () => apiFetch("/groups"),

  createGroup: (payload) =>
    apiFetch("/groups", {
      method: "POST",
      body: payload,
    }),

  getInvite: (token) =>
    apiFetch(`/groups/invitations/${encodeURIComponent(token)}`, {
      auth: false,
    }),

  acceptInvite: (payload) =>
    apiFetch("/groups/invitations/accept", {
      method: "POST",
      body: payload,
    }),

  getGroup: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}`),

  getMembers: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}/members`),

  getAssignments: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}/assignments`),

  searchMembers: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/member-search`, {
      method: "POST",
      body: payload,
    }),

  updateGroup: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}`, {
      method: "PUT",
      body: payload,
    }),

  getInvitations: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}/invitations`),

  createInvitation: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/invitations`, {
      method: "POST",
      body: payload,
    }),

  deleteInvitation: (groupId, inviteId) =>
    apiFetch(
      `/groups/${encodeURIComponent(groupId)}/invitations/${encodeURIComponent(inviteId)}`,
      {
        method: "DELETE",
      }
    ),

  uploadPicture: (groupId, formData) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/picture`, {
      method: "POST",
      body: formData,
      stringify: false,
    }),

  deletePicture: (groupId) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/picture`, {
      method: "DELETE",
    }),

  getAnalytics: (groupId, params = {}) => {
    const query = new URLSearchParams(params);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch(`/groups/${encodeURIComponent(groupId)}/analytics${suffix}`);
  },

  getBilling: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}/billing`),

  updateBilling: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/billing`, {
      method: "PUT",
      body: payload,
    }),

  getChat: (groupId) => apiFetch(`/groups/${encodeURIComponent(groupId)}/chat`),

  createChatMessage: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/chat/messages`, {
      method: "POST",
      body: payload,
    }),

  deleteChatMessage: (groupId, messageId) =>
    apiFetch(
      `/groups/${encodeURIComponent(groupId)}/chat/messages/${encodeURIComponent(messageId)}`,
      {
        method: "DELETE",
      }
    ),

  addMember: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/members`, {
      method: "POST",
      body: payload,
    }),

  updateMember: (groupId, memberId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`, {
      method: "PUT",
      body: payload,
    }),

  removeMember: (groupId, memberId) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`, {
      method: "DELETE",
    }),

  createAssignment: (groupId, payload) =>
    apiFetch(`/groups/${encodeURIComponent(groupId)}/assignments`, {
      method: "POST",
      body: payload,
    }),
};
