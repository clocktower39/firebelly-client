import { LOGIN_USER, LOGOUT_USER, ERROR, EDIT_DAILY_TASK, EDIT_DEFAULT_TASK, EDIT_MYACCOUNT, EDIT_DAILY_NUTRITION, FETCH_DAILY_TASK, EDIT_DAILY_NOTE, EDIT_DAILY_TRAINING, EDIT_WEEKLY_VIEW } from './actions';
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
                        ...state.calander.dailyView,
                        dailyTasks: [...action.dailyTasks],
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case FETCH_DAILY_TASK:
            return {
                ...state,
                calander:{
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyTasks: [...action.dailyTasks],
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case EDIT_DAILY_TRAINING:
            return {
                ...state,
                calander:{
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyTraining: {...action.dailyTraining},
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case EDIT_DAILY_NUTRITION:
            return {
                ...state,
                calander:{
                    ...state.calander,
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyNutrition: action.dailyNutrition,
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case EDIT_DAILY_NOTE:
            return {
                ...state,
                calander:{
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyNote: action.dailyNote,
                    },
                    weeklyView:{...calander.weeklyView},
                    monthlyView:{...calander.monthlyView},
                },
            }
        case EDIT_MYACCOUNT:
            return {
                ...state,
                user: {
                    ...action.user,
                }
            }
        case EDIT_DEFAULT_TASK:
            return {
                ...state,
                user: {
                    ...state.user,
                    defaultTasks: [...action.defaultTasks],
                }
            }
        case EDIT_WEEKLY_VIEW:
            return {
                ...state,
                calander:{
                    dailyView:{ ...state.calander.dailyView,},
                    weeklyView:{...action.weeklyView},
                    monthlyView:{...state.calander.monthlyView},
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

