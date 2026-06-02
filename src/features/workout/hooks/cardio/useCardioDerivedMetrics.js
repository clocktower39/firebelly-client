import { useMemo } from "react";
import {
  CARDIO_CLIENT_PROMPT_LOOKUP,
  computeSplitSummary,
  getCardioActivityConfig,
  getCardioDistanceUnitOptions,
  getCardioPromptMissing,
  getCardioRouteOptions,
  getCardioStyleOptions,
  getCardioStylePresets,
  getCardioSurfaceOptions,
  getDerivedMetricHelperText,
  getPaceUnitLabel,
  getPrimaryCardioMetric,
  getSecondaryCardioMetric,
  getSpeedUnitLabel,
  hasCardioValue,
  isPositiveNumericValue,
  isValidDurationValue,
  isValidPaceValue,
} from "../../utils/workoutUtils";

const EMPTY_COMPARISON_VALUE = "—";

export default function useCardioDerivedMetrics({
  activeCardio,
  actualCardio,
  cardioViewMode,
  plannedCardio,
}) {
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

  const cardioComparisonItems = useMemo(() => {
    const formatDistanceEntry = (entry) =>
      hasCardioValue(entry?.distance)
        ? `${entry.distance} ${entry.distanceUnit || activeCardio.distanceUnit}`
        : EMPTY_COMPARISON_VALUE;
    const formatMetricEntry = (entry, metricKey, metricType) => {
      if (!hasCardioValue(entry?.[metricKey])) return EMPTY_COMPARISON_VALUE;
      return metricType === "speed" ? `${entry[metricKey]} ${speedUnitLabel}` : `${entry[metricKey]} ${paceUnitLabel}`;
    };

    return [
      {
        key: "session",
        label: "Type",
        plan: plannedCardio.style || EMPTY_COMPARISON_VALUE,
        actual: actualCardio.style || EMPTY_COMPARISON_VALUE,
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
        plan: plannedCardio.duration || EMPTY_COMPARISON_VALUE,
        actual: actualCardio.duration || EMPTY_COMPARISON_VALUE,
      },
      {
        key: "metric",
        label: primaryCardioMetric === "speed" ? "Speed" : "Pace",
        plan: formatMetricEntry(plannedCardio, primaryCardioMetricField, primaryCardioMetric),
        actual: formatMetricEntry(actualCardio, primaryCardioMetricField, primaryCardioMetric),
      },
    ].filter((item) => item.plan !== EMPTY_COMPARISON_VALUE || item.actual !== EMPTY_COMPARISON_VALUE);
  }, [
    activeCardio.distanceUnit,
    actualCardio,
    paceUnitLabel,
    plannedCardio,
    primaryCardioMetric,
    primaryCardioMetricField,
    speedUnitLabel,
  ]);

  return {
    activeCardioConfig,
    cardioComparisonItems,
    cardioDistanceUnitOptions,
    cardioRouteOptions,
    cardioStatus,
    cardioStyleOptions,
    cardioStylePresets,
    cardioSurfaceOptions,
    durationHasError,
    missingClientPromptKeys,
    paceUnitLabel,
    planClientPrompts,
    primaryCardioMetric,
    primaryCardioMetricAutoKey,
    primaryCardioMetricField,
    primaryCardioMetricHelperText,
    primaryCardioMetricLabel,
    primaryCardioMetricPlaceholder,
    primaryMetricHasError,
    secondaryCardioMetric,
    secondaryCardioMetricAutoKey,
    secondaryCardioMetricField,
    secondaryCardioMetricHelperText,
    secondaryCardioMetricLabel,
    secondaryCardioMetricPlaceholder,
    secondaryMetricHasError,
    speedUnitLabel,
    splitMetricLabel,
    splitMetricUnitLabel,
    splitMetricValue,
    splitSummary,
  };
}
