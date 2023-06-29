import React, { Fragment, useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { serverURL } from "../../Redux/actions";

export default function WeeklyTrainingStatus({ selectedDate }) {
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
    weeklyData.forEach((weeklyDataDay) => {
      if (
        dayjs(dayOfWeek.date).format("YYYY-MM-DD") ===
        dayjs.utc(weeklyDataDay.date).format("YYYY-MM-DD")
      ) {
        matchingWorkouts.push(weeklyDataDay);
      }
    });
    return { ...dayOfWeek, workouts: [...matchingWorkouts] };
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

    fetchWeelyData().then(wd => setWeeklyData(wd));;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    // onClick open detail. btn on detail will move to that date
    <Grid container sx={{ justifyContent: "center" }}>
      {weekData.map((day) => (
        <DayStatusView day={day} key={day.date} />
      ))}
    </Grid>
  );
}

const DayStatusView = ({ day }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <Box
      sx={{ position: "relative" }}
      key={day.date}
      onClick={handleClick}
      component={Button}
    >
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
        }}
        size={45}
        thickness={1}
        value={100}
      />
      <CircularProgress
        value={day.workouts.length > 0 ? 100 : 0}
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
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
        <Box>
          <Typography variant="body2" component="div">
            {dayjs(day.date).format("ddd")}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{ textAlign: "center" }}
          >
            {dayjs(day.date).format("DD")}{" "}
          </Typography>
        </Box>
      </Box>

      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom"
        disablePortal={false}
        modifiers={[
          {
            name: "flip",
            enabled: false,
            options: {
              altBoundary: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              rootBoundary: "document",
              padding: 8,
            },
          },
          {
            name: "arrow",
            enabled: true,
          },
        ]}
      >
        {day.workouts.map((workout) => {
          return (
            <Paper key={workout._id}>
              <Container >
              <Typography variant="body1">{workout.workoutTitle}</Typography>

              {workout.training.map(
                (workoutSet, workoutSetIndex, allWorkoutSetsArray) => {
                  return (
                    <Grid container key={`${workout._id}-set-${workoutSetIndex}`}>
                      <Grid item xs={12}>
                        set {workoutSetIndex + 1}
                      </Grid>
                      {workoutSet.map(
                        (exercise, exerciseIndex, workoutSetArray) => {
                          return (
                            <Fragment key={`${exercise.exercise}-${exerciseIndex}`}>
                              <Grid item xs={6} >
                                <Typography variant="caption">
                                  {exercise.exercise}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption">
                                  Reps: {exercise.achieved.reps.join(", ")}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}></Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption">
                                  Weight: {exercise.achieved.weight.join(", ")}
                                </Typography>
                              </Grid>
                            </Fragment>
                          );
                        }
                      )}
                    </Grid>
                  );
                }
              )}
              </Container>
            </Paper>
          );
        })}
      </Popper>
    </Box>
  );
};
