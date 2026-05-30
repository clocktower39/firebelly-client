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

export function getGoals({ requestedBy = "client", client }) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    let url = `${serverURL}/goals`;
    let response;

    if (requestedBy === "trainer") {
      url = `${serverURL}/clientGoals`;
      response = await fetch(url, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          requestedBy,
          client,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
    } else {
      response = await fetch(url, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
    }

    let goals = await response.json();

    return dispatch({
      type: GET_GOALS,
      goals,
    });
  };
}

export function updateGoal(updatedGoal) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/updateGoal`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(updatedGoal),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let goal = await response.json();

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function addNewGoal(newGoal) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/createGoal`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(newGoal),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let goal = await response.json();

    return dispatch({
      type: ADD_NEW_GOAL,
      goal,
    });
  };
}

export function deleteGoal(goalId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/removeGoal`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ goalId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let results = await response.json();

    if (results.status === "Record deleted") {
      return dispatch({
        type: DELETE_GOAL,
        goalId,
      });
    }
  };
}

export function addGoalComment(goalId, newComment) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/commentGoal`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: goalId, comment: newComment }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let goal = await response.json();

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function removeGoalComment(goalId, commentId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/removeGoalComment`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: goalId, commentId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let goal = await response.json();

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function markAchievementSeen(goalId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/goals/markAchievementSeen`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ goalId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let goal = await response.json();

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function requestMetrics({ userId } = {}) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/list`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ userId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const entries = await response.json();

    dispatch({
      type: EDIT_METRICS_ENTRIES,
      userId,
      entries,
    });

    return entries;
  };
}

export function requestPendingMetrics() {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/pending`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const entries = await response.json();

    dispatch({
      type: EDIT_METRICS_PENDING,
      entries,
    });

    return entries;
  };
}

export function requestLatestMetric({ userId } = {}) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/latest`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ userId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const latest = await response.json();

    dispatch({
      type: EDIT_METRICS_LATEST,
      userId,
      entry: latest,
    });

    return latest;
  };
}

export function createMetricEntry(payload) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/create`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const entry = await response.json();

    dispatch({
      type: ADD_METRIC_ENTRY,
      entry,
      userId: payload?.userId,
    });

    return entry;
  };
}

export function reviewMetricEntry(entryId, approved) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/review`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ entryId, approved }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const entry = await response.json();

    dispatch({
      type: REVIEW_METRIC_ENTRY,
      entry,
    });

    return entry;
  };
}

export function updateMetricEntry(payload) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/update`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const entry = await response.json();

    dispatch({
      type: UPDATE_METRIC_ENTRY,
      entry,
    });

    return entry;
  };
}

export function deleteMetricEntry(entryId, userId) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const response = await fetch(`${serverURL}/metrics/delete`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ entryId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

    if (data?.status === "success") {
      dispatch({
        type: DELETE_METRIC_ENTRY,
        entryId,
        userId: userId || data.userId,
      });
    }

    return data;
  };
}

export function getConversations() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/conversation/getConversations`, {
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

    return dispatch({
      type: UPDATE_CONVERSATIONS,
      conversations: data,
    });
  };
}

export function sendMessage(conversationId, message) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/conversation/message/send`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ conversationId, message }),
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

    return dispatch({
      type: UPDATE_CONVERSATION_MESSAGES,
      conversation: { ...data },
    });
  };
}

export function socketMessage(conversation) {
  return async (dispatch) => {
    return dispatch({
      type: UPDATE_CONVERSATION_MESSAGES,
      conversation,
    });
  };
}

export function deleteMessage(conversationId, messageId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/conversation/message/delete`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ conversationId, messageId }),
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

    return dispatch({
      type: UPDATE_CONVERSATION_MESSAGES,
      conversation: { ...data },
    });
  };
}

export function uploadProfilePicture(formData) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    axios
      .post(`${serverURL}/user/upload/profilePicture`, formData, {
        headers: { Authorization: bearer },
      })
      .then(async (res) => {
        const accessToken = res.data.accessToken;
        const decodedAccessToken = jwt(accessToken);

        setAccessToken(accessToken);
        return dispatch({
          type: LOGIN_USER,
          user: decodedAccessToken,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
