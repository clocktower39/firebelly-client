import jwt from "jwt-decode";

export const LOGIN_USER = "LOGIN_USER";
export const LOGOUT_USER = "LOGOUT_USER";
export const SIGNUP_USER = "SIGNUP_USER";
export const ERROR = "ERROR";
export const EDIT_TASKS = "EDIT_TASKS";
export const EDIT_TASK_HISTORY = "EDIT_TASK_HISTORY";
export const ADD_TASK_HISTORY_DAY = "ADD_TASK_HISTORY_DAY";
export const EDIT_NUTRITION = "EDIT_NUTRITION";
export const EDIT_DEFAULT_TASK = "EDIT_DEFAULT_TASK";
export const EDIT_MYACCOUNT = "EDIT_MYACCOUNT";
export const EDIT_NOTES = "EDIT_NOTES";
export const ADD_NOTE = "ADD_NOTE";
export const EDIT_TRAINING = "EDIT_TRAINING";
export const EDIT_WEEKLY_VIEW = "EDIT_WEEKLY_VIEW";
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

export function changePassword(currentPassword, newPassword) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

    const response = await fetch(`${serverURL}/changePassword`, {
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
    const data = await response.json();
    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error
      });
    }
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    localStorage.setItem('JWT_AUTH_TOKEN', accessToken);
    return dispatch({
      type: LOGIN_USER,
      agent: decodedAccessToken,
    });
  }
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

export function checkToggleTask(selectedDate, taskHistoryDateObject, newHistory) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/updateTaskHistory`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        history: newHistory,
      }),
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
      type: EDIT_TASK_HISTORY,
      history: newHistory,
    });
  };
}

export function addDateToTaskHistory(taskDateObject) {
  return async (dispatch, getState) => {
    const state = getState();
    const newHistory = [...state.tasks.history];
    newHistory.push(taskDateObject);
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/updateTaskHistory`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        history: newHistory
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    return dispatch({
      type: EDIT_TASK_HISTORY,
      history: newHistory,
      data,
    });
  };
}

export function addTaskDay(date, defaultTasksArray) {
  return async (dispatch) => {
    const newDay = {
      date,
      tasks: defaultTasksArray,
    };

    return dispatch({
      type: ADD_TASK_HISTORY_DAY,
      newDay,
    });
  };
}

// // Fetches or creates daily tasks
export function requestTasks() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    // Check if the daily tasks for the selected date has already been created
    const response = await fetch(`${serverURL}/tasks`, {
      method: "get",
      dataType: "json",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    let data = await response.json();
    return dispatch({
      type: EDIT_TASKS,
      tasks: data[0],
    });
  };
}

// Pushes updates to default daily tasks
export function editDefaultDailyTask(defaultTasks) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/updateDefaultTasks`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ defaultTasks }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
    const data = await response.json();
    if (data.status === "Successful") {
      return dispatch({
        type: EDIT_DEFAULT_TASK,
        defaultTasks,
      });
    }
  };
}

// Fetches or creates daily nutrition stats
export function requestNutrition(date) {
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
            type: EDIT_NUTRITION,
            nutrition: data.nutrition,
          });
        });
    } else {
      return dispatch({
        type: EDIT_NUTRITION,
        nutrition: data[0],
      });
    }
  };
}

// Pushes updates to nutrition stats
export function updateNutrition(updatedNutrition) {
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
        type: EDIT_NUTRITION,
        nutrition: data.nutrition,
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
  };
}

// Fetches daily training information
export function requestTraining(date, requestedBy = 'client', clientId) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    let url = `${serverURL}/training`;
    if(requestedBy === 'trainer'){
      url = `${serverURL}/getClientTraining`;
    }

    const response = await fetch(url, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
        clientId
      }),
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
        type: EDIT_TRAINING,
        training: { ...data[0] },
      });
    }
  };
}

// Creates new daily training workouts
export function createTraining(date) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    await fetch(`${serverURL}/createTraining`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date,
        category: [],
        training: [
          [
            {
              exercise: "",
              exerciseType: "Reps",
              goals: {
                sets: 0,
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
          type: EDIT_TRAINING,
          training: data.training,
        });
      });
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
export function updateWorkoutDate(selectedDate, newDate) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const data = await fetch(`${serverURL}/updateWorkoutDate`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        originalDate: selectedDate,
        newDate,
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
      });
    }
  };
}

// Delete a training record
export function deleteWorkoutDate(selectedDate) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const data = await fetch(`${serverURL}/deleteWorkoutDate`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        date: selectedDate,
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
export function requestMyExerciseList() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/myExerciseList`, {
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
        targetExercise,
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

export function updateThemeMode(mode) {
  return async (dispatch) => {
    const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;
    const response = await fetch(`${serverURL}/updateUser`, {
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ themeMode: mode }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
    const data = await response.json();
    if (data.error) {
      return dispatch({
        type: ERROR,
        error: data.error
      });
    }
    const accessToken = data.accessToken;
    const decodedAccessToken = jwt(accessToken);

    localStorage.setItem('JWT_AUTH_TOKEN', accessToken);
    return dispatch({
      type: LOGIN_USER,
      user: decodedAccessToken,
    });
  }
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

export function requestTrainer(trainerId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/manageRelationship`, {
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ trainerId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    });
    let data = await response.json();
    if(data.status === 'success'){
      dispatch(requestMyTrainers());
    }
  };
}

export function removeTrainer(trainerId) {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/removeRelationship`, {
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ trainerId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    });
    if(response.status === 200){
      dispatch(requestMyTrainers());
    }
  };
}

export function getGoals() {
  return async (dispatch, getState) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const response = await fetch(`${serverURL}/goals`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    });
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
      method: 'post',
      dataType: 'json',
      body: JSON.stringify(updatedGoal),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
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
      method: 'post',
      dataType: 'json',
      body: JSON.stringify(newGoal),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
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
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ goalId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
    let results = await response.json();

    if(results.status === 'Record deleted'){
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
      method: 'post',
      dataType: 'json',
      body: JSON.stringify({ _id: goalId, comment: newComment}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": bearer,
      }
    })
    let goal = await response.json();

    return dispatch({
      type: UPDATE_GOAL,
      goal
    });
  };
}

