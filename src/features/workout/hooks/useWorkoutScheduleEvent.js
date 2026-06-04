import { useEffect, useState } from "react";
import { scheduleApi } from "../../../api/scheduleApi";

export default function useWorkoutScheduleEvent({ locationSearch, workoutId }) {
  const [scheduleEvent, setScheduleEvent] = useState(null);

  useEffect(() => {
    const eventId = new URLSearchParams(locationSearch).get("event");

    if (!eventId && !workoutId) {
      setScheduleEvent(null);
      return;
    }

    let cancelled = false;
    const request = eventId
      ? scheduleApi.getEvent(eventId)
      : scheduleApi.getEventByWorkout(workoutId);

    request
      .then((data) => {
        if (cancelled) return;
        setScheduleEvent(data?.event || null);
      })
      .catch(() => {
        if (!cancelled) {
          setScheduleEvent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locationSearch, workoutId]);

  return {
    scheduleEvent,
    setScheduleEvent,
  };
}
