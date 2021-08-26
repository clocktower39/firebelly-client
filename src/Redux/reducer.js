import { LOGIN_USER, LOGOUT_USER, ERROR } from './actions';
import { user, dailyTasks, todayTraining, todayNutrition } from './states';
export let reducer = (state = { user, today: { dailyTasks, todayTraining, todayNutrition }}, action) => {
    switch (action.type) {
        case LOGIN_USER:
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.user,
                },
            }
        case LOGOUT_USER:
            return {
                ...state,
                user: {
                },
            }
        case ERROR:
            return {
                ...state,
                error: { ...action.error }
            }
        default:
            return state
    }
}

