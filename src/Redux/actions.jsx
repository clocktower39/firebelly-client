import { jwtDecode as jwt } from "jwt-decode";
import axios from "axios";

export const LOGIN_USER = "LOGIN_USER";
export const LOGOUT_USER = "LOGOUT_USER";
export const SIGNUP_USER = "SIGNUP_USER";
export const ERROR = "ERROR";
export const EDIT_MYACCOUNT = "EDIT_MYACCOUNT";
export const EDIT_HOME_WORKOUTS = "EDIT_HOME_WORKOUTS";
export const EDIT_WORKOUTS = "EDIT_WORKOUTS";
export const ADD_WORKOUT = "ADD_WORKOUT";
export const EDIT_TRAINING = "EDIT_TRAINING";
export const EDIT_EXERCISE_LIBRARY = "EDIT_EXERCISE_LIBRARY";
export const EDIT_PROGRESS_EXERCISE_LIST = "EDIT_PROGRESS_EXERCISE_LIST";
export const EDIT_PROGRESS_TARGET_EXERCISE_HISTORY = "EDIT_PROGRESS_TARGET_EXERCISE_HISTORY";
export const UPDATE_MY_TRAINERS = "UPDATE_MY_TRAINERS";
export const GET_TRAINERS = "GET_TRAINERS";
export const GET_CLIENTS = "GET_CLIENTS";
export const GET_GOALS = "GET_GOALS";
export const UPDATE_GOAL = "UPDATE_GOAL";
export const ADD_NEW_GOAL = "ADD_NEW_GOAL";
export const DELETE_GOAL = "DELETE_GOAL";
export const UPDATE_CONVERSATIONS = "UPDATE_CONVERSATIONS";
export const UPDATE_CONVERSATION_MESSAGES = "UPDATE_CONVERSATION_MESSAGES";
export const EDIT_SCHEDULE_EVENTS = "EDIT_SCHEDULE_EVENTS";
export const EDIT_SESSION_SUMMARY = "EDIT_SESSION_SUMMARY";
export const EDIT_WORKOUT_QUEUE = "EDIT_WORKOUT_QUEUE";

// dev server
const currentIP = window.location.href.split(":")[1];
export const serverURL = `http:${currentIP}:6969`;

// live server
// export const serverURL = "https://firebellyfitness.herokuapp.com";

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
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    }

    return dispatch(loginUser({ email: user.email, password: user.password }));
  };
}

// Retrieves new JWT Token from username and password post request
export function loginUser(user) {
  return async (dispatch) => {
    const response = await fetch(`${serverURL}/login`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
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
    const refreshToken = data.refreshToken;
    const decodedAccessToken = jwt(accessToken);

    localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
    localStorage.setItem("JWT_REFRESH_TOKEN", refreshToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  };
}

export const loginJWT = () => {
  return async (dispatch) => {
    const refreshToken = localStorage.getItem("JWT_REFRESH_TOKEN");

    const response = await fetch(`${serverURL}/refresh-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
      },
      body: JSON.stringify({ refreshToken }), // Send the refresh token in the request body
    });

    const data = await response.json();
    if (data.accessToken) {
      const decodedAccessToken = jwt(data.accessToken);
      localStorage.setItem("JWT_AUTH_TOKEN", data.accessToken);
      return dispatch({
        type: LOGIN_USER,
        user: decodedAccessToken,
      });
    } else {
      return dispatch({
        type: LOGOUT_USER,
      });
    }
  };
};

export function logoutUser() {
  return async (dispatch) => {
    localStorage.removeItem("JWT_AUTH_TOKEN");
    localStorage.removeItem("JWT_REFRESH_TOKEN");
    return dispatch({
      type: LOGOUT_USER,
    });
  };
}

const buildScheduleScopeKey = (trainerId, clientId) =>
  `${trainerId || "me"}:${clientId || "all"}`;

export function requestScheduleRange({
  startDate,
  endDate,
  trainerId,
  clientId,
  includeAvailability = true,
}) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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

export function createScheduleEvent(payload) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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

export function updateScheduleEvent(eventId, updates) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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

export function deleteScheduleEvent(eventId) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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

export function changePassword(currentPassword, newPassword) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

    localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
    return dispatch({
      type: LOGIN_USER,
      agent: decodedAccessToken,
    });
  };
}

export function editUser(user) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
      localStorage.setItem("JWT_AUTH_TOKEN", data.accessToken);
      const decodedAccessToken = jwt(data.accessToken);
      return dispatch({
        type: LOGIN_USER,
        user: decodedAccessToken,
      });
    }
  };
}

// Fetches daily training information
export function requestTraining(trainingId) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

    if (!data || data.length < 1) {
      return dispatch({
        type: EDIT_TRAINING,
        training: { training: [] },
      });
    } else {
      data.training.map((set) => {
        set.map((exercise) => {
          if (!exercise.achieved.weight) {
            exercise.achieved.weight = [0];
          }
          return exercise;
        });
        return set;
      });
      return dispatch({
        type: EDIT_TRAINING,
        training: { ...data },
      });
    }
  };
}

// Fetches workouts by date
export function requestWorkoutsByDate(date, client = null,) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
      accountId: client,
    });
  };
}

// Fetches entire month of workout data
export function requestWorkoutsByMonth(date, client) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    await fetch(`${serverURL}/createTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        userId: user?._id,
        date: training.date,
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/createTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        userId: accountId,
        date: training.date,
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
      return dispatch({
        type: ERROR,
        error: data.error,
      });
    } else {
      return dispatch({
        type: EDIT_TRAINING,
        training: updatedTraining,
      });
    }
  };
}

// Updates training date
export function updateWorkoutDateById(training, newDate, newTitle) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
      const accountId = training.user._id;
      return dispatch({
        type: EDIT_TRAINING,
        training: { ...training, date: newDate },
        workouts: {
          ...state.workouts,
          [accountId]: {
            ...state.workouts[accountId],
            workouts: state.workouts[accountId].workouts.filter(
              (workout) => workout._id !== training._id
            ),
          },
        },
      });
    }
  };
}

// Updates training date
export function copyWorkoutById(trainingId, newDate, copyOption = "exact", newTitle, newAccount) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

// Delete a training record
export function deleteWorkoutById(trainingId, accountId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const state = getState();

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
      return dispatch({
        type: EDIT_TRAINING,
        training: { training: [] },
        workouts: {
          ...state.workouts,
          [accountId]: {
            ...state.workouts[accountId],
            workouts: state.workouts[accountId].workouts.filter(
              (workout) => workout._id !== trainingId
            ),
          },
        },
      });
    }
  };
}

// Fetches training stats from a range
export function requestTrainingWeek(date, workoutUser) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    });
  };
}

// Fetches entire exercise list for the user
export function requestMyExerciseList(user) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

export function requestExerciseLibrary() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
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

export function updateThemeMode(mode) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const response = await fetch(`${serverURL}/updateUser`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ themeMode: mode }),
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

    localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  };
}

export function requestMyTrainers() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/relationships/myClients`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let clients = await response.json();

    return dispatch({
      type: GET_CLIENTS,
      clients,
    });
  };
}

export function changeRelationshipStatus(client, accepted) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

export function getTrainers() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

export function getGoals({ requestedBy = "client", client }) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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

export function getConversations() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

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
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    axios
      .post(`${serverURL}/user/upload/profilePicture`, formData, {
        headers: { Authorization: bearer },
      })
      .then(async (res) => {
        const accessToken = res.data.accessToken;
        const decodedAccessToken = jwt(accessToken);

        localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
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
