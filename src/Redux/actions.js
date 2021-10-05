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
const CURRENT_IP = window.location.href.split(":")[1];

export function signupUser(user) {
    return async (dispatch, getState) => {
        const response = await fetch(`http:${CURRENT_IP}:6969/signup`, {
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
        const response = await fetch(`http:${CURRENT_IP}:6969/login`, {
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
        const decodedAccessToken = jwt(token);
        return dispatch({
            type: LOGIN_USER,
            user: decodedAccessToken,
        });
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
                fetch(`http:${CURRENT_IP}:6969/updateTask`, {
                    method: 'post',
                    dataType: 'json',
                    body: JSON.stringify({
                        _id: id,
                        achieved: task.achieved
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
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

        const dbTask = await fetch(`http:${CURRENT_IP}:6969/createTask`, {
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
                "Content-type": "application/json; charset=UTF-8"
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
        const response = await fetch(`http:${CURRENT_IP}:6969/tasks`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        let data = await response.json();

        // return default tasks if array is empty
        if (data.length < 1) {
            let newTaskList = [];

            state.user.defaultTasks.forEach(task => {
                fetch(`http:${CURRENT_IP}:6969/createTask`, {
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
                        "Content-type": "application/json; charset=UTF-8"
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
        const response = await fetch(`http:${CURRENT_IP}:6969/updateDefaultTasks`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({ _id: state.user._id, defaultTasks }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        const data = await response.json();
        console.log(data)
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
    return async (dispatch, getState) => {
        const state = getState();
        const response = await fetch(`http:${CURRENT_IP}:6969/nutrition`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        let data = await response.json();

        // return default tasks if array is empty
        if (data.length < 1) {
            let newNutritionList = [];

            state.user.defaultNutrition.forEach(nutritionTask => {
                fetch(`http:${CURRENT_IP}:6969/createNutrition`, {
                    method: 'post',
                    dataType: 'json',
                    body: JSON.stringify({
                        accountId,
                        date,
                        title: nutritionTask.title,
                        goal: nutritionTask.goal,
                        achieved: nutritionTask.achieved,
                        unit: nutritionTask.unit,
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
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
                        newNutritionList.push(data.nutrition);
                        return dispatch({
                            type: EDIT_DAILY_NUTRITION,
                            dailyNutrition: newNutritionList,
                        })
                    })
            })
        }


        return dispatch({
            type: EDIT_DAILY_NUTRITION,
            dailyNutrition: data,
        })
    }
}

export function updateDailyNutrition(updateList) {
    return async (dispatch) => {
        let newNutritionList = [];
        updateList.forEach(async nutrition => {
            const data = await fetch(`http:${CURRENT_IP}:6969/updateNutrition`, {
                method: 'post',
                dataType: 'json',
                body: JSON.stringify({
                    _id: nutrition._id,
                    achieved: nutrition.achieved
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
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
                newNutritionList.push(data.nutrition);
                return dispatch({
                    type: EDIT_DAILY_NUTRITION,
                    dailyNutrition: newNutritionList
                })
            }
        });
    }
}

export function requestDailyNote(accountId, date) {
    return async (dispatch) => {
        const response = await fetch(`http:${CURRENT_IP}:6969/note`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                accountId,
                date
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        let data = await response.json();

        if (data.length < 1) {
            fetch(`http:${CURRENT_IP}:6969/createNote`, {
                method: 'post',
                dataType: 'json',
                body: JSON.stringify({
                    accountId,
                    date,
                    note: "",
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
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
        const data = await fetch(`http:${CURRENT_IP}:6969/updateNote`, {
            method: 'post',
            dataType: 'json',
            body: JSON.stringify({
                _id: udpatedNote._id,
                note: udpatedNote.note,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
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