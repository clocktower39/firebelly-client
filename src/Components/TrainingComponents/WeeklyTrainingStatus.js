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
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

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

    fetchWeelyData().then((wd) => setWeeklyData(wd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Grid container sx={{ justifyContent: "center" }}>
        {weekData.map((day) => (
          <DayStatusView day={day} key={day.date} setSelectedWorkout={setSelectedWorkout} setAnchorEl={setAnchorEl} />
        ))}
      </Grid>
      <DayPopperOverview selectedWorkout={selectedWorkout} anchorEl={anchorEl} />
    </>
  );
}

const DayPopperOverview = (props) => {
  const { selectedWorkout, anchorEl } = props;

  return (
    <Popper
      open={selectedWorkout ? true : false}
      anchorEl={anchorEl}
      placement="bottom"
      disablePortal={false}
      sx={{ maxWidth: "95%", }}
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
      {selectedWorkout &&
        selectedWorkout.workouts.map((workout) => {
          return (
              <Container key={workout._id} >
                <Paper sx={{ padding: '5px'}} elevation={5} >
                <Typography variant="body1">{workout.title}</Typography>

                {workout.training.map((workoutSet, workoutSetIndex, allWorkoutSetsArray) => {
                  return (
                    <Grid container key={`${workout._id}-set-${workoutSetIndex}`}>
                      <Grid item xs={12}>
                        set {workoutSetIndex + 1}
                      </Grid>
                      {workoutSet.map((exercise, exerciseIndex, workoutSetArray) => {
                        return (
                          <Fragment key={`${exercise.exercise}-${exerciseIndex}`}>
                            <Grid item xs={6}>
                              <Typography variant="caption">{exercise.exercise}</Typography>
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
                      })}
                    </Grid>
                  );
                })}
                </Paper>
              </Container>
          );
        })}
    </Popper>
  );
};

const DayStatusView = ({ day, setSelectedWorkout, setAnchorEl }) => {
  const handleClick = (e) => {
    setSelectedWorkout((prev) => prev ? dayjs.utc(prev.date).format('YYYY-MM-DD') !== dayjs.utc(day.date).format('YYYY-MM-DD') ? day : null : day);
    setAnchorEl(e.currentTarget.parentElement);
  }
  return (
    <Box sx={{ position: "relative", color: 'primary' }} key={day.date} onClick={handleClick} component={Button}>
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
          color: (theme) => (theme.palette.mode === "light" ? "#1a90ff" : "#308fe8"),
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
        <Box sx={{ color: 'primary.contrastText'}}>
          <Typography variant="body2" component="div">
            {dayjs(day.date).format("ddd")}
          </Typography>
          <Typography variant="body2" component="div" sx={{ textAlign: "center" }}>
            {dayjs(day.date).format("DD")}{" "}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
