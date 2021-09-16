import jwt from 'jwt-decode';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const SIGNUP_USER = 'SIGNUP_USER';
export const ERROR = 'ERROR';
export const EDIT_DAILY_TASK = 'EDIT_DAILY_TASK';
export const EDIT_DAILY_NUTRITION = 'EDIT_DAILY_NUTRITION';
export const EDIT_DEFAULT_TASK = 'EDIT_DEFAULT_TASK';
export const EDIT_MYACCOUNT = 'EDIT_MYACCOUNT';
const CURRENT_IP = window.location.href.split(":")[1];

export function signupUser(user){
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
        if(data.error){
            return dispatch({
                type: ERROR,
                error: data.error
            });
        }

        return dispatch(loginUser(user));
    }
}

export function loginUser(user){
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
        if(data.error){
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


export function logoutUser(){
    return async (dispatch, getState) => {
        localStorage.removeItem('JWT_AUTH_TOKEN');
        return dispatch({
            type: LOGOUT_USER
        })
    }
}
export function editUser(user){
    return async (dispatch, getState) => {
        
        return dispatch({
            type: EDIT_MYACCOUNT,
            user,
        })
    }
}

export function checkToggleDailyTask(title){
    return async (dispatch, getState) => {
        const state = getState();
        const dailyTasks = state.calander.dailyView.dailyTasks.map(task => {
            if(task.title === title){
                task.achieved===0?task.achieved = 1: task.achieved = 0;
            }
            return task;
        });

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks,
        })
    }
}

export function addDailyTask(newTask){
    return async (dispatch, getState) => {
        const state = getState();
        const dailyTasks = [...state.calander.dailyView.dailyTasks, newTask];

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks,
        })
    }
}

export function editDefaultDailyTask(defaultTasks){
    return async (dispatch, getState) => {
        return dispatch({
            type: EDIT_DEFAULT_TASK,
            defaultTasks,
        })
    }
}

export function removeDefaultDailyTask(removeTask){
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

export function requestDailyTasks(accountId, date){
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
        if(data.length === 0){
            data = [...state.user.defaultTasks];
        }

        return dispatch({
            type: EDIT_DAILY_TASK,
            dailyTasks: data,
        })
    }
}

export function requestDailyNutrition(accountId, date){
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
        if(data.length === 0){
            data = state.user.defaultNutrition
        }

        return dispatch({
            type: EDIT_DAILY_NUTRITION,
            dailyNutrition: data,
        })
    }
}