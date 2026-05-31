import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import dayjs from "dayjs";
import { HEADER_HEIGHT, SLOT_HEIGHT, SLOT_MINUTES } from "../constants";

export default function WeekCalendar({
  weekCaptureRef,
  weekScrollRef,
  totalsScrollRef,
  isShareMode,
  shareIncludeHeader,
  user,
  weekRangeLabel,
  isTrainerView,
  isClientView,
  shareLinkStatus,
  calendarScale,
  setCalendarScale,
  calendarMenuAnchor,
  setCalendarMenuAnchor,
  handleCalendarMenuClose,
  openCopyDay,
  openCopyWeek,
  selectedDate,
  setSelectedDate,
  setShareStatus,
  setShareWeekStartDate,
  setOpenShareDialog,
  setShareLinkStatus,
  handleCopyShareLink,
  setOpenTimeSettings,
  calendarContentHeight,
  timeColumnWidth,
  totalSlots,
  calendarStartHour,
  weekDays,
  normalizedSelection,
  handleSlotMouseDown,
  handleSlotMouseEnter,
  touchSelectionEnabled,
  handleSlotTouchStart,
  handleSlotTouchMove,
  handleSlotTouchEnd,
  weekEvents,
  getEventStyle,
  openActionForEvent,
  openRequestForEvent,
  shareHideDetails,
  shareHighlightShown,
  shareShownKeys,
  highlightFill,
  clientProfileLookup,
  clientLookup,
  serverURL,
  shareHidePrices,
  getEventDisplayName,
  getRowPayoutLabel,
  dayTotalsByColumn,
  formatTotals,
  dayCancelledByColumn,
  dayCountsByColumn,
  weekTotals,
  weekCancelledTotals,
  weekEventCount,
}) {
  return (
    <Grid container size={12}>
      <Box
        ref={weekCaptureRef}
        sx={{ width: "100%", fontFamily: isShareMode ? "Arial, sans-serif" : "inherit" }}
      >
        {isShareMode && shareIncludeHeader && (
          <Box sx={{ px: 2, pt: 2, pb: 1, backgroundColor: "grey.900", color: "common.white" }}>
            <Typography variant="h6" sx={{ color: "common.white" }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.300" }}>
              Week of {weekRangeLabel}
            </Typography>
          </Box>
        )}
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ alignItems: "baseline" }}
              >
                <Typography variant="h6">Week View</Typography>
                {isTrainerView && !isShareMode && (
                  <Typography variant="body2" color="text.secondary">
                    Drag to create open availability blocks. Slots start on the hour or half-hour.
                  </Typography>
                )}
              </Stack>
              {isTrainerView && !isShareMode && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />
                </Stack>
              )}
              {isTrainerView && !isShareMode && shareLinkStatus && (
                <Typography variant="caption" color="text.secondary">
                  {shareLinkStatus}
                </Typography>
              )}
              {!isShareMode && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Zoom
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={calendarScale}
                    onChange={(_, value) => {
                      if (!value) return;
                      setCalendarScale(value);
                    }}
                  >
                    <ToggleButton value={0.85}>Compact</ToggleButton>
                    <ToggleButton value={1}>Normal</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              )}
              <Menu
                anchorEl={calendarMenuAnchor}
                open={Boolean(calendarMenuAnchor)}
                onClose={handleCalendarMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    handleCalendarMenuClose();
                    openCopyDay();
                  }}
                >
                  Copy day
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCalendarMenuClose();
                    openCopyWeek();
                  }}
                >
                  Copy week
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCalendarMenuClose();
                    setShareStatus("");
                    setShareWeekStartDate(selectedDate.startOf("week").format("YYYY-MM-DD"));
                    setOpenShareDialog(true);
                  }}
                >
                  Copy week image
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCalendarMenuClose();
                    setShareLinkStatus("");
                    handleCopyShareLink();
                  }}
                >
                  Copy share link
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCalendarMenuClose();
                    setOpenTimeSettings(true);
                  }}
                >
                  Calendar hours
                </MenuItem>
              </Menu>
              <Box
                ref={weekScrollRef}
                sx={{
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  borderRadius: 2,
                  overflowX: { xs: "auto", md: "hidden" },
                  overflowY: calendarScale < 1 ? "hidden" : "auto",
                  height:
                    calendarScale < 1
                      ? `${calendarContentHeight * calendarScale}px`
                      : "auto",
                  minHeight:
                    calendarScale < 1
                      ? `${calendarContentHeight * calendarScale}px`
                      : undefined,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    transform: `scale(${calendarScale})`,
                    transformOrigin: "top left",
                    width: `calc(100% / ${calendarScale})`,
                    WebkitTextSizeAdjust: "100%",
                    textSizeAdjust: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: timeColumnWidth,
                      minWidth: timeColumnWidth,
                      maxWidth: timeColumnWidth,
                      borderRight: "1px solid rgba(148, 163, 184, 0.35)",
                    }}
                  >
                    <Box
                      sx={{
                        height: HEADER_HEIGHT,
                        borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        aria-label="Calendar settings"
                        onClick={(event) => setCalendarMenuAnchor(event.currentTarget)}
                        size="small"
                      >
                        <Settings fontSize="small" />
                      </IconButton>
                    </Box>
                    {Array.from({ length: totalSlots }).map((_, index) => {
                      const minutes = calendarStartHour * 60 + index * SLOT_MINUTES;
                      const label =
                        minutes % 60 === 0
                          ? dayjs().hour(Math.floor(minutes / 60)).minute(0).format("h A")
                          : "";
                      return (
                        <Box
                          key={`label-${index}`}
                          sx={{
                            height: SLOT_HEIGHT,
                            borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            pt: 0.5,
                          }}
                        >
                          {label}
                        </Box>
                      );
                    })}
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: isShareMode
                        ? "repeat(7, minmax(0, 1fr))"
                        : "repeat(7, minmax(96px, 1fr))",
                      minWidth: isShareMode ? "auto" : "672px",
                      flex: 1,
                    }}
                  >
                    {weekDays.map((day, dayIndex) => (
                      <Box
                        key={day.format("YYYY-MM-DD")}
                        sx={{ borderLeft: "1px solid rgba(148, 163, 184, 0.2)" }}
                      >
                        <Box
                          sx={{
                            position: "sticky",
                            top: 0,
                            height: HEADER_HEIGHT,
                            backgroundColor: "background.paper",
                            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            zIndex: 1,
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedDate(day)}
                        >
                          <Typography variant="subtitle2">{day.format("ddd")}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {day.format("MMM D")}
                          </Typography>
                        </Box>
                        <Box sx={{ position: "relative" }}>
                          {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                            <Box
                              key={`slot-${dayIndex}-${slotIndex}`}
                              onMouseDown={(event) =>
                                handleSlotMouseDown(event, dayIndex, slotIndex)
                              }
                              onMouseEnter={() => handleSlotMouseEnter(dayIndex, slotIndex)}
                              onTouchStart={
                                touchSelectionEnabled
                                  ? (event) => handleSlotTouchStart(event, dayIndex, slotIndex)
                                  : undefined
                              }
                              onTouchMove={touchSelectionEnabled ? handleSlotTouchMove : undefined}
                              onTouchEnd={touchSelectionEnabled ? handleSlotTouchEnd : undefined}
                              data-day-index={dayIndex}
                              data-slot-index={slotIndex}
                              sx={{
                                height: SLOT_HEIGHT,
                                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                                backgroundColor:
                                  slotIndex % 2 === 0
                                    ? "rgba(148,163,184,0.06)"
                                    : "transparent",
                                touchAction: "pan-x pan-y",
                              }}
                            />
                          ))}
                          {normalizedSelection && normalizedSelection.dayIndex === dayIndex && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: normalizedSelection.startIndex * SLOT_HEIGHT,
                                height:
                                  (normalizedSelection.endIndex -
                                    normalizedSelection.startIndex +
                                    1) *
                                  SLOT_HEIGHT,
                                left: 4,
                                right: 4,
                                backgroundColor: "rgba(25, 118, 210, 0.2)",
                                border: "1px solid rgba(25, 118, 210, 0.6)",
                                borderRadius: 1,
                                pointerEvents: "none",
                              }}
                            />
                          )}
                          {weekEvents
                            .filter((event) => dayjs(event.startDateTime).isSame(day, "day"))
                            .map((event) => {
                              const style = getEventStyle(event, day);
                              if (!style) return null;
                              return (
                                <Box
                                  key={event._id}
                                  sx={{
                                    position: "absolute",
                                    left: 6,
                                    right: 6,
                                    top: style.top,
                                    height: style.height,
                                    backgroundColor: (() => {
                                      if (
                                        isShareMode &&
                                        shareHideDetails &&
                                        shareHighlightShown &&
                                        ((event.clientId &&
                                          shareShownKeys.includes(`client:${event.clientId}`)) ||
                                          (event.customClientName &&
                                            shareShownKeys.includes(
                                              `custom:${event.customClientName}`
                                            )))
                                      ) {
                                        return highlightFill;
                                      }
                                      if (event.status === "CANCELLED") {
                                        return "rgba(244, 67, 54, 0.12)";
                                      }
                                      return event.eventType === "AVAILABILITY"
                                        ? "rgba(76, 175, 80, 0.25)"
                                        : "rgba(33, 150, 243, 0.25)";
                                    })(),
                                    border:
                                      event.status === "CANCELLED"
                                        ? "1px dashed rgba(244, 67, 54, 0.6)"
                                        : "1px solid rgba(25, 118, 210, 0.4)",
                                    borderRadius: 1,
                                    px: 0.5,
                                    py: 0.25,
                                    overflow: "hidden",
                                    opacity: event.status === "CANCELLED" ? 0.75 : 1,
                                    cursor:
                                      isTrainerView ||
                                      (isClientView && event.eventType === "AVAILABILITY")
                                        ? "pointer"
                                        : "default",
                                  }}
                                  onClick={() => {
                                    if (isTrainerView) {
                                      openActionForEvent(event);
                                      return;
                                    }
                                    if (
                                      isClientView &&
                                      event.eventType === "AVAILABILITY" &&
                                      event.status === "OPEN"
                                    ) {
                                      openRequestForEvent(event);
                                    }
                                  }}
                                >
                                  {event.eventType === "AVAILABILITY" ? (
                                    <Typography variant="caption">Open</Typography>
                                  ) : (
                                    <Stack spacing={0.25}>
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        sx={{ alignItems: "center" }}
                                      >
                                        {!(
                                          isShareMode &&
                                          shareHideDetails &&
                                          ((event.clientId &&
                                            !shareShownKeys.includes(
                                              `client:${event.clientId}`
                                            )) ||
                                            (event.customClientName &&
                                              !shareShownKeys.includes(
                                                `custom:${event.customClientName}`
                                              )) ||
                                            (!event.clientId && !event.customClientName))
                                        ) &&
                                          event.clientId && (
                                            <Avatar
                                              src={
                                                isTrainerView
                                                  ? clientProfileLookup.get(event.clientId)
                                                      ?.profilePicture
                                                    ? `${serverURL}/user/profilePicture/${
                                                        clientProfileLookup.get(event.clientId)
                                                          ?.profilePicture
                                                      }`
                                                    : undefined
                                                  : String(event.clientId) === String(user._id) &&
                                                    user.profilePicture
                                                  ? `${serverURL}/user/profilePicture/${user.profilePicture}`
                                                  : undefined
                                              }
                                              sx={{ width: 20, height: 20, fontSize: "0.65rem" }}
                                            >
                                              {isTrainerView
                                                ? (clientLookup.get(event.clientId) || "B")[0]
                                                : String(event.clientId) === String(user._id)
                                                ? user.firstName?.[0] || "M"
                                                : "B"}
                                            </Avatar>
                                          )}
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight:
                                              isShareMode &&
                                              shareHideDetails &&
                                              shareHighlightShown &&
                                              ((event.clientId &&
                                                shareShownKeys.includes(
                                                  `client:${event.clientId}`
                                                )) ||
                                                (event.customClientName &&
                                                  shareShownKeys.includes(
                                                    `custom:${event.customClientName}`
                                                  )))
                                                ? 700
                                                : 400,
                                            textDecoration:
                                              event.status === "CANCELLED"
                                                ? "line-through"
                                                : "none",
                                          }}
                                        >
                                          {getEventDisplayName(event)}
                                        </Typography>
                                      </Stack>
                                      {event.status === "CANCELLED" && (
                                        <Typography variant="caption" color="error">
                                          Cancelled
                                        </Typography>
                                      )}
                                      {isTrainerView && !(isShareMode && shareHidePrices) && (
                                        <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                          {getRowPayoutLabel(event)}
                                        </Typography>
                                      )}
                                    </Stack>
                                  )}
                                </Box>
                              );
                            })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
              {isTrainerView && !(isShareMode && shareHidePrices) && (
                <Box
                  ref={totalsScrollRef}
                  sx={{
                    overflowX: { xs: "auto", md: "hidden" },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `${timeColumnWidth}px repeat(7, minmax(${
                        isShareMode ? 0 : 96
                      }px, 1fr))`,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      borderTop: "1px solid rgba(148, 163, 184, 0.35)",
                      borderRadius: "8px",
                      minWidth: isShareMode ? "auto" : "736px",
                    }}
                  >
                    <Box
                      sx={{
                        borderRight: "1px solid rgba(148, 163, 184, 0.35)",
                        py: 1,
                        px: 0,
                        fontSize: "0.7rem",
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        minWidth: timeColumnWidth,
                        maxWidth: timeColumnWidth,
                      }}
                    >
                      {" "}
                    </Box>
                    {dayTotalsByColumn.map((totals, index) => (
                      <Box
                        key={`total-${index}`}
                        sx={{
                          borderLeft: "1px solid rgba(148, 163, 184, 0.2)",
                          py: 1,
                          px: 1,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                        }}
                      >
                        <Stack spacing={0.25} sx={{ alignItems: "flex-start" }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatTotals(totals)}
                          </Typography>
                        {Object.keys(dayCancelledByColumn[index] || {}).length > 0 && (
                          <Typography variant="caption" color="error" display="block">
                            Lost: {formatTotals(dayCancelledByColumn[index])}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {dayCountsByColumn[index]} sessions
                        </Typography>
                        </Stack>
                      </Box>
                    ))}
                    <Box
                      sx={{
                        gridColumn: "2 / span 7",
                        borderLeft: "1px solid rgba(148, 163, 184, 0.2)",
                        py: 1,
                        px: 1,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      <Stack spacing={0.25} sx={{ alignItems: "flex-start" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatTotals(weekTotals)}
                        </Typography>
                      {Object.keys(weekCancelledTotals || {}).length > 0 && (
                        <Typography variant="caption" color="error" display="block">
                          Lost: {formatTotals(weekCancelledTotals)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {weekEventCount} sessions
                      </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );
}
