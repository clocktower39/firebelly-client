import { jwtDecode as jwt } from "jwt-decode";
import { authApi } from "../../api/authApi";
import { conversationApi } from "../../api/conversationApi";
import { goalApi } from "../../api/goalApi";
import { metricApi } from "../../api/metricApi";
import { setAccessToken } from "../../api/client";
import {
  ADD_METRIC_ENTRY,
  ADD_NEW_GOAL,
  DELETE_GOAL,
  DELETE_METRIC_ENTRY,
  EDIT_METRICS_ENTRIES,
  EDIT_METRICS_LATEST,
  EDIT_METRICS_PENDING,
  ERROR,
  GET_GOALS,
  LOGIN_USER,
  REVIEW_METRIC_ENTRY,
  UPDATE_CONVERSATION_MESSAGES,
  UPDATE_CONVERSATIONS,
  UPDATE_GOAL,
  UPDATE_METRIC_ENTRY,
} from "../actionTypes";

export function getGoals({ requestedBy = "client", client }) {
  return async (dispatch, getState) => {
    let goals = await goalApi.getGoals({ requestedBy, client });

    return dispatch({
      type: GET_GOALS,
      goals,
    });
  };
}

export function updateGoal(updatedGoal) {
  return async (dispatch, getState) => {
    let goal = await goalApi.updateGoal(updatedGoal);

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function addNewGoal(newGoal) {
  return async (dispatch, getState) => {
    let goal = await goalApi.createGoal(newGoal);

    return dispatch({
      type: ADD_NEW_GOAL,
      goal,
    });
  };
}

export function deleteGoal(goalId) {
  return async (dispatch, getState) => {
    let results = await goalApi.deleteGoal(goalId);

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
    let goal = await goalApi.addComment(goalId, newComment);

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function removeGoalComment(goalId, commentId) {
  return async (dispatch, getState) => {
    let goal = await goalApi.removeComment(goalId, commentId);

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function markAchievementSeen(goalId) {
  return async (dispatch, getState) => {
    let goal = await goalApi.markAchievementSeen(goalId);

    return dispatch({
      type: UPDATE_GOAL,
      goal,
    });
  };
}

export function requestMetrics({ userId } = {}) {
  return async (dispatch) => {
    const entries = await metricApi.list({ userId });

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
    const entries = await metricApi.pending();

    dispatch({
      type: EDIT_METRICS_PENDING,
      entries,
    });

    return entries;
  };
}

export function requestLatestMetric({ userId } = {}) {
  return async (dispatch) => {
    const latest = await metricApi.latest({ userId });

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
    const entry = await metricApi.create(payload);

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
    const entry = await metricApi.review({ entryId, approved });

    dispatch({
      type: REVIEW_METRIC_ENTRY,
      entry,
    });

    return entry;
  };
}

export function updateMetricEntry(payload) {
  return async (dispatch) => {
    const entry = await metricApi.update(payload);

    dispatch({
      type: UPDATE_METRIC_ENTRY,
      entry,
    });

    return entry;
  };
}

export function deleteMetricEntry(entryId, userId) {
  return async (dispatch) => {
    const data = await metricApi.delete(entryId);

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
    const data = await conversationApi.getConversations();
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
    const data = await conversationApi.sendMessage({ conversationId, message });
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
    const data = await conversationApi.deleteMessage({ conversationId, messageId });
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
    const data = await authApi.uploadProfilePicture(formData);
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    setAccessToken(accessToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  };
}
