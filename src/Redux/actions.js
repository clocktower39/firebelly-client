import jwt from 'jwt-decode';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const SIGNUP_USER = 'SIGNUP_USER';
export const ERROR = 'ERROR';
export const EDIT_DAILY_TASK = 'EDIT_DAILY_TASK';
export const FETCH_DAILY_TASK = 'FETCH_DAILY_TASK';
export const EDIT_DAILY_NUTRITION = 'EDIT_DAILY_NUTRITION';
export const EDIT_DEFAULT_TASK = 'EDIT_DEFAULT_TASK';
export const EDIT_MYACCOUNT = 'EDIT_MYACCOUNT';
export const EDIT_DAILY_NOTE = 'EDIT_DAILY_NOTE';
export const EDIT_DAILY_TRAINING = 'EDIT_DAILY_TRAINING';

// dev server
// const currentIP = window.location.href.split(":")[1];
// const serverURL = `http:${currentIP}:6969`;

// live server
const serverURL = "https://firebellyfitness.herokuapp.com";

export function signupUser(user) {
    return async (dispatch, getState) => {
        const response = await fetch(`${serverURL}/signup`, {
            method: 'post',
            dataType: 'json',
            body: user,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        const data = await response.json();
        if (data.error) {
            return dispatch({
                type: ERROR,
                error: data.error
            });
        }

        return dispatch(loginUser(user));
    }
}

export function loginUser(user) {
    return async (dispatch, getState) => {
        const response = await fetch(`${serverURL}/login`, {
            method: 'post',
            dataType: 'json',
            body: user,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
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

export const loginJWT = (token) => {
    return async (dispatch, getState) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/checkAuthToken`, {
            headers: {
                "Authorization": bearer,
            }
        })

        const text = await response.text().then(item => item);
        if (text === "Authorized") {
            const decodedAccessToken = jwt(token);
            return dispatch({
                type: LOGIN_USER,
                user: decodedAccessToken,
            });
        }
        else {
            localStorage.removeItem('JWT_AUTH_TOKEN');
            return dispatch({
                type: LOGOUT_USER
            })
        }
    }
}

export function logoutUser() {
    return async (dispatch, getState) => {
        localStorage.removeItem('JWT_AUTH_TOKEN');
        return dispatch({
            type: LOGOUT_USER
        })
    }
}

export function editUser(user) {
    return async (dispatch, getState) => {

        return dispatch({
            type: EDIT_MYACCOUNT,
            user,
        })
    }
}

export function checkToggleDailyTask(id) {
    return async (dispatch, getState) => {
        const state = getState();
        const dailyTasks = state.calander.dailyView.dailyTasks.map(task => {
            if (task._id === id) {
                task.achieved === 0 ? task.achieved = 1 : task.achieved = 0;
                const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

                fetch(`${serverURL}/updateTask`, {
                    method: 'post',
                    dataType: 'json',
                    body: JSON.stringify({
                        _id: id,
                        achieved: task.achieved
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Authorization": bearer,
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            return dispatch({
                                type: ERROR,
                                error: data.error
                            })
                        }
                    })
            }
            return task;
        });

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks,
        })
    }
}

export function addDailyTask(newTask) {
    return async (dispatch, getState) => {
        const state = getState();

        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const dbTask = await fetch(`${serverURL}/createTask`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId: newTask.accountId,
                date: newTask.date,
                title: newTask.title,
                goal: 1,
                achieved: 0
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    return dispatch({
                        type: ERROR,
                        error: data.error
                    })
                }
                return data.task;
            })
        const dailyTasks = [...state.calander.dailyView.dailyTasks, dbTask];

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks,
        })
    }
}

export function editDailyTask(newTask) {
    return async (dispatch, getState) => {
        const state = getState();
        const dailyTasks = [...state.calander.dailyView.dailyTasks, newTask];

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks,
        })
    }
}

export function requestDailyTasks(accountId, date) {
    return async (dispatch, getState) => {
        const state = getState();
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/tasks`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        let data = await response.json();

        // return default tasks if array is empty
        if (data.length < 1) {
            let newTaskList = [];

            state.user.defaultTasks.forEach(task => {
                const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

                fetch(`${serverURL}/createTask`, {
                    method: 'post',
                    dataType: 'json',
                    body: JSON.stringify({
                        accountId,
                        date,
                        title: task.title,
                        goal: 1,
                        achieved: 0
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Authorization": bearer,
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            return dispatch({
                                type: ERROR,
                                error: data.error
                            })
                        }
                        newTaskList.push(data.task);
                        return dispatch({
                            type: EDIT_DAILY_TASK,
                            dailyTasks: newTaskList,
                        })
                    })
            })
        }

        return dispatch({
            type: FETCH_DAILY_TASK,
            dailyTasks: data,
        })
    }
}

export function editDefaultDailyTask(defaultTasks) {
    return async (dispatch, getState) => {
        const state = getState();
        // send update to DB
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/updateDefaultTasks`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({ _id: state.user._id, defaultTasks }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        const data = await response.json();

        localStorage.setItem('JWT_AUTH_TOKEN', data.accessToken);

        return dispatch({
            type: EDIT_MYACCOUNT,
            user: data.user,
        })
    }
}

export function removeDefaultDailyTask(removeTask) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentDefaultTasks = [...state.user.defaultTasks];
        const defaultTasks = currentDefaultTasks.filter(item => item !== removeTask);

        return dispatch({
            type: EDIT_DEFAULT_TASK,
            defaultTasks,
        })
    }
}

export function requestDailyNutrition(accountId, date) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/nutrition`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        let data = await response.json();

        // return default tasks if array is empty
        if (data.length < 1) {
            const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

            fetch(`${serverURL}/createNutrition`, {
                method: 'post',
                dataType: 'json',
                body: JSON.stringify({
                    accountId,
                    date,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Authorization": bearer,
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    return dispatch({
                        type: ERROR,
                        error: data.error
                    })
                }
                return dispatch({
                    type: EDIT_DAILY_NUTRITION,
                    dailyNutrition: data.nutrition,
                })
            })
        }
        else{
            return dispatch({
                type: EDIT_DAILY_NUTRITION,
                dailyNutrition: data[0],
            })
        }
    }
}

export function updateDailyNutrition(updatedNutrition) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const data = await fetch(`${serverURL}/updateNutrition`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                _id: updatedNutrition._id,
                nutrition: updatedNutrition
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        .then(res => res.json());

        if (data.error) {
            return dispatch({
                type: ERROR,
                error: data.error
            })
        }
        else {
            return dispatch({
                type: EDIT_DAILY_NUTRITION,
                dailyNutrition: data.nutrition
            })
        }
    }
}

export function requestDailyNote(accountId, date) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/note`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        let data = await response.json();

        if (data.results === "No Results") {
            fetch(`${serverURL}/createNote`, {
                method: 'post',
                dataType: 'json',
                body: JSON.stringify({
                    accountId,
                    date,
                    note: "",
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Authorization": bearer,
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        return dispatch({
                            type: ERROR,
                            error: data.error
                        })
                    }
                    return dispatch({
                        type: EDIT_DAILY_NOTE,
                        dailyNote: data.note,
                    })
                })
        }

        return dispatch({
            type: EDIT_DAILY_NOTE,
            dailyNote: data,
        })
    }
}

export function updateDailyNote(udpatedNote) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const data = await fetch(`${serverURL}/updateNote`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                _id: udpatedNote._id,
                note: udpatedNote.note,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
            .then(res => res.json());

        if (data.error) {
            return dispatch({
                type: ERROR,
                error: data.error
            })
        }
        else {
            return dispatch({
                type: EDIT_DAILY_NOTE,
                dailyNote: data.note,
            })
        }
    }
}

export function requestDailyTraining(accountId, date) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const response = await fetch(`${serverURL}/training`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
        let data = await response.json();

        if (!data || data.length < 1) {
            fetch(`${serverURL}/createTraining`, {
                method: 'post',
                dataType: 'json',
                body: JSON.stringify({
                    accountId,
                    date,
                    category: '',
                    training: [
                        [
                            {
                                exercise: "",
                                exerciseType: "Rep Range",
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
                    "Authorization": bearer,
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        return dispatch({
                            type: ERROR,
                            error: data.error
                        })
                    }
                    return dispatch({
                        type: EDIT_DAILY_TRAINING,
                        dailyTraining: data.training,
                    })
                })
        }
        else {
            data[0].training.map(set => {
                set.map(exercise => {
                    if (!exercise.achieved.weight) {
                        exercise.achieved.weight = [0];
                    }
                    return exercise;
                })
                return set;
            })
            return dispatch({
                type: EDIT_DAILY_TRAINING,
                dailyTraining: { ...data[0] },
            })
        }
    }
}

export function updateDailyTraining(trainingId, updatedTraining) {
    return async (dispatch) => {
        const bearer = `Bearer ${localStorage.getItem('JWT_AUTH_TOKEN')}`;

        const data = await fetch(`${serverURL}/updateTraining`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                _id: trainingId,
                training: updatedTraining,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": bearer,
            }
        })
            .then(res => res.json());

        if (data.error) {
            return dispatch({
                type: ERROR,
                error: data.error
            })
        }
        else {
            return dispatch({
                type: EDIT_DAILY_TRAINING,
                dailyTraining: updatedTraining,
            })
        }
    }
}