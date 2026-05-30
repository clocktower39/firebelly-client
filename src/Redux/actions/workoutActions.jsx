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
import { removeWorkouts, upsertWorkout } from "./scheduleActions";
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
    const bearer = `Bearer ${getAccessToken()}`;

    let url = `${serverURL}/training`;
    let requestbody = { _id: trainingId, client: null };

    const response = await fetch(url, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(requestbody),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    let url = `${serverURL}/workouts`;
    let requestbody = { date, client };

    const response = await fetch(url, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(requestbody),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

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
      const bearer = `Bearer ${getAccessToken()}`;

      const response = await fetch(`${serverURL}/workoutsRange`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          rangeStart,
          rangeEnd,
          client,
          filters,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        data = { error: text || `HTTP ${response.status}` };
      }

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
    const bearer = `Bearer ${getAccessToken()}`;

    const endpoint = "workoutMonth";
    const payload = JSON.stringify({
      date,
      client,
    });

    const response = await fetch(`${serverURL}/${endpoint}`, {
      method: "post",
      body: payload,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    const endpoint = "workoutYear";
    const payload = JSON.stringify({
      year,
      client,
    });

    const response = await fetch(`${serverURL}/${endpoint}`, {
      method: "post",
      body: payload,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

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
    const bearer = `Bearer ${getAccessToken()}`;

    await fetch(`${serverURL}/createTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        userId: user?._id,
        date: training.date,
        workoutType: training?.workoutType || "Strength",
        cardio: training?.cardio || {},
        category: training?.category || [],
        training: training?.training || [
          [
            // {
            //   exercise: "",
            //   exerciseType: "Reps",
            //   goals: {
            //     sets: 4,
            //     minReps: [0, 0, 0, 0],
            //     maxReps: [0, 0, 0, 0],
            //     exactReps: [10, 10, 10, 10],
            //     weight: [0, 0, 0, 0],
            //     percent: [0, 0, 0, 0],
            //     seconds: [0, 0, 0, 0],
            //   },
            //   achieved: {
            //     sets: 0,
            //     reps: [0, 0, 0, 0],
            //     weight: [0, 0, 0, 0],
            //     percent: [0, 0, 0, 0],
            //     seconds: [0, 0, 0, 0],
            //   },
            // },
          ],
        ],
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
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
      });
  };
}

export function createTrainingForAccount({ training, accountId }) {
  return async (dispatch) => {
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/createTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        userId: accountId,
        date: training.date,
        workoutType: training?.workoutType || "Strength",
        cardio: training?.cardio || {},
        category: training?.category || [],
        training: training?.training || [[]],
      }),
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
    const bearer = `Bearer ${getAccessToken()}`;

    const data = await fetch(`${serverURL}/updateTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: trainingId,
        training: updatedTraining,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    }).then((res) => res.json());

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
    const bearer = `Bearer ${getAccessToken()}`;
    const state = getState();

    const data = await fetch(`${serverURL}/updateWorkoutDateById`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: training._id,
        newDate,
        newTitle,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    }).then((res) => res.json());

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
    const bearer = `Bearer ${getAccessToken()}`;

    const data = await fetch(`${serverURL}/copyWorkoutById`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: trainingId,
        newDate,
        newTitle,
        option: copyOption,
        newAccount,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    }).then((res) => res.json());

    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    } else {
      const accountId = data.user
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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/trainingRangeEnd`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        startDate,
        userId,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    try {
      return await response.json();
    } catch (err) {
      const text = await response.text();
      return { error: text || `HTTP ${response.status}` };
    }
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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/bulkMoveCopyWorkouts`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
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
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      data = { error: text || `HTTP ${response.status}` };
    }

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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/undoBulkMoveCopy`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ operation }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      data = { error: text || `HTTP ${response.status}` };
    }

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
    const bearer = `Bearer ${getAccessToken()}`;

    const data = await fetch(`${serverURL}/deleteWorkoutById`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: trainingId,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    }).then((res) => res.json());

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
    const bearer = `Bearer ${getAccessToken()}`;

    const response = await fetch(`${serverURL}/trainingWeek`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
        client: workoutUser,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

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
