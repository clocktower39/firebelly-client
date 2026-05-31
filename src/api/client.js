const defaultServerURL = import.meta.env.DEV ? "/api" : "https://firebellyfitness.herokuapp.com";

export const serverURL = import.meta.env.VITE_API_URL || defaultServerURL;

let accessTokenMemory = null;
let trainerReturnAccessToken = null;
let guardianReturnAccessToken = null;
let refreshPromise = null;
let authChannel = null;
const originalFetch = globalThis.fetch?.bind(globalThis);
const nativeFetch = (...args) => originalFetch(...args);
const pendingAccessTokenRequests = new Map();
const AUTH_CHANNEL_NAME = "firebelly-auth";
const AUTH_MESSAGE = {
  requestAccessToken: "REQUEST_ACCESS_TOKEN",
  accessToken: "ACCESS_TOKEN",
  clearAuth: "CLEAR_AUTH",
};

export const apiUrl = (pathOrUrl) => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (serverURL !== "/" && pathOrUrl.startsWith(serverURL)) return pathOrUrl;
  return `${serverURL}${pathOrUrl}`;
};

export const getAccessToken = () => accessTokenMemory;

const getAuthChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (authChannel) return authChannel;

  authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
  authChannel.addEventListener("message", (event) => {
    const message = event.data || {};

    if (message.type === AUTH_MESSAGE.requestAccessToken && accessTokenMemory) {
      authChannel.postMessage({
        type: AUTH_MESSAGE.accessToken,
        requestId: message.requestId,
        accessToken: accessTokenMemory,
      });
      return;
    }

    if (message.type === AUTH_MESSAGE.accessToken && message.requestId) {
      const pending = pendingAccessTokenRequests.get(message.requestId);
      if (!pending) return;

      clearTimeout(pending.timeoutId);
      pendingAccessTokenRequests.delete(message.requestId);
      if (message.accessToken) setAccessToken(message.accessToken);
      pending.resolve(message.accessToken || null);
      return;
    }

    if (message.type === AUTH_MESSAGE.clearAuth) {
      accessTokenMemory = null;
      trainerReturnAccessToken = null;
      guardianReturnAccessToken = null;
    }
  });

  return authChannel;
};

export const initializeAuthTokenSync = () => {
  getAuthChannel();
};

export const requestAccessTokenFromOpenTab = (timeoutMs = 500) => {
  if (accessTokenMemory) return Promise.resolve(accessTokenMemory);

  const channel = getAuthChannel();
  if (!channel) return Promise.resolve(null);

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      pendingAccessTokenRequests.delete(requestId);
      resolve(null);
    }, timeoutMs);

    pendingAccessTokenRequests.set(requestId, { resolve, timeoutId });
    channel.postMessage({
      type: AUTH_MESSAGE.requestAccessToken,
      requestId,
    });
  });
};

export const setDelegatedReturnAccessToken = (type, token) => {
  if (type === "guardian") {
    guardianReturnAccessToken = token || null;
    localStorage.removeItem("JWT_GUARDIAN_AUTH_TOKEN");
    return;
  }
  trainerReturnAccessToken = token || null;
  localStorage.removeItem("JWT_TRAINER_AUTH_TOKEN");
};

export const getDelegatedReturnAccessToken = (type) =>
  type === "guardian" ? guardianReturnAccessToken : trainerReturnAccessToken;

export const hasDelegatedReturnAccessToken = (type) => Boolean(getDelegatedReturnAccessToken(type));

export const setAccessToken = (accessToken) => {
  accessTokenMemory = accessToken || null;
  localStorage.removeItem("JWT_AUTH_TOKEN");
};

export const clearAuthStorage = () => {
  accessTokenMemory = null;
  trainerReturnAccessToken = null;
  guardianReturnAccessToken = null;
  getAuthChannel()?.postMessage({ type: AUTH_MESSAGE.clearAuth });
  localStorage.removeItem("JWT_REFRESH_TOKEN");
  localStorage.removeItem("JWT_GUARDIAN_AUTH_TOKEN");
  localStorage.removeItem("JWT_GUARDIAN_REFRESH_TOKEN");
  localStorage.removeItem("JWT_TRAINER_AUTH_TOKEN");
  localStorage.removeItem("JWT_TRAINER_REFRESH_TOKEN");
  localStorage.removeItem("JWT_VIEW_ONLY");
  localStorage.removeItem("JWT_DELEGATED_SESSION");
};

const parseResponse = async (response) => {
  if (response.status === 204) return {};
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = nativeFetch(apiUrl("/refresh-tokens"), {
      method: "POST",
      body: "{}",
      headers: { "Content-type": "application/json; charset=UTF-8" },
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          clearAuthStorage();
          return null;
        }
        const data = await parseResponse(response);
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          return data.accessToken;
        }
        clearAuthStorage();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const authFetch = async (
  pathOrUrl,
  { auth = true, accessToken, retryOnUnauthorized = true, ...options } = {}
) => {
  const buildOptions = (token, forceAuthHeader = false) => {
    const headers = { ...(options.headers || {}) };
    if (auth && token && (forceAuthHeader || !headers.Authorization)) {
      headers.Authorization = `Bearer ${token}`;
    }
    return {
      ...options,
      headers,
      credentials: options.credentials || "include",
    };
  };

  const token = accessToken || getAccessToken();
  let response = await nativeFetch(apiUrl(pathOrUrl), buildOptions(token));
  const shouldRefresh =
    auth && retryOnUnauthorized && (response.status === 401 || response.status === 403);

  if (shouldRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await nativeFetch(apiUrl(pathOrUrl), buildOptions(refreshedToken, true));
    }
  }

  return response;
};

export const apiFetch = async (
  path,
  {
    method = "GET",
    body,
    headers = {},
    auth = true,
    accessToken,
    stringify = true,
    retryOnUnauthorized = true,
  } = {}
) => {
  const requestHeaders = { ...headers };
  let requestBody = body;

  if (body !== undefined && stringify && !(body instanceof FormData)) {
    requestHeaders["Content-type"] = "application/json; charset=UTF-8";
    requestBody = JSON.stringify(body);
  }

  const response = await authFetch(path, {
    method,
    body: requestBody,
    headers: requestHeaders,
    auth,
    accessToken,
    retryOnUnauthorized,
  });

  return parseResponse(response);
};
