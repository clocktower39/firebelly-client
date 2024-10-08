import React, { Fragment, useState, useEffect } from "react";
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
import { serverURL } from "../../Redux/actions";

export default function WeeklyTrainingStatus({ selectedDate, setSelectedDate }) {
  const date = dayjs(selectedDate);
  const [weeklyData, setWeeklyData] = useState([]);

  const fillData = [
    { workouts: [], date: date.subtract(6, "day").format("YYYY-MM-DD") },
    { workouts: [], date: date.subtract(5, "day").format("YYYY-MM-DD") },
    { workouts: [], date: date.subtract(4, "day").format("YYYY-MM-DD") },
    { workouts: [], date: date.subtract(3, "day").format("YYYY-MM-DD") },
    { workouts: [], date: date.subtract(2, "day").format("YYYY-MM-DD") },
    { workouts: [], date: date.subtract(1, "day").format("YYYY-MM-DD") },
    { workouts: [], date },
  ];

  const weekData = fillData.map((dayOfWeek) => {
    const matchingWorkouts = [];
    let complete = false; // Default to false

    weeklyData.forEach((weeklyDataDay) => {
      if (
        dayjs(dayOfWeek.date).format("YYYY-MM-DD") ===
        dayjs.utc(weeklyDataDay.date).format("YYYY-MM-DD")
      ) {
        matchingWorkouts.push(weeklyDataDay);
        if (weeklyDataDay.complete) {
          complete = true; // Set to true if any workout is complete
        }
      }
    });

    // Set complete to true only if all workouts for the day are complete
    if (matchingWorkouts.length > 0 && matchingWorkouts.every((workout) => workout.complete)) {
      complete = true;
    } else {
      complete = false;
    }

    return { ...dayOfWeek, workouts: [...matchingWorkouts], complete };
  });

  useEffect(() => {
    const fetchWeelyData = async () => {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const response = await fetch(`${serverURL}/trainingWeek`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({ date }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();
      return data;
    };

    fetchWeelyData().then((wd) => setWeeklyData(wd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Grid container sx={{ justifyContent: "center" }}>
        {weekData.map((day) => (
          <DayStatusView
            day={day}
            key={day.date}
            setSelectedDate={setSelectedDate}
          />
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

const DayStatusView = ({ day, setSelectedDate, }) => {
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
