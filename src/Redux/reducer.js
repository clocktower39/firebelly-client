import {
  LOGIN_USER,
  LOGOUT_USER,
  ERROR,
  EDIT_TASKS,
  EDIT_DEFAULT_TASK,
  EDIT_MYACCOUNT,
  EDIT_NUTRITION,
  EDIT_NOTES,
  ADD_NOTE,
  EDIT_TRAINING,
  EDIT_WEEKLY_VIEW,
  EDIT_PROGRESS_EXERCISE_LIST,
  EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
} from "./actions";
import { user, calander, progress, nutrition, training, notes, tasks } from "./states";
export let reducer = (state = { user, calander, progress, nutrition, training, notes, tasks }, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.user,
        },
      };
    case LOGOUT_USER:
      return {
        ...state,
        user: {},
      };
    case EDIT_TASKS:
      return {
        ...state,
        tasks: action.tasks
      };
    case EDIT_TRAINING:
      return {
        ...state,
        training: { ...action.training },
      };
    case EDIT_NUTRITION:
      return {
        ...state,
        nutrition: action.nutrition,
      };
    case ADD_NOTE:
      return {
        ...state,
        notes: [...state.notes, action.note],
      };
    case EDIT_NOTES:
      return {
        ...state,
        notes: [...action.notes],
      };
    case EDIT_MYACCOUNT:
      return {
        ...state,
        user: {
          ...action.user,
        },
      };
    case EDIT_DEFAULT_TASK:
      return {
        ...state,
        user: {
          ...state.user,
          defaultTasks: [...action.defaultTasks],
        },
      };
    case EDIT_WEEKLY_VIEW:
      return {
        ...state,
        calander: {
          ...state.calander,
          weeklyView: [...action.weeklyView],
        },
      };
    case EDIT_PROGRESS_EXERCISE_LIST:
      return {
        ...state,
        progress: {
          ...state.progress,
          exerciseList: [...action.exerciseList],
        },
      };
    case EDIT_PROGRESS_TARGET_EXERCISE_HISTORY:
      return {
        ...state,
        progress: {
          ...state.progress,
          targetExerciseHistory: [...action.targetExerciseHistory],
        },
      };
    case ERROR:
      return {
        ...state,
        error: { ...action.error },
      };
    default:
      return state;
  }
};
