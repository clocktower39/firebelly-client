import { useMemo } from "react";
import dayjs from "dayjs";
import { toPng } from "html-to-image";
import { createScheduleEvent, requestScheduleRange } from "../../../Redux/actions";

export default function useScheduleClipboardShare({
  dispatch,
  user,
  selectedTrainerId,
  selectedDate,
  weekStart,
  weekEvents,
  filteredWeekEvents,
  weekCaptureRef,
  refreshSchedule,
  isTrainerView,
  copySourceEvent,
  setCopySourceEvent,
  copyDate,
  setCopyDate,
  copyStartTime,
  setCopyStartTime,
  copyEndTime,
  setCopyEndTime,
  setOpenCopyDialog,
  copyDayDate,
  setCopyDayDate,
  copyDaySourceDate,
  setCopyDaySourceDate,
  setOpenCopyDayDialog,
  copyWeekDate,
  setCopyWeekDate,
  setOpenCopyWeekDialog,
  shareWeekStartDate,
  setShareWeekStartDate,
  setShareEvents,
  setShareInProgress,
  setShareStatus,
  setIsShareMode,
  setShareLinkStatus,
}) {
  return useMemo(() => {
    const buildCopyPayload = (event, startDateTime, endDateTime) => {
      const isAvailability = event.eventType === "AVAILABILITY";
      return {
        startDateTime,
        endDateTime,
        eventType: event.eventType,
        status: isAvailability ? "OPEN" : "BOOKED",
        clientId: event.clientId || null,
        customClientName: event.customClientName || "",
        customClientEmail: event.customClientEmail || "",
        customClientPhone: event.customClientPhone || "",
        workoutId: null,
        sessionTypeId: event.sessionTypeId || null,
        priceAmount: event.priceAmount ?? null,
        priceCurrency: event.priceCurrency || "USD",
        payoutAmount: event.payoutAmount ?? null,
        payoutCurrency: event.payoutCurrency || event.priceCurrency || "USD",
        availabilitySource: isAvailability ? event.availabilitySource || "MANUAL" : undefined,
        recurrenceRule: null,
      };
    };

    const hasOverlap = (candidate, events) =>
      events.some((event) => {
        if (event.status === "CANCELLED") return false;
        const start = new Date(event.startDateTime);
        const end = new Date(event.endDateTime);
        return start < candidate.end && end > candidate.start;
      });

    const openCopyForEvent = (event) => {
      const start = dayjs(event.startDateTime).add(1, "week");
      const end = dayjs(event.endDateTime).add(1, "week");
      setCopySourceEvent(event);
      setCopyDate(start.format("YYYY-MM-DD"));
      setCopyStartTime(start.format("HH:mm"));
      setCopyEndTime(end.format("HH:mm"));
      setOpenCopyDialog(true);
    };

    const handleCopyEvent = async () => {
      if (!copySourceEvent) return;
      const startDateTime = dayjs(`${copyDate}T${copyStartTime}`).toISOString();
      const endDateTime = dayjs(`${copyDate}T${copyEndTime}`).toISOString();
      if (dayjs(endDateTime).valueOf() <= dayjs(startDateTime).valueOf()) return;

      await dispatch(
        createScheduleEvent(buildCopyPayload(copySourceEvent, startDateTime, endDateTime))
      );
      setOpenCopyDialog(false);
      setCopySourceEvent(null);
      refreshSchedule();
    };

    const openCopyDay = () => {
      setCopyDaySourceDate(selectedDate.format("YYYY-MM-DD"));
      setCopyDayDate(selectedDate.add(1, "week").format("YYYY-MM-DD"));
      setOpenCopyDayDialog(true);
    };

    const openCopyWeek = () => {
      setCopyWeekDate(weekStart.add(1, "week").format("YYYY-MM-DD"));
      setOpenCopyWeekDialog(true);
    };

    const handleCopyDay = async () => {
      if (!isTrainerView || !copyDayDate || !copyDaySourceDate) return;
      const sourceDayStart = dayjs(copyDaySourceDate).startOf("day");
      const targetDay = dayjs(copyDayDate).startOf("day");
      const offsetDays = targetDay.diff(sourceDayStart, "day");
      const targetStart = targetDay.toISOString();
      const targetEnd = targetDay.add(1, "day").toISOString();

      const rangeData = await dispatch(
        requestScheduleRange({
          startDate: targetStart,
          endDate: targetEnd,
          trainerId: user._id,
          clientId: null,
          includeAvailability: true,
        })
      );

      const existingEvents = rangeData?.events || [];
      const createdEvents = [];
      const sourceEvents = weekEvents
        .filter((event) => dayjs(event.startDateTime).isSame(sourceDayStart, "day"))
        .filter((event) => event.status !== "CANCELLED");

      for (const event of sourceEvents) {
        const start = dayjs(event.startDateTime).add(offsetDays, "day");
        const end = dayjs(event.endDateTime).add(offsetDays, "day");
        const candidate = { start: start.toDate(), end: end.toDate() };
        if (hasOverlap(candidate, existingEvents) || hasOverlap(candidate, createdEvents)) {
          continue;
        }
        await dispatch(
          createScheduleEvent(buildCopyPayload(event, start.toISOString(), end.toISOString()))
        );
        createdEvents.push({
          startDateTime: candidate.start,
          endDateTime: candidate.end,
          status: "BOOKED",
        });
      }

      setOpenCopyDayDialog(false);
      refreshSchedule();
    };

    const handleCopyWeek = async () => {
      if (!isTrainerView || !copyWeekDate) return;
      const sourceWeekStart = weekStart.startOf("day");
      const targetWeekStart = dayjs(copyWeekDate).startOf("day");
      const offsetDays = targetWeekStart.diff(sourceWeekStart, "day");
      const targetStart = targetWeekStart.toISOString();
      const targetEnd = targetWeekStart.add(7, "day").toISOString();

      const rangeData = await dispatch(
        requestScheduleRange({
          startDate: targetStart,
          endDate: targetEnd,
          trainerId: user._id,
          clientId: null,
          includeAvailability: true,
        })
      );

      const existingEvents = rangeData?.events || [];
      const createdEvents = [];
      const sourceEvents = filteredWeekEvents.filter((event) => event.status !== "CANCELLED");

      for (const event of sourceEvents) {
        const start = dayjs(event.startDateTime).add(offsetDays, "day");
        const end = dayjs(event.endDateTime).add(offsetDays, "day");
        const candidate = { start: start.toDate(), end: end.toDate() };
        if (hasOverlap(candidate, existingEvents) || hasOverlap(candidate, createdEvents)) {
          continue;
        }
        await dispatch(
          createScheduleEvent(buildCopyPayload(event, start.toISOString(), end.toISOString()))
        );
        createdEvents.push({
          startDateTime: candidate.start,
          endDateTime: candidate.end,
          status: "BOOKED",
        });
      }

      setOpenCopyWeekDialog(false);
      refreshSchedule();
    };

    const handleShareWeek = async () => {
      if (!weekCaptureRef.current) return;
      setShareInProgress(true);
      setShareStatus("");
      setIsShareMode(true);
      if (!shareWeekStartDate) {
        setShareWeekStartDate(selectedDate.startOf("week").format("YYYY-MM-DD"));
      }

      const shareStart = dayjs(
        shareWeekStartDate || selectedDate.startOf("week").format("YYYY-MM-DD")
      ).startOf("day");
      const shareEnd = shareStart.add(7, "day").startOf("day");
      try {
        const rangeData = await dispatch(
          requestScheduleRange({
            startDate: shareStart.toISOString(),
            endDate: shareEnd.toISOString(),
            trainerId: selectedTrainerId || user._id,
            clientId: null,
            includeAvailability: true,
          })
        );
        setShareEvents(rangeData?.events || []);
      } catch (err) {
        setShareEvents([]);
      }

      await new Promise((resolve) => setTimeout(resolve, 80));

      try {
        const dataUrl = await toPng(weekCaptureRef.current, {
          cacheBust: true,
          backgroundColor: "#ffffff",
          style: { fontFamily: "Arial, sans-serif" },
          skipFonts: true,
        });
        const blob = await (await fetch(dataUrl)).blob();

        const canClipboard = navigator.clipboard?.write && window.ClipboardItem;
        if (canClipboard) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
            setShareStatus("Copied week view image to clipboard.");
            return;
          } catch (error) {
            console.error("Clipboard copy failed:", error);
          }
        }

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `sessions-${weekStart.format("YYYY-MM-DD")}.png`;
        link.click();
        setShareStatus(
          canClipboard
            ? "Clipboard blocked. Downloaded image instead."
            : "Clipboard unavailable. Downloaded image instead."
        );
      } catch (error) {
        console.error("Share image failed:", error);
        setShareStatus("Unable to copy image. Please try again.");
      } finally {
        setShareInProgress(false);
        setIsShareMode(false);
      }
    };

    const handleCopyShareLink = async () => {
      const shareUrl = `${window.location.origin}/public/sessions/${user._id}`;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          setShareLinkStatus("Share link copied.");
        } else {
          setShareLinkStatus("Clipboard unavailable. Please copy manually.");
        }
      } catch (error) {
        setShareLinkStatus("Unable to copy link. Please copy manually.");
      }
    };

    return {
      openCopyForEvent,
      openCopyDay,
      openCopyWeek,
      handleCopyEvent,
      handleCopyDay,
      handleCopyWeek,
      handleShareWeek,
      handleCopyShareLink,
    };
  }, [
    copyDate,
    copyDayDate,
    copyDaySourceDate,
    copyEndTime,
    copySourceEvent,
    copyStartTime,
    copyWeekDate,
    dispatch,
    filteredWeekEvents,
    isTrainerView,
    refreshSchedule,
    selectedDate,
    selectedTrainerId,
    setCopyDate,
    setCopyDayDate,
    setCopyDaySourceDate,
    setCopyEndTime,
    setCopySourceEvent,
    setCopyStartTime,
    setCopyWeekDate,
    setIsShareMode,
    setOpenCopyDayDialog,
    setOpenCopyDialog,
    setOpenCopyWeekDialog,
    setShareEvents,
    setShareInProgress,
    setShareLinkStatus,
    setShareStatus,
    setShareWeekStartDate,
    shareWeekStartDate,
    user,
    weekCaptureRef,
    weekEvents,
    weekStart,
  ]);
}
