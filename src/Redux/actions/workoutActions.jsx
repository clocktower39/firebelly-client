import { workoutApi } from "../../api/workoutApi";
import { removeWorkouts, upsertWorkout } from "./scheduleActions";
import {
  ADD_WORKOUT,
  CLEAR_LAST_BULK_OPERATION,
  EDIT_TRAINING,
  EDIT_WORKOUTS,
  ERROR,
  REMOVE_WORKOUTS,
  SET_LAST_BULK_OPERATION,
} from "../actionTypes";
import {
  addUtcDays,
  getContiguousDateRanges,
  getDateKey,
  getDateKeysInRange,
  normalizeWorkoutWeights,
} from "../actionUtils";

const inFlightWorkoutRangeRequests = new Map();

const getWorkoutRangeRequestKey = (accountId, rangeStart, rangeEnd, filters = {}) =>
  [
    accountId || "self",
    getDateKey(rangeStart),
    getDateKey(rangeEnd),
    JSON.stringify(filters || {}),
  ].join(":");

export function requestTraining(trainingId) {
  return async (dispatch) => {
    let data = await workoutApi.getTraining({ _id: trainingId, client: null });

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    if (!data || data.length < 1) {
      return dispatch({
        type: EDIT_TRAINING,
        training: { training: [] },
      });
    } else if (Array.isArray(data.training)) {
      data.training.map((set) => {
        set.map((exercise) => {
          if (!exercise.achieved.weight) {
            exercise.achieved.weight = [0];
          }
          return exercise;
        });
        return set;
      });
      dispatch(upsertWorkout(data));
      return data;
    }
  };
}

// Fetches workouts by date
export function requestWorkoutsByDate(date, client = null,) {
  return async (dispatch) => {
    let data = await workoutApi.getWorkoutsByDate({ date, client });

    normalizeWorkoutWeights(data.workouts);
    dispatch({
      type: EDIT_WORKOUTS,
      workouts: [...data.workouts],
      user: data.user,
      accountId: client,
      loadedDates: [getDateKey(date)],
    });
    return data;
  };
}

export function requestWorkoutsByRange(rangeStart, rangeEnd, client = null, filters = {}) {
  return async (dispatch, getState) => {
    const accountId = client || getState().user?._id || "self";
    const requestKey = getWorkoutRangeRequestKey(accountId, rangeStart, rangeEnd, filters);

    if (inFlightWorkoutRangeRequests.has(requestKey)) {
      return inFlightWorkoutRangeRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      const data = await workoutApi.getWorkoutsByRange({ rangeStart, rangeEnd, client, filters });

      if (data.error) {
        return dispatch({
          type: ERROR,
          error: data.error,
        });
      }

      normalizeWorkoutWeights(data.workouts);

      return dispatch({
        type: EDIT_WORKOUTS,
        workouts: [...data.workouts],
        user: data.user,
        accountId: client,
        loadedDates:
          !filters || Object.keys(filters).length === 0
            ? getDateKeysInRange(rangeStart, rangeEnd)
            : [],
      });
    })();

    inFlightWorkoutRangeRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlightWorkoutRangeRequests.delete(requestKey);
    }
  };
}

export function requestWorkoutsByDatesIfNeeded(dateKeys, client = null) {
  return async (dispatch, getState) => {
    const state = getState();
    const accountId = client || state.user?._id;
    if (!accountId) return { skipped: true };

    const loadedDates = new Set(state.workouts?.[accountId]?.loadedDates || []);
    const missingDateKeys = [...new Set((dateKeys || []).map(getDateKey).filter(Boolean))]
      .filter((dateKey) => !loadedDates.has(dateKey));

    if (!missingDateKeys.length) {
      return { skipped: true };
    }

    const ranges = getContiguousDateRanges(missingDateKeys);
    const results = [];

    for (const range of ranges) {
      const result = await dispatch(requestWorkoutsByRange(range.rangeStart, range.rangeEnd, client));
      results.push(result);
    }

    return { skipped: false, ranges, results };
  };
}

// Fetches entire month of workout data
export function requestWorkoutsByMonth(date, client) {
  return async (dispatch) => {
    const data = await workoutApi.getWorkoutsByMonth({ date, client });

    data.workouts.map((workout) =>
      workout.training.map((set) => {
        set.map((exercise) => {
          if (!exercise.achieved.weight) {
            exercise.achieved.weight = [0];
          }
          return exercise;
        });
        return set;
      })
    );

    return dispatch({
      type: EDIT_WORKOUTS,
      workouts: [...data.workouts],
      user: data.user,
      accountId: data.user._id,
    });
  };
}

export function requestWorkoutsByYear(year, client) {
  return async (dispatch) => {
    const data = await workoutApi.getWorkoutsByYear({ year, client });

    data.workouts.map((workout) =>
      workout.training.map((set) => {
        set.map((exercise) => {
          if (!exercise.achieved.weight) {
            exercise.achieved.weight = [0];
          }
          return exercise;
        });
        return set;
      })
    );

    return dispatch({
      type: EDIT_WORKOUTS,
      workouts: [...data.workouts],
      user: data.user,
      accountId: data.user._id,
    });
  };
}

// Creates new daily training workouts
export function createTraining({ training, user }) {
  return async (dispatch) => {
    const data = await workoutApi.createTraining({
      userId: user?._id,
      date: training.date,
      workoutType: training?.workoutType || "Strength",
      cardio: training?.cardio || {},
      category: training?.category || [],
      training: training?.training || [[]],
    });

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }
    return dispatch({
      type: ADD_WORKOUT,
      accountId: user._id,
      workout: data.training,
    });
  };
}

export function createTrainingForAccount({ training, accountId }) {
  return async (dispatch) => {
    const data = await workoutApi.createTraining({
      userId: accountId,
      date: training.date,
      workoutType: training?.workoutType || "Strength",
      cardio: training?.cardio || {},
      category: training?.category || [],
      training: training?.training || [[]],
    });

    if (data.error) {
      dispatch({
        type: ERROR,
        error: data.error,
      });
      return data;
    }

    if (accountId && data.training) {
      dispatch({
        type: ADD_WORKOUT,
        accountId,
        workout: data.training,
      });
    }

    return data.training;
  };
}

// Pushes updates to daily training information
export function updateTraining(trainingId, updatedTraining) {
  return async (dispatch) => {
    const data = await workoutApi.updateTraining({ _id: trainingId, training: updatedTraining });

    if (data.error) {
      dispatch({
        type: ERROR,
        error: data.error,
      });
      return null;
    } else {
      const savedTraining = data.training || updatedTraining;
      dispatch(upsertWorkout(savedTraining));
      return savedTraining;
    }
  };
}

// Updates training date
export function updateWorkoutDateById(training, newDate, newTitle) {
  return async (dispatch, getState) => {
    const state = getState();

    const data = await workoutApi.updateWorkoutDateById({
      _id: training._id,
      newDate,
      newTitle,
    });

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    } else {
      const accountId = training?.user?._id || training?.user;
      const updatedTraining = data?.training || data;
      const existingWorkouts = state.workouts?.[accountId]?.workouts || [];
      const nextWorkouts = existingWorkouts.some((workout) => workout._id === updatedTraining._id)
        ? existingWorkouts.map((workout) =>
            workout._id === updatedTraining._id ? updatedTraining : workout
          )
        : [...existingWorkouts, updatedTraining];

      return dispatch({
        type: EDIT_TRAINING,
        training: updatedTraining,
        workouts: {
          ...state.workouts,
          [accountId]: {
            ...state.workouts[accountId],
            workouts: nextWorkouts,
          },
        },
      });
    }
  };
}

// Updates training date
export function copyWorkoutById(trainingId, newDate, copyOption = "exact", newTitle, newAccount) {
  return async (dispatch) => {
    const data = await workoutApi.copyWorkoutById({
      _id: trainingId,
      newDate,
      newTitle,
      option: copyOption,
      newAccount,
    });

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    } else {
      const accountId = data.user;
      return dispatch({
        type: ADD_WORKOUT,
        accountId,
        workout: data,
      });
    }
  };
}

export function getTrainingRangeEnd(startDate, userId) {
  return async () => {
    return workoutApi.getTrainingRangeEnd({ startDate, userId });
  };
}

export function bulkMoveCopyWorkouts({
  action,
  rangeStart,
  rangeEnd,
  targetStartDate,
  option = "exact",
  userId,
  newAccount,
  targetQueue = false,
  filters = {},
  titlePrefix = "",
  titleSuffix = "",
}) {
  return async (dispatch) => {
    const data = await workoutApi.bulkMoveCopyWorkouts({
      action,
      rangeStart,
      rangeEnd,
      targetStartDate,
      option,
      userId,
      newAccount,
      targetQueue,
      filters,
      titlePrefix,
      titleSuffix,
    });

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    if (data.operation) {
      dispatch({
        type: SET_LAST_BULK_OPERATION,
        operation: data.operation,
      });
    }

    if (data.deletedIds?.length) {
      dispatch({
        type: REMOVE_WORKOUTS,
        accountId: data.user?._id,
        workoutIds: data.deletedIds,
      });
    }

    dispatch({
      type: EDIT_WORKOUTS,
      workouts: [...data.workouts],
      user: data.user,
      accountId: data.user?._id,
    });
    return data;
  };
}

export function undoBulkMoveCopy(operation) {
  return async (dispatch) => {
    const data = await workoutApi.undoBulkMoveCopy(operation);

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    if (data.workouts) {
      dispatch({
        type: EDIT_WORKOUTS,
        workouts: [...data.workouts],
        user: data.workouts[0]?.user,
        accountId: data.workouts[0]?.user?._id,
      });
    }

    if (data.deletedIds?.length) {
      dispatch({
        type: REMOVE_WORKOUTS,
        accountId: operation.userId,
        workoutIds: data.deletedIds,
      });
    }

    return dispatch({
      type: CLEAR_LAST_BULK_OPERATION,
    });
  };
}

// Delete a training record
export function deleteWorkoutById(trainingId, accountId) {
  return async (dispatch) => {
    const data = await workoutApi.deleteWorkoutById(trainingId);

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    } else {
      const resolvedAccountId = data.accountId || accountId;
      if (resolvedAccountId) {
        dispatch(removeWorkouts(resolvedAccountId, [data.deletedId || trainingId]));
      }
      return data;
    }
  };
}

// Fetches training stats from a range
export function requestTrainingWeek(date, workoutUser) {
  return async (dispatch, getState) => {
    let data = await workoutApi.getTrainingWeek({ date, client: workoutUser });

    return dispatch({
      type: EDIT_WORKOUTS,
      workouts: [...data.workouts],
      user: data.user,
      accountId: workoutUser._id,
      loadedDates: getDateKeysInRange(addUtcDays(getDateKey(date), -7), getDateKey(date)),
    });
  };
}

// Fetches entire exercise list for the user
