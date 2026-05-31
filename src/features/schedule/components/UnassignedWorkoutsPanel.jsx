import React from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function UnassignedWorkoutsPanel({
  isTrainerView,
  queueTargetEventId,
  setQueueTargetEventId,
  attachableEvents,
  queueTargetEvent,
  queueBookingStartOptions,
  selectedQueueSlot,
  setSelectedQueueSlot,
  queueBookingEndOptions,
  selectedQueueEndSlot,
  setSelectedQueueEndSlot,
  visibleQueuedWorkouts,
  selectedClientIds,
  clientLookup,
  serverURL,
  handleAttachQueuedWorkout,
}) {
  if (!isTrainerView) return null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Unassigned Workouts</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose an event to attach a workout. Availability slots will become booked appointments
            for the workout's client.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Attach to event</InputLabel>
            <Select
              label="Attach to event"
              value={queueTargetEventId}
              onChange={(event) => setQueueTargetEventId(event.target.value)}
              disabled={false}
            >
              {attachableEvents.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {dayjs(event.startDateTime).format("h:mm A")} -{" "}
                  {dayjs(event.endDateTime).format("h:mm A")} •{" "}
                  {event.eventType === "AVAILABILITY" ? "Open slot" : event.eventType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {queueTargetEvent?.eventType === "AVAILABILITY" && (
            <>
              {queueBookingStartOptions.length > 0 ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Start time</InputLabel>
                    <Select
                      label="Start time"
                      value={selectedQueueSlot}
                      onChange={(event) => setSelectedQueueSlot(event.target.value)}
                    >
                      {queueBookingStartOptions.map((slot) => (
                        <MenuItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>End time</InputLabel>
                    <Select
                      label="End time"
                      value={selectedQueueEndSlot}
                      onChange={(event) => setSelectedQueueEndSlot(event.target.value)}
                    >
                      {queueBookingEndOptions.map((slot) => (
                        <MenuItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  This availability range does not include any bookable times.
                </Typography>
              )}
            </>
          )}
          {attachableEvents.length === 0 && (
            <Typography color="text.secondary">
              No attachable events on this day. Create or book an appointment first.
            </Typography>
          )}
          {visibleQueuedWorkouts.length === 0 ? (
            <Typography color="text.secondary">
              {selectedClientIds.length
                ? "No unassigned workouts."
                : "No unassigned workouts found."}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {visibleQueuedWorkouts.map((workout) => {
                const workoutUserId =
                  typeof workout.user === "object" ? workout.user?._id : workout.user;
                const isClientMatch =
                  !queueTargetEvent?.clientId ||
                  String(queueTargetEvent.clientId) === String(workoutUserId);
                const disableAttach =
                  !queueTargetEventId ||
                  (queueTargetEvent?.eventType === "AVAILABILITY" &&
                    (!selectedQueueSlot || !selectedQueueEndSlot));
                const workoutClientName =
                  clientLookup.get(workoutUserId) ||
                  (typeof workout.user === "object"
                    ? `${workout.user.firstName || ""} ${workout.user.lastName || ""}`.trim()
                    : "Client");

                return (
                  <Card key={workout._id} variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle1">
                          {workout.title || "Untitled"}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={
                              workout.user?.profilePicture
                                ? `${serverURL}/user/profilePicture/${workout.user.profilePicture}`
                                : undefined
                            }
                            sx={{ width: 28, height: 28 }}
                          >
                            {workoutClientName ? workoutClientName[0] : "C"}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {workoutClientName || "Client"}
                          </Typography>
                        </Stack>
                        {workout.category?.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {workout.category.join(", ")}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/workout/${workout._id}`}
                          >
                            Open
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={disableAttach}
                            onClick={() => handleAttachQueuedWorkout(workout._id)}
                          >
                            Attach to event
                          </Button>
                        </Stack>
                        {queueTargetEvent?.clientId && !isClientMatch && (
                          <Typography variant="caption" color="text.secondary">
                            This workout belongs to a different client than the selected event.
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
