import { apiFetch } from "./client";

export const programApi = {
  listPrograms: (params = {}) => {
    const query = new URLSearchParams(params);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch(`/programs${suffix}`);
  },

  getProgram: (programId) => apiFetch(`/programs/${encodeURIComponent(programId)}`),

  createProgram: (payload) =>
    apiFetch("/programs", {
      method: "POST",
      body: payload,
    }),

  updateProgram: (programId, payload) =>
    apiFetch(`/programs/${encodeURIComponent(programId)}`, {
      method: "PUT",
      body: payload,
    }),

  publishProgram: (programId, payload = {}) =>
    apiFetch(`/programs/${encodeURIComponent(programId)}/publish`, {
      method: "POST",
      body: payload,
    }),

  updateProgramDay: ({ programId, week, day, workoutId }) =>
    apiFetch(`/programs/${encodeURIComponent(programId)}/days/${week}/${day}`, {
      method: "PUT",
      body: { workoutId },
    }),

  deleteProgramDay: ({ programId, week, day }) =>
    apiFetch(`/programs/${encodeURIComponent(programId)}/days/${week}/${day}`, {
      method: "DELETE",
    }),

  assignProgram: (programId, payload) =>
    apiFetch(`/programs/${encodeURIComponent(programId)}/assign`, {
      method: "POST",
      body: payload,
    }),
};
