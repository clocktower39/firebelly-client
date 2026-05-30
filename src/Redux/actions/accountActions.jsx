import { jwtDecode as jwt } from "jwt-decode";
import axios from "axios";
import {
  authFetch,
  getAccessToken,
  getDelegatedReturnAccessToken,
  hasDelegatedReturnAccessToken,
  serverURL,
  setAccessToken,
  setDelegatedReturnAccessToken,
} from "../../api/client";
import { loginUser, loginJWT } from "../authActions";
import {
  ADD_METRIC_ENTRY,
  ADD_NEW_GOAL,
  ADD_WORKOUT,
  CLEAR_LAST_BULK_OPERATION,
  DELETE_GOAL,
  DELETE_METRIC_ENTRY,
  EDIT_EXERCISE_LIBRARY,
  EDIT_HOME_WORKOUTS,
  EDIT_METRICS_ENTRIES,
  EDIT_METRICS_LATEST,
  EDIT_METRICS_PENDING,
  EDIT_MYACCOUNT,
  EDIT_PROGRESS_EXERCISE_LIST,
  EDIT_PROGRESS_EXERCISE_SUMMARIES,
  EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
  EDIT_SCHEDULE_EVENTS,
  EDIT_SESSION_SUMMARY,
  EDIT_TRAINING,
  EDIT_WORKOUT_QUEUE,
  EDIT_WORKOUTS,
  ERROR,
  GET_CLIENTS,
  GET_GOALS,
  GET_TRAINERS,
  LOGIN_USER,
  LOGOUT_USER,
  SIGNUP_USER,
  REMOVE_WORKOUTS,
  REVIEW_METRIC_ENTRY,
  SET_LAST_BULK_OPERATION,
  UPDATE_CONVERSATION_MESSAGES,
  UPDATE_CONVERSATIONS,
  UPDATE_GOAL,
  UPDATE_METRIC_ENTRY,
  UPDATE_MY_TRAINERS,
  UPSERT_WORKOUT,
} from "../actionTypes";
import {
  getContiguousDateRanges,
  getDateKeysInRange,
  normalizeWorkoutWeights,
} from "../actionUtils";

export function signupUser(user) {
  return async (dispatch) => {
    const response = await fetch(`${serverURL}/signup`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const data = await response.json();
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
    const bearer = `Bearer ${getAccessToken()}`;

    try {
      const response = await fetch(`${serverURL}/relationships/client/token`, {
        method: "POST",
        dataType: "json",
        credentials: "include",
        body: JSON.stringify({ clientId }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/changePassword`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/updateUser`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        ...user,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/updateUser`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/relationships/myTrainers`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let myTrainers = await response.json();

    return dispatch({
      type: UPDATE_MY_TRAINERS,
      myTrainers,
    });
  };
}

export function requestClients() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/relationships/myClients`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let clients = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    fetch(`${serverURL}/changeRelationshipStatus`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ client, accepted }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    }).then(() => dispatch(requestClients()));
  };
}

export function updateRelationshipProfile({ client, engagementStatus, serviceTags }) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/relationships/profile`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        client,
        engagementStatus,
        serviceTags,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    const data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/trainers`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let trainers = await response.json();

    return dispatch({
      type: GET_TRAINERS,
      trainers,
    });
  };
}

export function requestTrainer(trainer) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/manageRelationship`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ trainer }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();
    if (data.status === "success") {
      dispatch(requestMyTrainers());
    }
  };
}

export function removeRelationship(trainer, client) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/removeRelationship`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ trainer, client }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    if (response.status === 200) {
      dispatch(requestMyTrainers());
      dispatch(requestClients());
    }
  };
}

export function updateMetricsApproval(trainer, metricsApprovalRequired) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/relationships/metricsApproval`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ trainer, metricsApprovalRequired }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    return dispatch(requestMyTrainers());
  };
}
