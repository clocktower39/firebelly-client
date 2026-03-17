import React, { useCallback, useState, useEffect, useRef, Fragment, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import deepEqual from "fast-deep-equal/react";
import { debounce } from "lodash";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Slide,
  TextField,
  Toolbar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Add, ArrowBack, Close as CloseIcon, Delete, Settings } from "@mui/icons-material";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import { WorkoutOptionModalView } from "../../Components/WorkoutOptionModal";
import { requestTraining, updateTraining, getExerciseList, requestExerciseProgress, serverURL } from "../../Redux/actions";
import Loading from "../../Components/Loading";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const classes = {
  modalStyle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  },
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
};

const CARDIO_STYLE_OPTIONS = [
  "Easy",
  "Long Run",
  "Tempo",
  "Intervals",
  "Hill",
  "Fartlek",
  "Race",
  "Recovery",
];

const CARDIO_ROUTE_OPTIONS = ["Road", "Trail", "Track", "Treadmill", "Mixed"];
const CARDIO_SURFACE_OPTIONS = ["Asphalt", "Concrete", "Dirt", "Grass", "Sand", "Track", "Treadmill"];
const CARDIO_WEATHER_OPTIONS = ["Sunny", "Cloudy", "Rain", "Windy", "Snow", "Indoor"];
const CARDIO_HR_ZONE_OPTIONS = [
  "Z1 Recovery",
  "Z2 Endurance",
  "Z3 Tempo",
  "Z4 Threshold",
  "Z5 VO2",
];

const DEFAULT_CARDIO_SEGMENT = {
  label: "",
  distance: "",
  duration: "",
  pace: "",
  rpe: "",
};

const DEFAULT_CARDIO_FIELDS = {
  style: "",
  distance: "",
  distanceUnit: "mi",
  duration: "",
  avgPace: "",
  avgSpeed: "",
  rpe: "",
  avgHeartRate: "",
  elevationGain: "",
  routeType: "",
  surface: "",
  shoes: "",
  cadence: "",
  strideLength: "",
  strideUnit: "in",
  routeLink: "",
  weather: "",
  temperature: "",
  temperatureUnit: "F",
  hrZone: "",
  notes: "",
  segments: [],
};

const buildCardioAuto = (cardio) => ({
  plan: {
    pace: !cardio?.plan?.avgPace,
    speed: !cardio?.plan?.avgSpeed,
  },
  actual: {
    pace: !cardio?.actual?.avgPace,
    speed: !cardio?.actual?.avgSpeed,
  },
});

const parseDurationToSeconds = (value) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":").map((part) => part.trim());
  if (!parts.length || parts.some((part) => part === "")) return null;
  const numbers = parts.map((part) => Number(part));
  if (numbers.some((num) => Number.isNaN(num))) return null;

  if (numbers.length === 3) {
    const [hours, minutes, seconds] = numbers;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (numbers.length === 2) {
    const [minutes, seconds] = numbers;
    return minutes * 60 + seconds;
  }

  if (numbers.length === 1) {
    const [minutes] = numbers;
    return minutes * 60;
  }

  return null;
};

const formatPace = (secondsPerUnit) => {
  if (!Number.isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "";
  const totalSeconds = Math.round(secondsPerUnit);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const computeDerivedCardio = (cardio) => {
  const distance = Number(cardio?.distance);
  const durationSeconds = parseDurationToSeconds(cardio?.duration || "");

  if (!distance || !durationSeconds) {
    return { pace: "", speed: "" };
  }

  const paceSeconds = durationSeconds / distance;
  const pace = formatPace(paceSeconds);
  const speed = durationSeconds > 0 ? (distance / (durationSeconds / 3600)).toFixed(2) : "";

  return { pace, speed };
};

const computeSplitSummary = (segments = []) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return { totalDistance: "", totalDuration: "", avgPace: "" };
  }

  const totalDistance = segments.reduce((sum, segment) => sum + Number(segment?.distance || 0), 0);
  const totalDurationSeconds = segments.reduce(
    (sum, segment) => sum + (parseDurationToSeconds(segment?.duration || "") || 0),
    0
  );

  const avgPace =
    totalDistance > 0 && totalDurationSeconds > 0
      ? formatPace(totalDurationSeconds / totalDistance)
      : "";

  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const seconds = totalDurationSeconds % 60;
  const totalDuration =
    totalDurationSeconds > 0
      ? hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`
      : "";

  return {
    totalDistance: totalDistance > 0 ? totalDistance.toFixed(2) : "",
    totalDuration,
    avgPace,
  };
};

const normalizeShoeName = (value) => (value || "").trim().toLowerCase();

const renderAutoAdornment = (isAuto) =>
  isAuto ? (
    <InputAdornment position="end">
      <Tooltip title="Auto-calculated from distance and duration. Edit to override.">
        <Chip size="small" label="Auto" variant="outlined" />
      </Tooltip>
    </InputAdornment>
  ) : null;

const normalizeCardioFields = (cardioFields) => {
  const source = cardioFields && typeof cardioFields === "object" ? cardioFields : {};
  return {
    ...DEFAULT_CARDIO_FIELDS,
    ...source,
    segments: Array.isArray(source.segments)
      ? source.segments.map((segment) => ({
          ...DEFAULT_CARDIO_SEGMENT,
          ...(segment || {}),
        }))
      : [],
  };
};

const normalizeCardio = (cardio) => {
  const source = cardio && typeof cardio === "object" ? cardio : {};
  if (source.plan || source.actual) {
    return {
      plan: normalizeCardioFields(source.plan),
      actual: normalizeCardioFields(source.actual),
    };
  }
  return {
    plan: normalizeCardioFields(source),
    actual: normalizeCardioFields({}),
  };
};

export const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Workout({ socket }) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnPath = searchParams.get("return");
  const sourceView = searchParams.get("source");
  const isProgramBuilder = sourceView === "program";
  const isLocalUpdate = useRef(true);
  const hasSynced = useRef(false);

  const user = useSelector((state) => state.user);
  const training = useSelector((state) => state.training);
  const [size = 900, setBorderHighlight] = useOutletContext();

  const isPersonalWorkout = useCallback(
    () => user._id.toString() === training?.user?._id?.toString(),
    [user._id, training?.user?._id]
  );

  const [localTraining, setLocalTraining] = useState([]);
  const [trainingCategory, setTrainingCategory] = useState([]);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [workoutCompleteStatus, setWorkoutCompleteStatus] = useState(training?.complete || false);
  const [loading, setLoading] = useState(true);
  const [workoutFeedback, setWorkoutFeedback] = useState(training?.workoutFeedback || { difficulty: 1, comments: [] });
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scheduleEvent, setScheduleEvent] = useState(null);
  const [workoutType, setWorkoutType] = useState(training?.workoutType || "Strength");
  const [cardioDetails, setCardioDetails] = useState(() => normalizeCardio(training?.cardio));
  const [cardioAuto, setCardioAuto] = useState(() =>
    buildCardioAuto(normalizeCardio(training?.cardio))
  );
  const [cardioViewMode, setCardioViewMode] = useState("plan");

  const activeWorkoutType = workoutType || training?.workoutType || "Strength";
  const isCardio = activeWorkoutType === "Cardio";
  const activeCardio = cardioDetails?.[cardioViewMode] || normalizeCardioFields({});
  const paceUnitLabel = activeCardio.distanceUnit === "km" ? "min/km" : "min/mi";
  const speedUnitLabel = activeCardio.distanceUnit === "km" ? "km/h" : "mph";
  const splitSummary = useMemo(
    () => computeSplitSummary(activeCardio.segments || []),
    [activeCardio.segments]
  );
  const workoutsForMileage = useSelector((state) => {
    const accountId = training?.user?._id || user._id;
    return state.workouts?.[accountId]?.workouts || [];
  });
  const shoeMileage = useMemo(() => {
    const shoeName = normalizeShoeName(activeCardio.shoes);
    if (!shoeName) return null;
    let totalMiles = 0;
    let matchingWorkouts = 0;

    workoutsForMileage.forEach((workout) => {
      const cardio = normalizeCardio(workout?.cardio);
      const workoutTypeValue = workout?.workoutType || (cardio?.plan || cardio?.actual ? "Cardio" : "");
      if (workoutTypeValue !== "Cardio") return;
      const mode = cardio?.actual?.distance ? "actual" : "plan";
      const entry = cardio?.[mode] || {};
      if (normalizeShoeName(entry.shoes) !== shoeName) return;
      const distance = Number(entry.distance);
      if (!distance) return;
      const unit = entry.distanceUnit || "mi";
      const miles = unit === "km" ? distance * 0.621371 : distance;
      totalMiles += miles;
      matchingWorkouts += 1;
    });

    const displayValue =
      activeCardio.distanceUnit === "km"
        ? (totalMiles * 1.60934).toFixed(2)
        : totalMiles.toFixed(2);

    return {
      value: displayValue,
      unit: activeCardio.distanceUnit,
      workouts: matchingWorkouts,
    };
  }, [activeCardio.distanceUnit, activeCardio.shoes, workoutsForMileage]);
  const shoeMileageHelper = useMemo(() => {
    if (!activeCardio.shoes) return "";
    if (!shoeMileage) return "Mileage updates as workouts load.";
    const workoutLabel = shoeMileage.workouts === 1 ? "workout" : "workouts";
    return `Loaded mileage: ${shoeMileage.value} ${shoeMileage.unit} (${shoeMileage.workouts} ${workoutLabel} loaded)`;
  }, [activeCardio.shoes, shoeMileage]);

  // ---------------------- Dirty check infra (baseline + normalize + composite) ----------------------
  const baselineRef = useRef(null);

  const normalize = useCallback((obj) => {
    // Create a structured clone; if not supported, JSON clone is fine for plain data
    const clone = typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj ?? {}));

    // Drop volatile fields you don't want affecting dirtiness
    delete clone?._id;
    delete clone?.user; // or keep only user._id if you care about assignment changes

    // Normalize arrays for stable compare
    if (Array.isArray(clone?.training)) {
      clone.training = clone.training.map((block) =>
        Array.isArray(block)
          ? block.map((set) => {
            // Normalize exercise refs to id strings when present
            if (set?.exercise && typeof set.exercise === "object" && set.exercise._id) {
              set.exercise = String(set.exercise._id);
            }
            return set;
          })
          : block
      );
    }

    if (Array.isArray(clone?.category)) {
      clone.category = [...clone.category].map(String).sort((a, b) => a.localeCompare(b));
    }

    if (clone?.workoutFeedback?.comments) {
      clone.workoutFeedback.comments = clone.workoutFeedback.comments.map((c) => ({
        ...c,
        _id: undefined, // ignore DB ids
        timestamp: c?.timestamp ? new Date(c.timestamp).toISOString() : null,
      }));
    }

    clone.complete = !!clone.complete;
    clone.title = clone.title ?? "";
    clone.category = clone.category ?? [];
    clone.workoutFeedback = clone.workoutFeedback ?? { difficulty: 1, comments: [] };
    clone.training = clone.training ?? [];
    clone.workoutType = clone.workoutType ?? "Strength";
    clone.cardio = normalizeCardio(clone.cardio);

    return clone;
  }, []);

  const buildLocalComposite = useCallback(() => ({
    title: trainingTitle,
    category: trainingCategory,
    complete: workoutCompleteStatus,
    workoutFeedback,
    training: localTraining,
    workoutType,
    cardio: cardioDetails,
  }), [trainingTitle, trainingCategory, workoutCompleteStatus, workoutFeedback, localTraining, workoutType, cardioDetails]);

  // Hydrate locals when Redux training changes and set the baseline snapshot
  useEffect(() => {
    if (!training) return;

    // Optional: hydrate local UI from Redux when workout is loaded/switched
    setLocalTraining(training.training ?? []);
    setTrainingCategory(training.category ?? []);
    setTrainingTitle(training.title ?? "");
    setWorkoutCompleteStatus(!!training.complete);
    setWorkoutFeedback(training.workoutFeedback ?? { difficulty: 1, comments: [] });
    setWorkoutType(training.workoutType || "Strength");
    const normalizedCardio = normalizeCardio(training.cardio);
    setCardioDetails(normalizedCardio);
    setCardioAuto(buildCardioAuto(normalizedCardio));
    setCardioViewMode("plan");

    baselineRef.current = normalize({
      title: training.title ?? "",
      category: training.category ?? [],
      complete: !!training.complete,
      workoutFeedback: training.workoutFeedback ?? { difficulty: 1, comments: [] },
      training: training.training ?? [],
      workoutType: training.workoutType ?? "Strength",
      cardio: training.cardio ?? {},
    });

    setLoading(false);
  }, [training, normalize]);

  useEffect(() => {
    const eventId = new URLSearchParams(location.search).get("event");
    const workoutId = params._id;

    if (!eventId && !workoutId) {
      setScheduleEvent(null);
      return;
    }

    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const url = eventId ? `${serverURL}/schedule/event` : `${serverURL}/schedule/event/by-workout`;
    const body = eventId ? { _id: eventId } : { workoutId };

    fetch(url, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.event) {
          setScheduleEvent(data.event);
        } else {
          setScheduleEvent(null);
        }
      })
      .catch(() => setScheduleEvent(null));
  }, [location.search, params._id]);

  // Compute isDirty by comparing normalized local composite vs. baseline snapshot
  const isDirty = useMemo(() => {
    if (!baselineRef.current) return false;
    const localComposite = buildLocalComposite();
    return !deepEqual(baselineRef.current, normalize(localComposite));
  }, [buildLocalComposite, normalize, trainingTitle, trainingCategory, workoutCompleteStatus, workoutFeedback, localTraining, workoutType, cardioDetails]);

  // Save handler — replace with your thunk/API call
  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = buildLocalComposite();

      // TODO: dispatch your save thunk here, e.g. dispatch(saveTraining(payload))
      await new Promise((r) => setTimeout(r, 500)); // simulate IO

      // After successful save, update baseline so button returns to clean immediately
      baselineRef.current = normalize(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!isCardio) return;

    const derived = computeDerivedCardio(activeCardio);

    setCardioDetails((prev) => {
      const mode = cardioViewMode;
      const modeData = prev[mode] || normalizeCardioFields({});
      let nextData = { ...modeData };
      let changed = false;
      const autoFlags = cardioAuto?.[mode] || {};

      if (autoFlags.pace) {
        const nextPace = derived.pace || "";
        if (nextData.avgPace !== nextPace) {
          nextData.avgPace = nextPace;
          changed = true;
        }
      }

      if (autoFlags.speed) {
        const nextSpeed = derived.speed || "";
        if (nextData.avgSpeed !== nextSpeed) {
          nextData.avgSpeed = nextSpeed;
          changed = true;
        }
      }

      if (!changed) return prev;
      return { ...prev, [mode]: nextData };
    });
  }, [
    isCardio,
    cardioViewMode,
    cardioAuto,
    activeCardio.distance,
    activeCardio.duration,
    activeCardio.distanceUnit,
  ]);

  // -----------------------------------------------------------------------------------------------


  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps);
  };

  const handleCardioChange = (field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field]: value,
      },
    }));
  };

  const handleCardioDerivedChange = (field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field]: value,
      },
    }));
    setCardioAuto((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field === "avgPace" ? "pace" : "speed"]: value === "",
      },
    }));
  };

  const handleAddCardioSegment = () => {
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        segments: [...(prev[cardioViewMode]?.segments || []), { ...DEFAULT_CARDIO_SEGMENT }],
      },
    }));
  };

  const handleRemoveCardioSegment = (index) => {
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        segments: (prev[cardioViewMode]?.segments || []).filter((_, idx) => idx !== index),
      },
    }));
  };

  const handleCardioSegmentChange = (index, field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => {
      const segments = [...(prev[cardioViewMode]?.segments || [])];
      segments[index] = { ...segments[index], [field]: value };
      return {
        ...prev,
        [cardioViewMode]: {
          ...prev[cardioViewMode],
          segments,
        },
      };
    });
  };

  const handleCopyPlanToActual = () => {
    setCardioDetails((prev) => {
      const nextActual = normalizeCardioFields(prev.plan);
      return {
        ...prev,
        actual: nextActual,
      };
    });
    setCardioAuto((prev) => ({
      ...prev,
      actual: {
        pace: false,
        speed: false,
      },
    }));
  };

  const handleTitleChange = (e) => {
    setTrainingTitle(e.target.value);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  const handleAddExerciseOpen = () => setAddExerciseOpen(true);
  const handleAddExerciseClose = () => setAddExerciseOpen(false);

  const categories = [
    "Abdominals",
    "Back",
    "Biceps",
    "Calves",
    "Chest",
    "Core",
    "Forearms",
    "Full Body",
    "Hamstrings",
    "Legs",
    "Quadriceps",
    "Shoulders",
    "Triceps",
  ];

  const newExercise = (index) => {
    handleAddExerciseOpen();
  };

  // Create a new exercise on the current set
  const confirmedNewExercise = (
    index,
    selectedExercises,
    setSelectedExercises,
    setCount,
    setSelectedExercisesSetCount,
    selectedHistoryByExercise,
    exerciseList,
  ) => {
    if (selectedExercises.length > 0) {
      const newTraining = localTraining.map((group, i) => {
        if (index === i) {
          selectedExercises.forEach((exercise) => {
            const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
            const history = reduxExercise?.history?.[user._id] || [];
            const selectedHistoryId = selectedHistoryByExercise?.[exercise._id];
            const selectedHistory =
              history.find((item) => item._id === selectedHistoryId) ||
              history[history.length - 1];
            const achieved = selectedHistory?.achieved || {};
            const normalizeToSets = (values) => {
              const source = Array.isArray(values) ? values : [];
              return Array.from({ length: setCount }, (_, idx) => source[idx] ?? 0);
            };
            group.push({
              exercise: exercise,
              exerciseType: "Reps",
              goals: {
                sets: setCount,
                minReps: Array(setCount).fill(0),
                maxReps: Array(setCount).fill(0),
                exactReps: normalizeToSets(achieved.reps),
                weight: normalizeToSets(achieved.weight),
                percent: normalizeToSets(achieved.percent),
                seconds: normalizeToSets(achieved.seconds),
              },
              achieved: {
                sets: 0,
                reps: Array(setCount).fill(0),
                weight: Array(setCount).fill(0),
                percent: Array(setCount).fill(0),
                seconds: Array(setCount).fill(0),
              },
            });
          });
        }
        return group;
      });
      dispatch(
        updateTraining(training._id, {
          ...training,
          category: [...trainingCategory],
          training: [...newTraining],
        })
      );
    }
    setSelectedExercises([]);
    setSelectedExercisesSetCount(4);
    handleAddExerciseClose();
  };

  // Create a new set on the current day
  const newSet = () => {
    setLocalTraining((prev) => {
      prev.push([]);
      return prev;
    });
    setToggleNewSet((prev) => !prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    if (localTraining.length > 1) {
      setLocalTraining((prev) => prev.filter((item, index) => index !== setIndex));
      setToggleRemoveSet((prev) => !prev);
    }
  };

  // Remove the current exercise
  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = localTraining.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = async () => {
    dispatch(
      updateTraining(training._id, {
        ...training,
        title: trainingTitle,
        category: [...trainingCategory],
        training: localTraining,
        complete: workoutCompleteStatus,
        workoutFeedback: workoutFeedback,
        workoutType: activeWorkoutType,
        cardio: cardioDetails,
      })
    ).then(() => {
      socket.emit("liveTrainingUpdate", {
        workoutId: params._id,
        updatedTraining: localTraining,
      });
    });
  };

  useEffect(() => {
    dispatch(getExerciseList());
  }, [dispatch]);

  useEffect(() => {
    setLocalTraining([]);
    setLoading(true);

    dispatch(requestTraining(params._id)).then(() => {
      setLoading(false);
    });
  }, [params, dispatch, user._id]);

  useEffect(() => {
    setLocalTraining(training.training || []);
    setTrainingCategory(training.category && training.category.length > 0 ? training.category : []);
    setTrainingTitle(training.title || "");
    setWorkoutCompleteStatus(training?.complete || false);
    setWorkoutFeedback(training?.workoutFeedback || { difficulty: 1, comments: [] });
    setWorkoutType(training.workoutType || "Strength");
    const normalizedCardio = normalizeCardio(training.cardio);
    setCardioDetails(normalizedCardio);
    setCardioAuto(buildCardioAuto(normalizedCardio));
    setCardioViewMode("plan");
    if (training?.user?._id) {
      setBorderHighlight(!isPersonalWorkout());
    }
  }, [isPersonalWorkout, setBorderHighlight, training]);

  ///////////////////////////////
  // 1. Join Room & Request State
  ///////////////////////////////
  useEffect(() => {
    if (socket && params._id) {
      // Join the workout room.
      socket.emit("joinWorkout", { workoutId: params._id });
      // Immediately ask any existing clients for their current state.
      socket.emit("requestCurrentState", { workoutId: params._id });
    }
    return () => {
      if (socket && params._id) {
        socket.emit("leaveWorkout", { workoutId: params._id });
      }
    };
  }, [socket, params._id]);

  ///////////////////////////////
  // 2. Handshake: Listen for Current State
  ///////////////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleCurrentState = (currentState) => {
      // Only update if we haven’t already synced.
      if (!hasSynced.current) {
        setLocalTraining(currentState);
        hasSynced.current = true;
        // You can also log here if needed.
        console.log("Synced from handshake:", currentState);
      }
    };

    socket.on("currentState", handleCurrentState);
    return () => {
      socket.off("currentState", handleCurrentState);
    };
  }, [socket]);

  ///////////////////////////////
  // 3. Timeout: Mark as Synced If No Handshake Arrives
  ///////////////////////////////
  useEffect(() => {
    if (!socket || !params._id) return;
    // If no handshake is received within 2 seconds, allow local emissions.
    const timer = setTimeout(() => {
      if (!hasSynced.current) {
        hasSynced.current = true;
        console.log("No handshake received, marking as synced.");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [socket, params._id]);

  ///////////////////////////////
  // 4. Listen for Live Training Updates
  ///////////////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleLiveUpdate = (updatedTraining) => {
      // This update is coming from another client.
      isLocalUpdate.current = false;
      setLocalTraining(updatedTraining);
    };

    socket.on("liveTrainingUpdate", handleLiveUpdate);
    return () => {
      socket.off("liveTrainingUpdate", handleLiveUpdate);
    };
  }, [socket]);

  ///////////////////////////////
  // 5. Debounced Emission for Local Updates
  ///////////////////////////////
  useEffect(() => {
    if (!socket || !params._id) return;

    // If the change came from a remote update, skip emitting.
    if (!isLocalUpdate.current) {
      isLocalUpdate.current = true;
      return;
    }
    // If we haven't yet been synced by an existing client, do not emit.
    if (!hasSynced.current) return;

    const debouncedEmit = debounce(() => {
      socket.emit("liveTrainingUpdate", {
        workoutId: params._id,
        updatedTraining: localTraining,
      });
      console.log("Emitted live update", localTraining);
    }, 1000); // 1-second debounce

    debouncedEmit();

    return () => {
      debouncedEmit.cancel();
    };
  }, [localTraining, socket, params._id]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : training._id ? (
        <>
          <WorkoutOptionModalView
            modalOpen={modalOpen}
            handleModalToggle={handleModalToggle}
            handleSetModalAction={handleSetModalAction}
            modalActionType={modalActionType}
            training={training}
            setLocalTraining={setLocalTraining}
          />
          {training._id ? (
            <>
              <Grid
                container
                sx={{
                  justifyContent: "flex-start",
                  minHeight: "100%",
                  paddingTop: "15px",
                }}
              >
                {!isPersonalWorkout() && training.user.firstName && (
                  <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                    <Avatar
                      src={
                        training?.user?.profilePicture &&
                        `${serverURL}/user/profilePicture/${training.user.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={training?.user ? `${training?.user.firstName[0]} ${training?.user.lastName[0]}` : 'loading'}
                    />
                    <Typography variant="h5">
                      {training?.user.firstName} {training?.user.lastName}
                    </Typography>
                  </Grid>
                )}
                <Grid container size={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                  {returnPath ? (
                    <IconButton
                      onClick={async () => {
                        await save();
                        navigate(returnPath);
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  ) : training.date ? (
                    <IconButton
                      onClick={async () => {
                        const isToday = dayjs.utc(training.date).format("YYYY-MM-DD") ===
                          dayjs(new Date()).format("YYYY-MM-DD");

                        const link =
                          isPersonalWorkout()
                            ? `/?date=${dayjs.utc(training.date).format("YYYYMMDD")}`
                            : `/?date=${dayjs.utc(training.date).format("YYYYMMDD")}&client=${training.user._id}`;
                        // Navigate after saving
                        await save();
                        navigate(link);
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => {
                        save();
                        navigate(training.isTemplate ? "/workout-templates" : "/sessions");
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  )}
                </Grid>
                <Grid size={10} container sx={{ justifyContent: "center" }}>
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">
                      {training.date
                        ? dayjs.utc(training.date).format("MMMM Do, YYYY")
                        : isProgramBuilder
                        ? "Workout Builder"
                        : training.isTemplate
                        ? "Template Workout"
                        : "Workout Builder"}
                    </Typography>
                    {activeWorkoutType && (
                      <Chip label={`${activeWorkoutType} Workout`} size="small" variant="outlined" />
                    )}
                    {training.isTemplate && (
                      <Chip label="Template Workout" size="small" variant="outlined" />
                    )}
                  </Stack>
                </Grid>
                <Grid size={1} container sx={{ justifyContent: "center", alignItems: "center" }}>
                  <Tooltip title="Workout Settings">
                    <IconButton variant="contained" onClick={handleModalToggle}>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {scheduleEvent && (
                  <Grid container size={12} sx={{ justifyContent: "center", paddingTop: "5px" }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                      <Chip
                        label={scheduleEvent.eventType}
                        color={
                          scheduleEvent.eventType === "APPOINTMENT"
                            ? "primary"
                            : scheduleEvent.eventType === "INDEPENDENT"
                            ? "secondary"
                            : "info"
                        }
                        size="small"
                      />
                      <Chip label={scheduleEvent.status} size="small" />
                      <Chip
                        label={`${dayjs(scheduleEvent.startDateTime).format("h:mm A")} - ${dayjs(
                          scheduleEvent.endDateTime
                        ).format("h:mm A")}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Grid>
                )}

                <Grid container size={12} spacing={2} sx={{ paddingTop: "15px" }}>
                  <Grid size={12} container alignContent="center">
                    <TextField
                      label="Title"
                      placeholder="Workout Title"
                      value={trainingTitle}
                      onChange={handleTitleChange}
                      fullWidth
                    />
                  </Grid>
                  {isCardio ? (
                    <>
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ padding: "16px" }}>
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={1}
                              sx={{ flexWrap: "wrap", gap: "8px" }}
                            >
                              <Typography variant="h6">Run Details</Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ToggleButtonGroup
                                  value={cardioViewMode}
                                  exclusive
                                  size="small"
                                  onChange={(event, nextValue) => {
                                    if (nextValue) setCardioViewMode(nextValue);
                                  }}
                                >
                                  <ToggleButton value="plan">Plan</ToggleButton>
                                  <ToggleButton value="actual">Results</ToggleButton>
                                </ToggleButtonGroup>
                                {cardioViewMode === "actual" && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleCopyPlanToActual}
                                  >
                                    Copy plan
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  select
                                  label="Run type"
                                  value={activeCardio.style}
                                  onChange={handleCardioChange("style")}
                                  fullWidth
                                >
                                  {CARDIO_STYLE_OPTIONS.map((style) => (
                                    <MenuItem key={style} value={style}>
                                      {style}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 8, sm: 4 }}>
                                <TextField
                                  label="Distance"
                                  type="number"
                                  value={activeCardio.distance}
                                  onChange={handleCardioChange("distance")}
                                  fullWidth
                                  inputProps={{ min: 0, step: "0.01" }}
                                />
                              </Grid>
                              <Grid size={{ xs: 4, sm: 2 }}>
                                <TextField
                                  select
                                  label="Unit"
                                  value={activeCardio.distanceUnit}
                                  onChange={handleCardioChange("distanceUnit")}
                                  fullWidth
                                >
                                  <MenuItem value="mi">mi</MenuItem>
                                  <MenuItem value="km">km</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label="Duration"
                                  placeholder="hh:mm:ss"
                                  value={activeCardio.duration}
                                  onChange={handleCardioChange("duration")}
                                  fullWidth
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label={`Avg pace (${paceUnitLabel})`}
                                  placeholder={`mm:ss ${paceUnitLabel}`}
                                  value={activeCardio.avgPace}
                                  onChange={handleCardioDerivedChange("avgPace")}
                                  fullWidth
                                  InputProps={{
                                    endAdornment: renderAutoAdornment(
                                      cardioAuto?.[cardioViewMode]?.pace
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label={`Avg speed (${speedUnitLabel})`}
                                  type="number"
                                  value={activeCardio.avgSpeed}
                                  onChange={handleCardioDerivedChange("avgSpeed")}
                                  fullWidth
                                  inputProps={{ min: 0, step: "0.1" }}
                                  InputProps={{
                                    endAdornment: renderAutoAdornment(
                                      cardioAuto?.[cardioViewMode]?.speed
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label="Cadence (spm)"
                                  type="number"
                                  value={activeCardio.cadence}
                                  onChange={handleCardioChange("cadence")}
                                  fullWidth
                                  inputProps={{ min: 0, step: "1" }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label="Stride length"
                                  type="number"
                                  value={activeCardio.strideLength}
                                  onChange={handleCardioChange("strideLength")}
                                  fullWidth
                                  inputProps={{ min: 0, step: "0.1" }}
                                />
                              </Grid>
                              <Grid size={{ xs: 4, sm: 2 }}>
                                <TextField
                                  select
                                  label="Stride unit"
                                  value={activeCardio.strideUnit}
                                  onChange={handleCardioChange("strideUnit")}
                                  fullWidth
                                >
                                  <MenuItem value="in">in</MenuItem>
                                  <MenuItem value="cm">cm</MenuItem>
                                  <MenuItem value="m">m</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  select
                                  label="Route type"
                                  value={activeCardio.routeType}
                                  onChange={handleCardioChange("routeType")}
                                  fullWidth
                                >
                                  {CARDIO_ROUTE_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  select
                                  label="Surface"
                                  value={activeCardio.surface}
                                  onChange={handleCardioChange("surface")}
                                  fullWidth
                                >
                                  {CARDIO_SURFACE_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  label="Shoes"
                                  placeholder="e.g., Nike Pegasus 41"
                                  value={activeCardio.shoes}
                                  onChange={handleCardioChange("shoes")}
                                  fullWidth
                                  helperText={shoeMileageHelper}
                                />
                              </Grid>
                              <Grid size={{ xs: 4, sm: 3 }}>
                                <TextField
                                  label="RPE"
                                  type="number"
                                  value={activeCardio.rpe}
                                  onChange={handleCardioChange("rpe")}
                                  fullWidth
                                  inputProps={{ min: 1, max: 10 }}
                                />
                              </Grid>
                              <Grid size={{ xs: 8, sm: 3 }}>
                                <TextField
                                  select
                                  label="HR zone"
                                  value={activeCardio.hrZone}
                                  onChange={handleCardioChange("hrZone")}
                                  fullWidth
                                >
                                  {CARDIO_HR_ZONE_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 8, sm: 3 }}>
                                <TextField
                                  label="Avg heart rate"
                                  type="number"
                                  value={activeCardio.avgHeartRate}
                                  onChange={handleCardioChange("avgHeartRate")}
                                  fullWidth
                                  inputProps={{ min: 0 }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                  label="Elevation gain"
                                  type="number"
                                  value={activeCardio.elevationGain}
                                  onChange={handleCardioChange("elevationGain")}
                                  fullWidth
                                  inputProps={{ min: 0 }}
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                  select
                                  label="Weather"
                                  value={activeCardio.weather}
                                  onChange={handleCardioChange("weather")}
                                  fullWidth
                                >
                                  {CARDIO_WEATHER_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                  label="Temperature"
                                  type="number"
                                  value={activeCardio.temperature}
                                  onChange={handleCardioChange("temperature")}
                                  fullWidth
                                  inputProps={{ step: "0.1" }}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Select
                                          size="small"
                                          variant="standard"
                                          value={activeCardio.temperatureUnit}
                                          onChange={handleCardioChange("temperatureUnit")}
                                        >
                                          <MenuItem value="F">F</MenuItem>
                                          <MenuItem value="C">C</MenuItem>
                                        </Select>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={12}>
                                <TextField
                                  label="Route link"
                                  placeholder="Paste a Garmin/Strava/MapMyRun link"
                                  value={activeCardio.routeLink}
                                  onChange={handleCardioChange("routeLink")}
                                  fullWidth
                                />
                              </Grid>
                            </Grid>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid size={12}>
                        <Paper variant="outlined" sx={{ padding: "16px" }}>
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography variant="h6">Splits & Intervals</Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAddCardioSegment}
                                startIcon={<Add />}
                              >
                                Add split
                              </Button>
                            </Stack>
                            {(activeCardio.segments || []).length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                Add splits to track warmups, repeats, or cooldowns.
                              </Typography>
                            ) : (
                              (activeCardio.segments || []).map((segment, index) => (
                                <Paper key={`cardio-segment-${index}`} variant="outlined" sx={{ padding: "12px" }}>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                      <TextField
                                        label="Label"
                                        value={segment.label}
                                        onChange={handleCardioSegmentChange(index, "label")}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 2 }}>
                                      <TextField
                                        label={`Distance (${activeCardio.distanceUnit})`}
                                        type="number"
                                        value={segment.distance}
                                        onChange={handleCardioSegmentChange(index, "distance")}
                                        fullWidth
                                        inputProps={{ min: 0, step: "0.01" }}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 2 }}>
                                      <TextField
                                        label="Duration"
                                        placeholder="mm:ss"
                                        value={segment.duration}
                                        onChange={handleCardioSegmentChange(index, "duration")}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 2 }}>
                                      <TextField
                                        label={`Pace (${paceUnitLabel})`}
                                        placeholder="mm:ss"
                                        value={segment.pace}
                                        onChange={handleCardioSegmentChange(index, "pace")}
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 4, sm: 2 }}>
                                      <TextField
                                        label="RPE"
                                        type="number"
                                        value={segment.rpe}
                                        onChange={handleCardioSegmentChange(index, "rpe")}
                                        fullWidth
                                        inputProps={{ min: 1, max: 10 }}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 2, sm: 1 }} container justifyContent="flex-end">
                                      <Tooltip title="Remove split">
                                        <IconButton onClick={() => handleRemoveCardioSegment(index)}>
                                          <Delete />
                                        </IconButton>
                                      </Tooltip>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              ))
                            )}
                            {(activeCardio.segments || []).length > 0 && (
                              <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Typography variant="body2" color="text.secondary">
                                  Total distance: {splitSummary.totalDistance || "—"} {activeCardio.distanceUnit}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total time: {splitSummary.totalDuration || "—"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Avg split pace: {splitSummary.avgPace || "—"} {paceUnitLabel}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          label="Notes"
                          placeholder="How did it feel? Surface, weather, goal pacing..."
                          value={activeCardio.notes}
                          onChange={handleCardioChange("notes")}
                          multiline
                          minRows={3}
                          fullWidth
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid size={12} container sx={classes.TrainingCategoryInputContainer}>
                      <Grid size={12} container alignContent="center">
                        <Autocomplete
                          disableCloseOnSelect
                          value={trainingCategory}
                          fullWidth
                          multiple
                          id="tags-filled"
                          defaultValue={trainingCategory.map((category) => category)}
                          options={categories.map((option) => option)}
                          freeSolo
                          onChange={(e, getTagProps) => handleTrainingCategory(getTagProps)}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                              const { key, ...tagProps } = getTagProps({ index });
                              return (
                                <Chip key={`${option}-${index}`} variant="outlined" label={option} {...tagProps} />
                              )
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Muscle Groups"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: <>{params.InputProps.endAdornment}</>,
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Grid>
                {!isCardio && (
                  <Grid size={12}>
                    <Divider sx={{ margin: "25px 0px" }} />
                  </Grid>
                )}
                {!isCardio && training.training.length > 0 && (
                  <SwipeableSet
                    workoutUser={training.user}
                    newExercise={newExercise}
                    newSet={newSet}
                    removeSet={removeSet}
                    removeExercise={removeExercise}
                    localTraining={localTraining}
                    setLocalTraining={setLocalTraining}
                    save={save}
                    toggleNewSet={toggleNewSet}
                    toggleRemoveSet={toggleRemoveSet}
                    maxSteps={localTraining.length + 1}
                    selectedDate={training.date}
                    size={size}
                    workoutCompleteStatus={workoutCompleteStatus}
                    setWorkoutCompleteStatus={setWorkoutCompleteStatus}
                    workoutFeedback={workoutFeedback}
                    setWorkoutFeedback={setWorkoutFeedback}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                )}
              </Grid>
              <Grid
                container
                size={12}
                sx={{
                  alignContent: "flex-end",
                  "&.MuiGrid-root": { flexGrow: 1 },
                  paddingBottom: "5px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={save}
                  fullWidth
                  disabled={loading}
                  color={isDirty ? "warning" : "primary"}
                >
                  Save
                </Button>
              </Grid>

              <AddExercisesDialog
                user={training.user}
                addExerciseOpen={addExerciseOpen}
                handleAddExerciseClose={handleAddExerciseClose}
                confirmedNewExercise={confirmedNewExercise}
                activeStep={activeStep}
              />
            </>
          ) : (
            <Grid
              container
              size={12}
              sx={{
                justifyContent: "center",
                alignContent: "center",
                flexGrow: 1,
              }}
            >
              <Button variant="contained" onClick={() => null}>
                Create Workout
              </Button>
            </Grid>
          )}
        </>
      ) : (
        <>Workout does not exist</>
      )}
    </>
  );
}

export const ExerciseListAutocomplete = ({ exerciseList, selectedExercises, setSelectedExercises, disableCloseOnSelect = false, }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const matchWords = (option, inputValue) => {
    if (!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  return (
    <Autocomplete
      multiple
      fullWidth
      value={selectedExercises}
      options={exerciseList
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option)}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => option.exerciseTitle}
      onChange={(e, newSelection) => {
        setSelectedExercises(newSelection);

        // Find newly added exercise
        const newExercise = newSelection.find(
          (ex) => !selectedExercises.some((sel) => sel._id === ex._id)
        );

        if (newExercise) {
          dispatch(requestExerciseProgress(newExercise, user));
        }
      }}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) => matchWords(option.exerciseTitle, inputValue))
      }
      renderValue={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option._id}
            variant="outlined"
            label={option.exerciseTitle}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Search" placeholder="Exercises" />}
      disableCloseOnSelect={disableCloseOnSelect}
    />
  );
};

const AddExercisesDialog = ({ addExerciseOpen, handleAddExerciseClose, confirmedNewExercise, activeStep, user, }) => {
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedExercisesSetCount, setSelectedExercisesSetCount] = useState(4);
  const [selectedHistoryByExercise, setSelectedHistoryByExercise] = useState({});

  const handleSelectedExercisesSetCountChange = (e) =>
    setSelectedExercisesSetCount(Number(e.target.value));

  useEffect(() => {
    setSelectedHistoryByExercise((prev) => {
      const next = { ...prev };
      selectedExercises.forEach((exercise) => {
        if (next[exercise._id] !== undefined) return;
        const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
        const history = reduxExercise?.history?.[user._id] || [];
        next[exercise._id] = history.length > 0 ? history[history.length - 1]._id : "";
      });
      Object.keys(next).forEach((exerciseId) => {
        if (!selectedExercises.some((exercise) => exercise._id === exerciseId)) {
          delete next[exerciseId];
        }
      });
      return next;
    });
  }, [exerciseList, selectedExercises, user._id]);

  const formatHistoryLabel = (historyItem) => {
    if (!historyItem) return "No history";
    const achieved = historyItem.achieved || {};
    const weight = Array.isArray(achieved.weight) ? achieved.weight.filter(Boolean) : [];
    const reps = Array.isArray(achieved.reps) ? achieved.reps.filter(Boolean) : [];
    const seconds = Array.isArray(achieved.seconds) ? achieved.seconds.filter(Boolean) : [];
    const percent = Array.isArray(achieved.percent) ? achieved.percent.filter(Boolean) : [];
    const details = [];
    if (reps.length) details.push(`${reps.join(", ")} reps`);
    if (weight.length) details.push(`${weight.join(", ")} lb`);
    if (seconds.length) details.push(`${seconds.join(", ")} sec`);
    if (percent.length) details.push(`${percent.join(", ")}%`);
    const summary = details.length ? ` • ${details.join(" | ")}` : "";
    return `${dayjs(historyItem.date).format("MM/DD/YYYY")}${summary}`;
  };

  return (
    <Dialog
      open={addExerciseOpen}
      TransitionComponent={Transition}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          height: "80%",
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleAddExerciseClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add Exercises
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              confirmedNewExercise(
                activeStep,
                selectedExercises,
                setSelectedExercises,
                selectedExercisesSetCount,
                setSelectedExercisesSetCount,
                selectedHistoryByExercise,
                exerciseList
              )
            }
          >
            Confirm
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid container size={12}>
            <ExerciseListAutocomplete
              exerciseList={exerciseList}
              selectedExercises={selectedExercises}
              setSelectedExercises={setSelectedExercises}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Sets"
              select
              SelectProps={{ native: true }}
              fullWidth
              value={selectedExercisesSetCount}
              onChange={handleSelectedExercisesSetCountChange}
            >
              {[...Array(21)].map((x, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </TextField>

            {selectedExercises.length > 0 && (
              <List sx={{ bgcolor: "background.paper", width: "100%" }}>
                {selectedExercises.map((exercise, exerciseIndex, exercises) => {
                  const reduxExercise = exerciseList.find((ex) => ex._id === exercise._id);
                  const history = reduxExercise?.history?.[user._id];
                  const historyOptions = history ? history.slice(history.length - 3, history.length) : [];

                  return (
                    <Fragment key={`${exercise.exerciseTitle}-${exerciseIndex}`} >
                      <ListItem >
                        <Stack spacing={1} sx={{ width: "100%" }}>
                          <Typography variant="subtitle1">{exercise?.exerciseTitle}</Typography>
                          {historyOptions.length > 0 ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Use previous achieved</InputLabel>
                              <Select
                                label="Use previous achieved"
                                value={selectedHistoryByExercise[exercise._id] ?? ""}
                                onChange={(event) =>
                                  setSelectedHistoryByExercise((prev) => ({
                                    ...prev,
                                    [exercise._id]: event.target.value,
                                  }))
                                }
                              >
                                {historyOptions.map((historyItem) => (
                                  <MenuItem key={historyItem._id} value={historyItem._id}>
                                    {formatHistoryLabel(historyItem)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No recent history for this exercise.
                            </Typography>
                          )}
                        </Stack>
                      </ListItem>
                      {exerciseIndex !== exercises.length - 1 && <Divider component="li" />}
                    </Fragment>
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
