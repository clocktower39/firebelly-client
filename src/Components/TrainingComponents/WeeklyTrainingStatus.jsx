import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
  Today as MoveToDateIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

export default function WeeklyTrainingStatus({
  selectedDate,
  setSelectedDate,
  visibleDate,
  setVisibleDate,
  visibleDateLocked,
  setVisibleDateLocked,
  workouts,
}) {
  const date = dayjs(visibleDate || selectedDate);
  const visibleDateKey = date.format("YYYY-MM-DD");
  const previousVisibleDateRef = useRef(visibleDateKey);
  const selectedDateKey = dayjs(selectedDate).format("YYYY-MM-DD");
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    date.subtract(6 - i, "day").format("YYYY-MM-DD")
  );
  const weekStart = weekDates[0];
  const weekEnd = weekDates[weekDates.length - 1];
  const selectedDateVisible = weekDates.includes(selectedDateKey);

  const weekData = weekDates.map((dateStr) => {
    const dayWorkouts = workouts.filter(
      (w) => dayjs.utc(w.date).format("YYYY-MM-DD") === dateStr
    );
    const complete = dayWorkouts.length > 0 && dayWorkouts.every((w) => w.complete);
    return { date: dateStr, workouts: dayWorkouts, complete };
  });
  const previousWeekDataRef = useRef(weekData);
  const [carousel, setCarousel] = useState({
    previousWeekData: null,
    direction: 0,
    distance: 0,
    token: 0,
  });

  const moveVisibleWeek = (amount) => {
    if (!setVisibleDate) return;
    setVisibleDate(date.add(amount, "week").format("YYYY-MM-DD"));
  };

  useEffect(() => {
    const previousDate = dayjs(previousVisibleDateRef.current);
    const nextDate = dayjs(visibleDateKey);
    const dayDiff = nextDate.diff(previousDate, "day");

    if (dayDiff !== 0) {
      const token = Date.now();
      setCarousel({
        previousWeekData: previousWeekDataRef.current,
        direction: dayDiff > 0 ? 1 : -1,
        distance: Math.min(420, Math.max(58, Math.abs(dayDiff) * 58)),
        token,
      });

      const timeout = setTimeout(() => {
        setCarousel((current) =>
          current.token === token
            ? { previousWeekData: null, direction: 0, distance: 0, token: 0 }
            : current
        );
      }, 520);

      previousVisibleDateRef.current = visibleDateKey;
      previousWeekDataRef.current = weekData;
      return () => clearTimeout(timeout);
    }

    previousVisibleDateRef.current = visibleDateKey;
    previousWeekDataRef.current = weekData;
  }, [visibleDateKey]);

  useEffect(() => {
    if (previousVisibleDateRef.current === visibleDateKey && !carousel.previousWeekData) {
      previousWeekDataRef.current = weekData;
    }
  }, [carousel.previousWeekData, visibleDateKey, workouts]);

  const enterOffset = carousel.direction > 0 ? carousel.distance : -carousel.distance;
  const exitOffset = carousel.direction > 0 ? -carousel.distance : carousel.distance;

  return (
    <Stack spacing={1} sx={{ alignItems: "center" }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <IconButton size="small" onClick={() => moveVisibleWeek(-1)}>
          <ChevronLeft />
        </IconButton>
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ minWidth: 160 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            {dayjs(weekStart).format("MMM D")} - {dayjs(weekEnd).format("MMM D")}
          </Typography>
          {setVisibleDate && !selectedDateVisible && (
            <IconButton
              size="small"
              onClick={() => setVisibleDate(selectedDateKey)}
              sx={{ color: "success.main", p: 0.25 }}
              aria-label="Return to selected date"
            >
              <MoveToDateIcon fontSize="small" />
            </IconButton>
          )}
          {setVisibleDateLocked && (
            <IconButton
              size="small"
              onClick={() => setVisibleDateLocked((prev) => !prev)}
              sx={{ color: visibleDateLocked ? "success.main" : "text.secondary", p: 0.25 }}
              aria-label={visibleDateLocked ? "Unlock weekly date" : "Lock weekly date"}
            >
              {visibleDateLocked ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
            </IconButton>
          )}
        </Stack>
        <IconButton size="small" onClick={() => moveVisibleWeek(1)}>
          <ChevronRight />
        </IconButton>
      </Stack>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: 0.5,
          py: 0.75,
          "--week-row-enter": `${enterOffset}px`,
          "--week-row-exit": `${exitOffset}px`,
          "@keyframes weeklyCarouselIn": {
            "0%": {
              opacity: 0.35,
              transform: "translateX(var(--week-row-enter))",
            },
            "100%": {
              opacity: 1,
              transform: "translateX(0)",
            },
          },
          "@keyframes weeklyCarouselOut": {
            "0%": {
              opacity: 1,
              transform: "translateX(0)",
            },
            "100%": {
              opacity: 0.15,
              transform: "translateX(var(--week-row-exit))",
            },
          },
          "@media (prefers-reduced-motion: reduce)": {
            "& .weekly-status-row": {
              animation: "none",
            },
          },
        }}
      >
        {carousel.previousWeekData && (
          <Grid
            container
            className="weekly-status-row"
            sx={{
              justifyContent: "center",
              position: "absolute",
              inset: "6px 4px auto 4px",
              pointerEvents: "none",
              animation: "weeklyCarouselOut 460ms cubic-bezier(0.2, 0, 0, 1) both",
            }}
          >
            {carousel.previousWeekData.map((day) => (
              <DayStatusView
                day={day}
                key={`previous-${day.date}`}
                setSelectedDate={setSelectedDate}
              />
            ))}
          </Grid>
        )}
        <Grid
          container
          key={visibleDateKey}
          className="weekly-status-row"
          sx={{
            justifyContent: "center",
            animation: carousel.direction
              ? "weeklyCarouselIn 460ms cubic-bezier(0.2, 0, 0, 1) both"
              : "none",
          }}
        >
          {weekData.map((day) => (
            <DayStatusView
              day={day}
              key={day.date}
              setSelectedDate={setSelectedDate}
            />
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}

const DayStatusView = ({ day, setSelectedDate }) => {
  const handleMoveToDate = () => {
    setSelectedDate(dayjs(day.date).format("YYYY-MM-DD"));
  };

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={
        day.workouts.length > 0 ? (
          day.complete ? (
            <CheckBoxIcon fontSize="small" color="primary" />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: "red" }} />
          )
        ) : undefined
      }
    >
      <Box
        sx={{ position: "relative", color: "primary" }}
        key={day.date}
        onClick={handleMoveToDate}
        component={Button}
      >
        <CircularProgress
          variant="determinate"
          sx={{
            color: (theme) => theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
          }}
          size={45}
          thickness={1}
          value={100}
        />
        <CircularProgress
          value={day.workouts.length > 0 ? 100 : 0}
          variant="determinate"
          sx={{
            color: day.complete ? "green" : "red", // Change color based on completion status
            animationDuration: "550ms",
            position: "absolute",
            left: 10,
          }}
          size={45}
          thickness={1}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Box sx={{ color: "primary.contrastText" }}>
            <Typography variant="body2" component="div">
              {dayjs(day.date).format("ddd")}
            </Typography>
            <Typography variant="body2" component="div" sx={{ textAlign: "center" }}>
              {dayjs(day.date).format("DD")}{" "}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Badge>
  );
};
