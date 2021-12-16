import { LOGIN_USER, LOGOUT_USER, ERROR, EDIT_DAILY_TASK, EDIT_DEFAULT_TASK, EDIT_MYACCOUNT, EDIT_DAILY_NUTRITION, EDIT_DAILY_NOTE, EDIT_DAILY_TRAINING, EDIT_WEEKLY_VIEW, EDIT_PROGRESS_EXERCISE_LIST, EDIT_PROGRESS_TARGET_EXERCISE_HISTORY } from './actions';
import { user, calander, progress } from './states';
export let reducer = (state = { user, calander, progress }, action) => {
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
                    ...state.calander,
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyTasks: action.dailyTasks,
                    },
                },
            }
        case EDIT_DAILY_TRAINING:
            return {
                ...state,
                calander:{
                    ...state.calander,
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyTraining: {...action.dailyTraining},
                    },
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
                },
            }
        case EDIT_DAILY_NOTE:
            return {
                ...state,
                calander:{
                    ...state.calander,
                    dailyView:{ 
                        ...state.calander.dailyView,
                        dailyNote: action.dailyNote,
                    },
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
                    ...state.calander,
                    weeklyView:[...action.weeklyView],
                },
            }
        case EDIT_PROGRESS_EXERCISE_LIST:
            return {
                ...state,
                progress:{
                    ...state.progress,
                    exerciseList: [...action.exerciseList],
                },
            }
        case EDIT_PROGRESS_TARGET_EXERCISE_HISTORY:
            return {
                ...state,
                progress:{
                    ...state.progress,
                    targetExerciseHistory: [...action.targetExerciseHistory],
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

