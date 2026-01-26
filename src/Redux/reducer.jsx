import {
  LOGIN_USER,
  LOGOUT_USER,
  ERROR,
  EDIT_MYACCOUNT,
  EDIT_WORKOUTS,
  ADD_WORKOUT,
  EDIT_TRAINING,
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
  EDIT_METRICS_ENTRIES,
  EDIT_METRICS_PENDING,
  EDIT_METRICS_LATEST,
  ADD_METRIC_ENTRY,
  REVIEW_METRIC_ENTRY,
  UPDATE_METRIC_ENTRY,
  DELETE_METRIC_ENTRY,
  UPDATE_CONVERSATIONS,
  UPDATE_CONVERSATION_MESSAGES,
  EDIT_SCHEDULE_EVENTS,
  EDIT_SESSION_SUMMARY,
  EDIT_WORKOUT_QUEUE,
} from "./actions";
import {
  user,
  exerciseLibrary,
  progress,
  workouts,
  training,
  myTrainers,
  trainers,
  goals,
  clients,
  conversations,
  metrics,
  scheduleEvents,
  sessionSummary,
  workoutQueue,
} from "./states";
export let reducer = (
  state = {
    user,
    exerciseLibrary,
    progress,
    workouts,
    training,
    myTrainers,
    trainers,
    goals,
    clients,
    conversations,
    metrics,
    scheduleEvents,
    sessionSummary,
    workoutQueue,
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
        },
      };
    case EDIT_WORKOUTS: {
      const existing = state.workouts[action.accountId]?.workouts || [];

      // Convert existing workouts to a map for faster lookup
      const existingMap = new Map(existing.map((w) => [w._id, w]));

      // Merge new workouts
      const updatedWorkouts = [...existingMap.values()];

      action.workouts.forEach((newWorkout) => {
        const existingWorkout = existingMap.get(newWorkout._id);

        if (!existingWorkout) {
          // New workout, add it
          updatedWorkouts.push(newWorkout);
        } else if (JSON.stringify(existingWorkout) !== JSON.stringify(newWorkout)) {
          // Existing workout changed, replace it
          const index = updatedWorkouts.findIndex((w) => w._id === newWorkout._id);
          updatedWorkouts[index] = newWorkout;
        }
        // If same, do nothing (skip update)
      });

      const workoutUser = action.user ?? state.user;

      return {
        ...state,
        workouts: {
          ...state.workouts,
          [workoutUser._id]: {
            ...(state.workouts[workoutUser._id] || {}),
            workouts: updatedWorkouts,
            user: { ...workoutUser, },
          },
        },
      };
    }
    case ADD_WORKOUT:
      return {
        ...state,
        workouts: {
          ...state.workouts,
          [action.accountId]: {
            workouts: [...(state?.workouts?.[action.accountId]?.workouts || []), action.workout],
          },
        },
      };
    case EDIT_TRAINING:
      const updatedTraining = action.training;
      const userId = state.user._id;

      // Get existing workouts for the user
      const userWorkouts = state.workouts[userId]?.workouts || [];

      // Check if the training already exists
      const existingIndex = userWorkouts.findIndex((w) => w._id === updatedTraining._id);

      // Create a new workouts array with the updated or new training
      const updatedUserWorkouts =
        existingIndex >= 0
          ? userWorkouts.map((w) => (w._id === updatedTraining._id ? updatedTraining : w))
          : [...userWorkouts, updatedTraining];

      return action.workouts
        ? {
            ...state,
            training: { ...action.training },
            workouts: { ...action.workouts },
          }
        : {
            ...state,
            training: { ...updatedTraining },
            workouts: {
              ...state.workouts,
              [userId]: {
                ...state.workouts[userId],
                workouts: updatedUserWorkouts,
              },
            },
          };
    case EDIT_MYACCOUNT:
      return {
        ...state,
        user: {
          ...action.user,
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
    case EDIT_METRICS_ENTRIES: {
      const userId = action.userId || state.user._id;
      return {
        ...state,
        metrics: {
          ...state.metrics,
          entriesByUser: {
            ...state.metrics.entriesByUser,
            [userId]: action.entries || [],
          },
        },
      };
    }
    case EDIT_METRICS_PENDING: {
      const userId = state.user._id;
      return {
        ...state,
        metrics: {
          ...state.metrics,
          pendingByUser: {
            ...state.metrics.pendingByUser,
            [userId]: action.entries || [],
          },
        },
      };
    }
    case EDIT_METRICS_LATEST: {
      const userId = action.userId || state.user._id;
      return {
        ...state,
        metrics: {
          ...state.metrics,
          latestByUser: {
            ...state.metrics.latestByUser,
            [userId]: action.entry || null,
          },
        },
      };
    }
    case ADD_METRIC_ENTRY: {
      const userId = action.userId || action.entry?.user || state.user._id;
      const existingEntries = state.metrics.entriesByUser[userId] || [];
      const updatedEntries = [action.entry, ...existingEntries.filter((entry) => entry._id !== action.entry?._id)];
      return {
        ...state,
        metrics: {
          ...state.metrics,
          entriesByUser: {
            ...state.metrics.entriesByUser,
            [userId]: updatedEntries,
          },
        },
      };
    }
    case REVIEW_METRIC_ENTRY: {
      const userId = action.entry?.user || state.user._id;
      const existingEntries = state.metrics.entriesByUser[userId] || [];
      const updatedEntries =
        action.entry?.status === "rejected"
          ? existingEntries.filter((entry) => entry._id !== action.entry?._id)
          : existingEntries.map((entry) =>
              entry._id === action.entry?._id ? action.entry : entry
            );
      const existingPending = state.metrics.pendingByUser[userId] || [];
      const updatedPending = existingPending.filter((entry) => entry._id !== action.entry?._id);
      return {
        ...state,
        metrics: {
          ...state.metrics,
          entriesByUser: {
            ...state.metrics.entriesByUser,
            [userId]: updatedEntries,
          },
          pendingByUser: {
            ...state.metrics.pendingByUser,
            [userId]: updatedPending,
          },
        },
      };
    }
    case UPDATE_METRIC_ENTRY: {
      const userId = action.entry?.user || state.user._id;
      const existingEntries = state.metrics.entriesByUser[userId] || [];
      const updatedEntries = existingEntries.map((entry) =>
        entry._id === action.entry?._id ? action.entry : entry
      );
      return {
        ...state,
        metrics: {
          ...state.metrics,
          entriesByUser: {
            ...state.metrics.entriesByUser,
            [userId]: updatedEntries,
          },
          latestByUser: {
            ...state.metrics.latestByUser,
            [userId]:
              state.metrics.latestByUser[userId]?._id === action.entry?._id
                ? action.entry
                : state.metrics.latestByUser[userId],
          },
        },
      };
    }
    case DELETE_METRIC_ENTRY: {
      const userId = action.userId || state.user._id;
      const existingEntries = state.metrics.entriesByUser[userId] || [];
      const updatedEntries = existingEntries.filter((entry) => entry._id !== action.entryId);
      const latestEntry = state.metrics.latestByUser[userId];
      const nextLatest =
        latestEntry && latestEntry._id === action.entryId
          ? updatedEntries[0] || null
          : latestEntry;
      return {
        ...state,
        metrics: {
          ...state.metrics,
          entriesByUser: {
            ...state.metrics.entriesByUser,
            [userId]: updatedEntries,
          },
          latestByUser: {
            ...state.metrics.latestByUser,
            [userId]: nextLatest,
          },
        },
      };
    }
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
    case EDIT_SCHEDULE_EVENTS:
      return {
        ...state,
        scheduleEvents: {
          ...state.scheduleEvents,
          [action.scopeKey]: {
            events: action.events,
            range: action.range,
          },
        },
      };
    case EDIT_SESSION_SUMMARY:
      return {
        ...state,
        sessionSummary: {
          ...state.sessionSummary,
          [action.scopeKey]: action.summary,
        },
      };
    case EDIT_WORKOUT_QUEUE:
      return {
        ...state,
        workoutQueue: {
          ...state.workoutQueue,
          [action.accountId]: action.workouts,
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
