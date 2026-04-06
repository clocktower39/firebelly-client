import React, { useCallback, useState, useEffect, useRef, Fragment, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import deepEqual from "fast-deep-equal/react";
import { debounce } from "lodash";
import {
  Alert,
  AppBar,
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Collapse,
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
  Snackbar,
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
import WorkoutTrainerSessionDialog from "../../Components/TrainingComponents/WorkoutTrainerSessionDialog";
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

const CARDIO_ACTIVITY_CONFIG = {
  Run: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Long Run", "Tempo", "Intervals", "Hill", "Fartlek", "Race", "Recovery"],
    routeOptions: ["Road", "Trail", "Track", "Treadmill", "Mixed"],
    surfaceOptions: ["Asphalt", "Concrete", "Dirt", "Grass", "Sand", "Track", "Treadmill"],
    primaryDerivedMetric: "pace",
    showPace: true,
    showSpeed: true,
    showCadence: true,
    cadenceLabel: "Cadence (spm)",
    showStride: true,
    showFootwear: true,
    showRouteType: true,
    routeTypeLabel: "Route type",
    showSurface: true,
    surfaceLabel: "Surface",
    showElevation: true,
    routeLinkPlaceholder: "Paste a Garmin or Strava route link",
  },
  Walk: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Brisk", "Long Walk", "Intervals", "Recovery"],
    routeOptions: ["Road", "Trail", "Treadmill", "Mixed"],
    surfaceOptions: ["Asphalt", "Concrete", "Dirt", "Grass", "Sand", "Treadmill"],
    primaryDerivedMetric: "pace",
    showPace: true,
    showSpeed: true,
    showCadence: true,
    cadenceLabel: "Cadence (spm)",
    showStride: true,
    showFootwear: true,
    showRouteType: true,
    routeTypeLabel: "Route type",
    showSurface: true,
    surfaceLabel: "Surface",
    showElevation: true,
    routeLinkPlaceholder: "Paste a route link",
  },
  Hike: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Endurance", "Elevation", "Ruck", "Recovery"],
    routeOptions: ["Trail", "Road", "Treadmill", "Mixed"],
    surfaceOptions: ["Dirt", "Rock", "Grass", "Sand", "Snow", "Mixed"],
    primaryDerivedMetric: "pace",
    showPace: true,
    showSpeed: true,
    showCadence: true,
    cadenceLabel: "Cadence (spm)",
    showStride: true,
    showFootwear: true,
    showRouteType: true,
    routeTypeLabel: "Route type",
    showSurface: true,
    surfaceLabel: "Surface",
    showElevation: true,
    routeLinkPlaceholder: "Paste a route link",
  },
  Bike: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Endurance", "Intervals", "Hill", "Race", "Recovery"],
    routeOptions: ["Road", "Trail", "Indoor", "Mixed"],
    surfaceOptions: ["Road", "Gravel", "Trail", "Indoor"],
    primaryDerivedMetric: "speed",
    showPace: false,
    showSpeed: true,
    showCadence: true,
    cadenceLabel: "Cadence (rpm)",
    showStride: false,
    showFootwear: false,
    showRouteType: true,
    routeTypeLabel: "Course",
    showSurface: true,
    surfaceLabel: "Terrain",
    showElevation: true,
    routeLinkPlaceholder: "Paste a route link",
  },
  Swim: {
    distanceUnits: ["m", "yd"],
    styleOptions: ["Easy", "Endurance", "Drills", "Intervals", "Race", "Recovery"],
    routeOptions: ["Pool", "Open Water"],
    surfaceOptions: [],
    primaryDerivedMetric: "pace",
    showPace: true,
    showSpeed: false,
    showCadence: false,
    showStride: false,
    showFootwear: false,
    showRouteType: true,
    routeTypeLabel: "Location",
    showSurface: false,
    surfaceLabel: "Surface",
    showElevation: false,
    routeLinkPlaceholder: "Paste a workout or route link",
  },
  Kayak: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Endurance", "Technique", "Intervals", "Race", "Recovery"],
    routeOptions: ["Lake", "River", "Ocean", "Indoor", "Mixed"],
    surfaceOptions: [],
    primaryDerivedMetric: "speed",
    showPace: false,
    showSpeed: true,
    showCadence: false,
    showStride: false,
    showFootwear: false,
    showRouteType: true,
    routeTypeLabel: "Water",
    showSurface: false,
    surfaceLabel: "Surface",
    showElevation: false,
    routeLinkPlaceholder: "Paste a route link",
  },
  Other: {
    distanceUnits: ["mi", "km"],
    styleOptions: ["Easy", "Endurance", "Intervals", "Race", "Recovery"],
    routeOptions: ["Indoor", "Outdoor", "Mixed"],
    surfaceOptions: ["Indoor", "Outdoor", "Mixed"],
    primaryDerivedMetric: "pace",
    showPace: true,
    showSpeed: true,
    showCadence: false,
    showStride: false,
    showFootwear: false,
    showRouteType: true,
    routeTypeLabel: "Location",
    showSurface: true,
    surfaceLabel: "Surface",
    showElevation: false,
    routeLinkPlaceholder: "Paste a route or workout link",
  },
};

const CARDIO_ACTIVITY_OPTIONS = Object.keys(CARDIO_ACTIVITY_CONFIG);
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
  activity: "Run",
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
  clientPrompts: [],
  segments: [],
};

const DEFAULT_CARDIO_SECTION_STATE = {
  metrics: false,
  route: false,
  conditions: false,
  notes: false,
  segments: false,
};

const CARDIO_OPTIONAL_SECTIONS = [
  { key: "segments", label: "Splits", summaryLabel: "Splits" },
  { key: "metrics", label: "Metrics", summaryLabel: "Metrics" },
  { key: "route", label: "Route & Gear", summaryLabel: "Route" },
  { key: "conditions", label: "Conditions", summaryLabel: "Weather" },
  { key: "notes", label: "Notes", summaryLabel: "Notes" },
];

const CARDIO_CLIENT_PROMPT_OPTIONS = [
  { key: "rpe", label: "RPE", section: "metrics" },
  { key: "avgHeartRate", label: "Heart rate", section: "metrics" },
  { key: "weather", label: "Weather", section: "conditions" },
  { key: "notes", label: "Notes", section: "notes" },
  { key: "segments", label: "Splits", section: "segments" },
];

const CARDIO_CLIENT_PROMPT_LOOKUP = CARDIO_CLIENT_PROMPT_OPTIONS.reduce((acc, option) => {
  acc[option.key] = option;
  return acc;
}, {});

const getCardioActivityConfig = (activity) =>
  CARDIO_ACTIVITY_CONFIG[activity] || CARDIO_ACTIVITY_CONFIG.Run;

const getCardioDistanceUnitOptions = (activity) =>
  getCardioActivityConfig(activity).distanceUnits || ["mi", "km"];

const getCardioStyleOptions = (activity) =>
  getCardioActivityConfig(activity).styleOptions || [];

const getCardioRouteOptions = (activity) =>
  getCardioActivityConfig(activity).routeOptions || [];

const getCardioSurfaceOptions = (activity) =>
  getCardioActivityConfig(activity).surfaceOptions || [];

const getCardioStylePresets = (activity) => getCardioStyleOptions(activity).slice(0, 4);

const getPaceUnitLabel = (activity, distanceUnit) => {
  if (activity === "Swim") {
    return distanceUnit === "yd" ? "min/100yd" : "min/100m";
  }

  if (distanceUnit === "km") return "min/km";
  return "min/mi";
};

const getSpeedUnitLabel = (distanceUnit) => {
  if (distanceUnit === "km") return "km/h";
  if (distanceUnit === "mi") return "mph";
  return "";
};

const getPrimaryCardioMetric = (activity) =>
  getCardioActivityConfig(activity).primaryDerivedMetric || "pace";

const getSecondaryCardioMetric = (activity) => {
  const config = getCardioActivityConfig(activity);
  const primaryMetric = getPrimaryCardioMetric(activity);

  if (primaryMetric !== "pace" && config.showPace) return "pace";
  if (primaryMetric !== "speed" && config.showSpeed) return "speed";
  return null;
};

const getDurationHelperText = () => "Examples: 45, 45:00, or 1:05:30.";

const getDerivedMetricHelperText = (metric, paceUnitLabel, speedUnitLabel) => {
  if (metric === "speed") {
    return speedUnitLabel ? `Example: 14.5 ${speedUnitLabel}.` : "Example: 14.5.";
  }

  return `Use mm:ss format. Example: 8:15 ${paceUnitLabel}.`;
};

const getDerivedMetricErrorText = (metric) =>
  metric === "speed" ? "Enter a positive number." : "Use mm:ss format.";

const truncateText = (value, maxLength = 44) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
};

const joinSummaryParts = (parts, limit = 2) => parts.filter(Boolean).slice(0, limit).join(" • ");

const formatTemperatureLabel = (temperature, unit) => {
  if (temperature === "" || temperature === null || temperature === undefined) return "";
  return unit ? `${temperature} ${unit}` : String(temperature);
};

const hasCardioValue = (value) =>
  !(value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0));

const shortenHrZoneLabel = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  const match = normalized.match(/^(Z\d+)/i);
  return match ? match[1].toUpperCase() : normalized;
};

const isPositiveNumericValue = (value) => {
  if (!hasCardioValue(value)) return true;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0;
};

const isValidPaceValue = (value) => {
  if (!hasCardioValue(value)) return true;
  if (!String(value).includes(":")) return false;
  return parseDurationToSeconds(String(value)) !== null;
};

const isValidDurationValue = (value) => {
  if (!hasCardioValue(value)) return true;
  return parseDurationToSeconds(String(value)) !== null;
};

const getCardioPromptMissing = (cardioFields, promptKeys = []) =>
  promptKeys.filter((key) => {
    if (key === "segments") return !Array.isArray(cardioFields?.segments) || cardioFields.segments.length === 0;
    return !hasCardioValue(cardioFields?.[key]);
  });

const getCardioAutoOpenSections = ({ cardioFields, promptKeys = [], editorMode = "quick" }) => {
  const nextState = { ...DEFAULT_CARDIO_SECTION_STATE };

  if (editorMode === "full") {
    if (cardioFields?.segments?.length) nextState.segments = true;
    if (
      hasCardioValue(cardioFields?.avgPace) ||
      hasCardioValue(cardioFields?.avgSpeed) ||
      hasCardioValue(cardioFields?.rpe) ||
      hasCardioValue(cardioFields?.hrZone) ||
      hasCardioValue(cardioFields?.avgHeartRate) ||
      hasCardioValue(cardioFields?.cadence) ||
      hasCardioValue(cardioFields?.strideLength)
    ) {
      nextState.metrics = true;
    }
    if (
      hasCardioValue(cardioFields?.routeType) ||
      hasCardioValue(cardioFields?.surface) ||
      hasCardioValue(cardioFields?.shoes) ||
      hasCardioValue(cardioFields?.elevationGain) ||
      hasCardioValue(cardioFields?.routeLink)
    ) {
      nextState.route = true;
    }
    if (hasCardioValue(cardioFields?.weather) || hasCardioValue(cardioFields?.temperature)) {
      nextState.conditions = true;
    }
    if (hasCardioValue(cardioFields?.notes)) {
      nextState.notes = true;
    }
  }

  promptKeys.forEach((key) => {
    const section = CARDIO_CLIENT_PROMPT_LOOKUP[key]?.section;
    if (section) nextState[section] = true;
  });

  return nextState;
};

const sanitizeCardioForActivity = (cardioFields, nextActivity) => {
  const current = normalizeCardioFields(cardioFields);
  const nextConfig = getCardioActivityConfig(nextActivity);
  const nextPrimaryMetric = getPrimaryCardioMetric(nextActivity);
  const currentPrimaryMetric = getPrimaryCardioMetric(current.activity);
  const nextDistanceUnits = getCardioDistanceUnitOptions(nextActivity);
  const nextDistanceUnit = nextDistanceUnits.includes(current.distanceUnit)
    ? current.distanceUnit
    : nextDistanceUnits[0];
  const nextStyleOptions = getCardioStyleOptions(nextActivity);
  const nextRouteOptions = getCardioRouteOptions(nextActivity);
  const nextSurfaceOptions = getCardioSurfaceOptions(nextActivity);

  return {
    ...current,
    activity: nextActivity,
    distanceUnit: nextDistanceUnit,
    distance: convertDistanceValue(current.distance, current.distanceUnit, nextDistanceUnit),
    style: nextStyleOptions.includes(current.style) ? current.style : "",
    avgPace: nextConfig.showPace ? current.avgPace : "",
    avgSpeed: nextConfig.showSpeed ? current.avgSpeed : "",
    routeType:
      nextConfig.showRouteType && nextRouteOptions.includes(current.routeType) ? current.routeType : "",
    surface:
      nextConfig.showSurface && nextSurfaceOptions.includes(current.surface) ? current.surface : "",
    shoes: nextConfig.showFootwear ? current.shoes : "",
    cadence: nextConfig.showCadence ? current.cadence : "",
    strideLength: nextConfig.showStride ? current.strideLength : "",
    strideUnit: nextConfig.showStride ? current.strideUnit : DEFAULT_CARDIO_FIELDS.strideUnit,
    elevationGain: nextConfig.showElevation ? current.elevationGain : "",
    segments:
      currentPrimaryMetric === nextPrimaryMetric
        ? current.segments.map((segment) => ({
            ...segment,
            distance: convertDistanceValue(segment?.distance, current.distanceUnit, nextDistanceUnit),
          }))
        : current.segments.map((segment) => ({
            ...segment,
            distance: convertDistanceValue(segment?.distance, current.distanceUnit, nextDistanceUnit),
            pace: "",
          })),
  };
};

const convertDistanceToMiles = (distance, unit) => {
  const value = Number(distance);
  if (!value) return 0;

  switch (unit) {
    case "km":
      return value * 0.621371;
    case "m":
      return value * 0.000621371;
    case "yd":
      return value * 0.000568182;
    default:
      return value;
  }
};

const convertMilesToDistance = (miles, unit) => {
  if (!Number.isFinite(miles) || miles === 0) return 0;

  switch (unit) {
    case "km":
      return miles / 0.621371;
    case "m":
      return miles / 0.000621371;
    case "yd":
      return miles / 0.000568182;
    default:
      return miles;
  }
};

const formatConvertedDistance = (value, unit) => {
  if (!Number.isFinite(value)) return "";
  const precision = ["m", "yd"].includes(unit) ? 1 : 2;
  return Number(value.toFixed(precision)).toString();
};

const convertDistanceValue = (distance, fromUnit, toUnit) => {
  if (!hasCardioValue(distance) || fromUnit === toUnit) return distance;
  const numericDistance = Number(distance);
  if (!Number.isFinite(numericDistance) || numericDistance <= 0) return distance;

  const miles = convertDistanceToMiles(numericDistance, fromUnit);
  const convertedDistance = convertMilesToDistance(miles, toUnit);
  return formatConvertedDistance(convertedDistance, toUnit);
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
  const activity = cardio?.activity || "Run";
  const canComputeSpeed = getCardioActivityConfig(activity).showSpeed && !["m", "yd"].includes(cardio?.distanceUnit);

  if (!distance || !durationSeconds) {
    return { pace: "", speed: "" };
  }

  const paceSeconds = activity === "Swim" ? durationSeconds / (distance / 100) : durationSeconds / distance;
  const pace = formatPace(paceSeconds);
  const speed =
    canComputeSpeed && durationSeconds > 0 ? (distance / (durationSeconds / 3600)).toFixed(2) : "";

  return { pace, speed };
};

const computeSplitSummary = (segments = [], cardio = {}) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return { totalDistance: "", totalDuration: "", avgPace: "", avgSpeed: "" };
  }

  const totalDistance = segments.reduce((sum, segment) => sum + Number(segment?.distance || 0), 0);
  const totalDurationSeconds = segments.reduce(
    (sum, segment) => sum + (parseDurationToSeconds(segment?.duration || "") || 0),
    0
  );
  const activity = cardio?.activity || "Run";
  const canComputeSpeed = getCardioActivityConfig(activity).showSpeed && !["m", "yd"].includes(cardio?.distanceUnit);

  const avgPace =
    totalDistance > 0 && totalDurationSeconds > 0
      ? formatPace(activity === "Swim" ? totalDurationSeconds / (totalDistance / 100) : totalDurationSeconds / totalDistance)
      : "";
  const avgSpeed =
    totalDistance > 0 && totalDurationSeconds > 0 && canComputeSpeed
      ? (totalDistance / (totalDurationSeconds / 3600)).toFixed(2)
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
    avgSpeed,
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
    clientPrompts: Array.isArray(source.clientPrompts) ? source.clientPrompts.filter(Boolean) : [],
    segments: Array.isArray(source.segments)
      ? source.segments.map((segment) => ({
          ...DEFAULT_CARDIO_SEGMENT,
          ...(segment || {}),
        }))
      : [],
  };
};

const hasCardioResultDetails = (cardioFields) =>
  [
    cardioFields?.distance,
    cardioFields?.duration,
    cardioFields?.avgPace,
    cardioFields?.avgSpeed,
    cardioFields?.rpe,
    cardioFields?.avgHeartRate,
    cardioFields?.elevationGain,
    cardioFields?.routeType,
    cardioFields?.surface,
    cardioFields?.shoes,
    cardioFields?.cadence,
    cardioFields?.strideLength,
    cardioFields?.routeLink,
    cardioFields?.weather,
    cardioFields?.temperature,
    cardioFields?.hrZone,
    cardioFields?.notes,
    cardioFields?.segments?.length,
  ].some((value) => hasCardioValue(value));

const seedActualCardioFromPlan = (planCardio, actualCardio) => {
  const normalizedPlan = normalizeCardioFields(planCardio);
  const normalizedActual = normalizeCardioFields(actualCardio);

  if (hasCardioResultDetails(normalizedActual)) {
    return {
      ...normalizedActual,
      style: normalizedActual.style || normalizedPlan.style,
      routeType: normalizedActual.routeType || normalizedPlan.routeType,
      surface: normalizedActual.surface || normalizedPlan.surface,
      routeLink: normalizedActual.routeLink || normalizedPlan.routeLink,
    };
  }

  return {
    ...normalizedActual,
    activity: normalizedPlan.activity,
    style: normalizedPlan.style,
    distanceUnit: normalizedPlan.distanceUnit,
    routeType: normalizedPlan.routeType,
    surface: normalizedPlan.surface,
    routeLink: normalizedPlan.routeLink,
  };
};

const normalizeCardio = (cardio) => {
  const source = cardio && typeof cardio === "object" ? cardio : {};
  if (source.plan || source.actual) {
    const normalizedPlan = normalizeCardioFields(source.plan);
    return {
      plan: normalizedPlan,
      actual: seedActualCardioFromPlan(normalizedPlan, source.actual),
    };
  }
  const normalizedPlan = normalizeCardioFields(source);
  return {
    plan: normalizedPlan,
    actual: seedActualCardioFromPlan(normalizedPlan, {}),
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
  const [openTrainerSessionDialog, setOpenTrainerSessionDialog] = useState(false);
  const [workoutType, setWorkoutType] = useState(training?.workoutType || "Strength");
  const [cardioDetails, setCardioDetails] = useState(() => normalizeCardio(training?.cardio));
  const [cardioAuto, setCardioAuto] = useState(() =>
    buildCardioAuto(normalizeCardio(training?.cardio))
  );
  const [cardioViewMode, setCardioViewMode] = useState("plan");
  const [cardioSectionsOpen, setCardioSectionsOpen] = useState(DEFAULT_CARDIO_SECTION_STATE);
  const [cardioEditorMode, setCardioEditorMode] = useState(user?.isTrainer ? "full" : "quick");
  const [cardioNotice, setCardioNotice] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const activeWorkoutType = workoutType || training?.workoutType || "Strength";
  const isCardio = activeWorkoutType === "Cardio";
  const activeCardio = cardioDetails?.[cardioViewMode] || normalizeCardioFields({});
  const plannedCardio = cardioDetails?.plan || normalizeCardioFields({});
  const actualCardio = cardioDetails?.actual || normalizeCardioFields({});
  const isTrainerEditingClient =
    !!user?.isTrainer && !!training?.user?._id && String(user._id) !== String(training.user._id);
  const trainerAccessToken = user?.isTrainer
    ? localStorage.getItem("JWT_AUTH_TOKEN")
    : localStorage.getItem("JWT_TRAINER_AUTH_TOKEN");
  const activeTrainerId = user?.isTrainer ? user._id : user?.trainerId || null;
  const canManageTrainerSession =
    !!trainerAccessToken &&
    !!activeTrainerId &&
    !!training?.user?._id &&
    String(activeTrainerId) !== String(training.user._id);
  const activeCardioConfig = useMemo(
    () => getCardioActivityConfig(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioDistanceUnitOptions = useMemo(
    () => getCardioDistanceUnitOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioStyleOptions = useMemo(
    () => getCardioStyleOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioRouteOptions = useMemo(
    () => getCardioRouteOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioSurfaceOptions = useMemo(
    () => getCardioSurfaceOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioStylePresets = useMemo(
    () => getCardioStylePresets(activeCardio.activity),
    [activeCardio.activity]
  );
  const paceUnitLabel = getPaceUnitLabel(activeCardio.activity, activeCardio.distanceUnit);
  const speedUnitLabel = getSpeedUnitLabel(activeCardio.distanceUnit);
  const primaryCardioMetric = getPrimaryCardioMetric(activeCardio.activity);
  const secondaryCardioMetric = getSecondaryCardioMetric(activeCardio.activity);
  const primaryCardioMetricField = primaryCardioMetric === "speed" ? "avgSpeed" : "avgPace";
  const secondaryCardioMetricField =
    secondaryCardioMetric === "speed" ? "avgSpeed" : secondaryCardioMetric === "pace" ? "avgPace" : "";
  const primaryCardioMetricAutoKey = primaryCardioMetric === "speed" ? "speed" : "pace";
  const secondaryCardioMetricAutoKey =
    secondaryCardioMetric === "speed" ? "speed" : secondaryCardioMetric === "pace" ? "pace" : "";
  const primaryCardioMetricLabel =
    primaryCardioMetric === "speed" ? `Avg speed (${speedUnitLabel})` : `Avg pace (${paceUnitLabel})`;
  const secondaryCardioMetricLabel =
    secondaryCardioMetric === "speed"
      ? `Avg speed (${speedUnitLabel})`
      : secondaryCardioMetric === "pace"
        ? `Avg pace (${paceUnitLabel})`
        : "";
  const primaryCardioMetricPlaceholder =
    primaryCardioMetric === "speed" ? "0.0" : `mm:ss ${paceUnitLabel}`;
  const secondaryCardioMetricPlaceholder =
    secondaryCardioMetric === "speed"
      ? "0.0"
      : secondaryCardioMetric === "pace"
        ? `mm:ss ${paceUnitLabel}`
        : "";
  const primaryCardioMetricHelperText = getDerivedMetricHelperText(
    primaryCardioMetric,
    paceUnitLabel,
    speedUnitLabel
  );
  const secondaryCardioMetricHelperText = secondaryCardioMetric
    ? getDerivedMetricHelperText(secondaryCardioMetric, paceUnitLabel, speedUnitLabel)
    : "";
  const splitSummary = useMemo(
    () => computeSplitSummary(activeCardio.segments || [], activeCardio),
    [activeCardio]
  );
  const splitMetricLabel = primaryCardioMetric === "speed" ? "Avg split speed" : "Avg split pace";
  const splitMetricValue = primaryCardioMetric === "speed" ? splitSummary.avgSpeed : splitSummary.avgPace;
  const splitMetricUnitLabel = primaryCardioMetric === "speed" ? speedUnitLabel : paceUnitLabel;
  const durationHasError = hasCardioValue(activeCardio.duration) && !isValidDurationValue(activeCardio.duration);
  const primaryMetricHasError =
    hasCardioValue(activeCardio[primaryCardioMetricField]) &&
    !(primaryCardioMetric === "speed"
      ? isPositiveNumericValue(activeCardio[primaryCardioMetricField])
      : isValidPaceValue(activeCardio[primaryCardioMetricField]));
  const secondaryMetricHasError =
    secondaryCardioMetric &&
    hasCardioValue(activeCardio[secondaryCardioMetricField]) &&
    !(secondaryCardioMetric === "speed"
      ? isPositiveNumericValue(activeCardio[secondaryCardioMetricField])
      : isValidPaceValue(activeCardio[secondaryCardioMetricField]));
  const basicCardioMissingFields = [
    !hasCardioValue(activeCardio.style) ? "session type" : "",
    !hasCardioValue(activeCardio.distance) ? "distance" : "",
    !hasCardioValue(activeCardio.duration) ? "duration" : "",
  ].filter(Boolean);
  const planClientPrompts = plannedCardio.clientPrompts || [];
  const missingClientPromptKeys = useMemo(
    () => (cardioViewMode === "actual" ? getCardioPromptMissing(actualCardio, planClientPrompts) : []),
    [actualCardio, cardioViewMode, planClientPrompts]
  );
  const cardioStatus = useMemo(() => {
    if (basicCardioMissingFields.length > 0) {
      return {
        severity: "info",
        message: `Add ${basicCardioMissingFields.join(", ")} to finish the core workout details.`,
      };
    }

    if (durationHasError || primaryMetricHasError || secondaryMetricHasError) {
      return {
        severity: "warning",
        message: "Fix the highlighted cardio fields before you save.",
      };
    }

    if (missingClientPromptKeys.length > 0) {
      const labels = missingClientPromptKeys.map((key) => CARDIO_CLIENT_PROMPT_LOOKUP[key]?.label || key);
      return {
        severity: "info",
        message: `Trainer requested: ${labels.join(", ")}.`,
      };
    }

    return {
      severity: "success",
      message: "Cardio details look ready to save.",
    };
  }, [
    basicCardioMissingFields,
    durationHasError,
    primaryMetricHasError,
    secondaryMetricHasError,
    missingClientPromptKeys,
  ]);
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
      const miles = convertDistanceToMiles(distance, unit);
      totalMiles += miles;
      matchingWorkouts += 1;
    });

    const displayValue =
      activeCardio.distanceUnit === "km" ? (totalMiles * 1.60934).toFixed(2) : totalMiles.toFixed(2);

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
  const cardioSectionHasData = useMemo(
    () => ({
      metrics: [
        secondaryCardioMetric === "pace" ? activeCardio.avgPace : "",
        secondaryCardioMetric === "speed" ? activeCardio.avgSpeed : "",
        activeCardio.rpe,
        activeCardio.hrZone,
        activeCardio.avgHeartRate,
        activeCardio.cadence,
        activeCardio.strideLength,
      ].some((value) => value !== "" && value !== null && value !== undefined),
      route: [
        activeCardio.routeType,
        activeCardio.surface,
        activeCardio.shoes,
        activeCardio.elevationGain,
        activeCardio.routeLink,
      ].some((value) => value !== "" && value !== null && value !== undefined),
      conditions: [activeCardio.weather, activeCardio.temperature].some(
        (value) => value !== "" && value !== null && value !== undefined
      ),
      notes: [activeCardio.notes].some(
        (value) => value !== "" && value !== null && value !== undefined
      ),
      segments: (activeCardio.segments || []).length > 0,
    }),
    [activeCardio, secondaryCardioMetric]
  );
  const cardioSectionSummaries = useMemo(() => {
    const metricsSummary = joinSummaryParts(
      [
        activeCardio.rpe ? `RPE ${activeCardio.rpe}` : "",
        activeCardio.hrZone ? shortenHrZoneLabel(activeCardio.hrZone) : "",
        secondaryCardioMetric === "pace" && activeCardio.avgPace ? `Pace ${activeCardio.avgPace}` : "",
        secondaryCardioMetric === "speed" && activeCardio.avgSpeed ? `Speed ${activeCardio.avgSpeed}` : "",
        activeCardio.avgHeartRate ? `${activeCardio.avgHeartRate} bpm` : "",
        activeCardioConfig.showCadence && activeCardio.cadence
          ? `Cad ${activeCardio.cadence} ${activeCardio.activity === "Bike" ? "rpm" : "spm"}`
          : "",
      ],
      2
    );
    const routeSummary = joinSummaryParts([
      activeCardio.routeType,
      activeCardio.surface,
      activeCardio.shoes ? truncateText(activeCardio.shoes, 18) : "",
      activeCardio.elevationGain ? `Gain ${activeCardio.elevationGain}` : "",
      activeCardio.routeLink ? "Link" : "",
    ], 2);
    const conditionsSummary = joinSummaryParts([
      activeCardio.weather,
      formatTemperatureLabel(activeCardio.temperature, activeCardio.temperatureUnit),
    ], 2);
    const notePreview = truncateText(activeCardio.notes, 34);
    const segmentCount = activeCardio.segments?.length || 0;
    const segmentsSummary =
      segmentCount > 0
        ? joinSummaryParts(
            [
              `${segmentCount} ${segmentCount === 1 ? "split" : "splits"}`,
              splitSummary.totalDistance ? `${splitSummary.totalDistance} ${activeCardio.distanceUnit}` : "",
              !splitSummary.totalDistance && splitSummary.totalDuration ? splitSummary.totalDuration : "",
              splitMetricValue ? `${splitMetricValue} ${splitMetricUnitLabel}` : "",
            ],
            2
          )
        : "";

    return {
      metrics: metricsSummary,
      route: routeSummary,
      conditions: conditionsSummary,
      notes: notePreview,
      segments: segmentsSummary,
    };
  }, [
    activeCardio,
    activeCardioConfig,
    paceUnitLabel,
    secondaryCardioMetric,
    speedUnitLabel,
    splitSummary,
  ]);
  const cardioComparisonItems = useMemo(() => {
    const formatDistanceEntry = (entry) =>
      hasCardioValue(entry?.distance) ? `${entry.distance} ${entry.distanceUnit || activeCardio.distanceUnit}` : "—";
    const formatMetricEntry = (entry, metricKey, metricType) => {
      if (!hasCardioValue(entry?.[metricKey])) return "—";
      return metricType === "speed" ? `${entry[metricKey]} ${speedUnitLabel}` : `${entry[metricKey]} ${paceUnitLabel}`;
    };

    return [
      {
        key: "session",
        label: "Type",
        plan: plannedCardio.style || "—",
        actual: actualCardio.style || "—",
      },
      {
        key: "distance",
        label: "Distance",
        plan: formatDistanceEntry(plannedCardio),
        actual: formatDistanceEntry(actualCardio),
      },
      {
        key: "duration",
        label: "Duration",
        plan: plannedCardio.duration || "—",
        actual: actualCardio.duration || "—",
      },
      {
        key: "metric",
        label: primaryCardioMetric === "speed" ? "Speed" : "Pace",
        plan: formatMetricEntry(plannedCardio, primaryCardioMetricField, primaryCardioMetric),
        actual: formatMetricEntry(actualCardio, primaryCardioMetricField, primaryCardioMetric),
      },
    ].filter((item) => item.plan !== "—" || item.actual !== "—");
  }, [
    activeCardio.distanceUnit,
    actualCardio,
    paceUnitLabel,
    plannedCardio,
    primaryCardioMetric,
    primaryCardioMetricField,
    speedUnitLabel,
  ]);
  const planCopyActions = useMemo(() => {
    if (cardioViewMode !== "actual") return [];

    const actions = [];
    const pushAction = (action) => {
      if (actions.find((item) => item.key === action.key)) return;
      actions.push(action);
    };

    if (hasCardioValue(plannedCardio.style) && plannedCardio.style !== actualCardio.style) {
      pushAction({
        key: "style",
        label: `Use ${plannedCardio.style}`,
        patch: { style: plannedCardio.style },
        notice: "Copied planned session type.",
      });
    }

    if (
      hasCardioValue(plannedCardio.distance) &&
      (plannedCardio.distance !== actualCardio.distance || plannedCardio.distanceUnit !== actualCardio.distanceUnit)
    ) {
      pushAction({
        key: "distance",
        label: `Use ${plannedCardio.distance} ${plannedCardio.distanceUnit}`,
        patch: {
          distance: plannedCardio.distance,
          distanceUnit: plannedCardio.distanceUnit,
        },
        notice: "Copied planned distance.",
      });
    }

    if (hasCardioValue(plannedCardio.duration) && plannedCardio.duration !== actualCardio.duration) {
      pushAction({
        key: "duration",
        label: `Use ${plannedCardio.duration}`,
        patch: { duration: plannedCardio.duration },
        notice: "Copied planned duration.",
      });
    }

    if (
      hasCardioValue(plannedCardio[primaryCardioMetricField]) &&
      plannedCardio[primaryCardioMetricField] !== actualCardio[primaryCardioMetricField]
    ) {
      pushAction({
        key: primaryCardioMetricField,
        label: `Use ${plannedCardio[primaryCardioMetricField]}`,
        patch: { [primaryCardioMetricField]: plannedCardio[primaryCardioMetricField] },
        notice: `Copied planned ${primaryCardioMetric === "speed" ? "speed" : "pace"}.`,
      });
    }

    if (hasCardioValue(plannedCardio.rpe) && plannedCardio.rpe !== actualCardio.rpe) {
      pushAction({
        key: "rpe",
        label: `Use RPE ${plannedCardio.rpe}`,
        patch: { rpe: plannedCardio.rpe },
        notice: "Copied planned RPE.",
      });
    }

    if (hasCardioValue(plannedCardio.weather) && plannedCardio.weather !== actualCardio.weather) {
      pushAction({
        key: "weather",
        label: `Use ${plannedCardio.weather}`,
        patch: {
          weather: plannedCardio.weather,
          temperature: plannedCardio.temperature,
          temperatureUnit: plannedCardio.temperatureUnit,
        },
        notice: "Copied planned weather.",
      });
    }

    if (hasCardioValue(plannedCardio.notes) && plannedCardio.notes !== actualCardio.notes) {
      pushAction({
        key: "notes",
        label: "Use notes",
        patch: { notes: plannedCardio.notes },
        notice: "Copied planned notes.",
      });
    }

    if (Array.isArray(plannedCardio.segments) && plannedCardio.segments.length > 0) {
      const planSegments = JSON.stringify(plannedCardio.segments);
      const actualSegments = JSON.stringify(actualCardio.segments || []);
      if (planSegments !== actualSegments) {
        pushAction({
          key: "segments",
          label: "Use splits",
          patch: {
            segments: plannedCardio.segments.map((segment) => ({ ...segment })),
          },
          notice: "Copied planned splits.",
        });
      }
    }

    return actions.slice(0, 6);
  }, [
    actualCardio,
    cardioViewMode,
    plannedCardio,
    primaryCardioMetric,
    primaryCardioMetricField,
  ]);

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
    const nextEditorMode = user?.isTrainer ? "full" : "quick";
    setCardioEditorMode(nextEditorMode);
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: normalizedCardio.plan,
        promptKeys: normalizedCardio.plan?.clientPrompts || [],
        editorMode: nextEditorMode,
      })
    );

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
  }, [training, normalize, user?.isTrainer]);

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

  const handleCardioNoticeClose = () => {
    setCardioNotice((prev) => ({ ...prev, open: false }));
  };

  const handleCardioEditorModeChange = (event, nextMode) => {
    if (!nextMode) return;
    setCardioEditorMode(nextMode);
    const promptKeys = cardioViewMode === "actual" ? planClientPrompts : activeCardio.clientPrompts || [];
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: activeCardio,
        promptKeys,
        editorMode: nextMode,
      })
    );
  };

  const handleCardioViewModeChange = (event, nextValue) => {
    if (!nextValue) return;
    const nextCardio =
      nextValue === "actual"
        ? seedActualCardioFromPlan(cardioDetails?.plan, cardioDetails?.actual)
        : cardioDetails?.[nextValue] || normalizeCardioFields({});
    const promptKeys = nextValue === "actual" ? planClientPrompts : nextCardio.clientPrompts || [];

    if (nextValue === "actual") {
      setCardioDetails((prev) => ({
        ...prev,
        actual: seedActualCardioFromPlan(prev?.plan, prev?.actual),
      }));
    }

    setCardioViewMode(nextValue);
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: nextCardio,
        promptKeys,
        editorMode: cardioEditorMode,
      })
    );
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

  const handleCardioDistanceUnitChange = (event) => {
    const nextUnit = event.target.value;
    const currentUnit = activeCardio.distanceUnit;

    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        distanceUnit: nextUnit,
        distance: convertDistanceValue(prev[cardioViewMode]?.distance, currentUnit, nextUnit),
        segments: (prev[cardioViewMode]?.segments || []).map((segment) => ({
          ...segment,
          distance: convertDistanceValue(segment?.distance, currentUnit, nextUnit),
        })),
      },
    }));
  };

  const handleCardioActivityChange = (event) => {
    const nextActivity = event.target.value;
    const nextModeData = sanitizeCardioForActivity(activeCardio, nextActivity);
    const clearedFields = [];

    [
      ["style", "session type"],
      ["avgPace", "pace"],
      ["avgSpeed", "speed"],
      ["routeType", "route"],
      ["surface", "surface"],
      ["shoes", "shoes"],
      ["cadence", "cadence"],
      ["strideLength", "stride"],
      ["elevationGain", "elevation gain"],
    ].forEach(([field, label]) => {
      if (hasCardioValue(activeCardio?.[field]) && !hasCardioValue(nextModeData?.[field])) {
        clearedFields.push(label);
      }
    });

    setCardioDetails((prev) => {
      return {
        ...prev,
        [cardioViewMode]: nextModeData,
      };
    });
    setCardioAuto((prev) => ({
      ...prev,
      [cardioViewMode]: {
        pace: !nextModeData.avgPace,
        speed: !nextModeData.avgSpeed,
      },
    }));

    if (clearedFields.length > 0) {
      const preview =
        clearedFields.length > 3
          ? `${clearedFields.slice(0, 3).join(", ")}, and more`
          : clearedFields.join(", ");
      setCardioNotice({
        open: true,
        severity: "info",
        message: `Switched to ${nextActivity}. Cleared ${preview}.`,
      });
    }
  };

  const handleStylePreset = (style) => {
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        style,
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

  const handleToggleClientPrompt = (promptKey) => {
    const section = CARDIO_CLIENT_PROMPT_LOOKUP[promptKey]?.section;
    setCardioDetails((prev) => {
      const plan = prev.plan || normalizeCardioFields({});
      const nextPrompts = plan.clientPrompts?.includes(promptKey)
        ? plan.clientPrompts.filter((key) => key !== promptKey)
        : [...(plan.clientPrompts || []), promptKey];

      return {
        ...prev,
        plan: {
          ...plan,
          clientPrompts: nextPrompts,
        },
      };
    });
    if (section) {
      setCardioSectionsOpen((prev) => ({
        ...prev,
        [section]: true,
      }));
    }
  };

  const toggleCardioSection = (section) => {
    setCardioSectionsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddCardioSegment = () => {
    setCardioSectionsOpen((prev) => ({
      ...prev,
      segments: true,
    }));
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

  const handleCopyPlanFieldToActual = (action) => {
    setCardioDetails((prev) => ({
      ...prev,
      actual: {
        ...prev.actual,
        ...action.patch,
      },
    }));

    setCardioAuto((prev) => ({
      ...prev,
      actual: {
        ...prev.actual,
        ...(Object.prototype.hasOwnProperty.call(action.patch, "avgPace") ? { pace: false } : {}),
        ...(Object.prototype.hasOwnProperty.call(action.patch, "avgSpeed") ? { speed: false } : {}),
      },
    }));

    setCardioNotice({
      open: true,
      severity: "success",
      message: action.notice,
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
    setCardioNotice({
      open: true,
      severity: "success",
      message: "Copied the full plan into results.",
    });
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
    const nextEditorMode = user?.isTrainer ? "full" : "quick";
    setCardioEditorMode(nextEditorMode);
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: normalizedCardio.plan,
        promptKeys: normalizedCardio.plan?.clientPrompts || [],
        editorMode: nextEditorMode,
      })
    );
    if (training?.user?._id) {
      setBorderHighlight(!isPersonalWorkout());
    }
  }, [isPersonalWorkout, setBorderHighlight, training, user?.isTrainer]);

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
            localTraining={localTraining}
            allowTrainingReorder
          />
          <Snackbar
            open={cardioNotice.open}
            autoHideDuration={3000}
            onClose={handleCardioNoticeClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleCardioNoticeClose} severity={cardioNotice.severity} variant="filled">
              {cardioNotice.message}
            </Alert>
          </Snackbar>
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
                {canManageTrainerSession && (
                  <Grid container size={12} sx={{ justifyContent: "center", paddingTop: scheduleEvent ? "8px" : "5px" }}>
                    <Button
                      size="small"
                      variant={scheduleEvent ? "outlined" : "contained"}
                      onClick={() => setOpenTrainerSessionDialog(true)}
                    >
                      {scheduleEvent ? "Edit Trainer Session" : "Mark as Trainer Session"}
                    </Button>
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
                          <Stack spacing={2.5}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              spacing={1}
                              sx={{ flexWrap: "wrap", gap: "8px" }}
                            >
                              <Stack spacing={0.5}>
                                <Typography variant="h6">Cardio Details</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Start with the basics. Open the plus buttons for the extras.
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ToggleButtonGroup
                                  value={cardioViewMode}
                                  exclusive
                                  size="small"
                                  onChange={handleCardioViewModeChange}
                                >
                                  <ToggleButton value="plan">Plan</ToggleButton>
                                  <ToggleButton value="actual">Results</ToggleButton>
                                </ToggleButtonGroup>
                                <ToggleButtonGroup
                                  value={cardioEditorMode}
                                  exclusive
                                  size="small"
                                  onChange={handleCardioEditorModeChange}
                                >
                                  <ToggleButton value="quick">Quick Log</ToggleButton>
                                  <ToggleButton value="full">Full Details</ToggleButton>
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
                            <Alert severity={cardioStatus.severity} variant="outlined">
                              {cardioStatus.message}
                            </Alert>
                            {cardioComparisonItems.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                {cardioComparisonItems.map((item) => (
                                  <Chip
                                    key={`compare-${item.key}`}
                                    size="small"
                                    variant="outlined"
                                    label={`${item.label}: ${item.plan} -> ${item.actual}`}
                                  />
                                ))}
                              </Stack>
                            )}
                            {cardioViewMode === "actual" && planClientPrompts.length > 0 && (
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Trainer requested:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                  {planClientPrompts.map((key) => {
                                    const option = CARDIO_CLIENT_PROMPT_LOOKUP[key];
                                    if (!option) return null;
                                    const isMissing = missingClientPromptKeys.includes(key);

                                    return (
                                      <Chip
                                        key={`requested-${key}`}
                                        size="small"
                                        clickable
                                        color={isMissing ? "warning" : "success"}
                                        variant={isMissing ? "filled" : "outlined"}
                                        label={option.label}
                                        onClick={() => toggleCardioSection(option.section)}
                                      />
                                    );
                                  })}
                                </Stack>
                              </Stack>
                            )}
                            {cardioViewMode === "actual" && planCopyActions.length > 0 && (
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Use planned details:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                  {planCopyActions.map((action) => (
                                    <Chip
                                      key={`copy-${action.key}`}
                                      size="small"
                                      clickable
                                      variant="outlined"
                                      label={action.label}
                                      onClick={() => handleCopyPlanFieldToActual(action)}
                                    />
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  select
                                  label="Activity"
                                  value={activeCardio.activity}
                                  onChange={handleCardioActivityChange}
                                  helperText="Changing activity clears details that do not apply."
                                  fullWidth
                                >
                                  {CARDIO_ACTIVITY_OPTIONS.map((activity) => (
                                    <MenuItem key={activity} value={activity}>
                                      {activity}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                  select
                                  label="Session type"
                                  value={activeCardio.style}
                                  onChange={handleCardioChange("style")}
                                  helperText="Choose a preset or pick a custom type."
                                  fullWidth
                                >
                                  {cardioStyleOptions.map((style) => (
                                    <MenuItem key={style} value={style}>
                                      {style}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 8, sm: 2 }}>
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
                                  onChange={handleCardioDistanceUnitChange}
                                  fullWidth
                                >
                                  {cardioDistanceUnitOptions.map((unit) => (
                                    <MenuItem key={unit} value={unit}>
                                      {unit}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label="Duration"
                                  placeholder="hh:mm:ss"
                                  value={activeCardio.duration}
                                  onChange={handleCardioChange("duration")}
                                  error={durationHasError}
                                  helperText={durationHasError ? "Use mm:ss or hh:mm:ss." : getDurationHelperText()}
                                  fullWidth
                                />
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4 }}>
                                <TextField
                                  label={primaryCardioMetricLabel}
                                  placeholder={primaryCardioMetricPlaceholder}
                                  type={primaryCardioMetric === "speed" ? "number" : "text"}
                                  value={activeCardio[primaryCardioMetricField]}
                                  onChange={handleCardioDerivedChange(primaryCardioMetricField)}
                                  fullWidth
                                  inputProps={
                                    primaryCardioMetric === "speed" ? { min: 0, step: "0.1" } : undefined
                                  }
                                  error={primaryMetricHasError}
                                  helperText={
                                    primaryMetricHasError
                                      ? getDerivedMetricErrorText(primaryCardioMetric)
                                      : primaryCardioMetricHelperText
                                  }
                                  InputProps={{
                                    endAdornment: renderAutoAdornment(
                                      cardioAuto?.[cardioViewMode]?.[primaryCardioMetricAutoKey]
                                    ),
                                  }}
                                />
                              </Grid>
                            </Grid>
                            {cardioStylePresets.length > 0 && (
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Quick presets
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                  {cardioStylePresets.map((style) => (
                                    <Chip
                                      key={`preset-${style}`}
                                      label={style}
                                      size="small"
                                      clickable
                                      color={activeCardio.style === style ? "primary" : "default"}
                                      variant={activeCardio.style === style ? "filled" : "outlined"}
                                      onClick={() => handleStylePreset(style)}
                                    />
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                            {isTrainerEditingClient && cardioViewMode === "plan" && (
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Ask the client to complete
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                  {CARDIO_CLIENT_PROMPT_OPTIONS.map((option) => (
                                    <Chip
                                      key={`prompt-${option.key}`}
                                      label={option.label}
                                      size="small"
                                      clickable
                                      color={planClientPrompts.includes(option.key) ? "primary" : "default"}
                                      variant={planClientPrompts.includes(option.key) ? "filled" : "outlined"}
                                      onClick={() => handleToggleClientPrompt(option.key)}
                                    />
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                              {CARDIO_OPTIONAL_SECTIONS.map((section) => (
                                <Button
                                  key={section.key}
                                  variant={cardioSectionsOpen[section.key] ? "contained" : "outlined"}
                                  color={
                                    cardioSectionsOpen[section.key] || cardioSectionHasData[section.key]
                                      ? "primary"
                                      : "inherit"
                                  }
                                  size="small"
                                  onClick={() => toggleCardioSection(section.key)}
                                  startIcon={
                                    <Add
                                      sx={{
                                        transform: cardioSectionsOpen[section.key]
                                          ? "rotate(45deg)"
                                          : "rotate(0deg)",
                                        transition: "transform 0.2s ease",
                                      }}
                                    />
                                  }
                                >
                                  {section.label}
                                </Button>
                              ))}
                            </Stack>
                            {CARDIO_OPTIONAL_SECTIONS.some(
                              (section) => cardioSectionHasData[section.key] && !cardioSectionsOpen[section.key]
                            ) && (
                              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                                {CARDIO_OPTIONAL_SECTIONS.filter(
                                  (section) =>
                                    cardioSectionHasData[section.key] &&
                                    !cardioSectionsOpen[section.key] &&
                                    cardioSectionSummaries[section.key]
                                ).map((section) => (
                                  <Chip
                                    key={`${section.key}-summary`}
                                    label={`${section.summaryLabel}: ${cardioSectionSummaries[section.key]}`}
                                    variant="outlined"
                                    size="small"
                                    clickable
                                    onClick={() => toggleCardioSection(section.key)}
                                    sx={{
                                      maxWidth: "100%",
                                      "& .MuiChip-label": {
                                        display: "block",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      },
                                    }}
                                  />
                                ))}
                              </Stack>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid size={12}>
                        <Collapse in={cardioSectionsOpen.metrics} unmountOnExit>
                          <Paper variant="outlined" sx={{ padding: "16px" }}>
                            <Stack spacing={2}>
                              <Typography variant="subtitle1">Metrics</Typography>
                              <Grid container spacing={2}>
                                {secondaryCardioMetric && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      label={secondaryCardioMetricLabel}
                                      placeholder={secondaryCardioMetricPlaceholder}
                                      type={secondaryCardioMetric === "speed" ? "number" : "text"}
                                      value={activeCardio[secondaryCardioMetricField]}
                                      onChange={handleCardioDerivedChange(secondaryCardioMetricField)}
                                      fullWidth
                                      inputProps={
                                        secondaryCardioMetric === "speed"
                                          ? { min: 0, step: "0.1" }
                                          : undefined
                                      }
                                      error={secondaryMetricHasError}
                                      helperText={
                                        secondaryMetricHasError
                                          ? getDerivedMetricErrorText(secondaryCardioMetric)
                                          : secondaryCardioMetricHelperText
                                      }
                                      InputProps={{
                                        endAdornment: renderAutoAdornment(
                                          cardioAuto?.[cardioViewMode]?.[secondaryCardioMetricAutoKey]
                                        ),
                                      }}
                                    />
                                  </Grid>
                                )}
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
                                {activeCardioConfig.showCadence && (
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <TextField
                                      label={activeCardioConfig.cadenceLabel}
                                      type="number"
                                      value={activeCardio.cadence}
                                      onChange={handleCardioChange("cadence")}
                                      fullWidth
                                      inputProps={{ min: 0, step: "1" }}
                                    />
                                  </Grid>
                                )}
                                {activeCardioConfig.showStride && (
                                  <>
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
                                    <Grid size={{ xs: 6, sm: 2 }}>
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
                                  </>
                                )}
                              </Grid>
                            </Stack>
                          </Paper>
                        </Collapse>
                      </Grid>
                      <Grid size={12}>
                        <Collapse in={cardioSectionsOpen.route} unmountOnExit>
                          <Paper variant="outlined" sx={{ padding: "16px" }}>
                            <Stack spacing={2}>
                              <Typography variant="subtitle1">Route & Gear</Typography>
                              <Grid container spacing={2}>
                                {activeCardioConfig.showRouteType && cardioRouteOptions.length > 0 && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      select
                                      label={activeCardioConfig.routeTypeLabel}
                                      value={activeCardio.routeType}
                                      onChange={handleCardioChange("routeType")}
                                      fullWidth
                                    >
                                      {cardioRouteOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                )}
                                {activeCardioConfig.showSurface && cardioSurfaceOptions.length > 0 && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      select
                                      label={activeCardioConfig.surfaceLabel}
                                      value={activeCardio.surface}
                                      onChange={handleCardioChange("surface")}
                                      fullWidth
                                    >
                                      {cardioSurfaceOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                )}
                                {activeCardioConfig.showFootwear && (
                                  <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                      label={activeCardio.activity === "Hike" ? "Shoes / footwear" : "Shoes"}
                                      placeholder="e.g., Nike Pegasus 41"
                                      value={activeCardio.shoes}
                                      onChange={handleCardioChange("shoes")}
                                      fullWidth
                                      helperText={shoeMileageHelper}
                                    />
                                  </Grid>
                                )}
                                {activeCardioConfig.showElevation && (
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
                                )}
                                <Grid size={12}>
                                  <TextField
                                    label="Route link"
                                    placeholder={activeCardioConfig.routeLinkPlaceholder}
                                    value={activeCardio.routeLink}
                                    onChange={handleCardioChange("routeLink")}
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                            </Stack>
                          </Paper>
                        </Collapse>
                      </Grid>
                      <Grid size={12}>
                        <Collapse in={cardioSectionsOpen.conditions} unmountOnExit>
                          <Paper variant="outlined" sx={{ padding: "16px" }}>
                            <Stack spacing={2}>
                              <Typography variant="subtitle1">Conditions</Typography>
                              <Grid container spacing={2}>
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
                              </Grid>
                            </Stack>
                          </Paper>
                        </Collapse>
                      </Grid>
                      <Grid size={12}>
                        <Collapse in={cardioSectionsOpen.notes} unmountOnExit>
                          <Paper variant="outlined" sx={{ padding: "16px" }}>
                            <Stack spacing={2}>
                              <Typography variant="subtitle1">Notes</Typography>
                              <TextField
                                label="Notes"
                                placeholder="How did it feel? Surface, weather, goal pacing..."
                                value={activeCardio.notes}
                                onChange={handleCardioChange("notes")}
                                multiline
                                minRows={3}
                                fullWidth
                              />
                            </Stack>
                          </Paper>
                        </Collapse>
                      </Grid>
                      <Grid size={12}>
                        <Collapse in={cardioSectionsOpen.segments} unmountOnExit>
                          <Paper variant="outlined" sx={{ padding: "16px" }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1">Splits & Intervals</Typography>
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
                                          label={
                                            primaryCardioMetric === "speed"
                                              ? `Speed (${speedUnitLabel})`
                                              : `Pace (${paceUnitLabel})`
                                          }
                                          placeholder={primaryCardioMetric === "speed" ? "0.0" : "mm:ss"}
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
                                    {splitMetricLabel}: {splitMetricValue || "—"} {splitMetricUnitLabel}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Paper>
                        </Collapse>
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
              <WorkoutTrainerSessionDialog
                open={openTrainerSessionDialog}
                onClose={() => setOpenTrainerSessionDialog(false)}
                workouts={
                  training?._id
                    ? [
                        {
                          ...training,
                          title: trainingTitle || training.title,
                          complete: workoutCompleteStatus,
                        },
                      ]
                    : []
                }
                initialWorkoutId={training?._id || ""}
                onSaved={(event) => setScheduleEvent(event)}
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
