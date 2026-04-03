import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createScheduleEvent, deleteScheduleEvent, serverURL, updateScheduleEvent } from "../../Redux/actions";

dayjs.extend(utc);

const getWorkoutUserId = (workout) =>
  typeof workout?.user === "object" ? workout?.user?._id : workout?.user;

const getWorkoutDateLabel = (workout) =>
  workout?.date ? dayjs.utc(workout.date).format("dddd, MMM D") : "No date";

const getWorkoutSelectLabel = (workout) => {
  const title = workout?.title?.trim();
  const type = workout?.workoutType || "Workout";
  const dateLabel = getWorkoutDateLabel(workout);
  return title ? `${title} • ${dateLabel}` : `${type} workout • ${dateLabel}`;
};

const getPreferredSessionType = (sessionTypes) =>
  sessionTypes.find((type) => type.isDefault && type.name === "60 Min Session") ||
  sessionTypes.find((type) => type.isDefault) ||
  sessionTypes[0] ||
  null;

export default function WorkoutTrainerSessionDialog({
  open,
  onClose,
  workouts = [],
  initialWorkoutId = "",
  onSaved,
}) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const trainerAccessToken = user?.isTrainer
    ? localStorage.getItem("JWT_AUTH_TOKEN")
    : localStorage.getItem("JWT_TRAINER_AUTH_TOKEN");
  const trainerId = user?.isTrainer ? user?._id : user?.trainerId || null;
  const canManageTrainerSessions = Boolean(trainerAccessToken && trainerId);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionTypesStatus, setSessionTypesStatus] = useState("");
  const [eventStatus, setEventStatus] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingEvent, setExistingEvent] = useState(null);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [sessionTypeId, setSessionTypeId] = useState("");

  const preferredSessionType = useMemo(
    () => getPreferredSessionType(sessionTypes),
    [sessionTypes]
  );
  const selectedWorkout = useMemo(
    () => workouts.find((workout) => workout._id === selectedWorkoutId) || null,
    [selectedWorkoutId, workouts]
  );

  useEffect(() => {
    if (!open) return;

    setEventStatus("");
    setSessionTypesStatus("");
    setExistingEvent(null);
    setSelectedWorkoutId(initialWorkoutId || workouts[0]?._id || "");
  }, [initialWorkoutId, open, workouts]);

  useEffect(() => {
    if (!open || !canManageTrainerSessions) return;

    const bearer = `Bearer ${trainerAccessToken}`;
    let active = true;

    fetch(`${serverURL}/session-types`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.error) {
          setSessionTypesStatus(data.error);
          setSessionTypes([]);
          return;
        }
        setSessionTypes(data.sessionTypes || []);
        setSessionTypesStatus("");
      })
      .catch((err) => {
        if (active) {
          setSessionTypesStatus(err.message || "Unable to load session types.");
          setSessionTypes([]);
        }
      });

    return () => {
      active = false;
    };
  }, [canManageTrainerSessions, open, trainerAccessToken]);

  useEffect(() => {
    if (!open || !selectedWorkout?._id || !trainerAccessToken) {
      setExistingEvent(null);
      return;
    }

    const bearer = `Bearer ${trainerAccessToken}`;
    let active = true;
    setExistingEvent(null);
    setEventLoading(true);
    setEventStatus("");

    fetch(`${serverURL}/schedule/event/by-workout`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({ workoutId: selectedWorkout._id }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.error) {
          setEventStatus(data.error);
          setExistingEvent(null);
          return;
        }
        setExistingEvent(data.event || null);
      })
      .catch((err) => {
        if (active) {
          setEventStatus(err.message || "Unable to load trainer session.");
          setExistingEvent(null);
        }
      })
      .finally(() => {
        if (active) {
          setEventLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, selectedWorkout?._id, trainerAccessToken]);

  useEffect(() => {
    if (!open || !selectedWorkout) return;

    if (existingEvent?._id) {
      const start = dayjs(existingEvent.startDateTime);
      const end = dayjs(existingEvent.endDateTime);
      setStartTime(start.format("HH:mm"));
      setDurationMinutes(String(Math.max(end.diff(start, "minute"), 15)));
      setSessionTypeId(existingEvent.sessionTypeId || preferredSessionType?._id || "");
      return;
    }

    const nextPreferred = preferredSessionType || null;
    setStartTime("09:00");
    setDurationMinutes(String(nextPreferred?.durationMinutes || 60));
    setSessionTypeId(nextPreferred?._id || "");
  }, [existingEvent?._id, open, preferredSessionType, selectedWorkout]);

  const handleSessionTypeChange = (event) => {
    const nextId = event.target.value;
    setSessionTypeId(nextId);

    const nextType = sessionTypes.find((type) => type._id === nextId);
    if (nextType?.durationMinutes) {
      setDurationMinutes(String(nextType.durationMinutes));
    }
  };

  const handleSave = async () => {
    if (!selectedWorkout?._id || !trainerAccessToken) return;

    const clientId = getWorkoutUserId(selectedWorkout);
    const workoutDate = selectedWorkout?.date
      ? dayjs.utc(selectedWorkout.date).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const startDateTime = dayjs(`${workoutDate}T${startTime || "09:00"}`).toISOString();
    const duration = Math.max(Number(durationMinutes) || Number(preferredSessionType?.durationMinutes) || 60, 15);
    const endDateTime = dayjs(startDateTime).add(duration, "minute").toISOString();
    const payload = {
      startDateTime,
      endDateTime,
      eventType: "APPOINTMENT",
      status: selectedWorkout.complete ? "COMPLETED" : "BOOKED",
      clientId,
      workoutId: selectedWorkout._id,
      sessionTypeId: sessionTypeId || null,
    };

    setSaving(true);
    setEventStatus("");

    const result = existingEvent?._id
      ? await dispatch(updateScheduleEvent(existingEvent._id, payload, trainerAccessToken))
      : await dispatch(createScheduleEvent(payload, trainerAccessToken));

    setSaving(false);

    if (result?.error) {
      setEventStatus(result.error);
      return;
    }

    if (result?.event) {
      setExistingEvent(result.event);
      onSaved && onSaved(result.event, selectedWorkout);
      onClose();
    }
  };

  const handleRemove = async () => {
    if (!existingEvent?._id || !trainerAccessToken) return;

    setSaving(true);
    setEventStatus("");

    const result = await dispatch(deleteScheduleEvent(existingEvent._id, trainerAccessToken));

    setSaving(false);

    if (result?.error) {
      setEventStatus(result.error);
      return;
    }

    setExistingEvent(null);
    onSaved && onSaved(null, selectedWorkout);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {existingEvent ? "Edit Trainer Session" : "Mark as Trainer Session"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ paddingTop: "8px" }}>
          {!canManageTrainerSessions && (
            <Alert severity="warning">
              Trainer access is required. Return to your trainer account and try again.
            </Alert>
          )}
          {sessionTypesStatus && (
            <Alert severity="warning">
              {sessionTypesStatus}
            </Alert>
          )}
          {eventStatus && (
            <Alert severity="error">
              {eventStatus}
            </Alert>
          )}
          {workouts.length > 1 && (
            <FormControl fullWidth>
              <InputLabel id="trainer-session-workout-select-label">Workout</InputLabel>
              <Select
                labelId="trainer-session-workout-select-label"
                label="Workout"
                value={selectedWorkoutId}
                onChange={(event) => setSelectedWorkoutId(event.target.value)}
              >
                {workouts.map((workout) => (
                  <MenuItem key={workout._id} value={workout._id}>
                    {getWorkoutSelectLabel(workout)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {selectedWorkout && (
            <Alert severity="info" variant="outlined">
              This will {existingEvent ? "update" : "create"} a booked appointment in the scheduler for{" "}
              <strong>{getWorkoutDateLabel(selectedWorkout)}</strong>.
            </Alert>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Workout Date"
              value={getWorkoutDateLabel(selectedWorkout)}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={!canManageTrainerSessions || eventLoading}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="trainer-session-type-select-label">Session Type</InputLabel>
              <Select
                labelId="trainer-session-type-select-label"
                label="Session Type"
                value={sessionTypeId}
                onChange={handleSessionTypeChange}
                disabled={!canManageTrainerSessions || eventLoading || sessionTypes.length === 0}
              >
                <MenuItem value="">
                  No session type
                </MenuItem>
                {sessionTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              inputProps={{ min: 15, step: 15 }}
              fullWidth
              disabled={!canManageTrainerSessions || eventLoading}
            />
          </Stack>
          {existingEvent && (
            <Typography variant="caption" color="text.secondary">
              Scheduler time: {dayjs(existingEvent.startDateTime).format("h:mm A")} -{" "}
              {dayjs(existingEvent.endDateTime).format("h:mm A")}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {existingEvent && (
          <Button color="error" onClick={handleRemove} disabled={saving || !canManageTrainerSessions}>
            Remove
          </Button>
        )}
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!selectedWorkout?._id || saving || eventLoading || !canManageTrainerSessions}
        >
          {existingEvent ? "Update Session" : "Save Session"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
