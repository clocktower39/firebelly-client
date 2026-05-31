import { useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { HEADER_HEIGHT, SLOT_HEIGHT } from "../constants";

export default function useScheduleRange({
  selectedDate,
  isShareMode,
  shareWeekStartDate,
  calendarStartHour,
  calendarEndHour,
  scheduleData,
  shareEvents,
  clientLookup,
  isTrainerView,
  activeClientIds,
  formatPrice,
}) {
  const weekStart = useMemo(() => {
    if (isShareMode && shareWeekStartDate) {
      return dayjs(shareWeekStartDate).startOf("day");
    }
    return selectedDate.startOf("week");
  }, [isShareMode, selectedDate, shareWeekStartDate]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );

  const weekRangeLabel = useMemo(() => {
    const start = weekStart;
    const end = weekStart.add(6, "day");
    return `${start.format("MMM D")} - ${end.format("MMM D")}`;
  }, [weekStart]);

  const weekRangeDisplay = useMemo(() => {
    const start = weekStart;
    const end = weekStart.add(6, "day");
    return `${start.format("MMM D, YYYY")} - ${end.format("MMM D, YYYY")}`;
  }, [weekStart]);

  const timeColumnWidth = useMemo(() => (isShareMode ? 48 : 64), [isShareMode]);
  const totalSlots = Math.max((calendarEndHour - calendarStartHour) * 2, 0);
  const calendarContentHeight = HEADER_HEIGHT + totalSlots * SLOT_HEIGHT;

  const weekEvents = useMemo(() => {
    const start = weekStart.startOf("day");
    const end = weekStart.add(7, "day").startOf("day");
    const sourceEvents = isShareMode ? shareEvents : scheduleData.events || [];
    return sourceEvents.filter((event) => {
      const eventStart = dayjs(event.startDateTime);
      const eventEnd = dayjs(event.endDateTime);
      return eventStart.isBefore(end) && eventEnd.isAfter(start);
    });
  }, [isShareMode, scheduleData.events, shareEvents, weekStart]);

  const weekClientOptions = useMemo(() => {
    const seen = new Map();
    weekEvents.forEach((event) => {
      if (event.eventType === "AVAILABILITY") return;
      if (event.clientId) {
        const key = `client:${event.clientId}`;
        if (!seen.has(key)) {
          seen.set(key, {
            key,
            label: clientLookup.get(event.clientId) || "Assigned client",
            type: "client",
          });
        }
        return;
      }
      if (event.customClientName) {
        const key = `custom:${event.customClientName}`;
        if (!seen.has(key)) {
          seen.set(key, {
            key,
            label: event.customClientName,
            type: "custom",
          });
        }
      }
    });
    return Array.from(seen.values());
  }, [clientLookup, weekEvents]);

  const filteredWeekEvents = useMemo(() => {
    if (!isTrainerView) return weekEvents;
    if (!activeClientIds.length) return weekEvents;
    return weekEvents.filter((event) => {
      if (event.eventType === "AVAILABILITY") return true;
      if (!event.clientId) return false;
      return activeClientIds.includes(event.clientId);
    });
  }, [activeClientIds, isTrainerView, weekEvents]);

  const isCountableSession = useCallback(
    (event) => event.eventType !== "AVAILABILITY" && event.status !== "CANCELLED",
    []
  );

  const resolveEventAmount = useCallback((event) => {
    if (event.payoutAmount != null && !Number.isNaN(Number(event.payoutAmount))) {
      return {
        amount: Number(event.payoutAmount),
        currency: event.payoutCurrency || event.priceCurrency || "USD",
      };
    }
    if (event.priceAmount == null || Number.isNaN(Number(event.priceAmount))) return null;
    return { amount: Number(event.priceAmount), currency: event.priceCurrency || "USD" };
  }, []);

  const totalizePrices = useCallback(
    (events) => {
      const centsByCurrency = (events || []).reduce((acc, event) => {
        if (!isCountableSession(event)) return acc;
        const resolved = resolveEventAmount(event);
        if (!resolved) return acc;
        acc[resolved.currency] =
          (acc[resolved.currency] || 0) + Math.round(resolved.amount * 100);
        return acc;
      }, {});

      return Object.fromEntries(
        Object.entries(centsByCurrency).map(([currency, cents]) => [currency, cents / 100])
      );
    },
    [isCountableSession, resolveEventAmount]
  );

  const totalizeCancelled = useCallback(
    (events) => {
      const centsByCurrency = (events || []).reduce((acc, event) => {
        if (event.eventType === "AVAILABILITY") return acc;
        if (event.status !== "CANCELLED") return acc;
        const resolved = resolveEventAmount(event);
        if (!resolved) return acc;
        acc[resolved.currency] =
          (acc[resolved.currency] || 0) + Math.round(resolved.amount * 100);
        return acc;
      }, {});

      return Object.fromEntries(
        Object.entries(centsByCurrency).map(([currency, cents]) => [currency, cents / 100])
      );
    },
    [resolveEventAmount]
  );

  const weekTotals = useMemo(
    () => totalizePrices(filteredWeekEvents),
    [filteredWeekEvents, totalizePrices]
  );
  const weekCancelledTotals = useMemo(
    () => totalizeCancelled(filteredWeekEvents),
    [filteredWeekEvents, totalizeCancelled]
  );
  const dayTotalsByColumn = useMemo(
    () =>
      weekDays.map((day) => {
        const dayEvents = weekEvents.filter((event) =>
          dayjs(event.startDateTime).isSame(day, "day")
        );
        return totalizePrices(dayEvents);
      }),
    [totalizePrices, weekDays, weekEvents]
  );
  const dayCancelledByColumn = useMemo(
    () =>
      weekDays.map((day) => {
        const dayEvents = weekEvents.filter((event) =>
          dayjs(event.startDateTime).isSame(day, "day")
        );
        return totalizeCancelled(dayEvents);
      }),
    [totalizeCancelled, weekDays, weekEvents]
  );
  const dayCountsByColumn = useMemo(
    () =>
      weekDays.map((day) =>
        weekEvents.filter(
          (event) => isCountableSession(event) && dayjs(event.startDateTime).isSame(day, "day")
        ).length
      ),
    [isCountableSession, weekDays, weekEvents]
  );
  const weekEventCount = useMemo(
    () => weekEvents.filter((event) => isCountableSession(event)).length,
    [isCountableSession, weekEvents]
  );
  const weekEventRows = useMemo(() => {
    return [...filteredWeekEvents].sort(
      (a, b) => dayjs(a.startDateTime).valueOf() - dayjs(b.startDateTime).valueOf()
    );
  }, [filteredWeekEvents]);

  const formatTotals = useCallback(
    (totals) => {
      const entries = Object.entries(totals || {});
      if (!entries.length) return "—";
      return entries.map(([currency, total]) => formatPrice(total, currency)).join(" • ");
    },
    [formatPrice]
  );

  return {
    weekStart,
    weekDays,
    weekRangeLabel,
    weekRangeDisplay,
    timeColumnWidth,
    totalSlots,
    calendarContentHeight,
    weekEvents,
    weekClientOptions,
    filteredWeekEvents,
    weekTotals,
    weekCancelledTotals,
    dayTotalsByColumn,
    dayCancelledByColumn,
    dayCountsByColumn,
    weekEventCount,
    weekEventRows,
    formatTotals,
  };
}
