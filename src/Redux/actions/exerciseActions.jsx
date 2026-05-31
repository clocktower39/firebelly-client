import { exerciseApi } from "../../api/exerciseApi";
import {
  EDIT_EXERCISE_LIBRARY,
  EDIT_PROGRESS_EXERCISE_LIST,
  EDIT_PROGRESS_EXERCISE_SUMMARIES,
  EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
  ERROR,
} from "../actionTypes";

export function requestMyExerciseList(user) {
  return async (dispatch, getState) => {
    let exerciseList = await exerciseApi.getMyExerciseList(user);

    return dispatch({
      type: EDIT_PROGRESS_EXERCISE_LIST,
      exerciseList,
    });
  };
}

export function getExerciseList() {
  return async (dispatch, getState) => {
    let exerciseList = await exerciseApi.getExerciseList();

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

    let targetExerciseHistory = await exerciseApi.getExerciseHistory({ targetExercise, user });

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
    const exerciseSummaries = await exerciseApi.getExerciseProgressSummary(user);

    return dispatch({
      type: EDIT_PROGRESS_EXERCISE_SUMMARIES,
      userId: user._id,
      exerciseSummaries: Array.isArray(exerciseSummaries) ? exerciseSummaries : [],
    });
  };
}

export function requestExerciseLibrary() {
  return async (dispatch, getState) => {
    let exerciseLibrary = await exerciseApi.getExerciseList();

    return dispatch({
      type: EDIT_EXERCISE_LIBRARY,
      exerciseLibrary,
    });
  };
}

export function updateExercise(exercise) {
  return async (dispatch, getState) => {
    const state = getState();

    let status = await exerciseApi.updateExercise(exercise);

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
    const state = getState();

    const data = await exerciseApi.createExercise({ ...exercise });

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
    const state = getState();

    const data = await exerciseApi.mergeExercises({
      sourceExerciseId,
      targetExerciseId,
      deleteSource,
    });

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
