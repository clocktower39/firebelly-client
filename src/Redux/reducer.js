import {
  LOGIN_USER,
  LOGOUT_USER,
  ERROR,
  EDIT_TASKS,
  EDIT_TASK_HISTORY,
  ADD_TASK_HISTORY_DAY,
  EDIT_DEFAULT_TASK,
  EDIT_MYACCOUNT,
  EDIT_NUTRITION,
  EDIT_NOTES,
  ADD_NOTE,
  EDIT_TRAINING,
  EDIT_WEEKLY_VIEW,
  EDIT_EXERCISE_LIBRARY,
  EDIT_PROGRESS_EXERCISE_LIST,
  EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
} from "./actions";
import { user, calander, exerciseLibrary, progress, nutrition, training, notes, tasks } from "./states";
export let reducer = (
  state = { user, calander, exerciseLibrary, progress, nutrition, training, notes, tasks },
  action
) => {
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
        user: {
          isTrainer: false,
          theme: {
            mode: 'dark',
          }
        },
      };
    case EDIT_TASKS:
      return {
        ...state,
        tasks: action.tasks,
      };
    case EDIT_TASK_HISTORY:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          history: action.history,
        },
      };
    case ADD_TASK_HISTORY_DAY:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          history: [...state, tasks.history, action.newDay],
        },
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
        tasks: {
          ...state.tasks,
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
    case EDIT_EXERCISE_LIBRARY:
      return {
        ...state,
        exerciseLibrary: [...action.exerciseLibrary]
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
