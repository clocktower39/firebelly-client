import { jwtDecode as jwt } from "jwt-decode";
import { authApi } from "../api/authApi";
import { clearAuthStorage, setAccessToken } from "../api/client";

export function loginUser(user) {
  return async (dispatch) => {
    const data = await authApi.login(user);
    if (data.error) {
      return dispatch({
        type: "ERROR",
        error: data.error,
      });
    }
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    setAccessToken(accessToken);
    localStorage.removeItem("JWT_REFRESH_TOKEN");
    return dispatch({
      type: "LOGIN_USER",
      user: decodedAccessToken,
    });
  };
}

export function loginChild({ username, pin }) {
  return async (dispatch) => {
    const data = await authApi.loginChild({ username, pin });
    if (data.error) {
      return dispatch({
        type: "ERROR",
        error: data.error,
      });
    }
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    setAccessToken(accessToken);
    localStorage.removeItem("JWT_REFRESH_TOKEN");
    return dispatch({
      type: "LOGIN_USER",
      user: decodedAccessToken,
    });
  };
}

export const loginJWT = (accessTokenOverride, options = {}) => {
  return async (dispatch) => {
    const { clearOnFailure = true } = options;

    if (accessTokenOverride) {
      const decodedAccessToken = jwt(accessTokenOverride);
      setAccessToken(accessTokenOverride);
      return dispatch({
        type: "LOGIN_USER",
        user: decodedAccessToken,
      });
    }

    const data = await authApi.refresh();

    if (data.accessToken) {
      const decodedAccessToken = jwt(data.accessToken);
      setAccessToken(data.accessToken);
      return dispatch({
        type: "LOGIN_USER",
        user: decodedAccessToken,
      });
    }

    if (clearOnFailure) {
      clearAuthStorage();
      return dispatch({
        type: "LOGOUT_USER",
      });
    }

    return {
      authenticated: false,
      error: data?.error || "Unable to resume session.",
    };
  };
};

export function logoutUser() {
  return async (dispatch) => {
    try {
      await authApi.logout();
    } catch (err) {
      // Local logout should still complete if the network request fails.
    }
    clearAuthStorage();
    return dispatch({
      type: "LOGOUT_USER",
    });
  };
}
