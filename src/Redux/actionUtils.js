export const getDateKey = (value) => {
  if (!value) return "";
  const dateMatch = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (dateMatch) return dateMatch;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const addUtcDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

export const getDateKeysInRange = (rangeStart, rangeEnd) => {
  const startKey = getDateKey(rangeStart);
  const endKey = getDateKey(rangeEnd);
  if (!startKey || !endKey) return [];

  const keys = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    keys.push(cursor);
    cursor = addUtcDays(cursor, 1);
  }
  return keys;
};

export const getContiguousDateRanges = (dateKeys) => {
  const sortedKeys = [...new Set(dateKeys.map(getDateKey).filter(Boolean))].sort();
  if (!sortedKeys.length) return [];

  const ranges = [];
  let rangeStart = sortedKeys[0];
  let previous = sortedKeys[0];

  sortedKeys.slice(1).forEach((dateKey) => {
    if (dateKey === addUtcDays(previous, 1)) {
      previous = dateKey;
      return;
    }

    ranges.push({ rangeStart, rangeEnd: previous });
    rangeStart = dateKey;
    previous = dateKey;
  });

  ranges.push({ rangeStart, rangeEnd: previous });
  return ranges;
};

export const normalizeWorkoutWeights = (workouts = []) => {
  workouts.forEach((workout) =>
    workout.training?.forEach((set) => {
      set.forEach((exercise) => {
        if (!exercise.achieved.weight) {
          exercise.achieved.weight = [0];
        }
      });
    })
  );
};
