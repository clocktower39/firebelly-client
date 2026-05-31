import { apiFetch } from "./client";

export const scheduleApi = {
  getRange: (payload) =>
    apiFetch("/schedule/range", {
      method: "POST",
      body: payload,
    }),

  createEvent: (payload, accessToken = null) =>
    apiFetch("/schedule/event/create", {
      method: "POST",
      body: payload,
      accessToken,
    }),

  updateEvent: ({ eventId, updates }, accessToken = null) =>
    apiFetch("/schedule/event/update", {
      method: "POST",
      body: { _id: eventId, updates },
      accessToken,
    }),

  cancelEvent: (eventId) =>
    apiFetch("/schedule/event/cancel", {
      method: "POST",
      body: { _id: eventId },
    }),

  deleteEvent: (eventId, accessToken = null) =>
    apiFetch("/schedule/event/delete", {
      method: "POST",
      body: { _id: eventId },
      accessToken,
    }),

  requestBooking: (payload) =>
    apiFetch("/schedule/book/request", {
      method: "POST",
      body: payload,
    }),

  trainerBookAvailability: (payload) =>
    apiFetch("/schedule/book/trainer", {
      method: "POST",
      body: payload,
    }),

  respondBooking: (payload) =>
    apiFetch("/schedule/book/respond", {
      method: "POST",
      body: payload,
    }),

  getEvent: (eventId, accessToken = null) =>
    apiFetch("/schedule/event", {
      method: "POST",
      body: { _id: eventId },
      accessToken,
    }),

  getEventByWorkout: (workoutId, accessToken = null) =>
    apiFetch("/schedule/event/by-workout", {
      method: "POST",
      body: { workoutId },
      accessToken,
    }),

  getPublicRange: (payload) =>
    apiFetch("/schedule/public/range", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  getPublicTrainer: (trainerId) =>
    apiFetch(`/public/trainer/${encodeURIComponent(trainerId)}`, {
      auth: false,
    }),

  getSessionTypes: (accessToken = null) => apiFetch("/session-types", { accessToken }),

  createSessionType: (payload) =>
    apiFetch("/session-types", {
      method: "POST",
      body: payload,
    }),

  updateSessionType: (sessionTypeId, payload) =>
    apiFetch(`/session-types/${encodeURIComponent(sessionTypeId)}`, {
      method: "PUT",
      body: payload,
    }),

  deleteSessionType: (sessionTypeId) =>
    apiFetch(`/session-types/${encodeURIComponent(sessionTypeId)}`, {
      method: "DELETE",
    }),

  getSessionSummary: ({ trainerId, clientId }) =>
    apiFetch("/sessions/summary", {
      method: "POST",
      body: { trainerId, clientId },
    }),

  createSessionPurchase: ({ clientId, sessionsPurchased, expiresAt, notes }) =>
    apiFetch("/sessions/purchase/create", {
      method: "POST",
      body: { clientId, sessionsPurchased, expiresAt, notes },
    }),

  listSessionPurchases: ({ trainerId, clientId, activeOnly = false }) =>
    apiFetch("/sessions/purchase/list", {
      method: "POST",
      body: { trainerId, clientId, activeOnly },
    }),
};
