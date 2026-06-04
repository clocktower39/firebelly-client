import { useMemo } from "react";
import {
  formatTemperatureLabel,
  joinSummaryParts,
  shortenHrZoneLabel,
  truncateText,
} from "../../utils/workoutUtils";

export default function useCardioSections({
  activeCardio,
  activeCardioConfig,
  secondaryCardioMetric,
  splitMetricUnitLabel,
  splitMetricValue,
  splitSummary,
}) {
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
    const routeSummary = joinSummaryParts(
      [
        activeCardio.routeType,
        activeCardio.surface,
        activeCardio.shoes ? truncateText(activeCardio.shoes, 18) : "",
        activeCardio.elevationGain ? `Gain ${activeCardio.elevationGain}` : "",
        activeCardio.routeLink ? "Link" : "",
      ],
      2
    );
    const conditionsSummary = joinSummaryParts(
      [
        activeCardio.weather,
        formatTemperatureLabel(activeCardio.temperature, activeCardio.temperatureUnit),
      ],
      2
    );
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
    secondaryCardioMetric,
    splitMetricUnitLabel,
    splitMetricValue,
    splitSummary,
  ]);

  return {
    cardioSectionHasData,
    cardioSectionSummaries,
  };
}
