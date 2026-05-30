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

export function requestMyExerciseList(user) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/myExerciseList`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        user,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let exerciseList = await response.json();

    return dispatch({
      type: EDIT_PROGRESS_EXERCISE_LIST,
      exerciseList,
    });
  };
}

export function getExerciseList() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/exerciseLibrary`, {
      dataType: "json",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let exerciseList = await response.json();

    return dispatch({
      type: EDIT_PROGRESS_EXERCISE_LIST,
      exerciseList,
    });
  };
}

// Fetches entire history of a specific exercise
export function requestExerciseProgress(targetExercise, user) {
  return async (dispatch, getState) => {
    const state = getState();
    const existing = state.progress.exerciseList.find((ex) => ex._id === targetExercise._id);

    // Check if this specific user's history is already loaded
    if (existing?.history?.[user._id]) {
      return; // Already cached
    }

    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/exerciseHistory`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        targetExercise,
        user,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    let targetExerciseHistory = await response.json();

    return dispatch({
      type: EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
      exerciseId: targetExercise._id,
      userId: user._id,
      targetExerciseHistory,
    });
  };
}

export function requestExerciseProgressSummary(user) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/exerciseProgressSummary`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ user }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    const exerciseSummaries = await response.json();

    return dispatch({
      type: EDIT_PROGRESS_EXERCISE_SUMMARIES,
      userId: user._id,
      exerciseSummaries: Array.isArray(exerciseSummaries) ? exerciseSummaries : [],
    });
  };
}

export function requestExerciseLibrary() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/exerciseLibrary`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let exerciseLibrary = await response.json();

    return dispatch({
      type: EDIT_EXERCISE_LIBRARY,
      exerciseLibrary,
    });
  };
}

export function updateExercise(exercise) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const state = getState();

    const response = await fetch(`${serverURL}/updateExercise`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ exercise }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let status = await response.json();

    if (status.error) {
      return dispatch({
        type: ERROR,
        error: status.error,
      });
    } else {
      const newExerciseLibrary = state.progress.exerciseList.map((e) => {
        if (e._id === exercise._id) {
          e = exercise;
        }
        return e;
      });
      return dispatch({
        type: EDIT_PROGRESS_EXERCISE_LIST,
        exerciseList: newExerciseLibrary,
      });
    }
  };
}

export function createExercise(exercise) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const state = getState();

    const response = await fetch(`${serverURL}/createExercise`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ ...exercise }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

    if (data.error) {
      dispatch({
        type: ERROR,
        error: data.error,
      });
      return { error: data.error };
    }

    const createdExercise = data.exercise || data;
    dispatch({
      type: EDIT_PROGRESS_EXERCISE_LIST,
      exerciseList: [...state.progress.exerciseList, createdExercise],
    });
    return { exercise: createdExercise };
  };
}

export function mergeExercises({ sourceExerciseId, targetExerciseId, deleteSource = true }) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${getAccessToken()}`;
    const state = getState();

    const response = await fetch(`${serverURL}/mergeExercises`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ sourceExerciseId, targetExerciseId, deleteSource }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

    if (data.error) {
      dispatch({
        type: ERROR,
        error: data.error,
      });
      return { error: data.error };
    }

    const mergedExercise = data.mergedExercise;
    const removedExerciseId = data.removedExerciseId;
    const updatedList = state.progress.exerciseList
      .filter((exercise) => exercise._id !== removedExerciseId)
      .map((exercise) =>
        exercise._id === mergedExercise?._id ? mergedExercise : exercise
      );

    dispatch({
      type: EDIT_PROGRESS_EXERCISE_LIST,
      exerciseList: updatedList,
    });
    return { mergedExercise, removedExerciseId };
  };
}
