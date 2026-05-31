import { apiFetch } from "./client";

export const accountApi = {
  getMyTrainers: () => apiFetch("/relationships/myTrainers"),

  getMyClients: () => apiFetch("/relationships/myClients"),

  changeRelationshipStatus: ({ client, accepted }) =>
    apiFetch("/changeRelationshipStatus", {
      method: "POST",
      body: { client, accepted },
    }),

  updateRelationshipProfile: ({ client, engagementStatus, serviceTags }) =>
    apiFetch("/relationships/profile", {
      method: "POST",
      body: { client, engagementStatus, serviceTags },
    }),

  getTrainers: () => apiFetch("/trainers"),

  requestTrainer: (trainer) =>
    apiFetch("/manageRelationship", {
      method: "POST",
      body: { trainer },
    }),

  removeRelationship: ({ trainer, client }) =>
    apiFetch("/removeRelationship", {
      method: "POST",
      body: { trainer, client },
    }),

  updateMetricsApproval: ({ trainer, metricsApprovalRequired }) =>
    apiFetch("/relationships/metricsApproval", {
      method: "POST",
      body: { trainer, metricsApprovalRequired },
    }),

  getTrainerConnections: () => apiFetch("/trainer-connections"),

  searchTrainerConnections: (payload) =>
    apiFetch("/trainer-connections/search", {
      method: "POST",
      body: payload,
    }),

  requestTrainerConnection: (payload) =>
    apiFetch("/trainer-connections/request", {
      method: "POST",
      body: payload,
    }),

  respondTrainerConnection: (payload) =>
    apiFetch("/trainer-connections/respond", {
      method: "POST",
      body: payload,
    }),

  removeTrainerConnection: (payload) =>
    apiFetch("/trainer-connections/remove", {
      method: "POST",
      body: payload,
    }),
};

