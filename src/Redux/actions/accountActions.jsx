import { jwtDecode as jwt } from "jwt-decode";
import { accountApi } from "../../api/accountApi";
import { authApi } from "../../api/authApi";
import {
  getAccessToken,
  hasDelegatedReturnAccessToken,
  setAccessToken,
  setDelegatedReturnAccessToken,
} from "../../api/client";
import { loginUser, loginJWT } from "../authActions";
import {
  ERROR,
  GET_CLIENTS,
  GET_TRAINERS,
  LOGIN_USER,
  UPDATE_MY_TRAINERS,
} from "../actionTypes";

export function signupUser(user) {
  return async (dispatch) => {
    const data = await authApi.signup(user);
    if (data.error) {
      dispatch({
        type: ERROR,
        error: data.error,
      });
      return data;
    }

    return dispatch(loginUser({ email: user.email, password: user.password }));
  };
}

export function enterClientAccount(clientId) {
  return async (dispatch) => {
    try {
      const data = await authApi.getClientAccessToken(clientId);

      if (!data.accessToken) {
        const error = data.error || "Unable to enter client view.";
        dispatch({
          type: ERROR,
          error,
        });
        return { error };
      }

      const currentAccess = getAccessToken();

      if (currentAccess && !hasDelegatedReturnAccessToken("trainer")) {
        setDelegatedReturnAccessToken("trainer", currentAccess);
      }

      localStorage.setItem("JWT_DELEGATED_SESSION", "trainer_client");
      localStorage.removeItem("JWT_VIEW_ONLY");
      await dispatch(loginJWT(data.accessToken));
      return data;
    } catch (err) {
      const error = "Unable to enter client view.";
      dispatch({
        type: ERROR,
        error,
      });
      return { error };
    }
  };
}

export function changePassword(currentPassword, newPassword) {
  return async (dispatch, getState) => {
    const data = await authApi.changePassword({ currentPassword, newPassword });
    if (data.error) return data;

    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    setAccessToken(accessToken);
    return dispatch({
      type: LOGIN_USER,
      agent: decodedAccessToken,
    });
  };
}

export function editUser(user) {
  return async (dispatch) => {
    const data = await authApi.updateUser({ ...user });

    if (data.status === "error") {
      return dispatch({
        type: ERROR,
        error: "User not updated",
      });
    } else {
      setAccessToken(data.accessToken);
      const decodedAccessToken = jwt(data.accessToken);
      return dispatch({
        type: LOGIN_USER,
        user: decodedAccessToken,
      });
    }
  };
}

// Fetches daily training information

export function updateUserSettings(payload) {
  return async (dispatch) => {
    const data = await authApi.updateUser(payload);
    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    setAccessToken(accessToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  };
}

export function updateThemeMode(mode) {
  return updateUserSettings({ themeMode: mode });
}

export function requestMyTrainers() {
  return async (dispatch, getState) => {
    let myTrainers = await accountApi.getMyTrainers();

    return dispatch({
      type: UPDATE_MY_TRAINERS,
      myTrainers,
    });
  };
}

export function requestClients() {
  return async (dispatch, getState) => {
    let clients = await accountApi.getMyClients();

    if (!Array.isArray(clients)) {
      dispatch({
        type: ERROR,
        error: clients?.error || "Unable to load clients.",
      });
      clients = [];
    }

    return dispatch({
      type: GET_CLIENTS,
      clients,
    });
  };
}

export function changeRelationshipStatus(client, accepted) {
  return async (dispatch, getState) => {
    accountApi.changeRelationshipStatus({ client, accepted }).then(() => dispatch(requestClients()));
  };
}

export function updateRelationshipProfile({ client, engagementStatus, serviceTags }) {
  return async (dispatch) => {
    const data = await accountApi.updateRelationshipProfile({
      client,
      engagementStatus,
      serviceTags,
    });

    if (data?.error || data?.message) {
      const error = data?.error || data?.message || "Unable to update client settings.";
      dispatch({
        type: ERROR,
        error,
      });
      return { error };
    }

    await dispatch(requestClients());
    return data;
  };
}

export function getTrainers() {
  return async (dispatch, getState) => {
    let trainers = await accountApi.getTrainers();

    return dispatch({
      type: GET_TRAINERS,
      trainers,
    });
  };
}

export function requestTrainer(trainer) {
  return async (dispatch, getState) => {
    let data = await accountApi.requestTrainer(trainer);
    if (data.status === "success") {
      dispatch(requestMyTrainers());
    }
  };
}

export function removeRelationship(trainer, client) {
  return async (dispatch, getState) => {
    const data = await accountApi.removeRelationship({ trainer, client });
    if (!data?.error) {
      dispatch(requestMyTrainers());
      dispatch(requestClients());
    }
  };
}

export function updateMetricsApproval(trainer, metricsApprovalRequired) {
  return async (dispatch) => {
    const data = await accountApi.updateMetricsApproval({ trainer, metricsApprovalRequired });
    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    return dispatch(requestMyTrainers());
  };
}
