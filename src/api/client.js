const defaultServerURL = import.meta.env.DEV ? "/api" : "https://firebellyfitness.herokuapp.com";

export const serverURL = import.meta.env.VITE_API_URL || defaultServerURL;

export const getAccessToken = () => localStorage.getItem("JWT_AUTH_TOKEN");

export const setAccessToken = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
  } else {
    localStorage.removeItem("JWT_AUTH_TOKEN");
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem("JWT_AUTH_TOKEN");
  localStorage.removeItem("JWT_REFRESH_TOKEN");
  localStorage.removeItem("JWT_GUARDIAN_AUTH_TOKEN");
  localStorage.removeItem("JWT_GUARDIAN_REFRESH_TOKEN");
  localStorage.removeItem("JWT_TRAINER_AUTH_TOKEN");
  localStorage.removeItem("JWT_TRAINER_REFRESH_TOKEN");
  localStorage.removeItem("JWT_VIEW_ONLY");
  localStorage.removeItem("JWT_DELEGATED_SESSION");
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
  } = {}
) => {
  const token = accessToken || getAccessToken();
  const requestHeaders = { ...headers };
  let requestBody = body;

  if (body !== undefined && stringify && !(body instanceof FormData)) {
    requestHeaders["Content-type"] = "application/json; charset=UTF-8";
    requestBody = JSON.stringify(body);
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${serverURL}${path}`, {
    method,
    body: requestBody,
    headers: requestHeaders,
    credentials: "include",
  });

  if (response.status === 204) return {};

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};
