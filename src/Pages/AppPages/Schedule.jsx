import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Autocomplete,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Avatar,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toPng } from "html-to-image";
import SelectedDate from "../../Components/SelectedDate";
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
  trainerBookAvailability,
  serverURL,
  deleteScheduleEvent,
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

const WEEK_START_HOUR = 6;
const WEEK_END_HOUR = 20;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 28;
const HEADER_HEIGHT = 56;

export default function Schedule() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const myTrainers = useSelector((state) => state.myTrainers);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedMyTrainerId, setSelectedMyTrainerId] = useState("");
  const [bookingAsClient, setBookingAsClient] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [hasClientSelection, setHasClientSelection] = useState(false);
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openAttachDialog, setOpenAttachDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [activeRequestEvent, setActiveRequestEvent] = useState(null);
  const [attachEvent, setAttachEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [queueTargetEventId, setQueueTargetEventId] = useState("");
  const [dragSelection, setDragSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [availabilityType, setAvailabilityType] = useState("MANUAL");
  const [availabilityRecurrence, setAvailabilityRecurrence] = useState("none");

  const [bookingType, setBookingType] = useState("one-time");
  const [selectedBookingSlot, setSelectedBookingSlot] = useState("");
  const [editDate, setEditDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("10:00");
  const [editStatus, setEditStatus] = useState("OPEN");
  const [editClientId, setEditClientId] = useState("");
  const [editWorkoutId, setEditWorkoutId] = useState("");
  const [editCustomName, setEditCustomName] = useState("");
  const [editCustomEmail, setEditCustomEmail] = useState("");
  const [editCustomPhone, setEditCustomPhone] = useState("");
  const [quickBookClientId, setQuickBookClientId] = useState("");
  const [quickBookWorkoutId, setQuickBookWorkoutId] = useState("");
  const [quickBookCustomName, setQuickBookCustomName] = useState("");
  const [quickBookCustomEmail, setQuickBookCustomEmail] = useState("");
  const [quickBookCustomPhone, setQuickBookCustomPhone] = useState("");
  const [openSelectionDialog, setOpenSelectionDialog] = useState(false);
  const [selectedQueueSlot, setSelectedQueueSlot] = useState("");
  const [selectionStartTime, setSelectionStartTime] = useState("");
  const [selectionEndTime, setSelectionEndTime] = useState("");
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [copySourceEvent, setCopySourceEvent] = useState(null);
  const [copyDate, setCopyDate] = useState("");
  const [copyStartTime, setCopyStartTime] = useState("");
  const [copyEndTime, setCopyEndTime] = useState("");
  const [openCopyDayDialog, setOpenCopyDayDialog] = useState(false);
  const [openCopyWeekDialog, setOpenCopyWeekDialog] = useState(false);
  const [copyDayDate, setCopyDayDate] = useState("");
  const [copyWeekDate, setCopyWeekDate] = useState("");
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareHideDetails, setShareHideDetails] = useState(true);
  const [shareIncludeHeader, setShareIncludeHeader] = useState(true);
  const [shareInProgress, setShareInProgress] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [isShareMode, setIsShareMode] = useState(false);
  const [shareLinkStatus, setShareLinkStatus] = useState("");

  const weekCaptureRef = useRef(null);

  const isTrainerView = user.isTrainer && !bookingAsClient;
  const isClientView = !isTrainerView;

  useEffect(() => {
    if (user.isTrainer) {
      dispatch(requestClients());
      dispatch(requestMyTrainers());
    } else {
      dispatch(requestMyTrainers());
    }
  }, [dispatch, user.isTrainer]);

  useEffect(() => {
    if (!user.isTrainer) return;
    if (bookingAsClient && selectedMyTrainerId) {
      setSelectedTrainerId(selectedMyTrainerId);
      return;
    }
    if (bookingAsClient && !selectedMyTrainerId) {
      setSelectedTrainerId("");
      return;
    }
    if (!bookingAsClient) {
      setSelectedTrainerId(user._id);
    }
  }, [bookingAsClient, selectedMyTrainerId, user._id, user.isTrainer]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clientId = params.get("client");
    const trainerId = params.get("trainer");

    if (isTrainerView && clientId) {
      setSelectedClientIds([clientId]);
      setHasClientSelection(true);
    }
    if (isClientView && trainerId) {
      setSelectedTrainerId(trainerId);
      if (user.isTrainer) {
        setSelectedMyTrainerId(trainerId);
      }
    }
  }, [isClientView, isTrainerView, location.search, user.isTrainer]);

  const clientParam = new URLSearchParams(location.search).get("client");
  const selectedClientLabel = clients.find(
    (clientRel) => clientRel.client?._id === selectedClientIds[0]
  );

  const handleClearClientFilter = () => {
    setSelectedClientIds([]);
    setHasClientSelection(true);
    navigate("/sessions");
  };

  useEffect(() => {
    if (user.isTrainer && !bookingAsClient) return;
    if (myTrainers?.length && !selectedTrainerId) {
      const firstAccepted = myTrainers.find((trainer) => trainer.accepted);
      if (firstAccepted) {
        setSelectedTrainerId(firstAccepted.trainer);
        if (user.isTrainer) {
          setSelectedMyTrainerId(firstAccepted.trainer);
        }
      }
    }
  }, [bookingAsClient, myTrainers, selectedTrainerId, user.isTrainer]);

  const refreshSchedule = () => {
    const effectiveTrainerId = isTrainerView ? user._id : selectedTrainerId;
    if (!effectiveTrainerId) return;
    const monthStart = selectedDate.startOf("month").startOf("day").toISOString();
    const monthEnd = selectedDate.startOf("month").add(1, "month").startOf("day").toISOString();
    const requestedClientId =
      isTrainerView && selectedClientIds.length === 1 ? selectedClientIds[0] : null;
    dispatch(
      requestScheduleRange({
        startDate: monthStart,
        endDate: monthEnd,
        trainerId: effectiveTrainerId,
        clientId: isTrainerView ? requestedClientId : user._id,
        includeAvailability: true,
      })
    );
  };

  useEffect(() => {
    refreshSchedule();
  }, [dispatch, isTrainerView, selectedDate, selectedTrainerId, selectedClientIds, user._id]);

  const scopeKey = buildScopeKey(
    isTrainerView ? user._id : selectedTrainerId,
    isTrainerView ? (selectedClientIds.length === 1 ? selectedClientIds[0] : null) : user._id
  );

  const scheduleData = useSelector((state) => state.scheduleEvents?.[scopeKey]) || {
    events: [],
  };
  const workoutsByAccount = useSelector((state) => state.workouts) || {};
  const workoutQueue = useSelector((state) => state.workoutQueue) || {};

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
  const clientProfileLookup = useMemo(
    () => new Map(clients.map((clientRel) => [clientRel.client?._id, clientRel.client])),
    [clients]
  );
  const selectedTrainerLabel = useMemo(() => {
    const trainer = myTrainers.find((item) => item.trainer === selectedTrainerId);
    if (!trainer) return "";
    return `${trainer.firstName} ${trainer.lastName}`.trim();
  }, [myTrainers, selectedTrainerId]);
  const getEventDisplayName = useCallback(
    (event) => {
      if (isShareMode && shareHideDetails) return "Booked";
      if (isTrainerView) {
        if (event?.customClientName) return event.customClientName;
        if (event?.clientId) return clientLookup.get(event.clientId) || "Assigned client";
        return "Booked";
      }
      if (String(event?.clientId) === String(user._id)) {
        return `${user.firstName || ""} ${user.lastName || ""}`.trim();
      }
      return "Booked";
    },
    [clientLookup, isShareMode, shareHideDetails, isTrainerView, user._id, user.firstName, user.lastName]
  );

  const activeClientIds = useMemo(() => {
    if (!isTrainerView) return [];
    if (selectedClientIds.length > 0) return selectedClientIds;
    return [];
  }, [isTrainerView, selectedClientIds]);

  const attachAccountId =
    attachEvent?.clientId ||
    (isTrainerView && selectedClientIds.length === 1 ? selectedClientIds[0] : null) ||
    user._id;
  const availableWorkouts =
    useSelector((state) => state.workouts?.[attachAccountId]?.workouts) || [];
  const queueAccountIds = useMemo(
    () => (isTrainerView ? activeClientIds : [user._id]),
    [activeClientIds, isTrainerView, user._id]
  );
  const queuedWorkouts =
    useSelector((state) => {
      if (!isTrainerView) {
        return state.workoutQueue?.[user._id] || [];
      }
      return queueAccountIds.flatMap(
        (clientId) => state.workoutQueue?.[clientId] || []
      );
    }) || [];
  const visibleQueuedWorkouts = useMemo(() => {
    const selectedDateKey = selectedDate.format("YYYY-MM-DD");
    return queuedWorkouts.filter(
      (workout) =>
        workout.date &&
        dayjs.utc(workout.date).format("YYYY-MM-DD") === selectedDateKey
    );
  }, [queuedWorkouts, selectedDate]);

  useEffect(() => {
    if (isTrainerView) {
      queueAccountIds.forEach((clientId) => {
        dispatch(requestWorkoutQueue(clientId, selectedDate.format("YYYY-MM-DD")));
      });
    }
  }, [dispatch, isTrainerView, queueAccountIds, selectedDate]);
  const attachWorkouts = useMemo(() => {
    if (!isTrainerView) return availableWorkouts;
    if (attachEvent?.clientId || selectedClientIds.length === 1) return availableWorkouts;
    return activeClientIds.flatMap((clientId) => workoutsByAccount?.[clientId]?.workouts || []);
  }, [activeClientIds, attachEvent?.clientId, availableWorkouts, selectedClientIds, isTrainerView, workoutsByAccount]);
  const attachQueuedWorkouts = useSelector((state) => {
    if (!isTrainerView) return state.workoutQueue?.[user._id] || [];
    if (attachEvent?.clientId || selectedClientIds.length === 1) {
      return state.workoutQueue?.[attachAccountId || "me"] || [];
    }
    return activeClientIds.flatMap((clientId) => state.workoutQueue?.[clientId] || []);
  });

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

  const handleOpenAvailability = () => {
    setAvailabilityType("MANUAL");
    setAvailabilityRecurrence("none");
    setOpenAvailabilityDialog(true);
  };

  const handleCreateAvailability = async () => {
    if (!isTrainerView) return;
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
    const slot = availableBookingSlots.find((item) => item.value === selectedBookingSlot);
    const bookingStart = slot ? slot.start.toISOString() : activeRequestEvent.startDateTime;
    const bookingEnd = slot ? slot.end.toISOString() : activeRequestEvent.endDateTime;
    await dispatch(
      requestBooking({
        availabilityEventId: activeRequestEvent._id,
        trainerId: activeRequestEvent.trainerId,
        startDateTime: bookingStart,
        endDateTime: bookingEnd,
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

  const handleDeleteEvent = async (eventId) => {
    if (!eventId) return;
    await dispatch(deleteScheduleEvent(eventId));
    setOpenDeleteDialog(false);
    setDeleteEvent(null);
    refreshSchedule();
  };

  const openDeleteConfirm = (event) => {
    setDeleteEvent(event);
    setOpenDeleteDialog(true);
  };

  const handleReopenEvent = async (event) => {
    await dispatch(
      updateScheduleEvent(event._id, {
        clientId: null,
        workoutId: null,
        eventType: "AVAILABILITY",
        status: "OPEN",
      })
    );
    refreshSchedule();
  };

  const openRequestForEvent = (event) => {
    setActiveRequestEvent(event);
    setBookingType("one-time");
    setSelectedBookingSlot("");
    setOpenRequestDialog(true);
  };

  const availableBookingSlots = useMemo(() => {
    if (!activeRequestEvent || activeRequestEvent.eventType !== "AVAILABILITY") return [];
    const start = dayjs(activeRequestEvent.startDateTime);
    const end = dayjs(activeRequestEvent.endDateTime);
    let cursor = start;
    const remainder = cursor.minute() % 30;
    if (remainder !== 0) {
      cursor = cursor.add(30 - remainder, "minute");
    }

    const slots = [];
    while (cursor.add(60, "minute").valueOf() <= end.valueOf()) {
      const slotStart = cursor;
      const slotEnd = cursor.add(60, "minute");
      slots.push({
        value: slotStart.toISOString(),
        start: slotStart,
        end: slotEnd,
      });
      cursor = cursor.add(30, "minute");
    }
    return slots;
  }, [activeRequestEvent]);

  useEffect(() => {
    if (availableBookingSlots.length > 0) {
      setSelectedBookingSlot(availableBookingSlots[0].value);
    } else {
      setSelectedBookingSlot("");
    }
  }, [availableBookingSlots]);

  const openAttachForEvent = (event) => {
    setAttachEvent(event);
    setSelectedWorkoutId("");
    setOpenAttachDialog(true);

    const date = dayjs(event.startDateTime).format("YYYY-MM-DD");
    if (event.clientId) {
      dispatch(requestWorkoutsByMonth(date, { _id: event.clientId }));
      dispatch(requestWorkoutQueue(event.clientId, date));
      return;
    }
    if (isTrainerView && selectedClientIds.length === 1) {
      dispatch(requestWorkoutsByMonth(date, { _id: selectedClientIds[0] }));
      dispatch(requestWorkoutQueue(selectedClientIds[0], date));
      return;
    }
    if (isTrainerView) {
      activeClientIds.forEach((clientId) => {
        dispatch(requestWorkoutsByMonth(date, { _id: clientId }));
        dispatch(requestWorkoutQueue(clientId, date));
      });
      return;
    }
    dispatch(requestWorkoutsByMonth(date, user));
    dispatch(requestWorkoutQueue(user._id, date));
  };

  const openEditForEvent = (event) => {
    setEditEvent(event);
    setEditDate(dayjs(event.startDateTime).format("YYYY-MM-DD"));
    setEditStartTime(dayjs(event.startDateTime).format("HH:mm"));
    setEditEndTime(dayjs(event.endDateTime).format("HH:mm"));
    setEditStatus(event.status);
    setEditClientId(event.clientId || "");
    setEditWorkoutId(event.workoutId || "");
    setEditCustomName(event.customClientName || "");
    setEditCustomEmail(event.customClientEmail || "");
    setEditCustomPhone(event.customClientPhone || "");
    setOpenEditDialog(true);
  };

  const openCopyForEvent = (event) => {
    const start = dayjs(event.startDateTime).add(1, "week");
    const end = dayjs(event.endDateTime).add(1, "week");
    setCopySourceEvent(event);
    setCopyDate(start.format("YYYY-MM-DD"));
    setCopyStartTime(start.format("HH:mm"));
    setCopyEndTime(end.format("HH:mm"));
    setOpenCopyDialog(true);
  };

  const buildCopyPayload = (event, startDateTime, endDateTime) => {
    const isAvailability = event.eventType === "AVAILABILITY";
    return {
      startDateTime,
      endDateTime,
      eventType: event.eventType,
      status: isAvailability ? "OPEN" : "BOOKED",
      clientId: event.clientId || null,
      customClientName: event.customClientName || "",
      customClientEmail: event.customClientEmail || "",
      customClientPhone: event.customClientPhone || "",
      workoutId: null,
      availabilitySource: isAvailability ? event.availabilitySource || "MANUAL" : undefined,
      recurrenceRule: null,
    };
  };

  const hasOverlap = (candidate, events) =>
    events.some((event) => {
      if (event.status === "CANCELLED") return false;
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      return start < candidate.end && end > candidate.start;
    });

  const handleCopyEvent = async () => {
    if (!copySourceEvent) return;
    const startDateTime = dayjs(`${copyDate}T${copyStartTime}`).toISOString();
    const endDateTime = dayjs(`${copyDate}T${copyEndTime}`).toISOString();
    if (dayjs(endDateTime).valueOf() <= dayjs(startDateTime).valueOf()) return;

    await dispatch(createScheduleEvent(buildCopyPayload(copySourceEvent, startDateTime, endDateTime)));
    setOpenCopyDialog(false);
    setCopySourceEvent(null);
    refreshSchedule();
  };

  const openCopyDay = () => {
    setCopyDayDate(selectedDate.add(1, "week").format("YYYY-MM-DD"));
    setOpenCopyDayDialog(true);
  };

  const openCopyWeek = () => {
    setCopyWeekDate(weekStart.add(1, "week").format("YYYY-MM-DD"));
    setOpenCopyWeekDialog(true);
  };

  const handleCopyDay = async () => {
    if (!isTrainerView || !copyDayDate) return;
    const sourceDayStart = selectedDate.startOf("day");
    const targetDay = dayjs(copyDayDate).startOf("day");
    const offsetDays = targetDay.diff(sourceDayStart, "day");
    const targetStart = targetDay.toISOString();
    const targetEnd = targetDay.add(1, "day").toISOString();

    const rangeData = await dispatch(
      requestScheduleRange({
        startDate: targetStart,
        endDate: targetEnd,
        trainerId: user._id,
        clientId: null,
        includeAvailability: true,
      })
    );

    const existingEvents = rangeData?.events || [];
    const createdEvents = [];
    const sourceEvents = filteredDayEvents.filter((event) => event.status !== "CANCELLED");

    for (const event of sourceEvents) {
      const start = dayjs(event.startDateTime).add(offsetDays, "day");
      const end = dayjs(event.endDateTime).add(offsetDays, "day");
      const candidate = { start: start.toDate(), end: end.toDate() };
      if (hasOverlap(candidate, existingEvents) || hasOverlap(candidate, createdEvents)) {
        continue;
      }
      await dispatch(createScheduleEvent(buildCopyPayload(event, start.toISOString(), end.toISOString())));
      createdEvents.push({
        startDateTime: candidate.start,
        endDateTime: candidate.end,
        status: "BOOKED",
      });
    }

    setOpenCopyDayDialog(false);
    refreshSchedule();
  };

  const handleCopyWeek = async () => {
    if (!isTrainerView || !copyWeekDate) return;
    const sourceWeekStart = weekStart.startOf("day");
    const targetWeekStart = dayjs(copyWeekDate).startOf("day");
    const offsetDays = targetWeekStart.diff(sourceWeekStart, "day");
    const targetStart = targetWeekStart.toISOString();
    const targetEnd = targetWeekStart.add(7, "day").toISOString();

    const rangeData = await dispatch(
      requestScheduleRange({
        startDate: targetStart,
        endDate: targetEnd,
        trainerId: user._id,
        clientId: null,
        includeAvailability: true,
      })
    );

    const existingEvents = rangeData?.events || [];
    const createdEvents = [];
    const sourceEvents = filteredWeekEvents.filter((event) => event.status !== "CANCELLED");

    for (const event of sourceEvents) {
      const start = dayjs(event.startDateTime).add(offsetDays, "day");
      const end = dayjs(event.endDateTime).add(offsetDays, "day");
      const candidate = { start: start.toDate(), end: end.toDate() };
      if (hasOverlap(candidate, existingEvents) || hasOverlap(candidate, createdEvents)) {
        continue;
      }
      await dispatch(createScheduleEvent(buildCopyPayload(event, start.toISOString(), end.toISOString())));
      createdEvents.push({
        startDateTime: candidate.start,
        endDateTime: candidate.end,
        status: "BOOKED",
      });
    }

    setOpenCopyWeekDialog(false);
    refreshSchedule();
  };

  const handleShareWeek = async () => {
    if (!weekCaptureRef.current) return;
    setShareInProgress(true);
    setShareStatus("");
    setIsShareMode(true);

    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const dataUrl = await toPng(weekCaptureRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: { fontFamily: "Arial, sans-serif" },
        skipFonts: true,
      });
      const blob = await (await fetch(dataUrl)).blob();

      const canClipboard = navigator.clipboard?.write && window.ClipboardItem;
      if (canClipboard) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          setShareStatus("Copied week view image to clipboard.");
          return;
        } catch (error) {
          console.error("Clipboard copy failed:", error);
        }
      }

      const link = document.createElement("a");
      link.href = dataUrl;
        link.download = `sessions-${weekStart.format("YYYY-MM-DD")}.png`;
      link.click();
      setShareStatus(
        canClipboard
          ? "Clipboard blocked. Downloaded image instead."
          : "Clipboard unavailable. Downloaded image instead."
      );
    } catch (error) {
      console.error("Share image failed:", error);
      setShareStatus("Unable to copy image. Please try again.");
    } finally {
      setShareInProgress(false);
      setIsShareMode(false);
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/public/sessions/${user._id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareLinkStatus("Share link copied.");
      } else {
        setShareLinkStatus("Clipboard unavailable. Please copy manually.");
      }
    } catch (error) {
      setShareLinkStatus("Unable to copy link. Please copy manually.");
    }
  };

  const editWorkoutClientId = editClientId || editEvent?.clientId || "";
  const editClientProfile = useMemo(
    () => clients.find((clientRel) => clientRel.client?._id === editWorkoutClientId)?.client,
    [clients, editWorkoutClientId]
  );
  const editClientName = editClientProfile
    ? `${editClientProfile.firstName || ""} ${editClientProfile.lastName || ""}`.trim()
    : "";
  const editClientAvatar = editClientProfile?.profilePicture
    ? `${serverURL}/user/profilePicture/${editClientProfile.profilePicture}`
    : undefined;
  const attachedEditWorkout = useMemo(() => {
    if (!editWorkoutClientId || !editEvent?.workoutId) return null;
    const workouts = workoutsByAccount?.[editWorkoutClientId]?.workouts || [];
    const queued = workoutQueue?.[editWorkoutClientId] || [];
    return [...workouts, ...queued].find(
      (workout) => String(workout._id) === String(editEvent.workoutId)
    );
  }, [editEvent?.workoutId, editWorkoutClientId, workoutQueue, workoutsByAccount]);

  useEffect(() => {
    if (!isTrainerView) return;
    if (!openEditDialog) return;
    if (!editWorkoutClientId) return;
    const date = dayjs(editDate).format("YYYY-MM-DD");
    dispatch(requestWorkoutsByMonth(date, { _id: editWorkoutClientId }));
    dispatch(requestWorkoutQueue(editWorkoutClientId, date));
  }, [dispatch, editDate, editWorkoutClientId, isTrainerView, openEditDialog]);

  useEffect(() => {
    if (!openEditDialog) return;
    if (!editWorkoutClientId) {
      setEditWorkoutId("");
      return;
    }
    if (editEvent?.clientId !== editWorkoutClientId) {
      setEditWorkoutId("");
    }
  }, [editEvent?.clientId, editWorkoutClientId, openEditDialog]);

  const handleSaveEdit = async () => {
    if (!editEvent) return;
    const startDateTime = dayjs(`${editDate}T${editStartTime}`).toISOString();
    const endDateTime = dayjs(`${editDate}T${editEndTime}`).toISOString();
    if (dayjs(endDateTime).valueOf() <= dayjs(startDateTime).valueOf()) return;
    const customName = editCustomName.trim();
    const updates = {
      startDateTime,
      endDateTime,
      customClientName: customName,
      customClientEmail: editCustomEmail.trim(),
      customClientPhone: editCustomPhone.trim(),
    };
    if (editEvent.eventType === "AVAILABILITY" && (editClientId || customName)) {
      updates.clientId = editClientId || null;
      updates.eventType = "APPOINTMENT";
      updates.status = "BOOKED";
      if (editClientId) {
        updates.customClientName = "";
        updates.customClientEmail = "";
        updates.customClientPhone = "";
      }
    } else {
      updates.status = editStatus;
      if (editClientId) {
        updates.clientId = editClientId;
      }
    }
    if (editWorkoutId) {
      updates.workoutId = editWorkoutId;
    } else if (editEvent?.workoutId) {
      updates.workoutId = null;
    }
    await dispatch(
      updateScheduleEvent(editEvent._id, {
        ...updates,
      })
    );
    setOpenEditDialog(false);
    setEditEvent(null);
    refreshSchedule();
  };

  const handleCreateWorkoutForEdit = async () => {
    if (!editWorkoutClientId || !editEvent) return;
    const created = await dispatch(
      createTrainingForAccount({
        training: { date: dayjs(editDate).toISOString() },
        accountId: editWorkoutClientId,
      })
    );
    if (created?._id) {
      setEditWorkoutId(created._id);
      await dispatch(updateScheduleEvent(editEvent._id, { workoutId: created._id }));
      refreshSchedule();
    }
  };

  useEffect(() => {
    if (!isTrainerView || !quickBookClientId) return;
    const date = selectedDate.format("YYYY-MM-DD");
    dispatch(requestWorkoutsByMonth(date, { _id: quickBookClientId }));
    dispatch(requestWorkoutQueue(quickBookClientId, date));
  }, [dispatch, isTrainerView, quickBookClientId, selectedDate]);

  useEffect(() => {
    setQuickBookWorkoutId("");
  }, [quickBookClientId]);

  const quickBookWorkouts = useMemo(
    () => (workoutsByAccount?.[quickBookClientId]?.workouts || []),
    [quickBookClientId, workoutsByAccount]
  );
  const quickBookQueuedWorkouts = useSelector(
    (state) => state.workoutQueue?.[quickBookClientId] || []
  );

  const handleQuickBookClient = async () => {
    if (!isTrainerView || !selectionRangeAdjusted || !quickBookClientId) return;
    const payload = {
      startDateTime: selectionRangeAdjusted.start.toISOString(),
      endDateTime: selectionRangeAdjusted.end.toISOString(),
      eventType: "APPOINTMENT",
      status: "BOOKED",
      clientId: quickBookClientId,
    };
    if (quickBookWorkoutId) {
      payload.workoutId = quickBookWorkoutId;
    }
    await dispatch(createScheduleEvent(payload));
    setDragSelection(null);
    setOpenSelectionDialog(false);
    setQuickBookWorkoutId("");
    refreshSchedule();
  };

  const handleQuickBookCustom = async () => {
    if (!isTrainerView || !selectionRangeAdjusted || !quickBookCustomName.trim()) return;
    await dispatch(
      createScheduleEvent({
        startDateTime: selectionRangeAdjusted.start.toISOString(),
        endDateTime: selectionRangeAdjusted.end.toISOString(),
        eventType: "APPOINTMENT",
        status: "BOOKED",
        customClientName: quickBookCustomName.trim(),
        customClientEmail: quickBookCustomEmail.trim(),
        customClientPhone: quickBookCustomPhone.trim(),
      })
    );
    setDragSelection(null);
    setOpenSelectionDialog(false);
    setQuickBookCustomName("");
    setQuickBookCustomEmail("");
    setQuickBookCustomPhone("");
    refreshSchedule();
  };

  const handleQuickBookCreateWorkout = async () => {
    if (!isTrainerView || !selectionRangeAdjusted || !quickBookClientId) return;
    const created = await dispatch(
      createTrainingForAccount({
        training: { date: selectionRangeAdjusted.start.toISOString() },
        accountId: quickBookClientId,
      })
    );
    if (!created?._id) return;
    await dispatch(
      createScheduleEvent({
        startDateTime: selectionRangeAdjusted.start.toISOString(),
        endDateTime: selectionRangeAdjusted.end.toISOString(),
        eventType: "APPOINTMENT",
        status: "BOOKED",
        clientId: quickBookClientId,
        workoutId: created._id,
      })
    );
    setDragSelection(null);
    setOpenSelectionDialog(false);
    setQuickBookWorkoutId("");
    refreshSchedule();
  };

  const handleAttachWorkout = async () => {
    if (!attachEvent || !selectedWorkoutId) return;
    const allAttachWorkouts = [...attachWorkouts, ...attachQueuedWorkouts];
    const selectedWorkout = allAttachWorkouts.find((workout) => workout._id === selectedWorkoutId);
    const selectedWorkoutUserId =
      typeof selectedWorkout?.user === "object" ? selectedWorkout?.user?._id : selectedWorkout?.user;
    const updates =
      attachEvent.eventType === "AVAILABILITY"
        ? {
          workoutId: selectedWorkoutId,
          clientId: selectedWorkoutUserId || selectedClientIds[0],
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

  const queueBookingSlots = useMemo(() => {
    if (!queueTargetEvent || queueTargetEvent.eventType !== "AVAILABILITY") return [];
    const start = dayjs(queueTargetEvent.startDateTime);
    const end = dayjs(queueTargetEvent.endDateTime);
    let cursor = start;
    const remainder = cursor.minute() % 30;
    if (remainder !== 0) {
      cursor = cursor.add(30 - remainder, "minute");
    }

    const slots = [];
    while (cursor.add(60, "minute").valueOf() <= end.valueOf()) {
      const slotStart = cursor;
      const slotEnd = cursor.add(60, "minute");
      slots.push({
        value: slotStart.toISOString(),
        start: slotStart,
        end: slotEnd,
      });
      cursor = cursor.add(30, "minute");
    }
    return slots;
  }, [queueTargetEvent]);

  useEffect(() => {
    if (queueBookingSlots.length > 0) {
      setSelectedQueueSlot(queueBookingSlots[0].value);
    } else {
      setSelectedQueueSlot("");
    }
  }, [queueBookingSlots]);

  const handleAttachQueuedWorkout = async (workoutId) => {
    const targetEvent = attachableEvents.find((event) => event._id === queueTargetEventId);
    if (!targetEvent) return;
    const workoutMatch = visibleQueuedWorkouts.find((workout) => workout._id === workoutId);
    const workoutUserId =
      typeof workoutMatch?.user === "object" ? workoutMatch?.user?._id : workoutMatch?.user;
    if (targetEvent.eventType === "AVAILABILITY") {
      const slot = queueBookingSlots.find((item) => item.value === selectedQueueSlot);
      if (!slot) return;
      await dispatch(
        trainerBookAvailability({
          availabilityEventId: targetEvent._id,
          clientId: workoutUserId,
          startDateTime: slot.start.toISOString(),
          endDateTime: slot.end.toISOString(),
          workoutId,
        })
      );
    } else {
      await dispatch(updateScheduleEvent(targetEvent._id, { workoutId }));
    }
    if (isTrainerView) {
      await Promise.all(
        activeClientIds.map((clientId) =>
          dispatch(requestWorkoutQueue(clientId, selectedDate.format("YYYY-MM-DD")))
        )
      );
    }
    refreshSchedule();
  };

  const weekStart = useMemo(() => selectedDate.startOf("week"), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );
  const weekRangeLabel = useMemo(() => {
    const start = weekStart;
    const end = weekStart.add(6, "day");
    return `${start.format("MMM D")} - ${end.format("MMM D")}`;
  }, [weekStart]);
  const totalSlots = (WEEK_END_HOUR - WEEK_START_HOUR) * 2;

  const weekEvents = useMemo(() => {
    const start = weekStart.startOf("day");
    const end = weekStart.add(7, "day").startOf("day");
    return (scheduleData.events || []).filter((event) => {
      const eventStart = dayjs(event.startDateTime);
      const eventEnd = dayjs(event.endDateTime);
      return eventStart.isBefore(end) && eventEnd.isAfter(start);
    });
  }, [scheduleData.events, weekStart]);
  const filteredWeekEvents = useMemo(() => {
    if (!isTrainerView) return weekEvents;
    if (!activeClientIds.length) return weekEvents;
    return weekEvents.filter((event) => {
      if (event.eventType === "AVAILABILITY") return true;
      if (!event.clientId) return false;
      return activeClientIds.includes(event.clientId);
    });
  }, [activeClientIds, isTrainerView, weekEvents]);

  const getEventStyle = (event, day) => {
    const dayStart = day.startOf("day");
    const dayEnd = day.add(1, "day").startOf("day");
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);
    const start = eventStart.isBefore(dayStart) ? dayStart : eventStart;
    const end = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

    const startMinutes = start.diff(dayStart, "minute");
    const endMinutes = end.diff(dayStart, "minute");
    const topMinutes = Math.max(startMinutes - WEEK_START_HOUR * 60, 0);
    const bottomMinutes = Math.min(endMinutes - WEEK_START_HOUR * 60, (WEEK_END_HOUR - WEEK_START_HOUR) * 60);

    if (bottomMinutes <= 0 || topMinutes >= (WEEK_END_HOUR - WEEK_START_HOUR) * 60) return null;

    return {
      top: Math.floor(topMinutes / SLOT_MINUTES) * SLOT_HEIGHT,
      height: Math.max(1, Math.ceil((bottomMinutes - topMinutes) / SLOT_MINUTES) * SLOT_HEIGHT),
    };
  };

  const handleSlotMouseDown = (dayIndex, slotIndex) => {
    if (!isTrainerView) return;
    setOpenSelectionDialog(false);
    setIsDragging(true);
    setDragSelection({ dayIndex, startIndex: slotIndex, endIndex: slotIndex });
    setSelectedDate(weekDays[dayIndex]);
  };

  const handleSlotMouseEnter = (dayIndex, slotIndex) => {
    if (!isDragging || !dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) return;
    setDragSelection((prev) => ({ ...prev, endIndex: slotIndex }));
  };

  const updateSelectionFromPoint = (clientX, clientY) => {
    let target = document.elementFromPoint(clientX, clientY);
    while (target && !target.dataset?.dayIndex) {
      target = target.parentElement;
    }
    const dayIndex = Number(target?.dataset?.dayIndex);
    const slotIndex = Number(target?.dataset?.slotIndex);
    if (Number.isNaN(dayIndex) || Number.isNaN(slotIndex)) return;
    if (!dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) return;
    setDragSelection((prev) => ({ ...prev, endIndex: slotIndex }));
  };

  const handleSlotTouchStart = (event, dayIndex, slotIndex) => {
    if (!isTrainerView) return;
    event.preventDefault();
    setOpenSelectionDialog(false);
    setIsDragging(true);
    setDragSelection({ dayIndex, startIndex: slotIndex, endIndex: slotIndex });
    setSelectedDate(weekDays[dayIndex]);
  };

  const handleSlotTouchMove = (event) => {
    if (!isDragging) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    event.preventDefault();
    updateSelectionFromPoint(touch.clientX, touch.clientY);
  };

  const handleSlotTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isTrainerView) return;
    if (!selectionRange) return;
    if (selectionRange.end.valueOf() <= selectionRange.start.valueOf()) return;
    setOpenSelectionDialog(true);
  };

  const normalizedSelection = useMemo(() => {
    if (!dragSelection) return null;
    const startIndex = Math.min(dragSelection.startIndex, dragSelection.endIndex);
    const endIndex = Math.max(dragSelection.startIndex, dragSelection.endIndex);
    return { ...dragSelection, startIndex, endIndex };
  }, [dragSelection]);

  const selectionRange = useMemo(() => {
    if (!normalizedSelection) return null;
    const day = weekDays[normalizedSelection.dayIndex];
    const startMinutes = WEEK_START_HOUR * 60 + normalizedSelection.startIndex * SLOT_MINUTES;
    const endMinutes = WEEK_START_HOUR * 60 + (normalizedSelection.endIndex + 1) * SLOT_MINUTES;
    const start = day.startOf("day").add(startMinutes, "minute");
    const end = day.startOf("day").add(endMinutes, "minute");
    return { start, end };
  }, [normalizedSelection, weekDays]);

  useEffect(() => {
    if (!openSelectionDialog || !selectionRange) return;
    setSelectionStartTime(selectionRange.start.format("HH:mm"));
    setSelectionEndTime(selectionRange.end.format("HH:mm"));
  }, [openSelectionDialog, selectionRange]);

  const selectionRangeAdjusted = useMemo(() => {
    if (!selectionRange) return null;
    if (!selectionStartTime || !selectionEndTime) return selectionRange;
    const day = selectionRange.start.startOf("day");
    const start = dayjs(`${day.format("YYYY-MM-DD")}T${selectionStartTime}`);
    const end = dayjs(`${day.format("YYYY-MM-DD")}T${selectionEndTime}`);
    return { start, end };
  }, [selectionRange, selectionEndTime, selectionStartTime]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (!isTrainerView) return;
      if (!selectionRange) return;
      if (selectionRange.end.valueOf() <= selectionRange.start.valueOf()) return;
      setOpenSelectionDialog(true);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging, isTrainerView, selectionRange]);

  const handleCreateSlotsFromSelection = async () => {
    if (!selectionRangeAdjusted) return;
    if (selectionRangeAdjusted.end.valueOf() <= selectionRangeAdjusted.start.valueOf()) return;

    await dispatch(
      createScheduleEvent({
        startDateTime: selectionRangeAdjusted.start.toISOString(),
        endDateTime: selectionRangeAdjusted.end.toISOString(),
        eventType: "AVAILABILITY",
        status: "OPEN",
        availabilitySource: "MANUAL",
      })
    );
    setDragSelection(null);
    setOpenSelectionDialog(false);
    refreshSchedule();
  };

  const handleClearSelection = () => {
    setDragSelection(null);
    setOpenSelectionDialog(false);
    setSelectionStartTime("");
    setSelectionEndTime("");
    setQuickBookClientId("");
    setQuickBookWorkoutId("");
    setQuickBookCustomName("");
    setQuickBookCustomEmail("");
    setQuickBookCustomPhone("");
  };

  return (
    <>
      <Grid container size={12} spacing={2}>
        <Grid container size={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="h4">Sessions</Typography>
            {isTrainerView && (
              <Button variant="contained" onClick={handleOpenAvailability}>
                Open Slot
              </Button>
            )}
          </Stack>
          {isTrainerView && clientParam && (
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
                  : "Client sessions"}
              </Typography>
            </Stack>
          )}
        </Grid>

        <Grid container size={12}>
          <SelectedDate
            selectedDate={selectedDate.format("YYYY-MM-DD")}
            setSelectedDate={(value) => setSelectedDate(dayjs(value))}
          />
        </Grid>

        <Grid container size={12}>
          <Box
            ref={weekCaptureRef}
            sx={{ width: "100%", fontFamily: isShareMode ? "Arial, sans-serif" : "inherit" }}
          >
            {isShareMode && shareIncludeHeader && (
              <Box sx={{ px: 2, pt: 2, pb: 1, backgroundColor: "grey.900", color: "common.white" }}>
                <Typography variant="h6" sx={{ color: "common.white" }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: "grey.300" }}>
                  Week of {weekRangeLabel}
                </Typography>
              </Box>
            )}
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
                  <Typography variant="h6">Week View</Typography>
                  {isTrainerView && !isShareMode && (
                    <Typography variant="body2" color="text.secondary">
                      Drag to create open availability blocks. Slots start on the hour or half-hour.
                    </Typography>
                  )}
                </Stack>
                {isTrainerView && !isShareMode && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button variant="outlined" onClick={openCopyDay}>
                      Copy day
                    </Button>
                    <Button variant="outlined" onClick={openCopyWeek}>
                      Copy week
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setShareStatus("");
                        setOpenShareDialog(true);
                      }}
                    >
                      Copy week image
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShareLinkStatus("");
                        handleCopyShareLink();
                      }}
                    >
                      Copy share link
                    </Button>
                  </Stack>
                )}
                {isTrainerView && !isShareMode && shareLinkStatus && (
                  <Typography variant="caption" color="text.secondary">
                    {shareLinkStatus}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: 2,
                    overflowX: { xs: "auto", md: "hidden" },
                  }}
                >
                  <Box sx={{ width: 64, borderRight: "1px solid rgba(148, 163, 184, 0.35)" }}>
                    <Box
                      sx={{
                        height: HEADER_HEIGHT,
                        borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    />
                    {Array.from({ length: totalSlots }).map((_, index) => {
                      const minutes = WEEK_START_HOUR * 60 + index * SLOT_MINUTES;
                      const label =
                        minutes % 60 === 0
                          ? dayjs().hour(Math.floor(minutes / 60)).minute(0).format("h A")
                          : "";
                      return (
                        <Box
                          key={`label-${index}`}
                          sx={{
                            height: SLOT_HEIGHT,
                            borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            pt: 0.5,
                          }}
                        >
                          {label}
                        </Box>
                      );
                    })}
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, minmax(96px, 1fr))",
                      flex: 1,
                    }}
                  >
                    {weekDays.map((day, dayIndex) => (
                      <Box key={day.format("YYYY-MM-DD")} sx={{ borderLeft: "1px solid rgba(148, 163, 184, 0.2)" }}>
                        <Box
                          sx={{
                            position: "sticky",
                            top: 0,
                            height: HEADER_HEIGHT,
                            backgroundColor: "background.paper",
                            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            zIndex: 1,
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedDate(day)}
                        >
                          <Typography variant="subtitle2">
                            {day.format("ddd")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {day.format("MMM D")}
                          </Typography>
                        </Box>
                        <Box sx={{ position: "relative" }}>
                          {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                            <Box
                              key={`slot-${dayIndex}-${slotIndex}`}
                              onMouseDown={() => handleSlotMouseDown(dayIndex, slotIndex)}
                              onMouseEnter={() => handleSlotMouseEnter(dayIndex, slotIndex)}
                              onTouchStart={(event) =>
                                handleSlotTouchStart(event, dayIndex, slotIndex)
                              }
                              onTouchMove={handleSlotTouchMove}
                              onTouchEnd={handleSlotTouchEnd}
                              data-day-index={dayIndex}
                              data-slot-index={slotIndex}
                              sx={{
                                height: SLOT_HEIGHT,
                                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                                backgroundColor: slotIndex % 2 === 0 ? "rgba(148,163,184,0.06)" : "transparent",
                                touchAction: "none",
                              }}
                            />
                          ))}
                          {normalizedSelection &&
                            normalizedSelection.dayIndex === dayIndex && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: normalizedSelection.startIndex * SLOT_HEIGHT,
                                  height: (normalizedSelection.endIndex - normalizedSelection.startIndex + 1) * SLOT_HEIGHT,
                                  left: 4,
                                  right: 4,
                                  backgroundColor: "rgba(25, 118, 210, 0.2)",
                                  border: "1px solid rgba(25, 118, 210, 0.6)",
                                  borderRadius: 1,
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                          {weekEvents
                            .filter((event) => dayjs(event.startDateTime).isSame(day, "day"))
                            .map((event) => {
                              const style = getEventStyle(event, day);
                              if (!style) return null;
                              return (
                                <Box
                                  key={event._id}
                                  sx={{
                                    position: "absolute",
                                    left: 6,
                                    right: 6,
                                    top: style.top,
                                    height: style.height,
                                    backgroundColor: event.eventType === "AVAILABILITY"
                                      ? "rgba(76, 175, 80, 0.25)"
                                      : "rgba(33, 150, 243, 0.25)",
                                    border: "1px solid rgba(25, 118, 210, 0.4)",
                                    borderRadius: 1,
                                    px: 0.5,
                                    py: 0.25,
                                    overflow: "hidden",
                                    cursor: isTrainerView || (isClientView && event.eventType === "AVAILABILITY")
                                      ? "pointer"
                                      : "default",
                                  }}
                                  onClick={() => {
                                    if (isTrainerView) {
                                      openEditForEvent(event);
                                      return;
                                    }
                                    if (
                                      isClientView &&
                                      event.eventType === "AVAILABILITY" &&
                                      event.status === "OPEN"
                                    ) {
                                      openRequestForEvent(event);
                                    }
                                  }}
                                >
                                  {event.eventType === "AVAILABILITY" ? (
                                    <Typography variant="caption">Open</Typography>
                                  ) : (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      {! (isShareMode && shareHideDetails) && (event.clientId || event.customClientName) && (
                                        <Avatar
                                          src={
                                            isTrainerView
                                              ? clientProfileLookup.get(event.clientId)
                                                  ?.profilePicture
                                                ? `${serverURL}/user/profilePicture/${
                                                    clientProfileLookup.get(event.clientId)
                                                      ?.profilePicture
                                                  }`
                                                : undefined
                                              : String(event.clientId) === String(user._id) &&
                                                user.profilePicture
                                                ? `${serverURL}/user/profilePicture/${user.profilePicture}`
                                                : undefined
                                          }
                                          sx={{ width: 20, height: 20, fontSize: "0.65rem" }}
                                        >
                                          {isTrainerView
                                            ? (event.customClientName || clientLookup.get(event.clientId) || "B")[0]
                                            : String(event.clientId) === String(user._id)
                                            ? user.firstName?.[0] || "M"
                                            : "B"}
                                        </Avatar>
                                      )}
                                      <Typography variant="caption">
                                        {getEventDisplayName(event)}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Box>
                              );
                            })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                {user.isTrainer && (
                  <Stack spacing={1}>
                    <Typography variant="overline" color="text.secondary">
                      Session mode
                    </Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={bookingAsClient ? "client" : "trainer"}
                      onChange={(_, value) => {
                        if (!value) return;
                        setBookingAsClient(value === "client");
                      }}
                      size="small"
                    >
                      <ToggleButton value="trainer">Manage sessions</ToggleButton>
                      <ToggleButton value="client">Book with trainer</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                )}

                {isClientView && (
                  <FormControl fullWidth>
                    <InputLabel>Trainer</InputLabel>
                    <Select
                      label="Trainer"
                      value={selectedTrainerId}
                      onChange={(event) => {
                        setSelectedTrainerId(event.target.value);
                        if (user.isTrainer) {
                          setSelectedMyTrainerId(event.target.value);
                        }
                      }}
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

                {isTrainerView && (
                  <Autocomplete
                    multiple
                    options={clients.filter((clientRel) => clientRel.accepted)}
                    getOptionLabel={(option) =>
                      `${option.client.firstName} ${option.client.lastName}`
                    }
                    value={clients.filter((clientRel) =>
                      selectedClientIds.includes(clientRel.client._id)
                    )}
                    onChange={(_, value) => {
                      setSelectedClientIds(value.map((item) => item.client._id));
                      setHasClientSelection(true);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clients"
                        placeholder="All clients"
                      />
                    )}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid container size={12}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
              <Typography variant="h6">
                {selectedDate.format("dddd, MMMM D")}
              </Typography>
              {isTrainerView && selectedClientIds.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Select one or more clients to load their workouts.
                </Typography>
              )}
            </Stack>
            {isTrainerView && clientParam && (
              <Card sx={{ borderLeft: "4px solid", borderColor: "primary.main" }}>
                <CardContent>
                  <Typography variant="body2">
                    Filter applied: showing sessions for{" "}
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
            {filteredDayEvents.length === 0 && (
              <Card>
                <CardContent>
                  <Typography color="text.secondary">No session events.</Typography>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent>
                <Typography variant="h6">Session Events</Typography>
              </CardContent>
            </Card>
            {filteredDayEvents.map((event) => (
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
                    {isTrainerView && (event.clientId || event.customClientName) && (
                      <Typography variant="body2" color="text.secondary">
                        Client: {getEventDisplayName(event)}
                      </Typography>
                    )}
                    {isClientView && selectedTrainerId && (
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
                      {isTrainerView &&
                        event.eventType !== "AVAILABILITY" &&
                        event.status !== "CANCELLED" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleReopenEvent(event)}
                          >
                            Reopen Slot
                          </Button>
                        )}
                      {isTrainerView &&
                        !event.workoutId &&
                        event.status !== "CANCELLED" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openAttachForEvent(event)}
                          >
                            Attach Workout
                          </Button>
                        )}
                      {isTrainerView && (
                        <Button size="small" variant="outlined" onClick={() => openEditForEvent(event)}>
                          Edit
                        </Button>
                      )}
                      {isTrainerView && event.status !== "CANCELLED" && (
                        <Button size="small" variant="outlined" onClick={() => openCopyForEvent(event)}>
                          Copy
                        </Button>
                      )}
                      {isTrainerView && event.status === "REQUESTED" && (
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
                      {isTrainerView && event.status === "OPEN" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCancelEvent(event._id)}
                        >
                          Close Slot
                        </Button>
                      )}
                      {isTrainerView && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => openDeleteConfirm(event)}
                        >
                          Delete
                        </Button>
                      )}
                      {isClientView &&
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
            {isTrainerView && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Unassigned Workouts</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose an event to attach a workout. Availability slots will become booked
                      appointments for the workout's client.
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
                        {queueBookingSlots.length > 0 ? (
                          <FormControl fullWidth>
                            <InputLabel>Choose 1-hour slot</InputLabel>
                            <Select
                              label="Choose 1-hour slot"
                              value={selectedQueueSlot}
                              onChange={(event) => setSelectedQueueSlot(event.target.value)}
                            >
                              {queueBookingSlots.map((slot) => (
                                <MenuItem key={slot.value} value={slot.value}>
                                  {`${slot.start.format("h:mm A")} - ${slot.end.format("h:mm A")}`}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            This availability range does not include any 1-hour slots.
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
                            (queueTargetEvent?.eventType === "AVAILABILITY" && !selectedQueueSlot);
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
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={openSelectionDialog}
        onClose={handleClearSelection}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Selected Time Range</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectionRange && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                {selectionRangeAdjusted
                  ? `${selectionRangeAdjusted.start.format("ddd, MMM D h:mm A")} - ${selectionRangeAdjusted.end.format("h:mm A")}`
                  : ""}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Start time"
                  type="time"
                  value={selectionStartTime}
                  onChange={(event) => setSelectionStartTime(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End time"
                  type="time"
                  value={selectionEndTime}
                  onChange={(event) => setSelectionEndTime(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Book a client</Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Client</InputLabel>
                    <Select
                      label="Client"
                      value={quickBookClientId}
                      onChange={(event) => setQuickBookClientId(event.target.value)}
                    >
                      {clients
                        .filter((clientRel) => clientRel.accepted)
                        .map((clientRel) => (
                          <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                            {clientRel.client.firstName} {clientRel.client.lastName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth disabled={!quickBookClientId}>
                    <InputLabel>Workout (optional)</InputLabel>
                    <Select
                      label="Workout (optional)"
                      value={quickBookWorkoutId}
                      onChange={(event) => setQuickBookWorkoutId(event.target.value)}
                    >
                      <MenuItem value="">No workout</MenuItem>
                      {quickBookWorkouts.map((workout) => (
                        <MenuItem key={workout._id} value={workout._id}>
                          {workout.title || "Untitled"} - {dayjs.utc(workout.date).format("MMM D")}
                        </MenuItem>
                      ))}
                      {quickBookQueuedWorkouts.map((workout) => (
                        <MenuItem key={workout._id} value={workout._id}>
                          {workout.title || "Untitled"} - Queued
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleQuickBookClient}
                    disabled={!quickBookClientId}
                  >
                    Book client
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleQuickBookCreateWorkout}
                    disabled={!quickBookClientId}
                  >
                    Create workout & book
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Book custom client</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Name"
                    value={quickBookCustomName}
                    onChange={(event) => setQuickBookCustomName(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={quickBookCustomEmail}
                    onChange={(event) => setQuickBookCustomEmail(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Phone"
                    value={quickBookCustomPhone}
                    onChange={(event) => setQuickBookCustomPhone(event.target.value)}
                    fullWidth
                  />
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleQuickBookCustom}
                  disabled={!quickBookCustomName.trim()}
                >
                  Book custom client
                </Button>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Or open this slot</Typography>
                <Button
                  variant="outlined"
                  onClick={handleCreateSlotsFromSelection}
                  disabled={
                    !selectionRangeAdjusted ||
                    selectionRangeAdjusted.end.valueOf() <= selectionRangeAdjusted.start.valueOf()
                  }
                >
                  Create open slot
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearSelection}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
              <ToggleButton value="NORMAL">Normal sessions</ToggleButton>
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
                Normal session entries should be recurring.
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
              {activeRequestEvent.eventType === "AVAILABILITY" && (
                <>
                  {availableBookingSlots.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Choose 1-hour slot</InputLabel>
                      <Select
                        label="Choose 1-hour slot"
                        value={selectedBookingSlot}
                        onChange={(event) => setSelectedBookingSlot(event.target.value)}
                      >
                        {availableBookingSlots.map((slot) => (
                          <MenuItem key={slot.value} value={slot.value}>
                            {`${slot.start.format("h:mm A")} - ${slot.end.format("h:mm A")}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      This availability range does not include any 1-hour slots.
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestBooking}
            disabled={
              activeRequestEvent?.eventType === "AVAILABILITY" &&
              availableBookingSlots.length === 0
            }
          >
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
            {attachEvent?.eventType === "AVAILABILITY" && (
              <Typography color="text.secondary">
                Attaching a workout to an open slot will create a booked appointment for that workout's
                client.
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
                    {dayjs.utc(workout.date).format("MMM D")}
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

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editClientProfile && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Athlete</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={editClientAvatar} sx={{ width: 32, height: 32 }}>
                    {editClientName ? editClientName[0] : "A"}
                  </Avatar>
                  <Typography variant="body2">{editClientName || "Assigned athlete"}</Typography>
                </Stack>
              </Stack>
            )}
            {editEvent?.workoutId && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Attached workout</Typography>
                <Typography variant="body2">
                  {attachedEditWorkout?.title || "Workout attached"}
                </Typography>
                {attachedEditWorkout?.date && (
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(attachedEditWorkout.date).format("MMM D, YYYY")}
                  </Typography>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`/workout/${editEvent.workoutId}?event=${editEvent._id}`}
                >
                  Open workout
                </Button>
              </Stack>
            )}
            <TextField
              label="Date"
              type="date"
              value={editDate}
              onChange={(event) => setEditDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Start time"
              type="time"
              value={editStartTime}
              onChange={(event) => setEditStartTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End time"
              type="time"
              value={editEndTime}
              onChange={(event) => setEditEndTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {isTrainerView && editEvent?.eventType === "AVAILABILITY" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Assign client</InputLabel>
                  <Select
                    label="Assign client"
                    value={editClientId}
                    onChange={(event) => {
                      setEditClientId(event.target.value);
                      if (event.target.value) {
                        setEditCustomName("");
                        setEditCustomEmail("");
                        setEditCustomPhone("");
                      }
                    }}
                  >
                    <MenuItem value="">Keep open</MenuItem>
                    {clients
                      .filter((clientRel) => clientRel.accepted)
                      .map((clientRel) => (
                        <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                          {clientRel.client.firstName} {clientRel.client.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {editClientId && (
                  <Typography variant="caption" color="text.secondary">
                    Assigning a client will book this session immediately.
                  </Typography>
                )}
              </>
            )}
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Custom booking</Typography>
                <TextField
                  label="Name"
                  value={editCustomName}
                  onChange={(event) => {
                    setEditCustomName(event.target.value);
                    if (event.target.value) {
                      setEditClientId("");
                    }
                  }}
                  disabled={Boolean(editClientId)}
                />
                <TextField
                  label="Email"
                  value={editCustomEmail}
                  onChange={(event) => setEditCustomEmail(event.target.value)}
                  disabled={Boolean(editClientId)}
                />
                <TextField
                  label="Phone"
                  value={editCustomPhone}
                  onChange={(event) => setEditCustomPhone(event.target.value)}
                  disabled={Boolean(editClientId)}
                />
                {editCustomName && (
                  <Typography variant="caption" color="text.secondary">
                    Custom bookings are trainer-only and won’t create an account.
                  </Typography>
                )}
              </Stack>
            )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                disabled={editEvent?.eventType === "AVAILABILITY" && Boolean(editClientId)}
              >
                {(editEvent?.eventType === "AVAILABILITY"
                  ? ["OPEN", "CANCELLED"]
                  : ["REQUESTED", "BOOKED", "COMPLETED", "CANCELLED"]
                ).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isTrainerView && editWorkoutClientId && (
              <Stack spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>Workout</InputLabel>
                  <Select
                    label="Workout"
                    value={editWorkoutId}
                    onChange={(event) => setEditWorkoutId(event.target.value)}
                  >
                    <MenuItem value="">No workout</MenuItem>
                    {(workoutsByAccount?.[editWorkoutClientId]?.workouts || []).map((workout) => (
                      <MenuItem key={workout._id} value={workout._id}>
                        {workout.title || "Untitled"} -{" "}
                        {dayjs.utc(workout.date).format("MMM D")}
                      </MenuItem>
                    ))}
                    {(workoutQueue?.[editWorkoutClientId] || []).map((workout) => (
                      <MenuItem key={workout._id} value={workout._id}>
                        {workout.title || "Untitled"} - Queued
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" variant="outlined" onClick={handleCreateWorkoutForEdit}>
                  Create workout for this session
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          {isTrainerView && editEvent && (
            <Button variant="outlined" onClick={() => openCopyForEvent(editEvent)}>
              Copy
            </Button>
          )}
          {isTrainerView && editEvent && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setOpenEditDialog(false);
                openDeleteConfirm(editEvent);
              }}
            >
              Delete
            </Button>
          )}
          <Button variant="contained" onClick={handleSaveEdit}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyDialog}
        onClose={() => setOpenCopyDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {copySourceEvent && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {getEventDisplayName(copySourceEvent)} • {copySourceEvent.eventType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Original: {formatRange(copySourceEvent)}
                </Typography>
              </>
            )}
            <TextField
              label="Date"
              type="date"
              value={copyDate}
              onChange={(event) => setCopyDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Start time"
              type="time"
              value={copyStartTime}
              onChange={(event) => setCopyStartTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End time"
              type="time"
              value={copyEndTime}
              onChange={(event) => setCopyEndTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyEvent}>
            Create copy
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyDayDialog}
        onClose={() => setOpenCopyDayDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Day</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Copy all events for {selectedDate.format("ddd, MMM D")} to a new date.
            </Typography>
            <TextField
              label="Target date"
              type="date"
              value={copyDayDate}
              onChange={(event) => setCopyDayDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" color="text.secondary">
              Overlaps will be skipped automatically.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyDayDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyDay} disabled={!copyDayDate}>
            Copy day
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyWeekDialog}
        onClose={() => setOpenCopyWeekDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Week</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Copy all events for the week of {weekStart.format("MMM D")} to a new week.
            </Typography>
            <TextField
              label="Target week start"
              type="date"
              value={copyWeekDate}
              onChange={(event) => setCopyWeekDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" color="text.secondary">
              Overlaps will be skipped automatically.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyWeekDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyWeek} disabled={!copyWeekDate}>
            Copy week
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Week Image</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Create a shareable snapshot of this week’s sessions.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={shareHideDetails}
                  onChange={(event) => setShareHideDetails(event.target.checked)}
                />
              }
              label="Hide client details (recommended)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={shareIncludeHeader}
                  onChange={(event) => setShareIncludeHeader(event.target.checked)}
                />
              }
              label="Include trainer name and week"
            />
            {shareStatus && (
              <Typography variant="caption" color="text.secondary">
                {shareStatus}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleShareWeek} disabled={shareInProgress}>
            {shareInProgress ? "Copying..." : "Copy image"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography>
              This will permanently delete the event. This cannot be undone.
            </Typography>
            {deleteEvent && (
              <Typography variant="body2" color="text.secondary">
                {dayjs(deleteEvent.startDateTime).format("ddd, MMM D h:mm A")} -{" "}
                {dayjs(deleteEvent.endDateTime).format("h:mm A")}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDeleteEvent(deleteEvent?._id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
