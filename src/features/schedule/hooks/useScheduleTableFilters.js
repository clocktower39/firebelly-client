import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

export default function useScheduleTableFilters({
  weekEventRows,
  calendarStartHour,
  calendarEndHour,
  isTrainerView,
  isShareMode,
  shareHidePrices,
  getRowClientLabel,
  getRowPriceLabel,
  getRowTimeLabel,
  getEventDisplayName,
}) {
  const [tableSortKey, setTableSortKey] = useState("date");
  const [tableSortDirection, setTableSortDirection] = useState("asc");
  const [tableFilterTypes, setTableFilterTypes] = useState([]);
  const [tableFilterStatuses, setTableFilterStatuses] = useState([]);
  const [tableFilterClients, setTableFilterClients] = useState([]);
  const [tableFilterPrices, setTableFilterPrices] = useState([]);
  const [tableFilterTimes, setTableFilterTimes] = useState([]);
  const [tableFilterClientQuery, setTableFilterClientQuery] = useState("");
  const [tableFilterDates, setTableFilterDates] = useState([]);
  const [tableFilterAnchor, setTableFilterAnchor] = useState(null);
  const [tableFilterKey, setTableFilterKey] = useState("");
  const [tableFilterLabel, setTableFilterLabel] = useState("");
  const [hiddenTableColumns, setHiddenTableColumns] = useState(["type"]);

  const weekTypeOptions = useMemo(
    () => Array.from(new Set(weekEventRows.map((event) => event.eventType))).sort(),
    [weekEventRows]
  );
  const weekStatusOptions = useMemo(
    () => Array.from(new Set(weekEventRows.map((event) => event.status))).sort(),
    [weekEventRows]
  );
  const weekTableClientOptions = useMemo(() => {
    const options = new Set();
    weekEventRows.forEach((event) => options.add(getRowClientLabel(event)));
    return Array.from(options).sort();
  }, [getRowClientLabel, weekEventRows]);
  const weekPriceOptions = useMemo(() => {
    const options = new Set();
    weekEventRows.forEach((event) => options.add(getRowPriceLabel(event)));
    return Array.from(options).sort();
  }, [getRowPriceLabel, weekEventRows]);
  const weekTimeOptions = useMemo(() => {
    const start = dayjs().hour(calendarStartHour).minute(0).second(0).millisecond(0);
    const end = dayjs().hour(calendarEndHour).minute(0).second(0).millisecond(0);
    const times = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end)) {
      times.push(current.format("h:mm A"));
      current = current.add(1, "hour");
    }
    return times;
  }, [calendarEndHour, calendarStartHour]);

  const filteredWeekRows = useMemo(() => {
    return weekEventRows.filter((event) => {
      if (tableFilterTypes.length > 0 && !tableFilterTypes.includes(event.eventType)) {
        return false;
      }
      if (tableFilterStatuses.length > 0 && !tableFilterStatuses.includes(event.status)) {
        return false;
      }
      if (tableFilterDates.length > 0) {
        const eventDate = dayjs(event.startDateTime).format("YYYY-MM-DD");
        if (!tableFilterDates.includes(eventDate)) return false;
      }
      if (tableFilterTimes.length > 0) {
        const timeLabel = getRowTimeLabel(event);
        if (!tableFilterTimes.includes(timeLabel)) return false;
      }
      if (tableFilterPrices.length > 0) {
        const priceLabel = getRowPriceLabel(event);
        if (!tableFilterPrices.includes(priceLabel)) return false;
      }
      if (tableFilterClients.length > 0) {
        const display = getRowClientLabel(event);
        if (!tableFilterClients.includes(display)) return false;
      }
      return true;
    });
  }, [
    getRowClientLabel,
    getRowPriceLabel,
    getRowTimeLabel,
    tableFilterClients,
    tableFilterDates,
    tableFilterPrices,
    tableFilterStatuses,
    tableFilterTimes,
    tableFilterTypes,
    weekEventRows,
  ]);

  const sortedWeekRows = useMemo(() => {
    const sorted = [...filteredWeekRows];
    const direction = tableSortDirection === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      switch (tableSortKey) {
        case "time":
        case "date": {
          const aTime = dayjs(a.startDateTime).valueOf();
          const bTime = dayjs(b.startDateTime).valueOf();
          return (aTime - bTime) * direction;
        }
        case "type":
          return a.eventType.localeCompare(b.eventType) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        case "client": {
          const aName = getEventDisplayName(a).toLowerCase();
          const bName = getEventDisplayName(b).toLowerCase();
          return aName.localeCompare(bName) * direction;
        }
        case "price": {
          const aPrice = Number(a.payoutAmount ?? 0);
          const bPrice = Number(b.payoutAmount ?? 0);
          return (aPrice - bPrice) * direction;
        }
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredWeekRows, tableSortDirection, tableSortKey, getEventDisplayName]);

  const openTableFilter = (event, key, label) => {
    setTableFilterKey(key);
    setTableFilterLabel(label || "");
    setTableFilterAnchor(event.currentTarget);
  };

  const closeTableFilter = () => {
    setTableFilterAnchor(null);
    setTableFilterKey("");
    setTableFilterLabel("");
  };

  const toggleTableSort = (key) => {
    const next = tableSortKey === key && tableSortDirection === "asc" ? "desc" : "asc";
    setTableSortKey(key);
    setTableSortDirection(next);
  };

  const applyTableSort = (key, direction) => {
    if (!key) return;
    setTableSortKey(key);
    setTableSortDirection(direction);
  };

  const isColumnHidden = useCallback(
    (key) => hiddenTableColumns.includes(key),
    [hiddenTableColumns]
  );

  const toggleColumnVisibility = (key) => {
    setHiddenTableColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const showAllColumns = () => {
    setHiddenTableColumns([]);
  };

  const isTableFilterActive = useMemo(
    () =>
      tableFilterTypes.length > 0 ||
      tableFilterStatuses.length > 0 ||
      tableFilterPrices.length > 0 ||
      tableFilterDates.length > 0 ||
      tableFilterTimes.length > 0 ||
      tableFilterClients.length > 0,
    [
      tableFilterClients,
      tableFilterDates,
      tableFilterPrices,
      tableFilterStatuses,
      tableFilterTimes,
      tableFilterTypes,
    ]
  );

  const tableColumnCount = useMemo(() => {
    let count = 0;
    if (!isColumnHidden("date")) count += 1;
    if (!isColumnHidden("time")) count += 1;
    if (!isColumnHidden("type")) count += 1;
    if (!isColumnHidden("status")) count += 1;
    if (!isColumnHidden("client")) count += 1;
    if (isTrainerView && !(isShareMode && shareHidePrices) && !isColumnHidden("price")) {
      count += 1;
    }
    return count + 1;
  }, [isColumnHidden, isTrainerView, isShareMode, shareHidePrices]);

  return {
    tableSortKey,
    tableSortDirection,
    tableFilterTypes,
    setTableFilterTypes,
    tableFilterStatuses,
    setTableFilterStatuses,
    tableFilterClients,
    setTableFilterClients,
    tableFilterPrices,
    setTableFilterPrices,
    tableFilterTimes,
    setTableFilterTimes,
    tableFilterClientQuery,
    setTableFilterClientQuery,
    tableFilterDates,
    setTableFilterDates,
    tableFilterAnchor,
    tableFilterKey,
    tableFilterLabel,
    hiddenTableColumns,
    weekTypeOptions,
    weekStatusOptions,
    weekTableClientOptions,
    weekPriceOptions,
    weekTimeOptions,
    sortedWeekRows,
    openTableFilter,
    closeTableFilter,
    toggleTableSort,
    applyTableSort,
    isColumnHidden,
    toggleColumnVisibility,
    showAllColumns,
    isTableFilterActive,
    tableColumnCount,
  };
}
