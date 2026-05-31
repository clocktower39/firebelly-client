import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import CalendarHoursDialog from "./components/CalendarHoursDialog";
import CopyShareDialogs from "./components/CopyShareDialogs";
import DeleteEventDialog from "./components/DeleteEventDialog";
import EventActionDialogs from "./components/EventActionDialogs";
import ScheduleControlsCard from "./components/ScheduleControlsCard";
import SessionEventsTable from "./components/SessionEventsTable";
import SessionTypeDialogs from "./components/SessionTypeDialogs";
import SchedulePageHeader from "./components/SchedulePageHeader";
import ScheduleTableFilterMenu from "./components/ScheduleTableFilterMenu";
import UnassignedWorkoutsPanel from "./components/UnassignedWorkoutsPanel";
import WeekCalendar from "./components/WeekCalendar";
import WeekNavigator from "./components/WeekNavigator";
import usePersistentSchedulePreference from "./hooks/usePersistentSchedulePreference";
import useScheduleClipboardShare from "./hooks/useScheduleClipboardShare";
import useScheduleBilling from "./hooks/useScheduleBilling";
import useScheduleRange from "./hooks/useScheduleRange";
import useScheduleSelection from "./hooks/useScheduleSelection";
import useScheduleTableFilters from "./hooks/useScheduleTableFilters";
import useScheduleWorkouts from "./hooks/useScheduleWorkouts";
import useSessionTypes from "./hooks/useSessionTypes";
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
  trainerBookAvailability,
  serverURL,
  deleteScheduleEvent,
  updateScheduleEvent,
} from "../../Redux/actions";

dayjs.extend(utc);

import {
  EMPTY_SCHEDULE_DATA,
  EMPTY_WORKOUT_QUEUE_BY_ACCOUNT,
  EMPTY_WORKOUTS,
  EMPTY_WORKOUTS_BY_ACCOUNT,
  SLOT_HEIGHT,
  SLOT_MINUTES,
  WEEK_END_HOUR,
  WEEK_START_HOUR,
  tableColumnLabels,
} from "./constants";
import {
  buildBookingEndOptions,
  buildBookingStartOptions,
  buildScopeKey,
  buildWeeklyRule,
  formatRange,
  pickDefaultBookingEnd,
} from "./utils/scheduleUtils";


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
  const [trainerBookEndSlot, setTrainerBookEndSlot] = useState("");
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

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [availabilityType, setAvailabilityType] = useState("MANUAL");
  const [availabilityRecurrence, setAvailabilityRecurrence] = useState("none");

  const [bookingType, setBookingType] = useState("one-time");
  const [selectedBookingSlot, setSelectedBookingSlot] = useState("");
  const [selectedBookingEndSlot, setSelectedBookingEndSlot] = useState("");
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
  const [calendarScale, setCalendarScale] = usePersistentSchedulePreference(
    "schedule.calendarScale",
    1
  );
  const [trainerBookSessionTypeId, setTrainerBookSessionTypeId] = useState("");

  const weekCaptureRef = useRef(null);
  const weekPickerRef = useRef(null);
  const weekScrollRef = useRef(null);
  const totalsScrollRef = useRef(null);
  const syncingScrollRef = useRef(false);

  const isTrainerView = user.isTrainer && !bookingAsClient;
  const isClientView = !isTrainerView;
  const {
    sessionTypes,
    sessionTypesStatus,
    setSessionTypesStatus,
    openSessionTypesDialog,
    setOpenSessionTypesDialog,
    openSessionTypeFormDialog,
    setOpenSessionTypeFormDialog,
    sessionTypeForm,
    setSessionTypeForm,
    editingSessionTypeId,
    sessionTypeLookup,
    resetSessionTypeForm,
    handleSaveSessionType,
    handleEditSessionType,
    handleDeleteSessionType,
  } = useSessionTypes({ isTrainer: user.isTrainer });

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

  const {
    billingSummary,
    billingLoading,
    selectedTypeEntry,
    selectedTypeName,
    refreshBillingSummary,
  } = useScheduleBilling({
    isTrainerView,
    userId: user._id,
    selectedTrainerId,
    selectedClientIds,
    openEditDialog,
    editSessionTypeId,
    openSelectionDialog,
    quickBookSessionTypeId,
    openTrainerBookDialog,
    trainerBookSessionTypeId,
    sessionTypeLookup,
  });

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
    const visibleWeekStart = selectedDate.startOf("week").startOf("day");
    const visibleWeekEnd = visibleWeekStart.add(7, "day").startOf("day");
    const requestedClientId =
      isTrainerView && selectedClientIds.length === 1 ? selectedClientIds[0] : null;
    dispatch(
      requestScheduleRange({
        startDate: visibleWeekStart.toISOString(),
        endDate: visibleWeekEnd.toISOString(),
        trainerId: effectiveTrainerId,
        clientId: isTrainerView ? requestedClientId : user._id,
        includeAvailability: true,
      })
    );
    refreshBillingSummary();
  };

  useEffect(() => {
    refreshSchedule();
  }, [dispatch, isTrainerView, selectedDate, selectedTrainerId, selectedClientIds, user._id]);

  const scopeKey = buildScopeKey(
    isTrainerView ? user._id : selectedTrainerId,
    isTrainerView ? (selectedClientIds.length === 1 ? selectedClientIds[0] : null) : user._id
  );

  const scheduleData =
    useSelector((state) => state.scheduleEvents?.[scopeKey]) || EMPTY_SCHEDULE_DATA;
  const workoutsByAccount =
    useSelector((state) => state.workouts) || EMPTY_WORKOUTS_BY_ACCOUNT;
  const workoutQueue =
    useSelector((state) => state.workoutQueue) || EMPTY_WORKOUT_QUEUE_BY_ACCOUNT;

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

  const {
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
  } = useScheduleWorkouts({
    dispatch,
    user,
    isTrainerView,
    selectedClientIds,
    selectedDate,
    scheduleData,
    attachEvent,
    workoutsByAccount,
    workoutQueue,
  });

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
    const start = bookingStartOptions.find((item) => item.value === selectedBookingSlot);
    const end = bookingEndOptions.find((item) => item.value === selectedBookingEndSlot);
    const bookingStart = start ? start.time.toISOString() : activeRequestEvent.startDateTime;
    const bookingEnd = end ? end.time.toISOString() : activeRequestEvent.endDateTime;
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
    setSelectedBookingEndSlot("");
    setOpenRequestDialog(true);
  };

  const bookingStartOptions = useMemo(
    () => buildBookingStartOptions(activeRequestEvent),
    [activeRequestEvent]
  );

  const bookingEndOptions = useMemo(
    () => buildBookingEndOptions(activeRequestEvent, selectedBookingSlot),
    [activeRequestEvent, selectedBookingSlot]
  );

  useEffect(() => {
    if (bookingStartOptions.length > 0) {
      setSelectedBookingSlot((prev) =>
        bookingStartOptions.some((option) => option.value === prev)
          ? prev
          : bookingStartOptions[0].value
      );
    } else {
      setSelectedBookingSlot("");
    }
  }, [bookingStartOptions]);

  useEffect(() => {
    if (bookingEndOptions.length > 0) {
      setSelectedBookingEndSlot((prev) =>
        bookingEndOptions.some((option) => option.value === prev)
          ? prev
          : pickDefaultBookingEnd(selectedBookingSlot, bookingEndOptions)
      );
    } else {
      setSelectedBookingEndSlot("");
    }
  }, [selectedBookingSlot, bookingEndOptions]);

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
    setTrainerBookEndSlot("");
    setTrainerBookClientId("");
    setTrainerBookCustomName("");
    setTrainerBookCustomEmail("");
    setTrainerBookCustomPhone("");
    setTrainerBookSessionTypeId("");
    setOpenTrainerBookDialog(true);
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
    () => workoutsByAccount?.[quickBookClientId]?.workouts || EMPTY_WORKOUTS,
    [quickBookClientId, workoutsByAccount]
  );
  const quickBookQueuedWorkouts = useMemo(
    () => workoutQueue?.[quickBookClientId] || EMPTY_WORKOUTS,
    [quickBookClientId, workoutQueue]
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

  const trainerBookingStartOptions = useMemo(
    () => buildBookingStartOptions(eventActionTarget),
    [eventActionTarget]
  );

  const trainerBookingEndOptions = useMemo(
    () => buildBookingEndOptions(eventActionTarget, trainerBookSlot),
    [eventActionTarget, trainerBookSlot]
  );

  useEffect(() => {
    if (!openTrainerBookDialog) return;
    if (trainerBookingStartOptions.length > 0) {
      setTrainerBookSlot((prev) =>
        trainerBookingStartOptions.some((option) => option.value === prev)
          ? prev
          : trainerBookingStartOptions[0].value
      );
    } else {
      setTrainerBookSlot("");
    }
  }, [openTrainerBookDialog, trainerBookingStartOptions]);

  useEffect(() => {
    if (!openTrainerBookDialog) return;
    if (trainerBookingEndOptions.length > 0) {
      setTrainerBookEndSlot((prev) =>
        trainerBookingEndOptions.some((option) => option.value === prev)
          ? prev
          : pickDefaultBookingEnd(trainerBookSlot, trainerBookingEndOptions)
      );
    } else {
      setTrainerBookEndSlot("");
    }
  }, [openTrainerBookDialog, trainerBookSlot, trainerBookingEndOptions]);

  const handleAttachQueuedWorkout = async (workoutId) => {
    const targetEvent = attachableEvents.find((event) => event._id === queueTargetEventId);
    if (!targetEvent) return;
    const workoutMatch = visibleQueuedWorkouts.find((workout) => workout._id === workoutId);
    const workoutUserId =
      typeof workoutMatch?.user === "object" ? workoutMatch?.user?._id : workoutMatch?.user;
    if (targetEvent.eventType === "AVAILABILITY") {
      const start = queueBookingStartOptions.find((item) => item.value === selectedQueueSlot);
      const end = queueBookingEndOptions.find((item) => item.value === selectedQueueEndSlot);
      if (!start || !end) return;
      await dispatch(
        trainerBookAvailability({
          availabilityEventId: targetEvent._id,
          clientId: workoutUserId,
          startDateTime: start.time.toISOString(),
          endDateTime: end.time.toISOString(),
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
    const start = trainerBookingStartOptions.find((item) => item.value === trainerBookSlot);
    const end = trainerBookingEndOptions.find((item) => item.value === trainerBookEndSlot);
    if (!start || !end) return;
    const hasCustomName = Boolean(trainerBookCustomName.trim());
    if (!trainerBookClientId && !hasCustomName) return;

    await dispatch(
      trainerBookAvailability({
        availabilityEventId: eventActionTarget._id,
        clientId: trainerBookClientId || null,
        startDateTime: start.time.toISOString(),
        endDateTime: end.time.toISOString(),
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

  const {
    weekStart,
    weekDays,
    weekRangeLabel,
    weekRangeDisplay,
    timeColumnWidth,
    totalSlots,
    calendarContentHeight,
    weekEvents,
    weekClientOptions,
    filteredWeekEvents,
    weekTotals,
    weekCancelledTotals,
    dayTotalsByColumn,
    dayCancelledByColumn,
    dayCountsByColumn,
    weekEventCount,
    weekEventRows,
    formatTotals,
  } = useScheduleRange({
    selectedDate,
    isShareMode,
    shareWeekStartDate,
    calendarStartHour,
    calendarEndHour,
    scheduleData,
    shareEvents,
    clientLookup,
    isTrainerView,
    activeClientIds,
    formatPrice,
  });

  const {
    openCopyForEvent,
    openCopyDay,
    openCopyWeek,
    handleCopyEvent,
    handleCopyDay,
    handleCopyWeek,
    handleShareWeek,
    handleCopyShareLink,
  } = useScheduleClipboardShare({
    dispatch,
    user,
    selectedTrainerId,
    selectedDate,
    weekStart,
    weekEvents,
    filteredWeekEvents,
    weekCaptureRef,
    refreshSchedule,
    isTrainerView,
    copySourceEvent,
    setCopySourceEvent,
    copyDate,
    setCopyDate,
    copyStartTime,
    setCopyStartTime,
    copyEndTime,
    setCopyEndTime,
    setOpenCopyDialog,
    copyDayDate,
    setCopyDayDate,
    copyDaySourceDate,
    setCopyDaySourceDate,
    setOpenCopyDayDialog,
    copyWeekDate,
    setCopyWeekDate,
    setOpenCopyWeekDialog,
    shareWeekStartDate,
    setShareWeekStartDate,
    setShareEvents,
    setShareInProgress,
    setShareStatus,
    setIsShareMode,
    setShareLinkStatus,
  });

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

  const resetSelectionBookingForm = useCallback(() => {
    setQuickBookClientId("");
    setQuickBookWorkoutId("");
    setQuickBookCustomName("");
    setQuickBookCustomEmail("");
    setQuickBookCustomPhone("");
    setQuickBookSessionTypeId("");
  }, []);

  const {
    setDragSelection,
    normalizedSelection,
    selectionRange,
    selectionRangeAdjusted,
    selectionStartTime,
    setSelectionStartTime,
    selectionEndTime,
    setSelectionEndTime,
    touchSelectionEnabled,
    handleSlotMouseDown,
    handleSlotMouseEnter,
    handleSlotTouchStart,
    handleSlotTouchMove,
    handleSlotTouchEnd,
    handleClearSelection,
  } = useScheduleSelection({
    isTrainerView,
    weekDays,
    calendarStartHour,
    openSelectionDialog,
    setSelectedDate,
    setOpenSelectionDialog,
    onClearSelection: resetSelectionBookingForm,
  });
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

  const {
    tableSortKey,
    tableSortDirection,
    tableFilterTypes,
    setTableFilterTypes,
    tableFilterStatuses,
    setTableFilterStatuses,
    tableFilterClients,
    setTableFilterClients,
    tableFilterPrices,
    setTableFilterPrices,
    tableFilterTimes,
    setTableFilterTimes,
    tableFilterClientQuery,
    setTableFilterClientQuery,
    tableFilterDates,
    setTableFilterDates,
    tableFilterAnchor,
    tableFilterKey,
    tableFilterLabel,
    hiddenTableColumns,
    weekTypeOptions,
    weekStatusOptions,
    weekTableClientOptions,
    weekPriceOptions,
    weekTimeOptions,
    sortedWeekRows,
    openTableFilter,
    closeTableFilter,
    toggleTableSort,
    applyTableSort,
    isColumnHidden,
    toggleColumnVisibility,
    showAllColumns,
    isTableFilterActive,
    tableColumnCount,
  } = useScheduleTableFilters({
    weekEventRows,
    calendarStartHour,
    calendarEndHour,
    isTrainerView,
    isShareMode,
    shareHidePrices,
    getRowClientLabel,
    getRowPriceLabel,
    getRowTimeLabel,
    getEventDisplayName,
  });

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

  return (
    <>
      <Grid container size={12} spacing={2}>
        <SchedulePageHeader
          isTrainerView={isTrainerView}
          clientParam={clientParam}
          selectedClientLabel={selectedClientLabel}
          onClearClientFilter={handleClearClientFilter}
          onOpenAvailability={handleOpenAvailability}
          billingLoading={billingLoading}
          billingSummary={billingSummary}
          selectedTypeEntry={selectedTypeEntry}
          selectedTypeName={selectedTypeName}
        />

        <WeekNavigator
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekPickerRef={weekPickerRef}
          weekRangeDisplay={weekRangeDisplay}
          dayjs={dayjs}
        />

        <WeekCalendar
          weekCaptureRef={weekCaptureRef}
          weekScrollRef={weekScrollRef}
          totalsScrollRef={totalsScrollRef}
          isShareMode={isShareMode}
          shareIncludeHeader={shareIncludeHeader}
          user={user}
          weekRangeLabel={weekRangeLabel}
          isTrainerView={isTrainerView}
          isClientView={isClientView}
          shareLinkStatus={shareLinkStatus}
          calendarScale={calendarScale}
          setCalendarScale={setCalendarScale}
          calendarMenuAnchor={calendarMenuAnchor}
          setCalendarMenuAnchor={setCalendarMenuAnchor}
          handleCalendarMenuClose={handleCalendarMenuClose}
          openCopyDay={openCopyDay}
          openCopyWeek={openCopyWeek}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setShareStatus={setShareStatus}
          setShareWeekStartDate={setShareWeekStartDate}
          setOpenShareDialog={setOpenShareDialog}
          setShareLinkStatus={setShareLinkStatus}
          handleCopyShareLink={handleCopyShareLink}
          setOpenTimeSettings={setOpenTimeSettings}
          calendarContentHeight={calendarContentHeight}
          timeColumnWidth={timeColumnWidth}
          totalSlots={totalSlots}
          calendarStartHour={calendarStartHour}
          weekDays={weekDays}
          normalizedSelection={normalizedSelection}
          handleSlotMouseDown={handleSlotMouseDown}
          handleSlotMouseEnter={handleSlotMouseEnter}
          touchSelectionEnabled={touchSelectionEnabled}
          handleSlotTouchStart={handleSlotTouchStart}
          handleSlotTouchMove={handleSlotTouchMove}
          handleSlotTouchEnd={handleSlotTouchEnd}
          weekEvents={weekEvents}
          getEventStyle={getEventStyle}
          openActionForEvent={openActionForEvent}
          openRequestForEvent={openRequestForEvent}
          shareHideDetails={shareHideDetails}
          shareHighlightShown={shareHighlightShown}
          shareShownKeys={shareShownKeys}
          highlightFill={highlightFill}
          clientProfileLookup={clientProfileLookup}
          clientLookup={clientLookup}
          serverURL={serverURL}
          shareHidePrices={shareHidePrices}
          getEventDisplayName={getEventDisplayName}
          getRowPayoutLabel={getRowPayoutLabel}
          dayTotalsByColumn={dayTotalsByColumn}
          formatTotals={formatTotals}
          dayCancelledByColumn={dayCancelledByColumn}
          dayCountsByColumn={dayCountsByColumn}
          weekTotals={weekTotals}
          weekCancelledTotals={weekCancelledTotals}
          weekEventCount={weekEventCount}
        />

        <ScheduleControlsCard
          user={user}
          clients={clients}
          myTrainers={myTrainers}
          isClientView={isClientView}
          isTrainerView={isTrainerView}
          bookingAsClient={bookingAsClient}
          setBookingAsClient={setBookingAsClient}
          selectedTrainerId={selectedTrainerId}
          setSelectedTrainerId={setSelectedTrainerId}
          setSelectedMyTrainerId={setSelectedMyTrainerId}
          selectedClientIds={selectedClientIds}
          setSelectedClientIds={setSelectedClientIds}
          setHasClientSelection={setHasClientSelection}
          setSessionTypesStatus={setSessionTypesStatus}
          setOpenSessionTypesDialog={setOpenSessionTypesDialog}
        />
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
            <SessionEventsTable
              sortedWeekRows={sortedWeekRows}
              tableColumnCount={tableColumnCount}
              isTableFilterActive={isTableFilterActive}
              isColumnHidden={isColumnHidden}
              openTableFilter={openTableFilter}
              toggleTableSort={toggleTableSort}
              tableSortKey={tableSortKey}
              tableSortDirection={tableSortDirection}
              isTrainerView={isTrainerView}
              isClientView={isClientView}
              isShareMode={isShareMode}
              shareHidePrices={shareHidePrices}
              getEventDisplayName={getEventDisplayName}
              getRowPayoutLabel={getRowPayoutLabel}
              selectedTrainerId={selectedTrainerId}
              selectedTrainerLabel={selectedTrainerLabel}
              openActionForEvent={openActionForEvent}
              openRequestForEvent={openRequestForEvent}
            />
            <UnassignedWorkoutsPanel
              isTrainerView={isTrainerView}
              queueTargetEventId={queueTargetEventId}
              setQueueTargetEventId={setQueueTargetEventId}
              attachableEvents={attachableEvents}
              queueTargetEvent={queueTargetEvent}
              queueBookingStartOptions={queueBookingStartOptions}
              selectedQueueSlot={selectedQueueSlot}
              setSelectedQueueSlot={setSelectedQueueSlot}
              queueBookingEndOptions={queueBookingEndOptions}
              selectedQueueEndSlot={selectedQueueEndSlot}
              setSelectedQueueEndSlot={setSelectedQueueEndSlot}
              visibleQueuedWorkouts={visibleQueuedWorkouts}
              selectedClientIds={selectedClientIds}
              clientLookup={clientLookup}
              serverURL={serverURL}
              handleAttachQueuedWorkout={handleAttachQueuedWorkout}
            />
          </Stack>
        </Grid>
      </Grid>

      <EventActionDialogs
        openSelectionDialog={openSelectionDialog}
        handleClearSelection={handleClearSelection}
        selectionRange={selectionRange}
        selectionRangeAdjusted={selectionRangeAdjusted}
        selectionStartTime={selectionStartTime}
        setSelectionStartTime={setSelectionStartTime}
        selectionEndTime={selectionEndTime}
        setSelectionEndTime={setSelectionEndTime}
        clients={clients}
        quickBookClientId={quickBookClientId}
        setQuickBookClientId={setQuickBookClientId}
        quickBookWorkoutId={quickBookWorkoutId}
        setQuickBookWorkoutId={setQuickBookWorkoutId}
        quickBookWorkouts={quickBookWorkouts}
        quickBookQueuedWorkouts={quickBookQueuedWorkouts}
        quickBookSessionTypeId={quickBookSessionTypeId}
        setQuickBookSessionTypeId={setQuickBookSessionTypeId}
        sessionTypes={sessionTypes}
        handleQuickBookClient={handleQuickBookClient}
        handleQuickBookCreateWorkout={handleQuickBookCreateWorkout}
        quickBookCustomName={quickBookCustomName}
        setQuickBookCustomName={setQuickBookCustomName}
        quickBookCustomEmail={quickBookCustomEmail}
        setQuickBookCustomEmail={setQuickBookCustomEmail}
        quickBookCustomPhone={quickBookCustomPhone}
        setQuickBookCustomPhone={setQuickBookCustomPhone}
        handleQuickBookCustom={handleQuickBookCustom}
        handleCreateSlotsFromSelection={handleCreateSlotsFromSelection}
        openAvailabilityDialog={openAvailabilityDialog}
        setOpenAvailabilityDialog={setOpenAvailabilityDialog}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        availabilityType={availabilityType}
        setAvailabilityType={setAvailabilityType}
        availabilityRecurrence={availabilityRecurrence}
        setAvailabilityRecurrence={setAvailabilityRecurrence}
        handleCreateAvailability={handleCreateAvailability}
        openRequestDialog={openRequestDialog}
        setOpenRequestDialog={setOpenRequestDialog}
        activeRequestEvent={activeRequestEvent}
        formatRange={formatRange}
        bookingType={bookingType}
        setBookingType={setBookingType}
        bookingStartOptions={bookingStartOptions}
        selectedBookingSlot={selectedBookingSlot}
        setSelectedBookingSlot={setSelectedBookingSlot}
        bookingEndOptions={bookingEndOptions}
        selectedBookingEndSlot={selectedBookingEndSlot}
        setSelectedBookingEndSlot={setSelectedBookingEndSlot}
        handleRequestBooking={handleRequestBooking}
        openAttachDialog={openAttachDialog}
        setOpenAttachDialog={setOpenAttachDialog}
        attachEvent={attachEvent}
        selectedWorkoutId={selectedWorkoutId}
        setSelectedWorkoutId={setSelectedWorkoutId}
        attachWorkouts={attachWorkouts}
        attachQueuedWorkouts={attachQueuedWorkouts}
        handleCreateWorkout={handleCreateWorkout}
        handleAttachWorkout={handleAttachWorkout}
        openEditDialog={openEditDialog}
        setOpenEditDialog={setOpenEditDialog}
        editClientProfile={editClientProfile}
        editClientAvatar={editClientAvatar}
        editClientName={editClientName}
        editEvent={editEvent}
        attachedEditWorkout={attachedEditWorkout}
        editDate={editDate}
        setEditDate={setEditDate}
        editStartTime={editStartTime}
        setEditStartTime={setEditStartTime}
        editEndTime={editEndTime}
        setEditEndTime={setEditEndTime}
        isTrainerView={isTrainerView}
        editClientId={editClientId}
        setEditClientId={setEditClientId}
        editCustomName={editCustomName}
        setEditCustomName={setEditCustomName}
        editCustomEmail={editCustomEmail}
        setEditCustomEmail={setEditCustomEmail}
        editCustomPhone={editCustomPhone}
        setEditCustomPhone={setEditCustomPhone}
        editPriceAmount={editPriceAmount}
        setEditPriceAmount={setEditPriceAmount}
        currencyAffix={currencyAffix}
        editPriceCurrency={editPriceCurrency}
        setEditPriceCurrency={setEditPriceCurrency}
        editPayoutAmount={editPayoutAmount}
        setEditPayoutAmount={setEditPayoutAmount}
        editPayoutCurrency={editPayoutCurrency}
        setEditPayoutCurrency={setEditPayoutCurrency}
        editPublicLabel={editPublicLabel}
        setEditPublicLabel={setEditPublicLabel}
        editSessionTypeId={editSessionTypeId}
        setEditSessionTypeId={setEditSessionTypeId}
        applyDefaultPriceForType={applyDefaultPriceForType}
        applyDefaultPayoutForType={applyDefaultPayoutForType}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editWorkoutClientId={editWorkoutClientId}
        workoutsByAccount={workoutsByAccount}
        workoutQueue={workoutQueue}
        editWorkoutId={editWorkoutId}
        setEditWorkoutId={setEditWorkoutId}
        handleCreateWorkoutForEdit={handleCreateWorkoutForEdit}
        openCopyForEvent={openCopyForEvent}
        handleReopenEvent={handleReopenEvent}
        openDeleteConfirm={openDeleteConfirm}
        handleSaveEdit={handleSaveEdit}
        openEventActionDialog={openEventActionDialog}
        setOpenEventActionDialog={setOpenEventActionDialog}
        eventActionTarget={eventActionTarget}
        getEventDisplayName={getEventDisplayName}
        getSessionTypeLabel={getSessionTypeLabel}
        openTrainerBookForEvent={openTrainerBookForEvent}
        openEditForEvent={openEditForEvent}
        handleCancelEvent={handleCancelEvent}
        openTrainerBookDialog={openTrainerBookDialog}
        setOpenTrainerBookDialog={setOpenTrainerBookDialog}
        trainerBookingStartOptions={trainerBookingStartOptions}
        trainerBookSlot={trainerBookSlot}
        setTrainerBookSlot={setTrainerBookSlot}
        trainerBookingEndOptions={trainerBookingEndOptions}
        trainerBookEndSlot={trainerBookEndSlot}
        setTrainerBookEndSlot={setTrainerBookEndSlot}
        trainerBookClientId={trainerBookClientId}
        setTrainerBookClientId={setTrainerBookClientId}
        trainerBookSessionTypeId={trainerBookSessionTypeId}
        setTrainerBookSessionTypeId={setTrainerBookSessionTypeId}
        trainerBookCustomName={trainerBookCustomName}
        setTrainerBookCustomName={setTrainerBookCustomName}
        trainerBookCustomEmail={trainerBookCustomEmail}
        setTrainerBookCustomEmail={setTrainerBookCustomEmail}
        trainerBookCustomPhone={trainerBookCustomPhone}
        setTrainerBookCustomPhone={setTrainerBookCustomPhone}
        handleTrainerBookSlot={handleTrainerBookSlot}
      />

      <SessionTypeDialogs
        openSessionTypesDialog={openSessionTypesDialog}
        setOpenSessionTypesDialog={setOpenSessionTypesDialog}
        sessionTypesStatus={sessionTypesStatus}
        sessionTypes={sessionTypes}
        formatPrice={formatPrice}
        handleEditSessionType={handleEditSessionType}
        handleDeleteSessionType={handleDeleteSessionType}
        resetSessionTypeForm={resetSessionTypeForm}
        setOpenSessionTypeFormDialog={setOpenSessionTypeFormDialog}
        openSessionTypeFormDialog={openSessionTypeFormDialog}
        editingSessionTypeId={editingSessionTypeId}
        sessionTypeForm={sessionTypeForm}
        setSessionTypeForm={setSessionTypeForm}
        handleSaveSessionType={handleSaveSessionType}
      />

      <ScheduleTableFilterMenu
        anchorEl={tableFilterAnchor}
        onClose={closeTableFilter}
        tableFilterLabel={tableFilterLabel}
        tableSortKey={tableSortKey}
        tableFilterKey={tableFilterKey}
        tableSortDirection={tableSortDirection}
        applyTableSort={applyTableSort}
        toggleColumnVisibility={toggleColumnVisibility}
        isColumnHidden={isColumnHidden}
        hiddenTableColumns={hiddenTableColumns}
        showAllColumns={showAllColumns}
        tableColumnLabels={tableColumnLabels}
        tableFilterTypes={tableFilterTypes}
        setTableFilterTypes={setTableFilterTypes}
        weekTypeOptions={weekTypeOptions}
        tableFilterDates={tableFilterDates}
        setTableFilterDates={setTableFilterDates}
        weekDays={weekDays}
        tableFilterTimes={tableFilterTimes}
        setTableFilterTimes={setTableFilterTimes}
        weekTimeOptions={weekTimeOptions}
        tableFilterStatuses={tableFilterStatuses}
        setTableFilterStatuses={setTableFilterStatuses}
        weekStatusOptions={weekStatusOptions}
        tableFilterClientQuery={tableFilterClientQuery}
        setTableFilterClientQuery={setTableFilterClientQuery}
        weekTableClientOptions={weekTableClientOptions}
        tableFilterClients={tableFilterClients}
        setTableFilterClients={setTableFilterClients}
        tableFilterPrices={tableFilterPrices}
        setTableFilterPrices={setTableFilterPrices}
        weekPriceOptions={weekPriceOptions}
      />

      <CopyShareDialogs
        openCopyDialog={openCopyDialog}
        setOpenCopyDialog={setOpenCopyDialog}
        copySourceEvent={copySourceEvent}
        getEventDisplayName={getEventDisplayName}
        formatRange={formatRange}
        copyDate={copyDate}
        setCopyDate={setCopyDate}
        copyStartTime={copyStartTime}
        setCopyStartTime={setCopyStartTime}
        copyEndTime={copyEndTime}
        setCopyEndTime={setCopyEndTime}
        handleCopyEvent={handleCopyEvent}
        openCopyDayDialog={openCopyDayDialog}
        setOpenCopyDayDialog={setOpenCopyDayDialog}
        copyDaySourceDate={copyDaySourceDate}
        setCopyDaySourceDate={setCopyDaySourceDate}
        copyDayDate={copyDayDate}
        setCopyDayDate={setCopyDayDate}
        handleCopyDay={handleCopyDay}
        openCopyWeekDialog={openCopyWeekDialog}
        setOpenCopyWeekDialog={setOpenCopyWeekDialog}
        weekStart={weekStart}
        copyWeekDate={copyWeekDate}
        setCopyWeekDate={setCopyWeekDate}
        handleCopyWeek={handleCopyWeek}
        openShareDialog={openShareDialog}
        setOpenShareDialog={setOpenShareDialog}
        shareWeekStartDate={shareWeekStartDate}
        setShareWeekStartDate={setShareWeekStartDate}
        shareHideDetails={shareHideDetails}
        setShareHideDetails={setShareHideDetails}
        shareHidePrices={shareHidePrices}
        setShareHidePrices={setShareHidePrices}
        weekClientOptions={weekClientOptions}
        shareShownKeys={shareShownKeys}
        setShareShownKeys={setShareShownKeys}
        shareHighlightShown={shareHighlightShown}
        setShareHighlightShown={setShareHighlightShown}
        shareHighlightColor={shareHighlightColor}
        setShareHighlightColor={setShareHighlightColor}
        shareIncludeHeader={shareIncludeHeader}
        setShareIncludeHeader={setShareIncludeHeader}
        shareStatus={shareStatus}
        shareInProgress={shareInProgress}
        handleShareWeek={handleShareWeek}
      />

      <CalendarHoursDialog
        open={openTimeSettings}
        onClose={() => setOpenTimeSettings(false)}
        draftStartHour={draftStartHour}
        setDraftStartHour={setDraftStartHour}
        draftEndHour={draftEndHour}
        setDraftEndHour={setDraftEndHour}
        hourOptions={hourOptions}
        formatHourLabel={formatHourLabel}
        timeSettingsError={timeSettingsError}
        onSave={() => {
          setCalendarStartHour(draftStartHour);
          setCalendarEndHour(draftEndHour);
          setOpenTimeSettings(false);
        }}
      />

      <DeleteEventDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        deleteEvent={deleteEvent}
        onDelete={handleDeleteEvent}
        dayjs={dayjs}
      />
    </>
  );
}
