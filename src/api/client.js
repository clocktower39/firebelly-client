const defaultServerURL = import.meta.env.DEV ? "/api" : "https://firebellyfitness.herokuapp.com";

export const serverURL = import.meta.env.VITE_API_URL || defaultServerURL;

let accessTokenMemory = null;
let trainerReturnAccessToken = null;
let guardianReturnAccessToken = null;
let refreshPromise = null;
const originalFetch = globalThis.fetch?.bind(globalThis);
const nativeFetch = (...args) => originalFetch(...args);
let fetchInstalled = false;

export const apiUrl = (pathOrUrl) => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (serverURL !== "/" && pathOrUrl.startsWith(serverURL)) return pathOrUrl;
  return `${serverURL}${pathOrUrl}`;
};

export const getAccessToken = () => accessTokenMemory;

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

export const installAuthenticatedFetch = () => {
  if (fetchInstalled || typeof window === "undefined") return;
  fetchInstalled = true;
  window.fetch = (input, options = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    const isApiRequest =
      typeof url === "string" &&
      (url.startsWith(serverURL) ||
        (serverURL === "/api" && url.startsWith("/api/")) ||
        url.startsWith("/api/"));

    if (!isApiRequest) {
      return nativeFetch(input, options);
    }

    return authFetch(url, options);
  };
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
