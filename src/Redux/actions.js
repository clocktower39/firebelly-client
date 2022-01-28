import jwt from "jwt-decode";

export const LOGIN_USER = "LOGIN_USER";
export const LOGOUT_USER = "LOGOUT_USER";
export const SIGNUP_USER = "SIGNUP_USER";
export const ERROR = "ERROR";
export const EDIT_DAILY_TASK = "EDIT_DAILY_TASK";
export const EDIT_DAILY_NUTRITION = "EDIT_DAILY_NUTRITION";
export const EDIT_DEFAULT_TASK = "EDIT_DEFAULT_TASK";
export const EDIT_MYACCOUNT = "EDIT_MYACCOUNT";
export const EDIT_NOTES = "EDIT_NOTES";
export const ADD_NOTE = "ADD_NOTE";
export const EDIT_DAILY_TRAINING = "EDIT_DAILY_TRAINING";
export const EDIT_WEEKLY_VIEW = "EDIT_WEEKLY_VIEW";
export const EDIT_PROGRESS_EXERCISE_LIST = "EDIT_PROGRESS_EXERCISE_LIST";
export const EDIT_PROGRESS_TARGET_EXERCISE_HISTORY = "EDIT_PROGRESS_TARGET_EXERCISE_HISTORY";

// dev server
const currentIP = window.location.href.split(":")[1];
const serverURL = `http:${currentIP}:6969`;

// live server
// const serverURL = "https://firebellyfitness.herokuapp.com";

export function signupUser(user) {
  return async (dispatch) => {
    const response = await fetch(`${serverURL}/signup`, {
      method: "post",
      dataType: "json",
      body: user,
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

    return dispatch(loginUser(user));
  };
}

// Retrieves new JWT Token from username and password post request
export function loginUser(user) {
  return async (dispatch) => {
    const response = await fetch(`${serverURL}/login`, {
      method: "post",
      dataType: "json",
      body: user,
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
    const decodedAccessToken = jwt(accessToken);

    localStorage.setItem("JWT_AUTH_TOKEN", accessToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  };
}

// Logs into account with JWT token
export const loginJWT = (token) => {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/checkAuthToken`, {
      headers: {
        Authorization: bearer,
      },
    });

    const text = await response.text().then((item) => item);
    if (text === "Authorized") {
      const decodedAccessToken = jwt(token);
      return dispatch({
        type: LOGIN_USER,
        user: decodedAccessToken,
      });
    } else {
      // removes JWT token if invalid or expired
      localStorage.removeItem("JWT_AUTH_TOKEN");
      return dispatch({
        type: LOGOUT_USER,
      });
    }
  };
};

export function logoutUser() {
  return async (dispatch) => {
    localStorage.removeItem("JWT_AUTH_TOKEN");
    return dispatch({
      type: LOGOUT_USER,
    });
  };
}

export function editUser(user) {
  return async (dispatch) => {
    return dispatch({
      type: EDIT_MYACCOUNT,
      user,
    });
  };
}

export function checkToggleDailyTask(id, newDailyTask) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    fetch(`${serverURL}/updateTask`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: id,
        newDailyTask,
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
      });

    return dispatch({
      type: EDIT_DAILY_TASK,
      dailyTasks: newDailyTask,
    });
  };
}

// // Fetches or creates daily tasks
export function requestDailyTasks(date) {
  return async (dispatch, getState) => {
    const state = getState();
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    // Check if the daily tasks for the selected date has already been created
    const response = await fetch(`${serverURL}/tasks`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    if (data.length < 1) {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

      fetch(`${serverURL}/createTask`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          date,
          tasks: state.user.defaultTasks.map((task) => {
            return {
              title: task.title,
              goal: 1,
              achieved: 0,
            };
          }),
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
            type: EDIT_DAILY_TASK,
            dailyTasks: data.task,
          });
        });
    } else {
      return dispatch({
        type: EDIT_DAILY_TASK,
        dailyTasks: data[0],
      });
    }
  };
}

// Pushes updates to default daily tasks
export function editDefaultDailyTask(defaultTasks) {
  return async (dispatch, getState) => {
    const state = getState();
    // send update to DB
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/updateDefaultTasks`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ _id: state.user._id, defaultTasks }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();

    localStorage.setItem("JWT_AUTH_TOKEN", data.accessToken);

    return dispatch({
      type: EDIT_MYACCOUNT,
      user: data.user,
    });
  };
}

// Removes the task provided from the default taks
export function removeDefaultDailyTask(removeTask) {
  return async (dispatch, getState) => {
    const state = getState();
    const currentDefaultTasks = [...state.user.defaultTasks];
    const defaultTasks = currentDefaultTasks.filter((item) => item !== removeTask);

    return dispatch({
      type: EDIT_DEFAULT_TASK,
      defaultTasks,
    });
  };
}

// Fetches or creates daily nutrition stats
export function requestDailyNutrition(date) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/nutrition`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    // return default tasks if array is empty
    if (data.length < 1) {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

      fetch(`${serverURL}/createNutrition`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          date,
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
            type: EDIT_DAILY_NUTRITION,
            dailyNutrition: data.nutrition,
          });
        });
    } else {
      return dispatch({
        type: EDIT_DAILY_NUTRITION,
        dailyNutrition: data[0],
      });
    }
  };
}

// Pushes updates to nutrition stats
export function updateDailyNutrition(updatedNutrition) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const data = await fetch(`${serverURL}/updateNutrition`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        _id: updatedNutrition._id,
        nutrition: updatedNutrition,
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
        type: EDIT_DAILY_NUTRITION,
        dailyNutrition: data.nutrition,
      });
    }
  };
}

// Fetches or creates daily note
export function requestNotes() {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/notes`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    return dispatch({
      type: EDIT_NOTES,
      notes: data,
    });
  };
}

// Add a new note
export function createNote(newNote) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    await fetch(`${serverURL}/createNote`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        note: newNote,
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
          type: ADD_NOTE,
          note: data.note,
        });
      });
  }
}

// Fetches or creates daily training information
export function requestDailyTraining(date) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/training`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    if (!data || data.length < 1) {
      fetch(`${serverURL}/createTraining`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          date,
          category: "",
          training: [
            [
              {
                exercise: "",
                exerciseType: "Reps",
                goals: {
                  sets: 1,
                  minReps: [0],
                  maxReps: [0],
                  exactReps: [0],
                  weight: [0],
                  percent: [0],
                  seconds: [0],
                },
                achieved: {
                  sets: 0,
                  reps: [0],
                  weight: [0],
                  percent: [0],
                  seconds: [0],
                },
              },
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
            type: EDIT_DAILY_TRAINING,
            dailyTraining: data.training,
          });
        });
    } else {
      data[0].training.map((set) => {
        set.map((exercise) => {
          if (!exercise.achieved.weight) {
            exercise.achieved.weight = [0];
          }
          return exercise;
        });
        return set;
      });
      return dispatch({
        type: EDIT_DAILY_TRAINING,
        dailyTraining: { ...data[0] },
      });
    }
  };
}

// Pushes updates to daily training information
export function updateDailyTraining(trainingId, updatedTraining) {
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
        type: EDIT_DAILY_TRAINING,
        dailyTraining: updatedTraining,
      });
    }
  };
}

// Fetches nutrition stats from a range
export function requestNutritionWeek(startDate, endDate) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const state = getState();

    const response = await fetch(`${serverURL}/nutritionWeek`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        startDate,
        endDate,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    const newWeeklyView = state.calander.weeklyView.map((day, index) => {
      data.forEach((dataDay, dataIndex) => {
        if (new Date(dataDay.date).getDay() === index) {
          day.nutrition = dataDay;
        }
      });
      return day;
    });

    return dispatch({
      type: EDIT_WEEKLY_VIEW,
      weeklyView: newWeeklyView,
    });
  };
}

// Fetches training stats from a range
export function requestTrainingWeek(startDate, endDate) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const state = getState();

    const response = await fetch(`${serverURL}/trainingWeek`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        startDate,
        endDate,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();

    const newWeeklyView = state.calander.weeklyView.map((day, index) => {
      data.forEach((dataDay, dataIndex) => {
        if (new Date(dataDay.date).getDay() === index) {
          day.training = dataDay;
        }
      });
      return day;
    });

    return dispatch({
      type: EDIT_WEEKLY_VIEW,
      weeklyView: newWeeklyView,
    });
  };
}

// Fetches entire exercise list for the user
export function requestExerciseList() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/exerciseList`, {
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
export function requestExerciseProgess(targetExercise) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/exerciseHistory`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        targetExercise
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let targetExerciseHistory = await response.json();

    return dispatch({
      type: EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
      targetExerciseHistory,
    });
  };
}
