import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, Box, Button, Card, CardContent, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { serverURL } from "../../Redux/actions";

dayjs.extend(utc);

const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 20;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 28;
const HEADER_HEIGHT = 56;

export default function PublicSchedule() {
  const { trainerId } = useParams();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [trainerError, setTrainerError] = useState("");
  const weekPickerRef = useRef(null);

  useEffect(() => {
    if (!trainerId) return;
    const weekStart = selectedDate.startOf("week").startOf("day").toISOString();
    const weekEnd = selectedDate.startOf("week").add(7, "day").startOf("day").toISOString();

    fetch(`${serverURL}/schedule/public/range`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        startDate: weekStart,
        endDate: weekEnd,
        trainerId,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setTrainerError(data.error);
          setEvents([]);
          return;
        }
        setEvents(data?.events || []);
      })
      .catch(() => {
        setTrainerError("Trainer not found.");
        setEvents([]);
      });
  }, [selectedDate, trainerId]);

  useEffect(() => {
    if (!trainerId) return;
    fetch(`${serverURL}/public/trainer/${trainerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setTrainerError(data.error);
          setTrainer(null);
          return;
        }
        setTrainer(data);
        setTrainerError("");
      })
      .catch(() => {
        setTrainerError("Trainer not found.");
        setTrainer(null);
      });
  }, [trainerId]);

  const weekStart = useMemo(() => selectedDate.startOf("week"), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")),
    [weekStart]
  );
  const weekEvents = useMemo(() => {
    const start = weekStart.startOf("day");
    const end = weekStart.add(7, "day").startOf("day");
    return (events || []).filter((event) => {
      const eventStart = dayjs(event.startDateTime);
      const eventEnd = dayjs(event.endDateTime);
      return eventStart.isBefore(end) && eventEnd.isAfter(start);
    });
  }, [events, weekStart]);

  const { calendarStartHour, calendarEndHour } = useMemo(() => {
    if (!weekEvents.length) {
      return { calendarStartHour: DEFAULT_START_HOUR, calendarEndHour: DEFAULT_END_HOUR };
    }
    let minStart = 23;
    let maxEnd = 0;
    weekEvents.forEach((event) => {
      const startTime = dayjs(event.startDateTime);
      const endTime = dayjs(event.endDateTime);
      const startHour = startTime.hour();
      const endHour = endTime.hour();
      minStart = Math.min(minStart, startHour);
      maxEnd = Math.max(maxEnd, endTime.minute() > 0 ? endHour + 1 : endHour);
    });
    if (maxEnd <= minStart) {
      maxEnd = Math.min(minStart + 1, 24);
    }
    return {
      calendarStartHour: Math.max(0, Math.min(23, minStart)),
      calendarEndHour: Math.max(1, Math.min(24, maxEnd)),
    };
  }, [weekEvents]);

  const totalSlots = Math.max((calendarEndHour - calendarStartHour) * 2, 0);

  const getEventStyle = (event, day) => {
    const dayStart = day.startOf("day");
    const dayEnd = day.add(1, "day").startOf("day");
    const eventStart = dayjs(event.startDateTime);
    const eventEnd = dayjs(event.endDateTime);
    const start = eventStart.isBefore(dayStart) ? dayStart : eventStart;
    const end = eventEnd.isAfter(dayEnd) ? dayEnd : eventEnd;

    const startMinutes = start.diff(dayStart, "minute");
    const endMinutes = end.diff(dayStart, "minute");
    const topMinutes = Math.max(startMinutes - calendarStartHour * 60, 0);
    const bottomMinutes = Math.min(
      endMinutes - calendarStartHour * 60,
      (calendarEndHour - calendarStartHour) * 60
    );

    if (bottomMinutes <= 0 || topMinutes >= (calendarEndHour - calendarStartHour) * 60) return null;

    return {
      top: Math.floor(topMinutes / SLOT_MINUTES) * SLOT_HEIGHT,
      height: Math.max(1, Math.ceil((bottomMinutes - topMinutes) / SLOT_MINUTES) * SLOT_HEIGHT),
    };
  };

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

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          {trainer && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src={
                  trainer.profilePicture
                    ? `${serverURL}/user/profilePicture/${trainer.profilePicture}`
                    : undefined
                }
                sx={{ width: 44, height: 44 }}
              >
                {trainer.firstName?.[0] || "T"}
              </Avatar>
              <Stack spacing={0.25}>
                <Typography variant="h5">
                  {trainer.firstName} {trainer.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Week of {weekRangeLabel}
                </Typography>
              </Stack>
            </Stack>
          )}
          {!trainer && (
            <>
              <Typography variant="h4">Public Sessions</Typography>
              <Typography variant="body2" color="text.secondary">
                Week of {weekRangeLabel}
              </Typography>
            </>
          )}
        </Stack>

        <Container maxWidth="md" sx={{ height: "100%", paddingTop: "10px", maxWidth: "100%" }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button onClick={() => setSelectedDate(selectedDate.subtract(1, "week"))}>
              <ArrowBack sx={{ color: "primary.dark" }} />
            </Button>
            <TextField
              focused
              label="Week"
              type="text"
              color="primary"
              value={weekRangeDisplay}
              onClick={() => {
                if (weekPickerRef.current?.showPicker) {
                  weekPickerRef.current.showPicker();
                } else if (weekPickerRef.current) {
                  weekPickerRef.current.click();
                  weekPickerRef.current.focus();
                }
              }}
              InputProps={{ readOnly: true }}
            />
            <Button onClick={() => setSelectedDate(selectedDate.add(1, "week"))}>
              <ArrowForward sx={{ color: "primary.dark" }} />
            </Button>
            <input
              ref={weekPickerRef}
              type="date"
              value={selectedDate.format("YYYY-MM-DD")}
              onChange={(event) => setSelectedDate(dayjs(event.target.value))}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: 0,
                height: 0,
              }}
            />
          </Stack>
          <Divider sx={{ margin: "15px" }} />
        </Container>

        {(!trainerId || trainerError) && (
          <Typography color="text.secondary">
            {trainerError || "Missing trainer id."}
          </Typography>
        )}

        {!trainerError && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
                  <Typography variant="h6">Week View</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open slots are shown in green. Booked slots are shown in blue.
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: 2,
                    overflowX: { xs: "auto", md: "hidden" },
                  }}
                >
                  <Box sx={{ width: 64, borderRight: "1px solid rgba(148, 163, 184, 0.35)" }}>
                    <Box
                      sx={{
                        height: HEADER_HEIGHT,
                        borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    />
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
                      gridTemplateColumns: "repeat(7, minmax(96px, 1fr))",
                      flex: 1,
                    }}
                  >
                    {weekDays.map((day) => (
                      <Box key={day.format("YYYY-MM-DD")} sx={{ borderLeft: "1px solid rgba(148, 163, 184, 0.2)" }}>
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
                          }}
                        >
                          <Typography variant="subtitle2">
                            {day.format("ddd")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {day.format("MMM D")}
                          </Typography>
                        </Box>
                        <Box sx={{ position: "relative" }}>
                          {Array.from({ length: totalSlots }).map((_, slotIndex) => (
                            <Box
                              key={`slot-${day.format("YYYY-MM-DD")}-${slotIndex}`}
                              sx={{
                                height: SLOT_HEIGHT,
                                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                                backgroundColor: slotIndex % 2 === 0 ? "rgba(148,163,184,0.06)" : "transparent",
                              }}
                            />
                          ))}
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
                                    backgroundColor: event.eventType === "AVAILABILITY"
                                      ? "rgba(76, 175, 80, 0.25)"
                                      : "rgba(33, 150, 243, 0.25)",
                                    border: "1px solid rgba(25, 118, 210, 0.4)",
                                    borderRadius: 1,
                                    px: 0.5,
                                    py: 0.25,
                                    overflow: "hidden",
                                  }}
                                >
                                <Typography variant="caption">
                                  {event.eventType === "AVAILABILITY"
                                    ? "Open"
                                    : event.publicLabel || "Booked"}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
