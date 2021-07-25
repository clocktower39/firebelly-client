export const LOGIN = 'LOGIN';

export function login() {
    return async (dispatch, getState) => {
        return dispatch({
            type: LOGIN,
        })
    }
}