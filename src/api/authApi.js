import { apiFetch } from "./client";

export const authApi = {
  login: (credentials) =>
    apiFetch("/login", {
      method: "POST",
      body: credentials,
      auth: false,
    }),

  loginChild: (credentials) =>
    apiFetch("/login-child", {
      method: "POST",
      body: credentials,
      auth: false,
    }),

  refresh: () =>
    apiFetch("/refresh-tokens", {
      method: "POST",
      body: {},
      auth: false,
    }),

  logout: () =>
    apiFetch("/logout", {
      method: "POST",
      body: {},
      auth: false,
    }),

  signup: (user) =>
    apiFetch("/signup", {
      method: "POST",
      body: user,
      auth: false,
    }),

  resendVerificationEmail: (email) =>
    apiFetch("/resend-verification-email", {
      method: "POST",
      body: { email },
      auth: false,
    }),

  changePassword: ({ currentPassword, newPassword }) =>
    apiFetch("/changePassword", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),

  updateUser: (payload) =>
    apiFetch("/updateUser", {
      method: "POST",
      body: payload,
    }),

  uploadProfilePicture: (formData) =>
    apiFetch("/user/upload/profilePicture", {
      method: "POST",
      body: formData,
      stringify: false,
    }),

  getClientAccessToken: (clientId) =>
    apiFetch("/relationships/client/token", {
      method: "POST",
      body: { clientId },
    }),

  listGuardianChildren: () => apiFetch("/guardian/children"),

  createGuardianChild: (payload) =>
    apiFetch("/guardian/child", {
      method: "POST",
      body: payload,
    }),

  updateGuardianChildConsent: (payload) =>
    apiFetch("/guardian/child/consent", {
      method: "POST",
      body: payload,
    }),

  getGuardianChildToken: (payload) =>
    apiFetch("/guardian/child/token", {
      method: "POST",
      body: payload,
    }),

  addGuardianChildEmail: (payload) =>
    apiFetch("/guardian/child/add-email", {
      method: "POST",
      body: payload,
    }),
};

