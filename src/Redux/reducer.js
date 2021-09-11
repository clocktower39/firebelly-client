import { LOGIN_USER, LOGOUT_USER, ERROR, EDIT_DAILY_TASK, EDIT_DEFAULT_TASK } from './actions';
import { user, calander } from './states';
export let reducer = (state = { user, calander }, action) => {
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
        case EDIT_DAILY_TASK:
            return {
                ...state,
                calander:{
                    dailyView:{ 
                        ...calander.dailyView,
                        dailyTasks: action.dailyTasks,
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case EDIT_DEFAULT_TASK:
            return {
                ...state,
                user: {
                    ...state.user,
                    defaultTasks: action.defaultTasks,
                }
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

