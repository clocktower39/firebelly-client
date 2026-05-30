import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export const buildWeeklyRule = (date) => {
  const dayCode = dayCodes[dayjs(date).day()];
  return `FREQ=WEEKLY;BYDAY=${dayCode};INTERVAL=1`;
};

export const buildScopeKey = (trainerId, clientId) => `${trainerId || "me"}:${clientId || "all"}`;

export const formatRange = (event) =>
  `${dayjs(event.startDateTime).format("h:mm A")} - ${dayjs(event.endDateTime).format("h:mm A")}`;

export const scheduleColors = {
  APPOINTMENT: "primary",
  INDEPENDENT: "secondary",
  AVAILABILITY: "info",
};

export const statusColors = {
  OPEN: "success",
  REQUESTED: "warning",
  BOOKED: "primary",
  COMPLETED: "default",
  CANCELLED: "error",
};

export const tableColumnLabels = {
  date: "Date",
  time: "Time",
  type: "Type",
  status: "Status",
  client: "Client",
  price: "Price",
};

export const WEEK_START_HOUR = 6;
export const WEEK_END_HOUR = 20;
export const SLOT_MINUTES = 30;
export const SLOT_HEIGHT = 28;
export const HEADER_HEIGHT = 56;
export const BOOKING_INTERVAL_MINUTES = 15;
export const DEFAULT_BOOKING_MINUTES = 60;

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

export const EMPTY_EVENTS = [];
export const EMPTY_SCHEDULE_DATA = { events: EMPTY_EVENTS };
export const EMPTY_WORKOUTS_BY_ACCOUNT = {};
export const EMPTY_WORKOUT_QUEUE_BY_ACCOUNT = {};
export const EMPTY_WORKOUTS = [];
