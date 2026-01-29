import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Menu,
  Select,
  Stack,
  Avatar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableSortLabel,
  TableRow,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  ArrowDownward,
  ArrowUpward,
  Settings,
} from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toPng } from "html-to-image";
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

const tableColumnLabels = {
  date: "Date",
  time: "Time",
  type: "Type",
  status: "Status",
  client: "Client",
  price: "Price",
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
  const [openEventActionDialog, setOpenEventActionDialog] = useState(false);
  const [eventActionTarget, setEventActionTarget] = useState(null);
  const [openTrainerBookDialog, setOpenTrainerBookDialog] = useState(false);
  const [trainerBookSlot, setTrainerBookSlot] = useState("");
  const [trainerBookClientId, setTrainerBookClientId] = useState("");
  const [trainerBookCustomName, setTrainerBookCustomName] = useState("");
  const [trainerBookCustomEmail, setTrainerBookCustomEmail] = useState("");
  const [trainerBookCustomPhone, setTrainerBookCustomPhone] = useState("");
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
  const [editPublicLabel, setEditPublicLabel] = useState("");
  const [editSessionTypeId, setEditSessionTypeId] = useState("");
  const [editPriceAmount, setEditPriceAmount] = useState("");
  const [editPriceCurrency, setEditPriceCurrency] = useState("USD");
  const [editPayoutAmount, setEditPayoutAmount] = useState("");
  const [editPayoutCurrency, setEditPayoutCurrency] = useState("USD");
  const [quickBookClientId, setQuickBookClientId] = useState("");
  const [quickBookWorkoutId, setQuickBookWorkoutId] = useState("");
  const [quickBookCustomName, setQuickBookCustomName] = useState("");
  const [quickBookCustomEmail, setQuickBookCustomEmail] = useState("");
  const [quickBookCustomPhone, setQuickBookCustomPhone] = useState("");
  const [quickBookSessionTypeId, setQuickBookSessionTypeId] = useState("");
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
  const [copyDaySourceDate, setCopyDaySourceDate] = useState("");
  const [copyWeekDate, setCopyWeekDate] = useState("");
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareHideDetails, setShareHideDetails] = useState(true);
  const [shareIncludeHeader, setShareIncludeHeader] = useState(true);
  const [shareInProgress, setShareInProgress] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchSelectionRef = useRef({ active: false, dayIndex: 0, slotIndex: 0 });
  const touchTimerRef = useRef(null);
  const [calendarMenuAnchor, setCalendarMenuAnchor] = useState(null);
  const [shareStatus, setShareStatus] = useState("");
  const [isShareMode, setIsShareMode] = useState(false);
  const [shareLinkStatus, setShareLinkStatus] = useState("");
  const [shareShownKeys, setShareShownKeys] = useState([]);
  const [shareHighlightShown, setShareHighlightShown] = useState(false);
  const [shareHighlightColor, setShareHighlightColor] = useState("#ffc107");
  const [shareHidePrices, setShareHidePrices] = useState(true);
  const [shareWeekStartDate, setShareWeekStartDate] = useState("");
  const [shareEvents, setShareEvents] = useState([]);
  const [openTimeSettings, setOpenTimeSettings] = useState(false);
  const [calendarStartHour, setCalendarStartHour] = useState(WEEK_START_HOUR);
  const [calendarEndHour, setCalendarEndHour] = useState(WEEK_END_HOUR);
  const [draftStartHour, setDraftStartHour] = useState(WEEK_START_HOUR);
  const [draftEndHour, setDraftEndHour] = useState(WEEK_END_HOUR);
  const [tableSortKey, setTableSortKey] = useState("date");
  const [tableSortDirection, setTableSortDirection] = useState("asc");
  const [tableFilterTypes, setTableFilterTypes] = useState([]);
  const [tableFilterStatuses, setTableFilterStatuses] = useState([]);
  const [tableFilterClients, setTableFilterClients] = useState([]);
  const [tableFilterPrices, setTableFilterPrices] = useState([]);
  const [tableFilterTimes, setTableFilterTimes] = useState([]);
  const [tableFilterClientQuery, setTableFilterClientQuery] = useState("");
  const [tableFilterDates, setTableFilterDates] = useState([]);
  const [tableFilterAnchor, setTableFilterAnchor] = useState(null);
  const [tableFilterKey, setTableFilterKey] = useState("");
  const [tableFilterLabel, setTableFilterLabel] = useState("");
  const [hiddenTableColumns, setHiddenTableColumns] = useState(["type"]);
  const [touchSelectionEnabled, setTouchSelectionEnabled] = useState(false);
  const [calendarScale, setCalendarScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const stored = window.localStorage.getItem("schedule.calendarScale");
    const parsed = stored ? Number(stored) : 1;
    return Number.isFinite(parsed) ? parsed : 1;
  });
  const [sessionTypes, setSessionTypes] = useState([]);
  const [sessionTypesStatus, setSessionTypesStatus] = useState("");
  const [openSessionTypesDialog, setOpenSessionTypesDialog] = useState(false);
  const [openSessionTypeFormDialog, setOpenSessionTypeFormDialog] = useState(false);
  const [sessionTypeForm, setSessionTypeForm] = useState({
    name: "",
    description: "",
    defaultPrice: "",
    currency: "USD",
    defaultPayout: "",
    payoutCurrency: "USD",
  });
  const [editingSessionTypeId, setEditingSessionTypeId] = useState("");
  const [trainerBookSessionTypeId, setTrainerBookSessionTypeId] = useState("");

  const weekCaptureRef = useRef(null);
  const weekPickerRef = useRef(null);
  const weekScrollRef = useRef(null);
  const totalsScrollRef = useRef(null);
  const syncingScrollRef = useRef(false);

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

  const loadSessionTypes = useCallback(async () => {
    if (!user.isTrainer) return;
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    try {
      setSessionTypesStatus("");
      const response = await fetch(`${serverURL}/session-types`, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setSessionTypes(data.sessionTypes || []);
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to load session types.");
    }
  }, [user.isTrainer]);

  useEffect(() => {
    if (!user.isTrainer) return;
    loadSessionTypes();
  }, [loadSessionTypes, user.isTrainer]);

  const sessionTypeLookup = useMemo(() => {
    const map = new Map();
    sessionTypes.forEach((type) => {
      map.set(type._id, type);
    });
    return map;
  }, [sessionTypes]);

  const resetSessionTypeForm = useCallback(() => {
    setSessionTypeForm({
      name: "",
      description: "",
      defaultPrice: "",
      currency: "USD",
      defaultPayout: "",
      payoutCurrency: "USD",
    });
    setEditingSessionTypeId("");
    setOpenSessionTypeFormDialog(false);
  }, []);

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
      if (isShareMode && shareHideDetails) {
        if (event?.clientId && shareShownKeys.includes(`client:${event.clientId}`)) {
          return clientLookup.get(event.clientId) || "Booked";
        }
        if (
          event?.customClientName &&
          shareShownKeys.includes(`custom:${event.customClientName}`)
        ) {
          return event.customClientName;
        }
        return event?.publicLabel || "Booked";
      }
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
    [
      clientLookup,
      isShareMode,
      shareHideDetails,
      shareShownKeys,
      isTrainerView,
      user._id,
      user.firstName,
      user.lastName,
    ]
  );
  const getSessionTypeLabel = useCallback(
    (event) => {
      if (!event?.sessionTypeId) return "";
      const type = sessionTypeLookup.get(event.sessionTypeId);
      return type?.name || "Session type";
    },
    [sessionTypeLookup]
  );
  const highlightFill = useMemo(() => {
    const hex = shareHighlightColor.replace("#", "");
    if (hex.length !== 6) return "rgba(255, 193, 7, 0.35)";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.35)`;
  }, [shareHighlightColor]);

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

  const handleSaveSessionType = async () => {
    if (!sessionTypeForm.name.trim()) return;
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const payload = {
      name: sessionTypeForm.name.trim(),
      description: sessionTypeForm.description.trim(),
      defaultPrice: sessionTypeForm.defaultPrice === "" ? 0 : Number(sessionTypeForm.defaultPrice),
      currency: sessionTypeForm.currency || "USD",
      defaultPayout:
        sessionTypeForm.defaultPayout === "" ? 0 : Number(sessionTypeForm.defaultPayout),
      payoutCurrency: sessionTypeForm.payoutCurrency || "USD",
    };
    try {
      if (editingSessionTypeId) {
        const response = await fetch(
          `${serverURL}/session-types/${editingSessionTypeId}`,
          {
            method: "put",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              Authorization: bearer,
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        if (data?.error) throw new Error(data.error);
      } else {
        const response = await fetch(`${serverURL}/session-types`, {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: bearer,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data?.error) throw new Error(data.error);
      }
      setSessionTypesStatus("");
      resetSessionTypeForm();
      loadSessionTypes();
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to save session type.");
    }
  };

  const handleEditSessionType = (type) => {
    setEditingSessionTypeId(type._id);
    setSessionTypeForm({
      name: type.name || "",
      description: type.description || "",
      defaultPrice:
        type.defaultPrice === 0 || type.defaultPrice
          ? String(type.defaultPrice)
          : "",
      currency: type.currency || "USD",
      defaultPayout:
        type.defaultPayout === 0 || type.defaultPayout
          ? String(type.defaultPayout)
          : "",
      payoutCurrency: type.payoutCurrency || "USD",
    });
    setOpenSessionTypeFormDialog(true);
  };

  const handleDeleteSessionType = async (typeId) => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    try {
      const response = await fetch(`${serverURL}/session-types/${typeId}`, {
        method: "delete",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      if (editingSessionTypeId === typeId) {
        resetSessionTypeForm();
      }
      setSessionTypesStatus("");
      loadSessionTypes();
    } catch (err) {
      setSessionTypesStatus(err.message || "Unable to delete session type.");
    }
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
        sessionTypeId: null,
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
    const sessionType = event?.sessionTypeId
      ? sessionTypeLookup.get(event.sessionTypeId)
      : null;
    const defaultPrice =
      sessionType?.defaultPrice === 0 || sessionType?.defaultPrice
        ? String(sessionType.defaultPrice)
        : "";
    const defaultPayout =
      sessionType?.defaultPayout === 0 || sessionType?.defaultPayout
        ? String(sessionType.defaultPayout)
        : "";
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
    setEditPublicLabel(event.publicLabel || "");
    setEditSessionTypeId(event.sessionTypeId || "");
    setEditPriceAmount(
      typeof event.priceAmount === "number" ? String(event.priceAmount) : defaultPrice
    );
    setEditPriceCurrency(event.priceCurrency || sessionType?.currency || "USD");
    setEditPayoutAmount(
      typeof event.payoutAmount === "number" ? String(event.payoutAmount) : defaultPayout
    );
    setEditPayoutCurrency(
      event.payoutCurrency || sessionType?.payoutCurrency || event.priceCurrency || "USD"
    );
    setOpenEditDialog(true);
  };

  const openActionForEvent = (event) => {
    setEventActionTarget(event);
    setOpenEventActionDialog(true);
  };

  const openTrainerBookForEvent = (event) => {
    setEventActionTarget(event);
    setTrainerBookSlot("");
    setTrainerBookClientId("");
    setTrainerBookCustomName("");
    setTrainerBookCustomEmail("");
    setTrainerBookCustomPhone("");
    setTrainerBookSessionTypeId("");
    setOpenTrainerBookDialog(true);
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
      sessionTypeId: event.sessionTypeId || null,
      priceAmount: event.priceAmount ?? null,
      priceCurrency: event.priceCurrency || "USD",
      payoutAmount: event.payoutAmount ?? null,
      payoutCurrency: event.payoutCurrency || event.priceCurrency || "USD",
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
    setCopyDaySourceDate(selectedDate.format("YYYY-MM-DD"));
    setCopyDayDate(selectedDate.add(1, "week").format("YYYY-MM-DD"));
    setOpenCopyDayDialog(true);
  };

  const openCopyWeek = () => {
    setCopyWeekDate(weekStart.add(1, "week").format("YYYY-MM-DD"));
    setOpenCopyWeekDialog(true);
  };

  const handleCopyDay = async () => {
    if (!isTrainerView || !copyDayDate || !copyDaySourceDate) return;
    const sourceDayStart = dayjs(copyDaySourceDate).startOf("day");
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
    const sourceEvents = weekEvents
      .filter((event) => dayjs(event.startDateTime).isSame(sourceDayStart, "day"))
      .filter((event) => event.status !== "CANCELLED");

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
    if (!shareWeekStartDate) {
      setShareWeekStartDate(selectedDate.startOf("week").format("YYYY-MM-DD"));
    }

    const shareStart = dayjs(shareWeekStartDate || selectedDate.startOf("week").format("YYYY-MM-DD"))
      .startOf("day");
    const shareEnd = shareStart.add(7, "day").startOf("day");
    try {
      const rangeData = await dispatch(
        requestScheduleRange({
          startDate: shareStart.toISOString(),
          endDate: shareEnd.toISOString(),
          trainerId: selectedTrainerId || user._id,
          clientId: null,
          includeAvailability: true,
        })
      );
      setShareEvents(rangeData?.events || []);
    } catch (err) {
      setShareEvents([]);
    }

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("schedule.calendarScale", String(calendarScale));
  }, [calendarScale]);

  const handleCalendarMenuClose = () => setCalendarMenuAnchor(null);

  const getDefaultPriceValue = (typeId) => {
    if (!typeId) return null;
    const type = sessionTypeLookup.get(typeId);
    if (!type) return null;
    const hasDefault =
      type.defaultPrice === 0 || type.defaultPrice || type.defaultPrice === "0";
    if (!hasDefault) return null;
    return { amount: String(type.defaultPrice), currency: type.currency || "USD" };
  };

  const getDefaultPayoutValue = (typeId) => {
    if (!typeId) return null;
    const type = sessionTypeLookup.get(typeId);
    if (!type) return null;
    const hasDefault =
      type.defaultPayout === 0 || type.defaultPayout || type.defaultPayout === "0";
    if (!hasDefault) return null;
    return { amount: String(type.defaultPayout), currency: type.payoutCurrency || "USD" };
  };

  const applyDefaultPriceForType = (
    nextTypeId,
    prevTypeId,
    currentAmount,
    setAmount,
    setCurrency
  ) => {
    const nextDefault = getDefaultPriceValue(nextTypeId);
    const prevDefault = getDefaultPriceValue(prevTypeId);
    const shouldUpdate =
      currentAmount === "" ||
      (prevDefault && String(currentAmount) === String(prevDefault.amount));
    if (!shouldUpdate) return;
    if (!nextDefault) {
      setAmount("");
      return;
    }
    setAmount(String(nextDefault.amount));
    if (nextDefault.currency) setCurrency(nextDefault.currency);
  };

  const applyDefaultPayoutForType = (
    nextTypeId,
    prevTypeId,
    currentAmount,
    setAmount,
    setCurrency
  ) => {
    const nextDefault = getDefaultPayoutValue(nextTypeId);
    const prevDefault = getDefaultPayoutValue(prevTypeId);
    const shouldUpdate =
      currentAmount === "" ||
      (prevDefault && String(currentAmount) === String(prevDefault.amount));
    if (!shouldUpdate) return;
    if (!nextDefault) {
      setAmount("");
      return;
    }
    setAmount(String(nextDefault.amount));
    if (nextDefault.currency) setCurrency(nextDefault.currency);
  };

  const handleSaveEdit = async () => {
    if (!editEvent) return;
    const startDateTime = dayjs(`${editDate}T${editStartTime}`).toISOString();
    const endDateTime = dayjs(`${editDate}T${editEndTime}`).toISOString();
    if (dayjs(endDateTime).valueOf() <= dayjs(startDateTime).valueOf()) return;
    const customName = editCustomName.trim();
    const updates = {
      startDateTime,
      endDateTime,
      publicLabel: editPublicLabel.trim(),
      customClientName: customName,
      customClientEmail: editCustomEmail.trim(),
      customClientPhone: editCustomPhone.trim(),
      priceAmount:
        editPriceAmount === "" ? null : Number.parseFloat(editPriceAmount),
      priceCurrency: editPriceCurrency || "USD",
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
    updates.payoutAmount =
      editPayoutAmount === "" ? null : Number.parseFloat(editPayoutAmount);
    updates.payoutCurrency = editPayoutCurrency || "USD";
    updates.sessionTypeId = editSessionTypeId || null;
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
      sessionTypeId: quickBookSessionTypeId || null,
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
        sessionTypeId: quickBookSessionTypeId || null,
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
        sessionTypeId: quickBookSessionTypeId || null,
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

  const trainerBookingSlots = useMemo(() => {
    if (!eventActionTarget || eventActionTarget.eventType !== "AVAILABILITY") return [];
    const start = dayjs(eventActionTarget.startDateTime);
    const end = dayjs(eventActionTarget.endDateTime);
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
  }, [eventActionTarget]);

  useEffect(() => {
    if (!openTrainerBookDialog) return;
    if (trainerBookingSlots.length > 0) {
      setTrainerBookSlot(trainerBookingSlots[0].value);
    } else {
      setTrainerBookSlot("");
    }
  }, [openTrainerBookDialog, trainerBookingSlots]);

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
          dispatch(requestWorkoutQueue(clientId, selectedDate.startOf("week").format("YYYY-MM-DD")))
        )
      );
    }
    refreshSchedule();
  };

  const handleTrainerBookSlot = async () => {
    if (!eventActionTarget || eventActionTarget.eventType !== "AVAILABILITY") return;
    const slot = trainerBookingSlots.find((item) => item.value === trainerBookSlot);
    if (!slot) return;
    const hasCustomName = Boolean(trainerBookCustomName.trim());
    if (!trainerBookClientId && !hasCustomName) return;

    await dispatch(
      trainerBookAvailability({
        availabilityEventId: eventActionTarget._id,
        clientId: trainerBookClientId || null,
        startDateTime: slot.start.toISOString(),
        endDateTime: slot.end.toISOString(),
        customClientName: hasCustomName ? trainerBookCustomName.trim() : "",
        customClientEmail: trainerBookCustomEmail.trim(),
        customClientPhone: trainerBookCustomPhone.trim(),
        sessionTypeId: trainerBookSessionTypeId || null,
      })
    );
    setOpenTrainerBookDialog(false);
    setEventActionTarget(null);
    refreshSchedule();
  };

  const weekStart = useMemo(() => {
    if (isShareMode && shareWeekStartDate) {
      return dayjs(shareWeekStartDate).startOf("day");
    }
    return selectedDate.startOf("week");
  }, [isShareMode, selectedDate, shareWeekStartDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );
  const weekRangeLabel = useMemo(() => {
    const start = weekStart;
    const end = weekStart.add(6, "day");
    return `${start.format("MMM D")} - ${end.format("MMM D")}`;
  }, [weekStart]);
  const weekRangeDisplay = useMemo(() => {
    const start = weekStart;
    const end = weekStart.add(6, "day");
    return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
  }, [weekStart]);
  const timeColumnWidth = useMemo(() => (isShareMode ? 48 : 64), [isShareMode]);
  const currencyAffix = useMemo(() => {
    const currency = editPriceCurrency || "USD";
    switch (currency) {
      case "EUR":
        return { position: "end", label: "€" };
      case "JPY":
        return { position: "start", label: "¥" };
      case "USD":
      default:
        return { position: "start", label: "$" };
    }
  }, [editPriceCurrency]);
  const formatPrice = useCallback((amount, currency) => {
    if (amount == null || Number.isNaN(Number(amount))) return "";
    const value = Number(amount).toFixed(2);
    switch (currency) {
      case "EUR":
        return `${value} €`;
      case "JPY":
        return `¥${value}`;
      case "USD":
      default:
        return `$${value}`;
    }
  }, []);
  const acceptedClients = useMemo(
    () => clients.filter((clientRel) => clientRel.accepted),
    [clients]
  );
  const totalSlots = Math.max((calendarEndHour - calendarStartHour) * 2, 0);
  const calendarContentHeight = HEADER_HEIGHT + totalSlots * SLOT_HEIGHT;

  const weekEvents = useMemo(() => {
    const start = weekStart.startOf("day");
    const end = weekStart.add(7, "day").startOf("day");
    const sourceEvents = isShareMode ? shareEvents : scheduleData.events || [];
    return sourceEvents.filter((event) => {
      const eventStart = dayjs(event.startDateTime);
      const eventEnd = dayjs(event.endDateTime);
      return eventStart.isBefore(end) && eventEnd.isAfter(start);
    });
  }, [isShareMode, scheduleData.events, shareEvents, weekStart]);
  const weekClientOptions = useMemo(() => {
    const seen = new Map();
    weekEvents.forEach((event) => {
      if (event.eventType === "AVAILABILITY") return;
      if (event.clientId) {
        const key = `client:${event.clientId}`;
        if (!seen.has(key)) {
          seen.set(key, {
            key,
            label: clientLookup.get(event.clientId) || "Assigned client",
            type: "client",
          });
        }
        return;
      }
      if (event.customClientName) {
        const key = `custom:${event.customClientName}`;
        if (!seen.has(key)) {
          seen.set(key, {
            key,
            label: event.customClientName,
            type: "custom",
          });
        }
      }
    });
    return Array.from(seen.values());
  }, [clientLookup, weekEvents]);
  useEffect(() => {
    if (!openShareDialog) return;
    setShareShownKeys([]);
  }, [openShareDialog, weekClientOptions]);

  useEffect(() => {
    if (!openTimeSettings) return;
    setDraftStartHour(calendarStartHour);
    setDraftEndHour(calendarEndHour);
  }, [calendarEndHour, calendarStartHour, openTimeSettings]);

  useEffect(() => {
    const weekNode = weekScrollRef.current;
    const totalsNode = totalsScrollRef.current;
    if (!weekNode || !totalsNode) return;

    const syncScroll = (source, target) => {
      if (syncingScrollRef.current) return;
      syncingScrollRef.current = true;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        syncingScrollRef.current = false;
      });
    };

    const onWeekScroll = () => syncScroll(weekNode, totalsNode);
    const onTotalsScroll = () => syncScroll(totalsNode, weekNode);

    weekNode.addEventListener("scroll", onWeekScroll);
    totalsNode.addEventListener("scroll", onTotalsScroll);
    return () => {
      weekNode.removeEventListener("scroll", onWeekScroll);
      totalsNode.removeEventListener("scroll", onTotalsScroll);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setTouchSelectionEnabled(true);
    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);
  const filteredWeekEvents = useMemo(() => {
    if (!isTrainerView) return weekEvents;
    if (!activeClientIds.length) return weekEvents;
    return weekEvents.filter((event) => {
      if (event.eventType === "AVAILABILITY") return true;
      if (!event.clientId) return false;
      return activeClientIds.includes(event.clientId);
    });
  }, [activeClientIds, isTrainerView, weekEvents]);
  const isCountableSession = useCallback(
    (event) => event.eventType !== "AVAILABILITY" && event.status !== "CANCELLED",
    []
  );
  const resolveEventAmount = useCallback((event) => {
    if (
      event.payoutAmount != null &&
      !Number.isNaN(Number(event.payoutAmount))
    ) {
      return {
        amount: Number(event.payoutAmount),
        currency: event.payoutCurrency || event.priceCurrency || "USD",
      };
    }
    if (event.priceAmount == null || Number.isNaN(Number(event.priceAmount))) return null;
    return { amount: Number(event.priceAmount), currency: event.priceCurrency || "USD" };
  }, []);
  const totalizePrices = useCallback(
    (events) =>
      (events || []).reduce((acc, event) => {
        if (!isCountableSession(event)) return acc;
        const resolved = resolveEventAmount(event);
        if (!resolved) return acc;
        acc[resolved.currency] = (acc[resolved.currency] || 0) + resolved.amount;
        return acc;
      }, {}),
    [isCountableSession, resolveEventAmount]
  );
  const totalizeCancelled = useCallback(
    (events) =>
      (events || []).reduce((acc, event) => {
        if (event.eventType === "AVAILABILITY") return acc;
        if (event.status !== "CANCELLED") return acc;
        const resolved = resolveEventAmount(event);
        if (!resolved) return acc;
        acc[resolved.currency] = (acc[resolved.currency] || 0) + resolved.amount;
        return acc;
      }, {}),
    [resolveEventAmount]
  );
  const weekTotals = useMemo(() => totalizePrices(filteredWeekEvents), [filteredWeekEvents, totalizePrices]);
  const weekCancelledTotals = useMemo(
    () => totalizeCancelled(filteredWeekEvents),
    [filteredWeekEvents, totalizeCancelled]
  );
  const dayTotalsByColumn = useMemo(
    () =>
      weekDays.map((day) => {
        const dayEvents = weekEvents.filter((event) =>
          dayjs(event.startDateTime).isSame(day, "day")
        );
        return totalizePrices(dayEvents);
      }),
    [totalizePrices, weekDays, weekEvents]
  );
  const dayCancelledByColumn = useMemo(
    () =>
      weekDays.map((day) => {
        const dayEvents = weekEvents.filter((event) =>
          dayjs(event.startDateTime).isSame(day, "day")
        );
        return totalizeCancelled(dayEvents);
      }),
    [totalizeCancelled, weekDays, weekEvents]
  );
  const dayCountsByColumn = useMemo(
    () =>
      weekDays.map((day) =>
        weekEvents.filter(
          (event) => isCountableSession(event) && dayjs(event.startDateTime).isSame(day, "day")
        ).length
      ),
    [isCountableSession, weekDays, weekEvents]
  );
  const weekEventCount = useMemo(
    () => weekEvents.filter((event) => isCountableSession(event)).length,
    [isCountableSession, weekEvents]
  );
  const weekEventRows = useMemo(() => {
    return [...filteredWeekEvents].sort(
      (a, b) => dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf()
    );
  }, [filteredWeekEvents]);

  const getRowClientLabel = useCallback(
    (event) => {
      if (isTrainerView && (event.clientId || event.customClientName)) {
        return getEventDisplayName(event);
      }
      if (isClientView && selectedTrainerId) {
        return selectedTrainerLabel || "Trainer";
      }
      if (event.eventType === "AVAILABILITY") return "Open slot";
      return "—";
    },
    [getEventDisplayName, isClientView, isTrainerView, selectedTrainerId, selectedTrainerLabel]
  );

  const getRowPriceLabel = useCallback(
    (event) => {
      if (event.priceAmount == null) return "No price";
      return formatPrice(event.priceAmount, event.priceCurrency || "USD");
    },
    [formatPrice]
  );
  const getRowPayoutLabel = useCallback(
    (event) => {
      if (event.payoutAmount != null && !Number.isNaN(Number(event.payoutAmount))) {
        return formatPrice(event.payoutAmount, event.payoutCurrency || "USD");
      }
      if (event.priceAmount != null && !Number.isNaN(Number(event.priceAmount))) {
        return formatPrice(event.priceAmount, event.priceCurrency || "USD");
      }
      return "No payout";
    },
    [formatPrice]
  );

  const getRowTimeLabel = useCallback(
    (event) => dayjs(event.startDateTime).format("h:mm A"),
    []
  );

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => index), []);
  const formatHourLabel = useCallback((hour) => dayjs().hour(hour).minute(0).format("h A"), []);
  const timeSettingsError = draftEndHour <= draftStartHour;

  const weekTypeOptions = useMemo(
    () => Array.from(new Set(weekEventRows.map((event) => event.eventType))).sort(),
    [weekEventRows]
  );
  const weekStatusOptions = useMemo(
    () => Array.from(new Set(weekEventRows.map((event) => event.status))).sort(),
    [weekEventRows]
  );
  const weekTableClientOptions = useMemo(() => {
    const options = new Set();
    weekEventRows.forEach((event) => options.add(getRowClientLabel(event)));
    return Array.from(options).sort();
  }, [getRowClientLabel, weekEventRows]);
  const weekPriceOptions = useMemo(() => {
    const options = new Set();
    weekEventRows.forEach((event) => options.add(getRowPriceLabel(event)));
    return Array.from(options).sort();
  }, [getRowPriceLabel, weekEventRows]);
  const weekTimeOptions = useMemo(() => {
    const start = dayjs().hour(calendarStartHour).minute(0).second(0).millisecond(0);
    const end = dayjs().hour(calendarEndHour).minute(0).second(0).millisecond(0);
    const times = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end)) {
      times.push(current.format("h:mm A"));
      current = current.add(1, "hour");
    }
    return times;
  }, [calendarEndHour, calendarStartHour]);
  const filteredWeekRows = useMemo(() => {
    return weekEventRows.filter((event) => {
      if (tableFilterTypes.length > 0 && !tableFilterTypes.includes(event.eventType)) {
        return false;
      }
      if (tableFilterStatuses.length > 0 && !tableFilterStatuses.includes(event.status)) {
        return false;
      }
      if (tableFilterDates.length > 0) {
        const eventDate = dayjs(event.startDateTime).format("YYYY-MM-DD");
        if (!tableFilterDates.includes(eventDate)) return false;
      }
      if (tableFilterTimes.length > 0) {
        const timeLabel = getRowTimeLabel(event);
        if (!tableFilterTimes.includes(timeLabel)) return false;
      }
      if (tableFilterPrices.length > 0) {
        const priceLabel = getRowPriceLabel(event);
        if (!tableFilterPrices.includes(priceLabel)) return false;
      }
      if (tableFilterClients.length > 0) {
        const display = getRowClientLabel(event);
        if (!tableFilterClients.includes(display)) return false;
      }
      return true;
    });
  }, [
    weekEventRows,
    tableFilterTypes,
    tableFilterStatuses,
    tableFilterDates,
    tableFilterTimes,
    tableFilterClients,
    tableFilterPrices,
    getRowClientLabel,
    getRowPriceLabel,
    getRowTimeLabel,
  ]);
  const sortedWeekRows = useMemo(() => {
    const sorted = [...filteredWeekRows];
    const direction = tableSortDirection === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      switch (tableSortKey) {
        case "time":
        case "date": {
          const aTime = dayjs(a.startDateTime).valueOf();
          const bTime = dayjs(b.startDateTime).valueOf();
          return (aTime - bTime) * direction;
        }
        case "type":
          return a.eventType.localeCompare(b.eventType) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        case "client": {
          const aName = getEventDisplayName(a).toLowerCase();
          const bName = getEventDisplayName(b).toLowerCase();
          return aName.localeCompare(bName) * direction;
        }
        case "price": {
          const aPrice = Number(a.payoutAmount ?? 0);
          const bPrice = Number(b.payoutAmount ?? 0);
          return (aPrice - bPrice) * direction;
        }
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredWeekRows, tableSortDirection, tableSortKey, getEventDisplayName]);

  const openTableFilter = (event, key, label) => {
    setTableFilterKey(key);
    setTableFilterLabel(label || "");
    setTableFilterAnchor(event.currentTarget);
  };

  const closeTableFilter = () => {
    setTableFilterAnchor(null);
    setTableFilterKey("");
    setTableFilterLabel("");
  };

  const toggleTableSort = (key) => {
    const next =
      tableSortKey === key && tableSortDirection === "asc" ? "desc" : "asc";
    setTableSortKey(key);
    setTableSortDirection(next);
  };

  const applyTableSort = (key, direction) => {
    if (!key) return;
    setTableSortKey(key);
    setTableSortDirection(direction);
  };

  const isColumnHidden = useCallback(
    (key) => hiddenTableColumns.includes(key),
    [hiddenTableColumns]
  );

  const toggleColumnVisibility = (key) => {
    setHiddenTableColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const showAllColumns = () => {
    setHiddenTableColumns([]);
  };

  const isTableFilterActive = useMemo(
    () =>
      tableFilterTypes.length > 0 ||
      tableFilterStatuses.length > 0 ||
      tableFilterPrices.length > 0 ||
      tableFilterDates.length > 0 ||
      tableFilterTimes.length > 0 ||
      tableFilterClients.length > 0,
    [
      tableFilterClients,
      tableFilterPrices,
      tableFilterStatuses,
      tableFilterTypes,
      tableFilterDates,
      tableFilterTimes,
    ]
  );

  const tableColumnCount = useMemo(() => {
    let count = 0;
    if (!isColumnHidden("date")) count += 1;
    if (!isColumnHidden("time")) count += 1;
    if (!isColumnHidden("type")) count += 1;
    if (!isColumnHidden("status")) count += 1;
    if (!isColumnHidden("client")) count += 1;
    if (
      isTrainerView &&
      !(isShareMode && shareHidePrices) &&
      !isColumnHidden("price")
    ) {
      count += 1;
    }
    return count + 1;
  }, [isColumnHidden, isTrainerView, isShareMode, shareHidePrices]);
  const formatTotals = useCallback(
    (totals) => {
      const entries = Object.entries(totals || {});
      if (!entries.length) return "—";
      return entries.map(([currency, total]) => formatPrice(total, currency)).join(" • ");
    },
    [formatPrice]
  );

  const getEventStyle = (event, day) => {
    const dayStart = day.startOf("day");
    const dayEnd = day.add(1, "day").startOf("day");
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);
    const start = eventStart.isBefore(dayStart) ? dayStart : eventStart;
    const end = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

    const startMinutes = start.diff(dayStart, "minute");
    const endMinutes = end.diff(dayStart, "minute");
    const topMinutes = Math.max(startMinutes - calendarStartHour * 60, 0);
    const bottomMinutes = Math.min(
      endMinutes - calendarStartHour * 60,
      (calendarEndHour - calendarStartHour) * 60
    );

    if (bottomMinutes <= 0 || topMinutes >= (calendarEndHour - calendarStartHour) * 60) return null;

    return {
      top: Math.floor(topMinutes / SLOT_MINUTES) * SLOT_HEIGHT,
      height: Math.max(1, Math.ceil((bottomMinutes - topMinutes) / SLOT_MINUTES) * SLOT_HEIGHT),
    };
  };

  const handleSlotMouseDown = (event, dayIndex, slotIndex) => {
    if (!isTrainerView) return;
    if (event.button !== 0) return;
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
    const touch = event.touches?.[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    touchSelectionRef.current = { active: false, dayIndex, slotIndex };
    setOpenSelectionDialog(false);
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    touchTimerRef.current = setTimeout(() => {
      touchSelectionRef.current = { active: true, dayIndex, slotIndex };
      setIsDragging(true);
      setDragSelection({ dayIndex, startIndex: slotIndex, endIndex: slotIndex });
      setSelectedDate(weekDays[dayIndex]);
    }, 220);
  };

  const handleSlotTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    if (!touchSelectionRef.current.active) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
      return;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;
    event.preventDefault();
    updateSelectionFromPoint(touch.clientX, touch.clientY);
  };

  const handleSlotTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    if (!touchSelectionRef.current.active) return;
    setIsDragging(false);
    if (!isTrainerView) return;
    if (!selectionRange) return;
    if (selectionRange.end.valueOf() <= selectionRange.start.valueOf()) return;
    setOpenSelectionDialog(true);
    touchSelectionRef.current = { active: false, dayIndex: 0, slotIndex: 0 };
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
    const startMinutes = calendarStartHour * 60 + normalizedSelection.startIndex * SLOT_MINUTES;
    const endMinutes = calendarStartHour * 60 + (normalizedSelection.endIndex + 1) * SLOT_MINUTES;
    const start = day.startOf("day").add(startMinutes, "minute");
    const end = day.startOf("day").add(endMinutes, "minute");
    return { start, end };
  }, [calendarStartHour, normalizedSelection, weekDays]);

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
    setQuickBookSessionTypeId("");
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
            <Typography variant="h4">Scheduling</Typography>
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
          <Container maxWidth="md" sx={{ height: "100%", paddingTop: "25px", maxWidth: "100%" }}>
            <Grid size={12} container sx={{ justifyContent: "center", flexWrap: "nowrap" }}>
              <Button onClick={() => setSelectedDate(selectedDate.subtract(1, "week"))}>
                <ArrowBack sx={{ color: "primary.dark" }} />
              </Button>
              <TextField
                focused
                label="Week"
                type="text"
                color="primary"
                value={weekRangeDisplay}
                onClick={() => {
                  if (weekPickerRef.current?.showPicker) {
                    weekPickerRef.current.showPicker();
                  } else if (weekPickerRef.current) {
                    weekPickerRef.current.click();
                    weekPickerRef.current.focus();
                  }
                }}
                InputProps={{ readOnly: true }}
              />
              <Button onClick={() => setSelectedDate(selectedDate.add(1, "week"))}>
                <ArrowForward sx={{ color: "primary.dark" }} />
              </Button>
              <input
                ref={weekPickerRef}
                type="date"
                value={selectedDate.format("YYYY-MM-DD")}
                onChange={(event) => setSelectedDate(dayjs(event.target.value))}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: 0,
                  height: 0,
                }}
              />
            </Grid>
            <Divider sx={{ margin: "15px" }} />
          </Container>
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
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                    <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />
                  </Stack>
                )}
                {isTrainerView && !isShareMode && shareLinkStatus && (
                  <Typography variant="caption" color="text.secondary">
                    {shareLinkStatus}
                  </Typography>
                )}
                {!isShareMode && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Zoom
                    </Typography>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={calendarScale}
                      onChange={(_, value) => {
                        if (!value) return;
                        setCalendarScale(value);
                      }}
                    >
                      <ToggleButton value={0.85}>Compact</ToggleButton>
                      <ToggleButton value={1}>Normal</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                )}
                <Menu
                  anchorEl={calendarMenuAnchor}
                  open={Boolean(calendarMenuAnchor)}
                  onClose={handleCalendarMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      handleCalendarMenuClose();
                      openCopyDay();
                    }}
                  >
                    Copy day
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCalendarMenuClose();
                      openCopyWeek();
                    }}
                  >
                    Copy week
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCalendarMenuClose();
                      setShareStatus("");
                      setShareWeekStartDate(selectedDate.startOf("week").format("YYYY-MM-DD"));
                      setOpenShareDialog(true);
                    }}
                  >
                    Copy week image
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCalendarMenuClose();
                      setShareLinkStatus("");
                      handleCopyShareLink();
                    }}
                  >
                    Copy share link
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCalendarMenuClose();
                      setOpenTimeSettings(true);
                    }}
                  >
                    Calendar hours
                  </MenuItem>
                </Menu>
                <Box
                  ref={weekScrollRef}
                  sx={{
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: 2,
                    overflowX: { xs: "auto", md: "hidden" },
                    overflowY: calendarScale < 1 ? "hidden" : "auto",
                    height:
                      calendarScale < 1
                        ? `${calendarContentHeight * calendarScale}px`
                        : "auto",
                    minHeight:
                      calendarScale < 1
                        ? `${calendarContentHeight * calendarScale}px`
                        : undefined,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      transform: `scale(${calendarScale})`,
                      transformOrigin: "top left",
                      width: `calc(100% / ${calendarScale})`,
                      WebkitTextSizeAdjust: "100%",
                      textSizeAdjust: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: timeColumnWidth,
                        minWidth: timeColumnWidth,
                        maxWidth: timeColumnWidth,
                        borderRight: "1px solid rgba(148, 163, 184, 0.35)",
                      }}
                    >
                      <Box
                        sx={{
                          height: HEADER_HEIGHT,
                          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconButton
                          aria-label="Calendar settings"
                          onClick={(event) => setCalendarMenuAnchor(event.currentTarget)}
                          size="small"
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Box>
                      {Array.from({ length: totalSlots }).map((_, index) => {
                        const minutes = calendarStartHour * 60 + index * SLOT_MINUTES;
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
                        gridTemplateColumns: isShareMode
                          ? "repeat(7, minmax(0, 1fr))"
                          : "repeat(7, minmax(96px, 1fr))",
                        minWidth: isShareMode ? "auto" : "672px",
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
                              onMouseDown={(event) => handleSlotMouseDown(event, dayIndex, slotIndex)}
                              onMouseEnter={() => handleSlotMouseEnter(dayIndex, slotIndex)}
                              onTouchStart={
                                touchSelectionEnabled
                                  ? (event) => handleSlotTouchStart(event, dayIndex, slotIndex)
                                  : undefined
                              }
                              onTouchMove={touchSelectionEnabled ? handleSlotTouchMove : undefined}
                              onTouchEnd={touchSelectionEnabled ? handleSlotTouchEnd : undefined}
                              data-day-index={dayIndex}
                              data-slot-index={slotIndex}
                              sx={{
                                height: SLOT_HEIGHT,
                                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                                backgroundColor: slotIndex % 2 === 0 ? "rgba(148,163,184,0.06)" : "transparent",
                                touchAction: "pan-x pan-y",
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
                                    backgroundColor: (() => {
                                      if (
                                        isShareMode &&
                                        shareHideDetails &&
                                        shareHighlightShown &&
                                        ((event.clientId &&
                                          shareShownKeys.includes(`client:${event.clientId}`)) ||
                                          (event.customClientName &&
                                            shareShownKeys.includes(`custom:${event.customClientName}`)))
                                      ) {
                                        return highlightFill;
                                      }
                                      if (event.status === "CANCELLED") {
                                        return "rgba(244, 67, 54, 0.12)";
                                      }
                                      return event.eventType === "AVAILABILITY"
                                        ? "rgba(76, 175, 80, 0.25)"
                                        : "rgba(33, 150, 243, 0.25)";
                                    })(),
                                    border:
                                      event.status === "CANCELLED"
                                        ? "1px dashed rgba(244, 67, 54, 0.6)"
                                        : "1px solid rgba(25, 118, 210, 0.4)",
                                    borderRadius: 1,
                                    px: 0.5,
                                    py: 0.25,
                                    overflow: "hidden",
                                    opacity: event.status === "CANCELLED" ? 0.75 : 1,
                                    cursor: isTrainerView || (isClientView && event.eventType === "AVAILABILITY")
                                      ? "pointer"
                                      : "default",
                                  }}
                                  onClick={() => {
                                    if (isTrainerView) {
                                      openActionForEvent(event);
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
                                    <Stack spacing={0.25}>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                      {!(
                                        isShareMode &&
                                        shareHideDetails &&
                                        ((event.clientId && !shareShownKeys.includes(`client:${event.clientId}`)) ||
                                          (event.customClientName &&
                                            !shareShownKeys.includes(`custom:${event.customClientName}`)) ||
                                          (!event.clientId && !event.customClientName))
                                      ) &&
                                        event.clientId && (
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
                                            ? (clientLookup.get(event.clientId) || "B")[0]
                                            : String(event.clientId) === String(user._id)
                                            ? user.firstName?.[0] || "M"
                                            : "B"}
                                        </Avatar>
                                      )}
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight:
                                            isShareMode &&
                                            shareHideDetails &&
                                            shareHighlightShown &&
                                            ((event.clientId &&
                                              shareShownKeys.includes(`client:${event.clientId}`)) ||
                                              (event.customClientName &&
                                                shareShownKeys.includes(`custom:${event.customClientName}`)))
                                              ? 700
                                              : 400,
                                          textDecoration:
                                            event.status === "CANCELLED" ? "line-through" : "none",
                                        }}
                                      >
                                        {getEventDisplayName(event)}
                                      </Typography>
                                      </Stack>
                                      {event.status === "CANCELLED" && (
                                        <Typography variant="caption" color="error">
                                          Cancelled
                                        </Typography>
                                      )}
                                      {isTrainerView &&
                                        !(isShareMode && shareHidePrices) && (
                                        <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                          {getRowPayoutLabel(event)}
                                        </Typography>
                                      )}
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
                </Box>
                {isTrainerView && !(isShareMode && shareHidePrices) && (
                  <Box
                    ref={totalsScrollRef}
                    sx={{
                      overflowX: { xs: "auto", md: "hidden" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `${timeColumnWidth}px repeat(7, minmax(${isShareMode ? 0 : 96}px, 1fr))`,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        borderTop: "1px solid rgba(148, 163, 184, 0.35)",
                        borderRadius: "8px",
                        minWidth: isShareMode ? "auto" : "736px",
                      }}
                    >
                      <Box
                        sx={{
                          borderRight: "1px solid rgba(148, 163, 184, 0.35)",
                          py: 1,
                          px: 0,
                          fontSize: "0.7rem",
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          minWidth: timeColumnWidth,
                          maxWidth: timeColumnWidth,
                        }}
                      >
                        {" "}
                      </Box>
                      {dayTotalsByColumn.map((totals, index) => (
                      <Box
                        key={`total-${index}`}
                        sx={{
                          borderLeft: "1px solid rgba(148, 163, 184, 0.2)",
                          py: 1,
                          px: 1,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                        }}
                      >
                        {formatTotals(totals)}
                        {Object.keys(dayCancelledByColumn[index] || {}).length > 0 && (
                          <Typography variant="caption" color="error" display="block">
                            Lost: {formatTotals(dayCancelledByColumn[index])}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dayCountsByColumn[index]} sessions
                        </Typography>
                      </Box>
                    ))}
                      <Box
                        sx={{
                          gridColumn: "2 / span 7",
                          borderLeft: "1px solid rgba(148, 163, 184, 0.2)",
                          py: 1,
                          px: 1,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                        }}
                      >
                        {formatTotals(weekTotals)}
                        {Object.keys(weekCancelledTotals || {}).length > 0 && (
                          <Typography variant="caption" color="error" display="block">
                            Lost: {formatTotals(weekCancelledTotals)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {weekEventCount} sessions
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
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
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSessionTypesStatus("");
                        setOpenSessionTypesDialog(true);
                      }}
                    >
                      Manage session types
                    </Button>
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
        <Grid container size={12} sx={{ minWidth: 0 }}>
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
              <Typography variant="h6">
                Week of {weekRangeLabel}
              </Typography>
              {isTrainerView && Object.keys(weekTotals).length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Week total:{" "}
                  {Object.entries(weekTotals)
                    .map(([currency, total]) => `${currency} ${total.toFixed(2)}`)
                    .join(" • ")}
                </Typography>
              )}
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
            <Card>
              <CardContent>
                  <Stack spacing={2} sx={{ minWidth: 0 }}>
                  <Typography variant="h6">Session Events (Week)</Typography>
                    <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                      <Table size="small" sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          {!isColumnHidden("date") && (
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={(event) => openTableFilter(event, "date", "Date")}
                                >
                                  Date
                                </Button>
                                <IconButton size="small" onClick={() => toggleTableSort("date")}>
                                  {tableSortKey === "date" && tableSortDirection === "desc" ? (
                                    <ArrowDownward fontSize="inherit" />
                                  ) : (
                                    <ArrowUpward fontSize="inherit" />
                                  )}
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                          {!isColumnHidden("time") && (
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={(event) => openTableFilter(event, "time", "Time")}
                                >
                                  Time
                                </Button>
                                <IconButton size="small" onClick={() => toggleTableSort("time")}>
                                  {tableSortKey === "time" && tableSortDirection === "desc" ? (
                                    <ArrowDownward fontSize="inherit" />
                                  ) : (
                                    <ArrowUpward fontSize="inherit" />
                                  )}
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                          {!isColumnHidden("type") && (
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={(event) => openTableFilter(event, "type", "Type")}
                                >
                                  Type
                                </Button>
                                <IconButton size="small" onClick={() => toggleTableSort("type")}>
                                  {tableSortKey === "type" && tableSortDirection === "desc" ? (
                                    <ArrowDownward fontSize="inherit" />
                                  ) : (
                                    <ArrowUpward fontSize="inherit" />
                                  )}
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                          {!isColumnHidden("status") && (
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={(event) => openTableFilter(event, "status", "Status")}
                                >
                                  Status
                                </Button>
                                <IconButton size="small" onClick={() => toggleTableSort("status")}>
                                  {tableSortKey === "status" && tableSortDirection === "desc" ? (
                                    <ArrowDownward fontSize="inherit" />
                                  ) : (
                                    <ArrowUpward fontSize="inherit" />
                                  )}
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                          {!isColumnHidden("client") && (
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={(event) => openTableFilter(event, "client", "Client")}
                                >
                                  Client
                                </Button>
                                <IconButton size="small" onClick={() => toggleTableSort("client")}>
                                  {tableSortKey === "client" && tableSortDirection === "desc" ? (
                                    <ArrowDownward fontSize="inherit" />
                                  ) : (
                                    <ArrowUpward fontSize="inherit" />
                                  )}
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                          {isTrainerView &&
                            !(isShareMode && shareHidePrices) &&
                            !isColumnHidden("price") && (
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={(event) => openTableFilter(event, "price", "Price")}
                                  >
                                    Price
                                  </Button>
                                  <IconButton size="small" onClick={() => toggleTableSort("price")}>
                                    {tableSortKey === "price" && tableSortDirection === "desc" ? (
                                      <ArrowDownward fontSize="inherit" />
                                    ) : (
                                      <ArrowUpward fontSize="inherit" />
                                    )}
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            )}
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedWeekRows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={tableColumnCount}>
                              <Typography color="text.secondary">
                                {isTableFilterActive
                                  ? "No session events match the current filters."
                                  : "No session events."}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {sortedWeekRows.map((event) => (
                          <TableRow key={event._id}>
                            {!isColumnHidden("date") && (
                              <TableCell>
                                {dayjs(event.startDateTime).format("ddd, MMM D")}
                              </TableCell>
                            )}
                            {!isColumnHidden("time") && (
                              <TableCell>{formatRange(event)}</TableCell>
                            )}
                            {!isColumnHidden("type") && (
                              <TableCell>
                                <Chip
                                  label={event.eventType}
                                  color={scheduleColors[event.eventType] || "default"}
                                  size="small"
                                />
                              </TableCell>
                            )}
                            {!isColumnHidden("status") && (
                              <TableCell>
                                <Chip
                                  label={event.status}
                                  color={statusColors[event.status] || "default"}
                                  size="small"
                                />
                              </TableCell>
                            )}
                            {!isColumnHidden("client") && (
                              <TableCell>
                                {isTrainerView && (event.clientId || event.customClientName)
                                  ? getEventDisplayName(event)
                                  : isClientView && selectedTrainerId
                                  ? selectedTrainerLabel || "Trainer"
                                  : event.eventType === "AVAILABILITY"
                                  ? "Open slot"
                                  : "—"}
                              </TableCell>
                            )}
                            {isTrainerView &&
                              !(isShareMode && shareHidePrices) &&
                              !isColumnHidden("price") && (
                                <TableCell>
                                  {getRowPayoutLabel(event)}
                                </TableCell>
                              )}
                            <TableCell>
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
                                {isTrainerView && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => openActionForEvent(event)}
                                  >
                                    Details
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
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </Box>
                </Stack>
              </CardContent>
            </Card>
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
                <FormControl fullWidth>
                  <InputLabel>Session type</InputLabel>
                  <Select
                    label="Session type"
                    value={quickBookSessionTypeId}
                    onChange={(event) => setQuickBookSessionTypeId(event.target.value)}
                  >
                    <MenuItem value="">No session type</MenuItem>
                    {sessionTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Price</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={editPriceAmount}
                    onChange={(event) => setEditPriceAmount(event.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    InputProps={
                      currencyAffix.position === "start"
                        ? {
                            startAdornment: (
                              <Box sx={{ mr: 1, color: "text.secondary" }}>
                                {currencyAffix.label}
                              </Box>
                            ),
                          }
                        : {
                            endAdornment: (
                              <Box sx={{ ml: 1, color: "text.secondary" }}>
                                {currencyAffix.label}
                              </Box>
                            ),
                          }
                    }
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={editPriceCurrency}
                      onChange={(event) => setEditPriceCurrency(event.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="JPY">YEN</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            )}
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Trainer payout</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={editPayoutAmount}
                    onChange={(event) => setEditPayoutAmount(event.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={editPayoutCurrency}
                      onChange={(event) => setEditPayoutCurrency(event.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="JPY">YEN</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            )}
            {isTrainerView && editEvent?.eventType !== "AVAILABILITY" && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Public label</Typography>
                <TextField
                  label="Public label"
                  value={editPublicLabel}
                  onChange={(event) => setEditPublicLabel(event.target.value)}
                  placeholder="Booked / Unavailable / Reserved / Custom"
                />
                <Typography variant="caption" color="text.secondary">
                  Shows on public sessions and share images when client details are hidden.
                </Typography>
              </Stack>
            )}
            {isTrainerView &&
              (editEvent?.eventType !== "AVAILABILITY" || editClientId || editCustomName) && (
              <FormControl fullWidth>
                <InputLabel>Session type</InputLabel>
                <Select
                  label="Session type"
                  value={editSessionTypeId}
                  onChange={(event) => {
                    const nextTypeId = event.target.value;
                    const prevTypeId = editSessionTypeId;
                    setEditSessionTypeId(nextTypeId);
                    applyDefaultPriceForType(
                      nextTypeId,
                      prevTypeId,
                      editPriceAmount,
                      setEditPriceAmount,
                      setEditPriceCurrency
                    );
                    applyDefaultPayoutForType(
                      nextTypeId,
                      prevTypeId,
                      editPayoutAmount,
                      setEditPayoutAmount,
                      setEditPayoutCurrency
                    );
                  }}
                >
                  <MenuItem value="">No session type</MenuItem>
                  {sessionTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          {isTrainerView && editEvent && editEvent.eventType !== "AVAILABILITY" && (
            <Button
              variant="outlined"
              onClick={async () => {
                await handleReopenEvent(editEvent);
                setOpenEditDialog(false);
              }}
            >
              Reopen slot
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
        open={openEventActionDialog}
        onClose={() => setOpenEventActionDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Session Actions</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {eventActionTarget && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">
                  {eventActionTarget.eventType === "AVAILABILITY" ? "Open slot" : "Booked session"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatRange(eventActionTarget)}
                </Typography>
                {eventActionTarget.eventType !== "AVAILABILITY" && (
                  <Typography variant="caption" color="text.secondary">
                    {getEventDisplayName(eventActionTarget)}
                  </Typography>
                )}
                {isTrainerView && getSessionTypeLabel(eventActionTarget) && (
                  <Typography variant="caption" color="text.secondary">
                    Session type: {getSessionTypeLabel(eventActionTarget)}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1}>
                {eventActionTarget.eventType === "AVAILABILITY" &&
                  eventActionTarget.status === "OPEN" && (
                    <Button variant="contained" onClick={() => openTrainerBookForEvent(eventActionTarget)}>
                      Book 1-hour slot
                    </Button>
                  )}
                <Button variant="outlined" onClick={() => {
                  setOpenEventActionDialog(false);
                  openEditForEvent(eventActionTarget);
                }}>
                  Edit details
                </Button>
                {eventActionTarget.status !== "CANCELLED" && (
                  <Button variant="outlined" onClick={() => {
                    setOpenEventActionDialog(false);
                    openCopyForEvent(eventActionTarget);
                  }}>
                    Copy
                  </Button>
                )}
                {eventActionTarget.status === "OPEN" && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenEventActionDialog(false);
                      handleCancelEvent(eventActionTarget._id);
                    }}
                  >
                    Close slot
                  </Button>
                )}
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setOpenEventActionDialog(false);
                    openDeleteConfirm(eventActionTarget);
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventActionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTrainerBookDialog}
        onClose={() => setOpenTrainerBookDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Book 1-hour Slot</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {eventActionTarget && (
              <Typography variant="body2" color="text.secondary">
                {formatRange(eventActionTarget)}
              </Typography>
            )}
            {trainerBookingSlots.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Choose 1-hour slot</InputLabel>
                <Select
                  label="Choose 1-hour slot"
                  value={trainerBookSlot}
                  onChange={(event) => setTrainerBookSlot(event.target.value)}
                >
                  {trainerBookingSlots.map((slot) => (
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
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                label="Client"
                value={trainerBookClientId}
                onChange={(event) => {
                  setTrainerBookClientId(event.target.value);
                  if (event.target.value) {
                    setTrainerBookCustomName("");
                    setTrainerBookCustomEmail("");
                    setTrainerBookCustomPhone("");
                  }
                }}
              >
                <MenuItem value="">Custom booking</MenuItem>
                {clients
                  .filter((clientRel) => clientRel.accepted)
                  .map((clientRel) => (
                    <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                      {clientRel.client.firstName} {clientRel.client.lastName}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Session type</InputLabel>
              <Select
                label="Session type"
                value={trainerBookSessionTypeId}
                onChange={(event) => setTrainerBookSessionTypeId(event.target.value)}
              >
                <MenuItem value="">No session type</MenuItem>
                {sessionTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!trainerBookClientId && (
              <Stack spacing={1}>
                <TextField
                  label="Name"
                  value={trainerBookCustomName}
                  onChange={(event) => setTrainerBookCustomName(event.target.value)}
                />
                <TextField
                  label="Email"
                  value={trainerBookCustomEmail}
                  onChange={(event) => setTrainerBookCustomEmail(event.target.value)}
                />
                <TextField
                  label="Phone"
                  value={trainerBookCustomPhone}
                  onChange={(event) => setTrainerBookCustomPhone(event.target.value)}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainerBookDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTrainerBookSlot}
            disabled={
              trainerBookingSlots.length === 0 ||
              !trainerBookSlot ||
              (!trainerBookClientId && !trainerBookCustomName.trim())
            }
          >
            Book slot
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSessionTypesDialog}
        onClose={() => setOpenSessionTypesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Types</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {sessionTypesStatus && (
              <Typography variant="caption" color="error">
                {sessionTypesStatus}
              </Typography>
            )}
            {sessionTypes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No session types yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {sessionTypes.map((type) => (
                  <Card key={type._id} variant="outlined">
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1">{type.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(type.defaultPrice || 0, type.currency || "USD")}
                        </Typography>
                        {type.defaultPayout != null && (
                          <Typography variant="caption" color="text.secondary">
                            Payout: {formatPrice(type.defaultPayout || 0, type.payoutCurrency || "USD")}
                          </Typography>
                        )}
                        {type.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {type.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditSessionType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => handleDeleteSessionType(type._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
            <Divider />
            <Button
              variant="contained"
              onClick={() => {
                resetSessionTypeForm();
                setOpenSessionTypeFormDialog(true);
              }}
            >
              New session type
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionTypesDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSessionTypeFormDialog}
        onClose={() => setOpenSessionTypeFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSessionTypeId ? "Edit session type" : "New session type"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={sessionTypeForm.name}
              onChange={(event) =>
                setSessionTypeForm((prev) => ({ ...prev, name: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={sessionTypeForm.description}
              onChange={(event) =>
                setSessionTypeForm((prev) => ({ ...prev, description: event.target.value }))
              }
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Default price"
                type="number"
                value={sessionTypeForm.defaultPrice}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({ ...prev, defaultPrice: event.target.value }))
                }
                inputProps={{ min: 0, step: "0.01" }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  label="Currency"
                  value={sessionTypeForm.currency}
                  onChange={(event) =>
                    setSessionTypeForm((prev) => ({ ...prev, currency: event.target.value }))
                  }
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="JPY">YEN</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Default payout"
                type="number"
                value={sessionTypeForm.defaultPayout}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({ ...prev, defaultPayout: event.target.value }))
                }
                inputProps={{ min: 0, step: "0.01" }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Payout currency</InputLabel>
                <Select
                  label="Payout currency"
                  value={sessionTypeForm.payoutCurrency}
                  onChange={(event) =>
                    setSessionTypeForm((prev) => ({ ...prev, payoutCurrency: event.target.value }))
                  }
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="JPY">YEN</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {sessionTypesStatus && (
              <Typography variant="caption" color="error">
                {sessionTypesStatus}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetSessionTypeForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSessionType}
            disabled={!sessionTypeForm.name.trim()}
          >
            {editingSessionTypeId ? "Save changes" : "Add session type"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={tableFilterAnchor}
        open={Boolean(tableFilterAnchor)}
        onClose={closeTableFilter}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { minWidth: 220, p: 1 } }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            {tableFilterLabel || "Column options"}
          </Typography>
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Sort
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={
                  tableSortKey === tableFilterKey && tableSortDirection === "asc"
                    ? "contained"
                    : "outlined"
                }
                startIcon={<ArrowUpward fontSize="small" />}
                onClick={() => {
                  applyTableSort(tableFilterKey, "asc");
                  closeTableFilter();
                }}
              >
                Asc
              </Button>
              <Button
                size="small"
                variant={
                  tableSortKey === tableFilterKey && tableSortDirection === "desc"
                    ? "contained"
                    : "outlined"
                }
                startIcon={<ArrowDownward fontSize="small" />}
                onClick={() => {
                  applyTableSort(tableFilterKey, "desc");
                  closeTableFilter();
                }}
              >
                Desc
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Column visibility
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                toggleColumnVisibility(tableFilterKey);
                closeTableFilter();
              }}
            >
              {isColumnHidden(tableFilterKey) ? "Show column" : "Hide column"}
            </Button>
            {hiddenTableColumns.length > 0 && (
              <Stack spacing={1}>
                <Button size="small" onClick={showAllColumns}>
                  Show all columns
                </Button>
                <Stack spacing={0.5}>
                  {hiddenTableColumns.map((columnKey) => (
                    <Button
                      key={columnKey}
                      size="small"
                      variant="text"
                      onClick={() => toggleColumnVisibility(columnKey)}
                    >
                      Show {tableColumnLabels[columnKey] || columnKey}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Filter
            </Typography>
            {tableFilterKey === "type" && (
              <>
                <MenuItem dense onClick={() => setTableFilterTypes([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekTypeOptions.map((type) => {
                    const isChecked = tableFilterTypes.includes(type);
                    return (
                      <MenuItem
                        key={type}
                        dense
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((item) => item !== type)
                              : [...prev, type]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText primary={type} primaryTypographyProps={{ variant: "body2" }} />
                      </MenuItem>
                    );
                  })}
                </Box>
                {tableFilterTypes.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterTypes([])}>
                    Clear filter
                  </Button>
                )}
              </>
            )}
            {tableFilterKey === "date" && (
              <>
                <MenuItem dense onClick={() => setTableFilterDates([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekDays.map((day) => {
                    const value = day.format("YYYY-MM-DD");
                    const isChecked = tableFilterDates.includes(value);
                    return (
                      <MenuItem
                        dense
                        key={value}
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterDates((prev) =>
                            prev.includes(value)
                              ? prev.filter((item) => item !== value)
                              : [...prev, value]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText
                          primary={day.format("ddd, MMM D")}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })}
                </Box>
                {tableFilterDates.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterDates([])}>
                    Clear filter
                  </Button>
                )}
              </>
            )}
            {tableFilterKey === "time" && (
              <>
                <MenuItem dense onClick={() => setTableFilterTimes([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekTimeOptions.map((timeLabel) => {
                    const isChecked = tableFilterTimes.includes(timeLabel);
                    return (
                      <MenuItem
                        key={timeLabel}
                        dense
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterTimes((prev) =>
                            prev.includes(timeLabel)
                              ? prev.filter((item) => item !== timeLabel)
                              : [...prev, timeLabel]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText
                          primary={timeLabel}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })}
                </Box>
                {tableFilterTimes.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterTimes([])}>
                    Clear filter
                  </Button>
                )}
              </>
            )}
            {tableFilterKey === "status" && (
              <>
                <MenuItem dense onClick={() => setTableFilterStatuses([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekStatusOptions.map((status) => {
                    const isChecked = tableFilterStatuses.includes(status);
                    return (
                      <MenuItem
                        key={status}
                        dense
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterStatuses((prev) =>
                            prev.includes(status)
                              ? prev.filter((item) => item !== status)
                              : [...prev, status]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText
                          primary={status}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })}
                </Box>
                {tableFilterStatuses.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterStatuses([])}>
                    Clear filter
                  </Button>
                )}
              </>
            )}
            {tableFilterKey === "client" && (
              <Stack spacing={0.75}>
                <TextField
                  label="Client contains"
                  value={tableFilterClientQuery}
                  onChange={(event) => setTableFilterClientQuery(event.target.value)}
                  size="small"
                  fullWidth
                />
                <MenuItem dense onClick={() => setTableFilterClients([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekTableClientOptions
                    .filter((client) =>
                      client.toLowerCase().includes(tableFilterClientQuery.trim().toLowerCase())
                    )
                    .map((client) => {
                      const isChecked = tableFilterClients.includes(client);
                      return (
                        <MenuItem
                          key={client}
                          dense
                          sx={{ py: 0.25 }}
                          onClick={() =>
                            setTableFilterClients((prev) =>
                              prev.includes(client)
                                ? prev.filter((item) => item !== client)
                                : [...prev, client]
                            )
                          }
                        >
                          <Checkbox size="small" checked={isChecked} />
                          <ListItemText
                            primary={client}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </MenuItem>
                      );
                    })}
                </Box>
                {tableFilterClients.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterClients([])}>
                    Clear filter
                  </Button>
                )}
              </Stack>
            )}
            {tableFilterKey === "price" && (
              <>
                <MenuItem dense onClick={() => setTableFilterPrices([])}>
                  All
                </MenuItem>
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  {weekPriceOptions.map((priceLabel) => {
                    const isChecked = tableFilterPrices.includes(priceLabel);
                    return (
                      <MenuItem
                        key={priceLabel}
                        dense
                        sx={{ py: 0.25 }}
                        onClick={() =>
                          setTableFilterPrices((prev) =>
                            prev.includes(priceLabel)
                              ? prev.filter((item) => item !== priceLabel)
                              : [...prev, priceLabel]
                          )
                        }
                      >
                        <Checkbox size="small" checked={isChecked} />
                        <ListItemText
                          primary={priceLabel}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })}
                </Box>
                {tableFilterPrices.length > 0 && (
                  <Button size="small" onClick={() => setTableFilterPrices([])}>
                    Clear filter
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Menu>

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
              Select the day to copy and the target date.
            </Typography>
            <TextField
              label="Source day"
              type="date"
              value={copyDaySourceDate}
              onChange={(event) => setCopyDaySourceDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
          <Button
            variant="contained"
            onClick={handleCopyDay}
            disabled={!copyDayDate || !copyDaySourceDate}
          >
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
            <TextField
              label="Week starting"
              type="date"
              value={shareWeekStartDate}
              onChange={(event) => setShareWeekStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
                  checked={shareHidePrices}
                  onChange={(event) => setShareHidePrices(event.target.checked)}
                />
              }
              label="Hide prices and totals"
            />
            {shareHideDetails && (
              <Autocomplete
                multiple
                options={weekClientOptions}
                getOptionLabel={(option) => option.label}
                value={weekClientOptions.filter((option) =>
                  shareShownKeys.includes(option.key)
                )}
                onChange={(_, value) => {
                  setShareShownKeys(value.map((item) => item.key));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Show these clients"
                    placeholder="All clients hidden"
                  />
                )}
              />
            )}
            {shareHideDetails && shareShownKeys.length > 0 && (
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={shareHighlightShown}
                      onChange={(event) => setShareHighlightShown(event.target.checked)}
                    />
                  }
                  label="Highlight shown clients"
                />
                {shareHighlightShown && (
                  <TextField
                    label="Highlight color"
                    type="color"
                    value={shareHighlightColor}
                    onChange={(event) => setShareHighlightColor(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Stack>
            )}
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
        open={openTimeSettings}
        onClose={() => setOpenTimeSettings(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Calendar hours</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Start time</InputLabel>
              <Select
                label="Start time"
                value={draftStartHour}
                onChange={(event) => setDraftStartHour(Number(event.target.value))}
              >
                {hourOptions.map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth error={timeSettingsError}>
              <InputLabel>End time</InputLabel>
              <Select
                label="End time"
                value={draftEndHour}
                onChange={(event) => setDraftEndHour(Number(event.target.value))}
              >
                {hourOptions.map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </MenuItem>
                ))}
              </Select>
              {timeSettingsError && (
                <Typography variant="caption" color="error">
                  End time must be after the start time.
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTimeSettings(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={timeSettingsError}
            onClick={() => {
              setCalendarStartHour(draftStartHour);
              setCalendarEndHour(draftEndHour);
              setOpenTimeSettings(false);
            }}
          >
            Save
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
