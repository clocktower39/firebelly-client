import jwt from 'jwt-decode';

export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const SIGNUP_USER = 'SIGNUP_USER';
export const ERROR = 'ERROR';

export function signupUser(user){
    return async (dispatch, getState) => {
        const response = await fetch('http://localhost:6969/signup', {
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
        const response = await fetch('http://localhost:6969/login', {
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