import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { SLOT_MINUTES } from "../constants";

export default function useScheduleSelection({
  isTrainerView,
  weekDays,
  calendarStartHour,
  openSelectionDialog,
  setSelectedDate,
  setOpenSelectionDialog,
  onClearSelection,
}) {
  const [dragSelection, setDragSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStartTime, setSelectionStartTime] = useState("");
  const [selectionEndTime, setSelectionEndTime] = useState("");
  const [touchSelectionEnabled, setTouchSelectionEnabled] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchSelectionRef = useRef({ active: false, dayIndex: 0, slotIndex: 0 });
  const touchTimerRef = useRef(null);

  const handleSlotMouseDown = (event, dayIndex, slotIndex) => {
    if (!isTrainerView) return;
    if (event.button !== 0) return;
    setOpenSelectionDialog(false);
    setIsDragging(true);
    setDragSelection({ dayIndex, startIndex: slotIndex, endIndex: slotIndex });
    setSelectedDate(weekDays[dayIndex]);
  };

  const handleSlotMouseEnter = (dayIndex, slotIndex) => {
    if (!isDragging || !dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) return;
    setDragSelection((prev) => ({ ...prev, endIndex: slotIndex }));
  };

  const updateSelectionFromPoint = (clientX, clientY) => {
    let target = document.elementFromPoint(clientX, clientY);
    while (target && !target.dataset?.dayIndex) {
      target = target.parentElement;
    }
    const dayIndex = Number(target?.dataset?.dayIndex);
    const slotIndex = Number(target?.dataset?.slotIndex);
    if (Number.isNaN(dayIndex) || Number.isNaN(slotIndex)) return;
    if (!dragSelection) return;
    if (dayIndex !== dragSelection.dayIndex) return;
    setDragSelection((prev) => ({ ...prev, endIndex: slotIndex }));
  };

  const handleSlotTouchStart = (event, dayIndex, slotIndex) => {
    if (!isTrainerView) return;
    const touch = event.touches?.[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    touchSelectionRef.current = { active: false, dayIndex, slotIndex };
    setOpenSelectionDialog(false);
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    touchTimerRef.current = setTimeout(() => {
      touchSelectionRef.current = { active: true, dayIndex, slotIndex };
      setIsDragging(true);
      setDragSelection({ dayIndex, startIndex: slotIndex, endIndex: slotIndex });
      setSelectedDate(weekDays[dayIndex]);
    }, 220);
  };

  const handleSlotTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    if (!touchSelectionRef.current.active) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
      return;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY)) return;
    event.preventDefault();
    updateSelectionFromPoint(touch.clientX, touch.clientY);
  };

  const normalizedSelection = useMemo(() => {
    if (!dragSelection) return null;
    const startIndex = Math.min(dragSelection.startIndex, dragSelection.endIndex);
    const endIndex = Math.max(dragSelection.startIndex, dragSelection.endIndex);
    return { ...dragSelection, startIndex, endIndex };
  }, [dragSelection]);

  const selectionRange = useMemo(() => {
    if (!normalizedSelection) return null;
    const day = weekDays[normalizedSelection.dayIndex];
    const startMinutes = calendarStartHour * 60 + normalizedSelection.startIndex * SLOT_MINUTES;
    const endMinutes = calendarStartHour * 60 + (normalizedSelection.endIndex + 1) * SLOT_MINUTES;
    const start = day.startOf("day").add(startMinutes, "minute");
    const end = day.startOf("day").add(endMinutes, "minute");
    return { start, end };
  }, [calendarStartHour, normalizedSelection, weekDays]);

  const handleSlotTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    if (!touchSelectionRef.current.active) return;
    setIsDragging(false);
    if (!isTrainerView) return;
    if (!selectionRange) return;
    if (selectionRange.end.valueOf() <= selectionRange.start.valueOf()) return;
    setOpenSelectionDialog(true);
    touchSelectionRef.current = { active: false, dayIndex: 0, slotIndex: 0 };
  };

  useEffect(() => {
    if (!openSelectionDialog || !selectionRange) return;
    setSelectionStartTime(selectionRange.start.format("HH:mm"));
    setSelectionEndTime(selectionRange.end.format("HH:mm"));
  }, [openSelectionDialog, selectionRange]);

  const selectionRangeAdjusted = useMemo(() => {
    if (!selectionRange) return null;
    if (!selectionStartTime || !selectionEndTime) return selectionRange;
    const day = selectionRange.start.startOf("day");
    const start = dayjs(`${day.format("YYYY-MM-DD")}T${selectionStartTime}`);
    const end = dayjs(`${day.format("YYYY-MM-DD")}T${selectionEndTime}`);
    return { start, end };
  }, [selectionRange, selectionEndTime, selectionStartTime]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (!isTrainerView) return;
      if (!selectionRange) return;
      if (selectionRange.end.valueOf() <= selectionRange.start.valueOf()) return;
      setOpenSelectionDialog(true);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDragging, isTrainerView, selectionRange, setOpenSelectionDialog]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setTouchSelectionEnabled(true);
    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const handleClearSelection = () => {
    setDragSelection(null);
    setOpenSelectionDialog(false);
    setSelectionStartTime("");
    setSelectionEndTime("");
    onClearSelection?.();
  };

  return {
    setDragSelection,
    normalizedSelection,
    selectionRange,
    selectionRangeAdjusted,
    selectionStartTime,
    setSelectionStartTime,
    selectionEndTime,
    setSelectionEndTime,
    touchSelectionEnabled,
    handleSlotMouseDown,
    handleSlotMouseEnter,
    handleSlotTouchStart,
    handleSlotTouchMove,
    handleSlotTouchEnd,
    handleClearSelection,
  };
}
