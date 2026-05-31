import { scheduleApi } from "../../api/scheduleApi";
import { workoutApi } from "../../api/workoutApi";
import {
  EDIT_SCHEDULE_EVENTS,
  EDIT_SESSION_SUMMARY,
  EDIT_WORKOUT_QUEUE,
  ERROR,
  REMOVE_WORKOUTS,
  UPSERT_WORKOUT,
} from "../actionTypes";

const buildScheduleScopeKey = (trainerId, clientId) =>
  `${trainerId || "me"}:${clientId || "all"}`;

export const upsertWorkout = (workout, accountId = null) => ({
  type: UPSERT_WORKOUT,
  workout,
  accountId,
});

export const removeWorkouts = (accountId, workoutIds = []) => ({
  type: REMOVE_WORKOUTS,
  accountId,
  workoutIds,
});

export function requestScheduleRange({
  startDate,
  endDate,
  trainerId,
  clientId,
  includeAvailability = true,
}) {
  return async (dispatch, getState) => {
    const data = await scheduleApi.getRange({
      startDate,
      endDate,
      trainerId,
      clientId,
      includeAvailability,
    });
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }

    const stateUser = getState().user;
    const scopeKey = buildScheduleScopeKey(trainerId || stateUser._id, clientId);
    dispatch({
      type: EDIT_SCHEDULE_EVENTS,
      scopeKey,
      events: data.events || [],
      range: { startDate, endDate },
    });
    return data;
  };
}

export function createScheduleEvent(payload, accessTokenOverride = null) {
  return async (dispatch) => {
    const data = await scheduleApi.createEvent(payload, accessTokenOverride);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function updateScheduleEvent(eventId, updates, accessTokenOverride = null) {
  return async (dispatch) => {
    const data = await scheduleApi.updateEvent({ eventId, updates }, accessTokenOverride);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function cancelScheduleEvent(eventId) {
  return async (dispatch) => {
    const data = await scheduleApi.cancelEvent(eventId);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function deleteScheduleEvent(eventId, accessTokenOverride = null) {
  return async (dispatch) => {
    const data = await scheduleApi.deleteEvent(eventId, accessTokenOverride);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function requestBooking(payload) {
  return async (dispatch) => {
    const data = await scheduleApi.requestBooking(payload);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function trainerBookAvailability(payload) {
  return async (dispatch) => {
    const data = await scheduleApi.trainerBookAvailability(payload);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function respondBooking(payload) {
  return async (dispatch) => {
    const data = await scheduleApi.respondBooking(payload);
    if (data.error) dispatch({ type: ERROR, error: data.error });
    return data;
  };
}

export function requestSessionSummary(trainerId, clientId) {
  return async (dispatch) => {
    const data = await scheduleApi.getSessionSummary({ trainerId, clientId });
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    const scopeKey = buildScheduleScopeKey(trainerId, clientId);
    dispatch({ type: EDIT_SESSION_SUMMARY, scopeKey, summary: data });
    return data;
  };
}

export function createSessionPurchase({ clientId, sessionsPurchased, expiresAt, notes }) {
  return async (dispatch) => {
    const data = await scheduleApi.createSessionPurchase({
      clientId,
      sessionsPurchased,
      expiresAt,
      notes,
    });
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    return data;
  };
}

export function requestSessionPurchases({ trainerId, clientId, activeOnly = false }) {
  return async (dispatch) => {
    const data = await scheduleApi.listSessionPurchases({
      trainerId,
      clientId,
      activeOnly,
    });
    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }
    return data.purchases || [];
  };
}

export function requestWorkoutQueue(accountId, startDate) {
  return async (dispatch) => {
    const data = await workoutApi.getWorkoutQueue({ accountId, startDate });

    if (data.error) {
      dispatch({ type: ERROR, error: data.error });
      return data;
    }

    dispatch({
      type: EDIT_WORKOUT_QUEUE,
      accountId: accountId || "me",
      workouts: data,
    });

    return data;
  };
}
