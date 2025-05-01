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
  EDIT_HOME_WORKOUTS,
  ADD_WORKOUT,
  EDIT_TRAINING,
  EDIT_WEEKLY_VIEW,
  EDIT_EXERCISE_LIBRARY,
  EDIT_PROGRESS_EXERCISE_LIST,
  EDIT_PROGRESS_TARGET_EXERCISE_HISTORY,
  UPDATE_MY_TRAINERS,
  GET_TRAINERS,
  GET_CLIENTS,
  GET_GOALS,
  UPDATE_GOAL,
  ADD_NEW_GOAL,
  DELETE_GOAL,
  UPDATE_CONVERSATIONS,
  UPDATE_CONVERSATION_MESSAGES,
} from "./actions";
import {
  user,
  calander,
  exerciseLibrary,
  progress,
  nutrition,
  workouts,
  training,
  tasks,
  myTrainers,
  trainers,
  goals,
  clients,
  conversations,
} from "./states";
export let reducer = (
  state = {
    user,
    calander,
    exerciseLibrary,
    progress,
    nutrition,
    workouts,
    training,
    tasks,
    myTrainers,
    trainers,
    goals,
    clients,
    conversations,
  },
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
          themeMode: "light",
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
    case EDIT_HOME_WORKOUTS:
      return {
        ...state,
        workouts: [...action.workouts],
      };
    case ADD_WORKOUT:
      return {
        ...state,
        workouts: [...state.workouts, action.workout],
      };
    case EDIT_TRAINING:
      return action.workouts
        ? {
            ...state,
            training: { ...action.training },
            workouts: [...action.workouts],
          }
        : {
            ...state,
            training: { ...action.training },
          };
    case EDIT_NUTRITION:
      return {
        ...state,
        nutrition: action.nutrition,
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
        exerciseLibrary: [...action.exerciseLibrary],
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

          exerciseList: state.progress.exerciseList.map((exercise) =>
            exercise._id === action.exerciseId
              ? {
                  ...exercise,
                  history: {
                    ...(exercise.history || {}),
                    [action.userId]: action.targetExerciseHistory,
                  },
                }
              : exercise
          ),
        },
      };
    case UPDATE_MY_TRAINERS:
      return {
        ...state,
        myTrainers: action.myTrainers,
      };
    case GET_TRAINERS:
      return {
        ...state,
        trainers: action.trainers,
      };
    case GET_CLIENTS:
      return {
        ...state,
        clients: action.clients,
      };
    case GET_GOALS:
      return {
        ...state,
        goals: action.goals,
      };
    case UPDATE_GOAL:
      return {
        ...state,
        goals: [
          ...state.goals.map((goal) =>
            goal._id === action.goal._id ? { ...goal, ...action.goal } : goal
          ),
        ],
      };
    case ADD_NEW_GOAL:
      return {
        ...state,
        goals: [...state.goals, action.goal],
      };
    case DELETE_GOAL:
      return {
        ...state,
        goals: [...state.goals.filter((goal) => goal._id !== action.goalId)],
      };
    case UPDATE_CONVERSATIONS:
      return {
        ...state,
        conversations: [...action.conversations],
      };
    case UPDATE_CONVERSATION_MESSAGES:
      const updatedConversations = [
        ...state.conversations.map((c) => {
          if (c._id === action.conversation._id) {
            c.messages = action.conversation.messages;
          }
          return c;
        }),
      ];

      return {
        ...state,
        conversations: [...updatedConversations],
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
