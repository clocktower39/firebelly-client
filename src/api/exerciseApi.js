import { apiFetch } from "./client";

export const exerciseApi = {
  getMyExerciseList: (user) =>
    apiFetch("/myExerciseList", {
      method: "POST",
      body: { user },
    }),

  getExerciseList: () => apiFetch("/exerciseLibrary"),

  getExerciseHistory: ({ targetExercise, user }) =>
    apiFetch("/exerciseHistory", {
      method: "POST",
      body: { targetExercise, user },
    }),

  getExerciseProgressSummary: (user) =>
    apiFetch("/exerciseProgressSummary", {
      method: "POST",
      body: { user },
    }),

  updateExercise: (exercise) =>
    apiFetch("/updateExercise", {
      method: "POST",
      body: { exercise },
    }),

  createExercise: (exercise) =>
    apiFetch("/createExercise", {
      method: "POST",
      body: exercise,
    }),

  mergeExercises: ({ sourceExerciseId, targetExerciseId, deleteSource = true }) =>
    apiFetch("/mergeExercises", {
      method: "POST",
      body: { sourceExerciseId, targetExerciseId, deleteSource },
    }),
};

