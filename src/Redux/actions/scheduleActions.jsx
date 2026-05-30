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

const buildScheduleScopeKey = (trainerId, clientId) =>
  `${trainerId || "me"}:${clientId || "all"}`;

export const upsertWorkout = (workout, accountId = null) => ({
  type: UPSERT_WORKOUT,
  workout,
  accountId,
});

export const removeWorkouts = (accountId, workoutIds = []) => ({
  type: REMOVE_WORKOUTS,
  accountId,
  workoutIds,
});

export function requestScheduleRange({
  startDate,
  endDate,
  trainerId,
  clientId,
  includeAvailability = true,
}) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/range`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        startDate,
        endDate,
        trainerId,
        clientId,
        includeAvailability,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    const data = await response.json();
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }

    const stateUser = getState().user;
    const scopeKey = buildScheduleScopeKey(trainerId || stateUser._id, clientId);
    dispatch({
      type: EDIT_SCHEDULE_EVENTS,
      scopeKey,
      events: data.events || [],
      range: { startDate, endDate },
    });
    return data;
  };
}

export function createScheduleEvent(payload, accessTokenOverride = null) {
  return async (dispatch) => {
    const bearer = `Bearer ${accessTokenOverride || getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/event/create`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function updateScheduleEvent(eventId, updates, accessTokenOverride = null) {
  return async (dispatch) => {
    const bearer = `Bearer ${accessTokenOverride || getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/event/update`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: eventId, updates }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function cancelScheduleEvent(eventId) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/event/cancel`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: eventId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function deleteScheduleEvent(eventId, accessTokenOverride = null) {
  return async (dispatch) => {
    const bearer = `Bearer ${accessTokenOverride || getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/event/delete`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: eventId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function requestBooking(payload) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/book/request`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function trainerBookAvailability(payload) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/book/trainer`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function respondBooking(payload) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/schedule/book/respond`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function requestSessionSummary(trainerId, clientId) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/sessions/summary`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ trainerId, clientId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    const scopeKey = buildScheduleScopeKey(trainerId, clientId);
    dispatch({ type: EDIT_SESSION_SUMMARY, scopeKey, summary: data });
    return data;
  };
}

export function createSessionPurchase({ clientId, sessionsPurchased, expiresAt, notes }) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/sessions/purchase/create`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ clientId, sessionsPurchased, expiresAt, notes }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    return data;
  };
}

export function requestSessionPurchases({ trainerId, clientId, activeOnly = false }) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/sessions/purchase/list`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ trainerId, clientId, activeOnly }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    return data.purchases || [];
  };
}

export function requestWorkoutQueue(accountId, startDate) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const query = new URLSearchParams();
    if (accountId) query.set("clientId", accountId);
    if (startDate) query.set("startDate", startDate);
    const params = query.toString() ? `?${query.toString()}` : "";
    const response = await fetch(`${serverURL}/getWorkoutQueue${params}`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }

    dispatch({
      type: EDIT_WORKOUT_QUEUE,
      accountId: accountId || "me",
      workouts: data,
    });

    return data;
  };
}
