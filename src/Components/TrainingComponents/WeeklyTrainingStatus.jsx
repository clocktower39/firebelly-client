import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
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
import { Cancel as CloseIcon, Today as MoveToDateIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import { serverURL } from "../../Redux/actions";

export default function WeeklyTrainingStatus({ selectedDate, setSelectedDate }) {
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
          <DayStatusView
            day={day}
            key={day.date}
            setSelectedWorkout={setSelectedWorkout}
            setSelectedDate={setSelectedDate}
            setAnchorEl={setAnchorEl}
          />
        ))}
      </Grid>
      <DayDialogOverview
        selectedWorkout={selectedWorkout}
        setSelectedWorkout={setSelectedWorkout}
        anchorEl={anchorEl}
        setActionEl={setAnchorEl}
        setSelectedDate={setSelectedDate}
      />
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

const DayDialogOverview = ({ selectedWorkout, setSelectedWorkout, setSelectedDate }) => {
  // Handle close function updates to work with Dialog
  const handleClose = () => {
    setSelectedWorkout(null);
  };

  const handleMoveToDate = () => {
    setSelectedDate(dayjs(selectedWorkout.date).format("YYYY-MM-DD"));
  };

  return (
    <Dialog
      open={selectedWorkout && selectedWorkout.workouts.length > 0 ? true : false}
      onClose={handleClose}
      PaperProps={{
        sx: {
          padding: "20px",
        },
      }}
      maxWidth="md"
    >
      {selectedWorkout && (
        <>
          <DialogTitle disableTypography>
            <Typography variant="h5" style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Achieved Data
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: "10px" }}>
              {dayjs(selectedWorkout.date).format("dddd - MMMM Do, YYYY")}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              style={{ position: "absolute", right: "10px", top: "10px", color: "#FFF" }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              aria-label="date"
              onClick={handleMoveToDate}
              style={{ position: "absolute", right: "50px", top: "10px", color: "#FFF" }}
            >
              <MoveToDateIcon />
            </IconButton>
            <Typography
              variant="caption"
              style={{ position: "absolute", right: "10px", top: "50px", fontSize: "0.8rem" }}
            >
              {dayjs(selectedWorkout.date).format("MM-DD-YYYY")}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            {selectedWorkout.workouts.map((workout, workoutIndex, thisArray) => {
              const to = `/workout/${workout._id}`;
              return (
                <Fragment key={workout._id}>
                  <Typography
                    variant="h5"
                    sx={{
                      marginBottom: "10px",
                    }}
                  >
                    {workout.title}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      marginBottom: "5px",
                    }}
                  >
                    {workout.category.join(", ")}
                  </Typography>
                  {workout.training.map((circuit, index) => (
                    <Grid container key={index} spacing={2} style={{ marginBottom: "15px" }}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" >
                          - Circuit {index + 1}
                        </Typography>
                      </Grid>
                      {circuit.map((exercise, exerciseIndex) => (
                        <Fragment key={`${exercise.exercise}-${exerciseIndex}`}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              sx={{ marginLeft: "16px",}}
                            >
                              {exercise.exercise}
                            </Typography>
                          </Grid>
                          
                          <Grid container item xs={12} sm={6}>
                            {exerciseTypeFields(exercise.exerciseType).repeating.map((field) => {
                                return (
                                <Grid item xs={12}>
                                  <Typography variant="body2" sx={{ marginLeft: "32px" }}>
                                    {field.label}: {exercise.achieved[field.goalAttribute]?.join(", ")}
                                  </Typography>
                                </Grid> )
                              }
                            )}
                          </Grid>

                        </Fragment>
                      ))}
                    </Grid>
                  ))}

                  <Grid
                    container
                    item
                    xs={12}
                    sx={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Button variant="contained" component={Link} to={to}>
                      Open
                    </Button>
                  </Grid>
                  {workoutIndex < thisArray.length - 1 && <Divider sx={{ padding: "15px" }} />}
                </Fragment>
              );
            })}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

const DayStatusView = ({ day, setSelectedWorkout, setSelectedDate, setAnchorEl }) => {
  const handleClick = (e) => {
    setSelectedWorkout((prev) =>
      prev
        ? dayjs.utc(prev.date).format("YYYY-MM-DD") !== dayjs.utc(day.date).format("YYYY-MM-DD")
          ? day
          : null
        : day
    );
    setAnchorEl(e.currentTarget.parentElement);
  };
  const handleMoveToDate = () => {
    setSelectedDate(dayjs(day.date).format("YYYY-MM-DD"));
  };
  return (
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
  );
};
