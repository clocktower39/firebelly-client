import { useMemo } from "react";
import { hasCardioValue } from "../../utils/workoutUtils";

export default function useCardioPlanCopyActions({
  actualCardio,
  cardioViewMode,
  plannedCardio,
  primaryCardioMetric,
  primaryCardioMetricField,
}) {
  return useMemo(() => {
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
}
