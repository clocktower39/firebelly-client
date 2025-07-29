import React, { Fragment, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Cancel as CloseIcon,
  Today as MoveToDateIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { requestTrainingWeek, serverURL } from "../../Redux/actions";

export default function WeeklyTrainingStatus({ selectedDate, setSelectedDate }) {
  const dispatch = useDispatch();
  const date = dayjs(selectedDate);
  const [weeklyData, setWeeklyData] = useState([]);
  const user = useSelector((state) => state.user);
  const workouts = useSelector((state) => state.workouts?.[user._id]?.workouts ?? []);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    date.subtract(6 - i, "day").format("YYYY-MM-DD")
  );

  const weekData = weekDates.map((dateStr) => {
    const dayWorkouts = workouts.filter(
      (w) => dayjs.utc(w.date).format("YYYY-MM-DD") === dateStr
    );
    const complete = dayWorkouts.length > 0 && dayWorkouts.every((w) => w.complete);
    return { date: dateStr, workouts: dayWorkouts, complete };
  });

  useEffect(() => {
    dispatch(requestTrainingWeek(date.format("YYYY-MM-DD"), user._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);
  return (
    <>
      <Grid container sx={{ justifyContent: "center" }}>
        {weekData.map((day) => (
          <DayStatusView day={day} key={day.date} setSelectedDate={setSelectedDate} />
        ))}
      </Grid>
    </>
  );
}

const exerciseTypeFields = (exerciseType) => {
  switch (exerciseType) {
    case "Rep Range":
      return {
        repeating: [
          {
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            goalAttribute: "minReps",
            label: "Min Reps",
          },
          {
            goalAttribute: "maxReps",
            label: "Max Reps",
          },
        ],
        nonRepeating: [],
      };
    case "Reps":
      return {
        repeating: [
          {
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            goalAttribute: "reps",
            label: "Reps",
          },
        ],
        nonRepeating: [],
      };
    case "Reps with %":
      return {
        repeating: [
          {
            goalAttribute: "percent",
            label: "Percent",
          },
          {
            goalAttribute: "reps",
            label: "Reps",
          },
        ],
        nonRepeating: [
          {
            goalAttribute: "maxWeight",
            label: "One Rep Max",
          },
        ],
      };
    case "Time":
      return {
        repeating: [
          {
            goalAttribute: "seconds",
            label: "Seconds",
          },
        ],
        nonRepeating: [],
      };
    default:
      return <Typography color="text.primary">Type Error</Typography>;
  }
};

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
