import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  BOOKING_INTERVAL_MINUTES,
  DEFAULT_BOOKING_MINUTES,
  dayCodes,
} from "../constants";

dayjs.extend(utc);

export const buildWeeklyRule = (date) => {
  const dayCode = dayCodes[dayjs(date).day()];
  return `FREQ=WEEKLY;BYDAY=${dayCode};INTERVAL=1`;
};

export const buildScopeKey = (trainerId, clientId) => `${trainerId || "me"}:${clientId || "all"}`;

export const formatRange = (event) =>
  `${dayjs(event.startDateTime).format("h:mm A")} - ${dayjs(event.endDateTime).format("h:mm A")}`;

export const alignUpToInterval = (value, intervalMinutes = BOOKING_INTERVAL_MINUTES) => {
  const time = dayjs(value);
  if (!time.isValid()) return time;
  let aligned = time.second(0).millisecond(0);
  if (time.second() > 0 || time.millisecond() > 0) {
    aligned = aligned.add(1, "minute");
  }
  const remainder = aligned.minute() % intervalMinutes;
  return remainder === 0 ? aligned : aligned.add(intervalMinutes - remainder, "minute");
};

export const alignDownToInterval = (value, intervalMinutes = BOOKING_INTERVAL_MINUTES) => {
  const time = dayjs(value);
  if (!time.isValid()) return time;
  let aligned = time.second(0).millisecond(0);
  const remainder = aligned.minute() % intervalMinutes;
  if (remainder !== 0) {
    aligned = aligned.subtract(remainder, "minute");
  }
  return aligned;
};

export const formatBookingOptionLabel = (time, rangeStart) =>
  time.isSame(rangeStart, "day") ? time.format("h:mm A") : time.format("MMM D h:mm A");

export const buildBookingStartOptions = (event) => {
  if (!event || event.eventType !== "AVAILABILITY") return [];
  const rangeStart = dayjs(event.startDateTime);
  const rangeEnd = alignDownToInterval(event.endDateTime);
  if (!rangeStart.isValid() || !rangeEnd.isValid()) return [];

  const options = [];
  let cursor = alignUpToInterval(rangeStart);
  while (cursor.add(BOOKING_INTERVAL_MINUTES, "minute").valueOf() <= rangeEnd.valueOf()) {
    options.push({
      value: cursor.toISOString(),
      time: cursor,
      label: formatBookingOptionLabel(cursor, rangeStart),
    });
    cursor = cursor.add(BOOKING_INTERVAL_MINUTES, "minute");
  }
  return options;
};

export const buildBookingEndOptions = (event, startValue) => {
  if (!event || event.eventType !== "AVAILABILITY" || !startValue) return [];
  const rangeStart = dayjs(event.startDateTime);
  const rangeEnd = alignDownToInterval(event.endDateTime);
  const selectedStart = dayjs(startValue);
  if (!rangeStart.isValid() || !rangeEnd.isValid() || !selectedStart.isValid()) return [];
  if (
    selectedStart.valueOf() < alignUpToInterval(rangeStart).valueOf() ||
    selectedStart.add(BOOKING_INTERVAL_MINUTES, "minute").valueOf() > rangeEnd.valueOf()
  ) {
    return [];
  }

  const options = [];
  let cursor = selectedStart.add(BOOKING_INTERVAL_MINUTES, "minute");
  while (cursor.valueOf() <= rangeEnd.valueOf()) {
    options.push({
      value: cursor.toISOString(),
      time: cursor,
      label: formatBookingOptionLabel(cursor, rangeStart),
    });
    cursor = cursor.add(BOOKING_INTERVAL_MINUTES, "minute");
  }
  return options;
};

export const pickDefaultBookingEnd = (startValue, endOptions) => {
  if (!startValue || endOptions.length === 0) return "";
  const selectedStart = dayjs(startValue);
  const preferred = endOptions.find(
    (option) => option.time.diff(selectedStart, "minute") >= DEFAULT_BOOKING_MINUTES
  );
  return (preferred || endOptions[endOptions.length - 1]).value;
};
