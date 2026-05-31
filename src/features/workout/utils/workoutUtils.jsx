import React from "react";
import { Chip, InputAdornment, Tooltip } from "@mui/material";

export const WORKOUT_GESTURES_STORAGE_KEY = "firebelly.workoutGestures";
export const DEFAULT_WORKOUT_GESTURES = {
  tapWeightLabelToSwitchUnit: false,
};

export const readWorkoutGestures = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(WORKOUT_GESTURES_STORAGE_KEY) || "{}");
    return {
      ...DEFAULT_WORKOUT_GESTURES,
      ...(stored && typeof stored === "object" ? stored : {}),
    };
  } catch {
    return { ...DEFAULT_WORKOUT_GESTURES };
  }
};

export const saveWorkoutGestures = (gestures) => {
  localStorage.setItem(WORKOUT_GESTURES_STORAGE_KEY, JSON.stringify(gestures));
};

export const CARDIO_ACTIVITY_CONFIG = {
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

export const CARDIO_ACTIVITY_OPTIONS = Object.keys(CARDIO_ACTIVITY_CONFIG);
export const CARDIO_WEATHER_OPTIONS = ["Sunny", "Cloudy", "Rain", "Windy", "Snow", "Indoor"];
export const CARDIO_HR_ZONE_OPTIONS = [
  "Z1 Recovery",
  "Z2 Endurance",
  "Z3 Tempo",
  "Z4 Threshold",
  "Z5 VO2",
];

export const DEFAULT_CARDIO_SEGMENT = {
  label: "",
  distance: "",
  duration: "",
  pace: "",
  rpe: "",
};

export const DEFAULT_CARDIO_FIELDS = {
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

export const DEFAULT_CARDIO_SECTION_STATE = {
  metrics: false,
  route: false,
  conditions: false,
  notes: false,
  segments: false,
};

export const CARDIO_OPTIONAL_SECTIONS = [
  { key: "segments", label: "Splits", summaryLabel: "Splits" },
  { key: "metrics", label: "Metrics", summaryLabel: "Metrics" },
  { key: "route", label: "Route & Gear", summaryLabel: "Route" },
  { key: "conditions", label: "Conditions", summaryLabel: "Weather" },
  { key: "notes", label: "Notes", summaryLabel: "Notes" },
];

export const CARDIO_CLIENT_PROMPT_OPTIONS = [
  { key: "rpe", label: "RPE", section: "metrics" },
  { key: "avgHeartRate", label: "Heart rate", section: "metrics" },
  { key: "weather", label: "Weather", section: "conditions" },
  { key: "notes", label: "Notes", section: "notes" },
  { key: "segments", label: "Splits", section: "segments" },
];

export const CARDIO_CLIENT_PROMPT_LOOKUP = CARDIO_CLIENT_PROMPT_OPTIONS.reduce((acc, option) => {
  acc[option.key] = option;
  return acc;
}, {});

export const getCardioActivityConfig = (activity) =>
  CARDIO_ACTIVITY_CONFIG[activity] || CARDIO_ACTIVITY_CONFIG.Run;

export const getCardioDistanceUnitOptions = (activity) =>
  getCardioActivityConfig(activity).distanceUnits || ["mi", "km"];

export const getCardioStyleOptions = (activity) =>
  getCardioActivityConfig(activity).styleOptions || [];

export const getCardioRouteOptions = (activity) =>
  getCardioActivityConfig(activity).routeOptions || [];

export const getCardioSurfaceOptions = (activity) =>
  getCardioActivityConfig(activity).surfaceOptions || [];

export const getCardioStylePresets = (activity) => getCardioStyleOptions(activity).slice(0, 4);

export const getPaceUnitLabel = (activity, distanceUnit) => {
  if (activity === "Swim") {
    return distanceUnit === "yd" ? "min/100yd" : "min/100m";
  }

  if (distanceUnit === "km") return "min/km";
  return "min/mi";
};

export const getSpeedUnitLabel = (distanceUnit) => {
  if (distanceUnit === "km") return "km/h";
  if (distanceUnit === "mi") return "mph";
  return "";
};

export const getPrimaryCardioMetric = (activity) =>
  getCardioActivityConfig(activity).primaryDerivedMetric || "pace";

export const getSecondaryCardioMetric = (activity) => {
  const config = getCardioActivityConfig(activity);
  const primaryMetric = getPrimaryCardioMetric(activity);

  if (primaryMetric !== "pace" && config.showPace) return "pace";
  if (primaryMetric !== "speed" && config.showSpeed) return "speed";
  return null;
};

export const getDurationHelperText = () => "Examples: 45, 45:00, or 1:05:30.";

export const getDerivedMetricHelperText = (metric, paceUnitLabel, speedUnitLabel) => {
  if (metric === "speed") {
    return speedUnitLabel ? `Example: 14.5 ${speedUnitLabel}.` : "Example: 14.5.";
  }

  return `Use mm:ss format. Example: 8:15 ${paceUnitLabel}.`;
};

export const getDerivedMetricErrorText = (metric) =>
  metric === "speed" ? "Enter a positive number." : "Use mm:ss format.";

export const truncateText = (value, maxLength = 44) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
};

export const joinSummaryParts = (parts, limit = 2) => parts.filter(Boolean).slice(0, limit).join(" • ");

export const formatTemperatureLabel = (temperature, unit) => {
  if (temperature === "" || temperature === null || temperature === undefined) return "";
  return unit ? `${temperature} ${unit}` : String(temperature);
};

export const hasCardioValue = (value) =>
  !(value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0));

export const shortenHrZoneLabel = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "";

  const match = normalized.match(/^(Z\d+)/i);
  return match ? match[1].toUpperCase() : normalized;
};

export const isPositiveNumericValue = (value) => {
  if (!hasCardioValue(value)) return true;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0;
};

export const isValidPaceValue = (value) => {
  if (!hasCardioValue(value)) return true;
  if (!String(value).includes(":")) return false;
  return parseDurationToSeconds(String(value)) !== null;
};

export const isValidDurationValue = (value) => {
  if (!hasCardioValue(value)) return true;
  return parseDurationToSeconds(String(value)) !== null;
};

export const getCardioPromptMissing = (cardioFields, promptKeys = []) =>
  promptKeys.filter((key) => {
    if (key === "segments") return !Array.isArray(cardioFields?.segments) || cardioFields.segments.length === 0;
    return !hasCardioValue(cardioFields?.[key]);
  });

export const getCardioAutoOpenSections = ({ cardioFields, promptKeys = [], editorMode = "quick" }) => {
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

export const sanitizeCardioForActivity = (cardioFields, nextActivity) => {
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

export const convertDistanceToMiles = (distance, unit) => {
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

export const convertMilesToDistance = (miles, unit) => {
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

export const formatConvertedDistance = (value, unit) => {
  if (!Number.isFinite(value)) return "";
  const precision = ["m", "yd"].includes(unit) ? 1 : 2;
  return Number(value.toFixed(precision)).toString();
};

export const convertDistanceValue = (distance, fromUnit, toUnit) => {
  if (!hasCardioValue(distance) || fromUnit === toUnit) return distance;
  const numericDistance = Number(distance);
  if (!Number.isFinite(numericDistance) || numericDistance <= 0) return distance;

  const miles = convertDistanceToMiles(numericDistance, fromUnit);
  const convertedDistance = convertMilesToDistance(miles, toUnit);
  return formatConvertedDistance(convertedDistance, toUnit);
};

export const buildCardioAuto = (cardio) => ({
  plan: {
    pace: !cardio?.plan?.avgPace,
    speed: !cardio?.plan?.avgSpeed,
  },
  actual: {
    pace: !cardio?.actual?.avgPace,
    speed: !cardio?.actual?.avgSpeed,
  },
});

export const parseDurationToSeconds = (value) => {
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

export const formatPace = (secondsPerUnit) => {
  if (!Number.isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "";
  const totalSeconds = Math.round(secondsPerUnit);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const computeDerivedCardio = (cardio) => {
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

export const computeSplitSummary = (segments = [], cardio = {}) => {
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

export const normalizeShoeName = (value) => (value || "").trim().toLowerCase();

export const renderAutoAdornment = (isAuto) =>
  isAuto ? (
    <InputAdornment position="end">
      <Tooltip title="Auto-calculated from distance and duration. Edit to override.">
        <Chip size="small" label="Auto" variant="outlined" />
      </Tooltip>
    </InputAdornment>
  ) : null;

export const normalizeCardioFields = (cardioFields) => {
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

export const hasCardioResultDetails = (cardioFields) =>
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

export const seedActualCardioFromPlan = (planCardio, actualCardio) => {
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

export const normalizeCardio = (cardio) => {
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
