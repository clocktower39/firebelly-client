import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { requestWorkoutQueue } from "../../../Redux/actions";
import { EMPTY_WORKOUTS } from "../constants";
import {
  buildBookingEndOptions,
  buildBookingStartOptions,
  pickDefaultBookingEnd,
} from "../utils/scheduleUtils";

export default function useScheduleWorkouts({
  dispatch,
  user,
  isTrainerView,
  selectedClientIds,
  selectedDate,
  scheduleData,
  attachEvent,
  workoutsByAccount,
  workoutQueue,
}) {
  const [queueTargetEventId, setQueueTargetEventId] = useState("");
  const [selectedQueueSlot, setSelectedQueueSlot] = useState("");
  const [selectedQueueEndSlot, setSelectedQueueEndSlot] = useState("");

  const activeClientIds = useMemo(() => {
    if (!isTrainerView) return [];
    if (selectedClientIds.length > 0) return selectedClientIds;
    return [];
  }, [isTrainerView, selectedClientIds]);

  const attachAccountId =
    attachEvent?.clientId ||
    (isTrainerView && selectedClientIds.length === 1 ? selectedClientIds[0] : null) ||
    user._id;
  const availableWorkouts = workoutsByAccount?.[attachAccountId]?.workouts || EMPTY_WORKOUTS;
  const queueAccountIds = useMemo(
    () => (isTrainerView ? activeClientIds : [user._id]),
    [activeClientIds, isTrainerView, user._id]
  );
  const queuedWorkouts = useMemo(() => {
    if (!isTrainerView) {
      return workoutQueue?.[user._id] || EMPTY_WORKOUTS;
    }
    return queueAccountIds.flatMap((clientId) => workoutQueue?.[clientId] || EMPTY_WORKOUTS);
  }, [isTrainerView, queueAccountIds, user._id, workoutQueue]);
  const visibleQueuedWorkouts = useMemo(() => {
    const start = selectedDate.startOf("week").startOf("day");
    const end = start.add(7, "day").startOf("day");
    return queuedWorkouts.filter((workout) => {
      if (!workout.date) return false;
      const workoutTime = dayjs.utc(workout.date).valueOf();
      return workoutTime >= start.valueOf() && workoutTime < end.valueOf();
    });
  }, [queuedWorkouts, selectedDate]);

  useEffect(() => {
    if (isTrainerView) {
      queueAccountIds.forEach((clientId) => {
        dispatch(requestWorkoutQueue(clientId, selectedDate.startOf("week").format("YYYY-MM-DD")));
      });
    }
  }, [dispatch, isTrainerView, queueAccountIds, selectedDate]);

  const attachWorkouts = useMemo(() => {
    if (!isTrainerView) return availableWorkouts;
    if (attachEvent?.clientId || selectedClientIds.length === 1) return availableWorkouts;
    return activeClientIds.flatMap(
      (clientId) => workoutsByAccount?.[clientId]?.workouts || EMPTY_WORKOUTS
    );
  }, [
    activeClientIds,
    attachEvent?.clientId,
    availableWorkouts,
    selectedClientIds.length,
    isTrainerView,
    workoutsByAccount,
  ]);
  const attachQueuedWorkouts = useMemo(() => {
    if (!isTrainerView) return workoutQueue?.[user._id] || EMPTY_WORKOUTS;
    if (attachEvent?.clientId || selectedClientIds.length === 1) {
      return workoutQueue?.[attachAccountId || "me"] || EMPTY_WORKOUTS;
    }
    return activeClientIds.flatMap((clientId) => workoutQueue?.[clientId] || EMPTY_WORKOUTS);
  }, [
    activeClientIds,
    attachAccountId,
    attachEvent?.clientId,
    isTrainerView,
    selectedClientIds.length,
    user._id,
    workoutQueue,
  ]);

  const dayEvents = useMemo(() => {
    const dayStart = selectedDate.startOf("day");
    const dayEnd = selectedDate.add(1, "day").startOf("day");
    return (scheduleData.events || [])
      .filter((event) => {
        const start = dayjs(event.startDateTime);
        const end = dayjs(event.endDateTime);
        return start.isBefore(dayEnd) && end.isAfter(dayStart);
      })
      .sort((a, b) => dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf());
  }, [scheduleData.events, selectedDate]);

  const filteredDayEvents = useMemo(() => {
    if (!isTrainerView) return dayEvents;
    if (!activeClientIds.length) return dayEvents;
    return dayEvents.filter((event) => {
      if (event.eventType === "AVAILABILITY") return true;
      if (!event.clientId) return false;
      return activeClientIds.includes(event.clientId);
    });
  }, [activeClientIds, dayEvents, isTrainerView]);

  const attachableEvents = useMemo(
    () => filteredDayEvents.filter((event) => event.status !== "CANCELLED"),
    [filteredDayEvents]
  );

  useEffect(() => {
    if (attachableEvents.length > 0) {
      setQueueTargetEventId((prev) => prev || attachableEvents[0]._id);
    } else {
      setQueueTargetEventId("");
    }
  }, [attachableEvents]);

  const queueTargetEvent = useMemo(
    () => attachableEvents.find((event) => event._id === queueTargetEventId),
    [attachableEvents, queueTargetEventId]
  );

  const queueBookingStartOptions = useMemo(
    () => buildBookingStartOptions(queueTargetEvent),
    [queueTargetEvent]
  );

  const queueBookingEndOptions = useMemo(
    () => buildBookingEndOptions(queueTargetEvent, selectedQueueSlot),
    [queueTargetEvent, selectedQueueSlot]
  );

  useEffect(() => {
    if (queueBookingStartOptions.length > 0) {
      setSelectedQueueSlot((prev) =>
        queueBookingStartOptions.some((option) => option.value === prev)
          ? prev
          : queueBookingStartOptions[0].value
      );
    } else {
      setSelectedQueueSlot("");
    }
  }, [queueBookingStartOptions]);

  useEffect(() => {
    if (queueBookingEndOptions.length > 0) {
      setSelectedQueueEndSlot((prev) =>
        queueBookingEndOptions.some((option) => option.value === prev)
          ? prev
          : pickDefaultBookingEnd(selectedQueueSlot, queueBookingEndOptions)
      );
    } else {
      setSelectedQueueEndSlot("");
    }
  }, [selectedQueueSlot, queueBookingEndOptions]);

  return {
    queueTargetEventId,
    setQueueTargetEventId,
    selectedQueueSlot,
    setSelectedQueueSlot,
    selectedQueueEndSlot,
    setSelectedQueueEndSlot,
    activeClientIds,
    attachAccountId,
    visibleQueuedWorkouts,
    attachWorkouts,
    attachQueuedWorkouts,
    filteredDayEvents,
    attachableEvents,
    queueTargetEvent,
    queueBookingStartOptions,
    queueBookingEndOptions,
  };
}
