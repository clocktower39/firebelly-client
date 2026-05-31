import { apiFetch } from "./client";

export const workoutApi = {
  getTraining: ({ _id, client = null }) =>
    apiFetch("/training", {
      method: "POST",
      body: { _id, client },
    }),

  getWorkoutsByDate: ({ date, client = null }) =>
    apiFetch("/workouts", {
      method: "POST",
      body: { date, client },
    }),

  getWorkoutsByRange: ({ rangeStart, rangeEnd, client = null, filters = {} }) =>
    apiFetch("/workoutsRange", {
      method: "POST",
      body: { rangeStart, rangeEnd, client, filters },
    }),

  getWorkoutsByMonth: ({ date, client }) =>
    apiFetch("/workoutMonth", {
      method: "POST",
      body: { date, client },
    }),

  getWorkoutsByYear: ({ year, client }) =>
    apiFetch("/workoutYear", {
      method: "POST",
      body: { year, client },
    }),

  createTraining: (payload) =>
    apiFetch("/createTraining", {
      method: "POST",
      body: payload,
    }),

  updateTraining: ({ _id, training }) =>
    apiFetch("/updateTraining", {
      method: "POST",
      body: { _id, training },
    }),

  updateWorkoutDateById: ({ _id, newDate, newTitle }) =>
    apiFetch("/updateWorkoutDateById", {
      method: "POST",
      body: { _id, newDate, newTitle },
    }),

  copyWorkoutById: ({ _id, newDate, newTitle, option, newAccount }) =>
    apiFetch("/copyWorkoutById", {
      method: "POST",
      body: { _id, newDate, newTitle, option, newAccount },
    }),

  getTrainingRangeEnd: ({ startDate, userId }) =>
    apiFetch("/trainingRangeEnd", {
      method: "POST",
      body: { startDate, userId },
    }),

  bulkMoveCopyWorkouts: (payload) =>
    apiFetch("/bulkMoveCopyWorkouts", {
      method: "POST",
      body: payload,
    }),

  undoBulkMoveCopy: (operation) =>
    apiFetch("/undoBulkMoveCopy", {
      method: "POST",
      body: { operation },
    }),

  deleteWorkoutById: (_id) =>
    apiFetch("/deleteWorkoutById", {
      method: "POST",
      body: { _id },
    }),

  getTrainingWeek: ({ date, client }) =>
    apiFetch("/trainingWeek", {
      method: "POST",
      body: { date, client },
    }),

  getWorkoutQueue: ({ accountId, startDate } = {}) => {
    const query = new URLSearchParams();
    if (accountId) query.set("clientId", accountId);
    if (startDate) query.set("startDate", startDate);
    const params = query.toString() ? `?${query.toString()}` : "";
    return apiFetch(`/getWorkoutQueue${params}`);
  },

  getWorkoutTemplates: (payload) =>
    apiFetch("/workoutTemplates", {
      method: "POST",
      body: payload,
    }),

  getWorkoutHistory: (payload) =>
    apiFetch("/getWorkoutHistory", {
      method: "POST",
      body: payload,
    }),
};

