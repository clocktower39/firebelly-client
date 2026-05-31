import { useEffect, useState } from "react";

export default function usePersistentSchedulePreference(storageKey, fallbackValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return fallbackValue;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) return fallbackValue;

    try {
      return JSON.parse(stored);
    } catch (err) {
      return stored;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  return [value, setValue];
}

