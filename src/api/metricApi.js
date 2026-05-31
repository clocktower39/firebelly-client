import { apiFetch } from "./client";

export const metricApi = {
  list: ({ userId } = {}) =>
    apiFetch("/metrics/list", {
      method: "POST",
      body: { userId },
    }),

  pending: () =>
    apiFetch("/metrics/pending", {
      method: "POST",
      body: {},
    }),

  latest: ({ userId } = {}) =>
    apiFetch("/metrics/latest", {
      method: "POST",
      body: { userId },
    }),

  create: (payload) =>
    apiFetch("/metrics/create", {
      method: "POST",
      body: payload,
    }),

  review: ({ entryId, approved }) =>
    apiFetch("/metrics/review", {
      method: "POST",
      body: { entryId, approved },
    }),

  update: (payload) =>
    apiFetch("/metrics/update", {
      method: "POST",
      body: payload,
    }),

  delete: (entryId) =>
    apiFetch("/metrics/delete", {
      method: "POST",
      body: { entryId },
    }),
};

