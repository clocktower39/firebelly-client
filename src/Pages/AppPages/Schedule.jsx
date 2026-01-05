import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import {
  cancelScheduleEvent,
  createTrainingForAccount,
  createScheduleEvent,
  requestWorkoutsByMonth,
  requestBooking,
  requestClients,
  requestMyTrainers,
  requestScheduleRange,
  requestWorkoutQueue,
  respondBooking,
  updateScheduleEvent,
} from "../../Redux/actions";

dayjs.extend(utc);

const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const buildWeeklyRule = (date) => {
  const dayCode = dayCodes[dayjs(date).day()];
  return `FREQ=WEEKLY;BYDAY=${dayCode};INTERVAL=1`;
};

const buildScopeKey = (trainerId, clientId) => `${trainerId || "me"}:${clientId || "all"}`;

const formatRange = (event) =>
  `${dayjs(event.startDateTime).format("h:mm A")} - ${dayjs(event.endDateTime).format("h:mm A")}`;

const scheduleColors = {
  APPOINTMENT: "primary",
  INDEPENDENT: "secondary",
  AVAILABILITY: "info",
};

const statusColors = {
  OPEN: "success",
  REQUESTED: "warning",
  BOOKED: "primary",
  COMPLETED: "default",
  CANCELLED: "error",
};

export default function Schedule() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const myTrainers = useSelector((state) => state.myTrainers);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openAttachDialog, setOpenAttachDialog] = useState(false);
  const [activeRequestEvent, setActiveRequestEvent] = useState(null);
  const [attachEvent, setAttachEvent] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [queueTargetEventId, setQueueTargetEventId] = useState("");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [availabilityType, setAvailabilityType] = useState("MANUAL");
  const [availabilityRecurrence, setAvailabilityRecurrence] = useState("none");

  const [bookingType, setBookingType] = useState("one-time");

  useEffect(() => {
    if (user.isTrainer) {
      dispatch(requestClients());
      setSelectedTrainerId(user._id);
    } else {
      dispatch(requestMyTrainers());
    }
  }, [dispatch, user._id, user.isTrainer]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clientId = params.get("client");
    const trainerId = params.get("trainer");

    if (user.isTrainer && clientId) {
      setSelectedClientId(clientId);
    }
    if (!user.isTrainer && trainerId) {
      setSelectedTrainerId(trainerId);
    }
  }, [location.search, user.isTrainer]);

  const clientParam = new URLSearchParams(location.search).get("client");
  const selectedClientLabel = clients.find(
    (clientRel) => clientRel.client?._id === selectedClientId
  );

  const handleClearClientFilter = () => {
    setSelectedClientId("");
    navigate("/schedule");
  };

  useEffect(() => {
    if (!user.isTrainer && myTrainers?.length && !selectedTrainerId) {
      const firstAccepted = myTrainers.find((trainer) => trainer.accepted);
      if (firstAccepted) setSelectedTrainerId(firstAccepted.trainer);
    }
  }, [myTrainers, selectedTrainerId, user.isTrainer]);

  const refreshSchedule = () => {
    if (!selectedTrainerId) return;
    const monthStart = selectedDate.startOf("month").startOf("day").toISOString();
    const monthEnd = selectedDate.startOf("month").add(1, "month").startOf("day").toISOString();
    dispatch(
      requestScheduleRange({
        startDate: monthStart,
        endDate: monthEnd,
        trainerId: selectedTrainerId,
        clientId: user.isTrainer ? selectedClientId || null : user._id,
        includeAvailability: true,
      })
    );
  };

  useEffect(() => {
    refreshSchedule();
  }, [dispatch, selectedDate, selectedTrainerId, selectedClientId, user.isTrainer, user._id]);

  const scopeKey = buildScopeKey(
    selectedTrainerId || user._id,
    user.isTrainer ? selectedClientId || null : user._id
  );

  const scheduleData = useSelector((state) => state.scheduleEvents?.[scopeKey]) || {
    events: [],
  };

  const clientLookup = useMemo(
    () =>
      new Map(
        clients.map((clientRel) => [
          clientRel.client?._id,
          `${clientRel.client?.firstName || ""} ${clientRel.client?.lastName || ""}`.trim(),
        ])
      ),
    [clients]
  );
  const selectedTrainerLabel = useMemo(() => {
    const trainer = myTrainers.find((item) => item.trainer === selectedTrainerId);
    if (!trainer) return "";
    return `${trainer.firstName} ${trainer.lastName}`.trim();
  }, [myTrainers, selectedTrainerId]);

  const attachAccountId =
    attachEvent?.clientId || (user.isTrainer ? selectedClientId : user._id) || user._id;
  const availableWorkouts =
    useSelector((state) => state.workouts?.[attachAccountId]?.workouts) || [];
  const queueAccountId = user.isTrainer ? selectedClientId || null : user._id;
  const queuedWorkouts =
    useSelector((state) => state.workoutQueue?.[queueAccountId || "me"]) || [];

  useEffect(() => {
    if (!queueAccountId) return;
    if (user.isTrainer) {
      dispatch(requestWorkoutQueue(queueAccountId, selectedDate.format("YYYY-MM-DD")));
    }
  }, [dispatch, queueAccountId, selectedDate, user.isTrainer]);
  const attachWorkouts = useMemo(() => availableWorkouts, [availableWorkouts]);
  const attachQueuedWorkouts =
    useSelector((state) => state.workoutQueue?.[attachAccountId || "me"]) || [];

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

  const handleOpenAvailability = () => {
    setAvailabilityType("MANUAL");
    setAvailabilityRecurrence("none");
    setOpenAvailabilityDialog(true);
  };

  const handleCreateAvailability = async () => {
    if (!selectedTrainerId) return;
    const dateBase = selectedDate.format("YYYY-MM-DD");
    const startDateTime = dayjs(`${dateBase}T${startTime}`).toISOString();
    const endDateTime = dayjs(`${dateBase}T${endTime}`).toISOString();
    const isNormal = availabilityType === "NORMAL";
    const isRecurring = availabilityRecurrence === "weekly";

    await dispatch(
      createScheduleEvent({
        startDateTime,
        endDateTime,
        eventType: "AVAILABILITY",
        status: "OPEN",
        availabilitySource: isNormal ? "NORMAL" : "MANUAL",
        recurrenceRule: isRecurring ? buildWeeklyRule(selectedDate) : null,
      })
    );

    setOpenAvailabilityDialog(false);
    refreshSchedule();
  };

  const handleRequestBooking = async () => {
    if (!activeRequestEvent) return;
    const isRecurring = bookingType === "recurring";
    await dispatch(
      requestBooking({
        availabilityEventId: activeRequestEvent._id,
        trainerId: activeRequestEvent.trainerId,
        startDateTime: activeRequestEvent.startDateTime,
        endDateTime: activeRequestEvent.endDateTime,
        isRecurring,
        recurrenceRule: isRecurring ? activeRequestEvent.recurrenceRule : null,
      })
    );
    setOpenRequestDialog(false);
    setActiveRequestEvent(null);
    refreshSchedule();
  };

  const handleTrainerResponse = async (eventId, status) => {
    await dispatch(respondBooking({ _id: eventId, status }));
    refreshSchedule();
  };

  const handleCancelEvent = async (eventId) => {
    await dispatch(cancelScheduleEvent(eventId));
    refreshSchedule();
  };

  const openRequestForEvent = (event) => {
    setActiveRequestEvent(event);
    setBookingType("one-time");
    setOpenRequestDialog(true);
  };

  const openAttachForEvent = (event) => {
    setAttachEvent(event);
    setSelectedWorkoutId("");
    setOpenAttachDialog(true);

    const targetClient = event.clientId
      ? { _id: event.clientId }
      : user.isTrainer && selectedClientId
      ? { _id: selectedClientId }
      : user;
    dispatch(requestWorkoutsByMonth(dayjs(event.startDateTime).format("YYYY-MM-DD"), targetClient));
    dispatch(
      requestWorkoutQueue(
        event.clientId || selectedClientId || user._id,
        dayjs(event.startDateTime).format("YYYY-MM-DD")
      )
    );
  };

  const handleAttachWorkout = async () => {
    if (!attachEvent || !selectedWorkoutId) return;
    const updates =
      attachEvent.eventType === "AVAILABILITY"
        ? {
            workoutId: selectedWorkoutId,
            clientId: selectedClientId,
            eventType: "APPOINTMENT",
            status: "BOOKED",
          }
        : { workoutId: selectedWorkoutId };
    await dispatch(updateScheduleEvent(attachEvent._id, updates));
    setOpenAttachDialog(false);
    setAttachEvent(null);
    refreshSchedule();
  };

  const handleCreateWorkout = async () => {
    if (!attachEvent) return;
    const created = await dispatch(
      createTrainingForAccount({
        training: { date: attachEvent.startDateTime },
        accountId: attachAccountId,
      })
    );
    if (created?._id) {
      await dispatch(updateScheduleEvent(attachEvent._id, { workoutId: created._id }));
      setOpenAttachDialog(false);
      setAttachEvent(null);
      refreshSchedule();
    }
  };

  const queueEvents = useMemo(
    () =>
      dayEvents.filter((event) => {
        if (event.workoutId) return false;
        if (event.status === "CANCELLED") return false;
        if (event.eventType === "AVAILABILITY") {
          return user.isTrainer && !!selectedClientId && event.status === "OPEN";
        }
        return true;
      }),
    [dayEvents, selectedClientId, user.isTrainer]
  );

  useEffect(() => {
    if (queueEvents.length > 0) {
      setQueueTargetEventId((prev) => prev || queueEvents[0]._id);
    } else {
      setQueueTargetEventId("");
    }
  }, [queueEvents]);

  const handleAttachQueuedWorkout = async (workoutId) => {
    const targetEvent = queueEvents.find((event) => event._id === queueTargetEventId);
    if (!targetEvent) return;
    const updates =
      targetEvent.eventType === "AVAILABILITY"
        ? {
            workoutId,
            clientId: selectedClientId,
            eventType: "APPOINTMENT",
            status: "BOOKED",
          }
        : { workoutId };
    await dispatch(updateScheduleEvent(targetEvent._id, updates));
    await dispatch(requestWorkoutQueue(queueAccountId, selectedDate.format("YYYY-MM-DD")));
    refreshSchedule();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container size={12} spacing={2}>
        <Grid container size={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="h4">Schedule</Typography>
            {user.isTrainer && (
              <Button variant="contained" onClick={handleOpenAvailability}>
                Open Slot
              </Button>
            )}
          </Stack>
          {user.isTrainer && clientParam && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Button component={Link} to="/clients" size="small" variant="outlined">
                Back to Clients
              </Button>
              <Chip
                label={
                  selectedClientLabel
                    ? `Client: ${selectedClientLabel.client.firstName} ${selectedClientLabel.client.lastName}`
                    : "Client filter"
                }
                onDelete={handleClearClientFilter}
                size="small"
                color="primary"
              />
              <Typography variant="body2" color="text.secondary">
                Viewing:{" "}
                {selectedClientLabel
                  ? `${selectedClientLabel.client.firstName} ${selectedClientLabel.client.lastName}`
                  : "Client schedule"}
              </Typography>
            </Stack>
          )}
        </Grid>

        <Grid container size={{ xs: 12, md: 4 }} sx={{ alignItems: "flex-start" }}>
          <Card sx={{ width: "100%", overflow: "visible" }}>
            <CardContent>
              {!user.isTrainer && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Trainer</InputLabel>
                  <Select
                    label="Trainer"
                    value={selectedTrainerId}
                    onChange={(event) => setSelectedTrainerId(event.target.value)}
                  >
                    {myTrainers
                      .filter((trainer) => trainer.accepted)
                      .map((trainer) => (
                        <MenuItem key={trainer.trainer} value={trainer.trainer}>
                          {trainer.firstName} {trainer.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              {user.isTrainer && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Client (optional)</InputLabel>
                  <Select
                    label="Client (optional)"
                    value={selectedClientId}
                    onChange={(event) => setSelectedClientId(event.target.value)}
                  >
                    <MenuItem value="">All clients</MenuItem>
                    {clients
                      .filter((clientRel) => clientRel.accepted)
                      .map((clientRel) => (
                        <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                          {clientRel.client.firstName} {clientRel.client.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Box sx={{ minWidth: 320 }}>
                  <DateCalendar value={selectedDate} onChange={setSelectedDate} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid container size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
              <Typography variant="h6">
                {selectedDate.format("dddd, MMMM D")}
              </Typography>
              {user.isTrainer && !selectedClientId && (
                <Typography variant="body2" color="text.secondary">
                  Select a client to attach workouts to availability slots.
                </Typography>
              )}
            </Stack>
            {user.isTrainer && clientParam && (
              <Card sx={{ borderLeft: "4px solid", borderColor: "primary.main" }}>
                <CardContent>
                  <Typography variant="body2">
                    Filter applied: showing schedule for{" "}
                    {selectedClientLabel
                      ? `${selectedClientLabel.client.firstName} ${selectedClientLabel.client.lastName}`
                      : "this client"}
                    .
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleClearClientFilter}
                    sx={{ mt: 1, px: 0 }}
                  >
                    Clear filter
                  </Button>
                </CardContent>
              </Card>
            )}
            {dayEvents.length === 0 && (
              <Card>
                <CardContent>
                  <Typography color="text.secondary">No schedule events.</Typography>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent>
                <Typography variant="h6">Schedule Events</Typography>
              </CardContent>
            </Card>
            {dayEvents.map((event) => (
              <Card key={event._id} variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={event.eventType}
                        color={scheduleColors[event.eventType] || "default"}
                        size="small"
                      />
                      <Chip
                        label={event.status}
                        color={statusColors[event.status] || "default"}
                        size="small"
                      />
                      {event.availabilitySource && (
                        <Chip label={event.availabilitySource} size="small" />
                      )}
                    </Stack>
                    <Typography variant="subtitle1">{formatRange(event)}</Typography>
                    {user.isTrainer && event.clientId && (
                      <Typography variant="body2" color="text.secondary">
                        Client: {clientLookup.get(event.clientId) || "Assigned client"}
                      </Typography>
                    )}
                    {!user.isTrainer && selectedTrainerId && (
                      <Typography variant="body2" color="text.secondary">
                        Trainer: {selectedTrainerLabel || "Trainer"}
                      </Typography>
                    )}
                    {event.recurrenceRule && (
                      <Typography variant="caption" color="text.secondary">
                        Recurring availability
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {event.workoutId && (
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/workout/${event.workoutId}?event=${event._id}`}
                        >
                          Open Workout
                        </Button>
                      )}
                      {user.isTrainer &&
                        !event.workoutId &&
                        event.status !== "CANCELLED" &&
                        (event.eventType !== "AVAILABILITY" || selectedClientId) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openAttachForEvent(event)}
                          >
                            Attach Workout
                          </Button>
                        )}
                      {user.isTrainer && event.status === "REQUESTED" && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleTrainerResponse(event._id, "BOOKED")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleTrainerResponse(event._id, "CANCELLED")}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {user.isTrainer && event.status === "OPEN" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCancelEvent(event._id)}
                        >
                          Close Slot
                        </Button>
                      )}
                      {!user.isTrainer &&
                        event.eventType === "AVAILABILITY" &&
                        event.status === "OPEN" && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openRequestForEvent(event)}
                          >
                            Request
                          </Button>
                        )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {user.isTrainer && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Unassigned Workouts</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose an event to attach a workout. Availability slots will become booked
                      appointments for the selected client.
                    </Typography>
                    {!selectedClientId && (
                      <Typography color="text.secondary">
                        Select a client to load their unassigned workouts and attach to slots.
                      </Typography>
                    )}
                    <FormControl fullWidth>
                      <InputLabel>Attach to event</InputLabel>
                      <Select
                        label="Attach to event"
                        value={queueTargetEventId}
                        onChange={(event) => setQueueTargetEventId(event.target.value)}
                        disabled={queueEvents.length === 0}
                      >
                        {queueEvents.map((event) => (
                          <MenuItem key={event._id} value={event._id}>
                            {dayjs(event.startDateTime).format("h:mm A")} -{" "}
                            {dayjs(event.endDateTime).format("h:mm A")} •{" "}
                            {event.eventType === "AVAILABILITY" ? "Open slot" : event.eventType}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {queueEvents.length === 0 && (
                      <Typography color="text.secondary">
                        No attachable events on this day. Create or book an appointment first.
                      </Typography>
                    )}
                    {queuedWorkouts.length === 0 ? (
                      <Typography color="text.secondary">
                        {selectedClientId
                          ? "No unassigned workouts."
                          : "Choose a client to load unassigned workouts."}
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {queuedWorkouts.map((workout) => (
                          <Card key={workout._id} variant="outlined">
                            <CardContent>
                              <Stack spacing={1}>
                                <Typography variant="subtitle1">
                                  {workout.title || "Untitled"}
                                </Typography>
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
                                    disabled={!queueTargetEventId}
                                    onClick={() => handleAttachQueuedWorkout(workout._id)}
                                  >
                                    Attach to event
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={openAvailabilityDialog}
        onClose={() => setOpenAvailabilityDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Open Availability</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Start time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <ToggleButtonGroup
              exclusive
              value={availabilityType}
              onChange={(event, value) => value && setAvailabilityType(value)}
              size="small"
            >
              <ToggleButton value="MANUAL">One-off</ToggleButton>
              <ToggleButton value="NORMAL">Normal schedule</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              exclusive
              value={availabilityRecurrence}
              onChange={(event, value) => value && setAvailabilityRecurrence(value)}
              size="small"
            >
              <ToggleButton value="none">No recurrence</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
            </ToggleButtonGroup>
            {availabilityType === "NORMAL" && availabilityRecurrence !== "weekly" && (
              <Typography variant="caption" color="text.secondary">
                Normal schedule entries should be recurring.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvailabilityDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAvailability}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Request Appointment</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {activeRequestEvent && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle1">{formatRange(activeRequestEvent)}</Typography>
              <ToggleButtonGroup
                exclusive
                value={bookingType}
                onChange={(event, value) => value && setBookingType(value)}
                size="small"
              >
                <ToggleButton value="one-time">One-time</ToggleButton>
                <ToggleButton
                  value="recurring"
                  disabled={
                    activeRequestEvent.availabilitySource !== "NORMAL" ||
                    !activeRequestEvent.recurrenceRule
                  }
                >
                  Recurring
                </ToggleButton>
              </ToggleButtonGroup>
              {activeRequestEvent.availabilitySource === "MANUAL" && (
                <Typography variant="caption" color="text.secondary">
                  Manual slots cannot be booked as recurring.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRequestBooking}>
            Send request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAttachDialog}
        onClose={() => setOpenAttachDialog(false)}
        maxWidth="xs"
        fullWidth
      >
      <DialogTitle>Attach Workout</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Workouts listed here include any dated workouts in this month and queued workouts.
          </Typography>
          {attachEvent?.eventType === "AVAILABILITY" && !selectedClientId && (
            <Typography color="text.secondary">
              Select a client first to attach a workout to an open slot.
            </Typography>
          )}
          <FormControl fullWidth>
              <InputLabel>Workout</InputLabel>
              <Select
                label="Workout"
                value={selectedWorkoutId}
                onChange={(event) => setSelectedWorkoutId(event.target.value)}
              >
                {attachWorkouts.map((workout) => (
                  <MenuItem key={workout._id} value={workout._id}>
                    {workout.title || "Untitled"} -{" "}
                    {dayjs(workout.date).format("MMM D")}
                  </MenuItem>
                ))}
                {attachQueuedWorkouts.map((workout) => (
                  <MenuItem key={workout._id} value={workout._id}>
                    {workout.title || "Untitled"} - Queued
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleCreateWorkout}>
              Create New Workout
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttachDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAttachWorkout} disabled={!selectedWorkoutId}>
            Attach
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
