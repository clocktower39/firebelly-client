import dayjs from "dayjs";

export const createZeroArray = (setCount) => Array(setCount).fill(0);

export const normalizeToSets = (values, setCount) => {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: setCount }, (_, idx) => source[idx] ?? 0);
};

export const formatHistoryLabel = (historyItem) => {
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

export const getHistoryOptionKey = (historyItem, index) =>
  `${historyItem?._id || "history"}-${historyItem?.date || "no-date"}-${index}`;

export const buildRecentHistoryOptions = (history = []) =>
  history.slice(Math.max(history.length - 3, 0)).map((historyItem, index) => ({
    key: getHistoryOptionKey(historyItem, index),
    historyItem,
  }));

export const buildExercisePresetFromHistory = (
  historyItem,
  setCount,
  fallbackExerciseType = "Reps"
) => {
  const nextExerciseType = historyItem?.exerciseType || fallbackExerciseType || "Reps";
  const historyGoals = historyItem?.goals || {};
  const achieved = historyItem?.achieved || {};
  const zeroArray = createZeroArray(setCount);
  const goals = {
    sets: setCount,
    minReps: [...zeroArray],
    maxReps: [...zeroArray],
    exactReps: [...zeroArray],
    weight: [...zeroArray],
    percent: [...zeroArray],
    seconds: [...zeroArray],
    oneRepMax: Number(historyGoals.oneRepMax) || 0,
  };

  switch (nextExerciseType) {
    case "Time":
      goals.seconds = normalizeToSets(achieved.seconds, setCount);
      break;
    case "Rep Range":
      goals.weight = normalizeToSets(achieved.weight, setCount);
      goals.minReps = normalizeToSets(achieved.reps, setCount);
      goals.maxReps = normalizeToSets(achieved.reps, setCount);
      break;
    case "Reps with %":
      goals.exactReps = normalizeToSets(
        Array.isArray(achieved.reps) && achieved.reps.length > 0
          ? achieved.reps
          : historyGoals.exactReps,
        setCount
      );
      goals.percent = normalizeToSets(
        Array.isArray(achieved.percent) && achieved.percent.length > 0
          ? achieved.percent
          : normalizeToSets(achieved.weight, setCount).map((weight) =>
              Number(historyGoals.oneRepMax)
                ? Math.round((Number(weight) / Number(historyGoals.oneRepMax)) * 100)
                : 0
            ),
        setCount
      );
      break;
    case "Reps":
    default:
      goals.exactReps = normalizeToSets(achieved.reps, setCount);
      goals.weight = normalizeToSets(achieved.weight, setCount);
      break;
  }

  return {
    exerciseType: nextExerciseType,
    goals,
    achieved: {
      sets: 0,
      reps: [...zeroArray],
      weight: [...zeroArray],
      percent: [...zeroArray],
      seconds: [...zeroArray],
    },
  };
};
