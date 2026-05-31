import { apiFetch } from "./client";

export const goalApi = {
  getGoals: ({ requestedBy = "client", client } = {}) =>
    requestedBy === "trainer"
      ? apiFetch("/clientGoals", {
          method: "POST",
          body: { requestedBy, client },
        })
      : apiFetch("/goals"),

  updateGoal: (updatedGoal) =>
    apiFetch("/updateGoal", {
      method: "POST",
      body: updatedGoal,
    }),

  createGoal: (newGoal) =>
    apiFetch("/createGoal", {
      method: "POST",
      body: newGoal,
    }),

  deleteGoal: (goalId) =>
    apiFetch("/removeGoal", {
      method: "POST",
      body: { goalId },
    }),

  addComment: (goalId, comment) =>
    apiFetch("/commentGoal", {
      method: "POST",
      body: { _id: goalId, comment },
    }),

  removeComment: (goalId, commentId) =>
    apiFetch("/removeGoalComment", {
      method: "POST",
      body: { _id: goalId, commentId },
    }),

  markAchievementSeen: (goalId) =>
    apiFetch("/goals/markAchievementSeen", {
      method: "POST",
      body: { goalId },
    }),

  getExerciseMaxAtReps: (payload) =>
    apiFetch("/goals/exerciseMaxAtReps", {
      method: "POST",
      body: payload,
    }),
};

