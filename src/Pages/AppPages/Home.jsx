import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import queryString from "query-string";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Loading from "../../Components/Loading";
import SelectedDate from "../../Components/SelectedDate";
import WorkoutOverview from "../../Components/TrainingComponents/WorkoutOverview";
import WeeklyTrainingStatus from "../../Components/TrainingComponents/WeeklyTrainingStatus";
import { requestWorkoutsByDate, requestLatestMetric, serverURL } from "../../Redux/actions";
import { Avatar, Button, Grid, Paper, Stack, Typography } from '@mui/material';

dayjs.extend(utc);

function Home() {
  const location = useLocation();
  const { date, client, } = queryString.parse(location.search);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [size = 900, setBorderHighlight] = useOutletContext();
  const isPersonalWorkout = useCallback(
    () => client ? user._id.toString() === client : true,
    [user._id, client]
  );
  const workouts = useSelector((state) => {
    return state.workouts?.[isPersonalWorkout() ? user._id : client]?.workouts ?? [];
  });
  const workoutsUser = useSelector((state) => {
    return state.workouts?.[isPersonalWorkout() ? user._id : client]?.user ?? {};
  });
  const latestMetric = useSelector(
    (state) => state.metrics.latestByUser[(client || user._id)] || null
  );
  const [loading, setLoading] = useState(true);

  const isValidDate = (date) => {
    return dayjs(date, "YYYYMMDD").isValid();
  };

  const formatDate = (date) => {
    return dayjs(date, "YYYYMMDD").format("YYYY-MM-DD");
  };

  const today = dayjs().format("YYYY-MM-DD");
  const initialDate = isValidDate(date) ? formatDate(date) : today;

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [localWorkouts, setLocalWorkouts] = useState(() => {
    return [];
  });

  const handleCancelEdit = () => {
    const matchedDateWorkouts = workouts.filter((workout) =>
      dayjs.utc(workout.date).isSame(dayjs.utc(selectedDate), "day")
    );
    setLocalWorkouts([...matchedDateWorkouts]);
  };

  const [openCreateWorkoutDialog, setOpenCreateWorkoutDialog] = useState(false);
  const handleOpenCreateWorkoutDialog = () => setOpenCreateWorkoutDialog(true);
  const handleCloseCreateWorkoutDialog = () => setOpenCreateWorkoutDialog(false);

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  useEffect(() => {
    const matchedDateWorkouts = workouts.filter((workout) =>
      dayjs.utc(workout.date).isSame(dayjs.utc(selectedDate), "day")
    );

    const isDifferent =
      matchedDateWorkouts.length !== localWorkouts.length ||
      matchedDateWorkouts.some((w, i) => w._id !== localWorkouts[i]?._id);

    if (isDifferent) {
      setLocalWorkouts(matchedDateWorkouts);
    }
  }, [workouts, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const newDate = dayjs(selectedDate).utc().format("YYYYMMDD");

      // Parse current query params (e.g., ?date=..., ?client=..., others)
      const currentQuery = queryString.parse(location.search);

      // Overwrite only the date; keep everything else (like `client`) intact
      const nextQuery = { ...currentQuery, date: newDate };

      // Build and replace the URL
      const nextSearch = queryString.stringify(nextQuery, {
        skipNull: true,
        skipEmptyString: true,
      });
      const nextUrl = `/?${nextSearch}`;
      window.history.replaceState(null, "", nextUrl);

      setLoading(true);
      dispatch(requestWorkoutsByDate(selectedDate, client)).finally(() => {
        setBorderHighlight(!isPersonalWorkout());
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isPersonalWorkout]);

  useEffect(() => {
    dispatch(requestLatestMetric({ userId: isPersonalWorkout() ? undefined : client }));
  }, [dispatch, isPersonalWorkout, client]);


  return loading ? (
    <Loading />
  ) : (
    <>
      {!isPersonalWorkout() && workoutsUser.firstName && (
        <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
          <Avatar
            src={
              workoutsUser?.profilePicture &&
              `${serverURL}/user/profilePicture/${workoutsUser.profilePicture}`
            }
            sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
            alt={workoutsUser ? `${workoutsUser.firstName[0]} ${workoutsUser.lastName[0]}` : 'loading'}
          />
          <Typography variant="h5">
            {workoutsUser.firstName} {workoutsUser.lastName}
          </Typography>
        </Grid>
      )}
      <SelectedDate selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <WeeklyTrainingStatus selectedDate={selectedDate} setSelectedDate={setSelectedDate} workoutsUser={workoutsUser} workouts={workouts} />
      {latestMetric && (
        <Grid container size={12} sx={{ marginTop: "10px" }}>
          <Paper elevation={5} sx={{ width: "100%", padding: "5px", margin: "5px" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="text.primary">Latest Body Metrics</Typography>
              <Button
                component={Link}
                to={`/progress?${client ? `client=${client}&` : ""}tab=metrics`}
                size="small"
                variant="outlined"
              >
                View Body Metrics
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {new Date(latestMetric.recordedAt).toLocaleDateString()}{" "}
              {new Date(latestMetric.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
            <Paper sx={{ padding: "4px 8px", marginTop: "6px" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ "& p": { color: "text.primary" } }}
              >
                <Typography variant="body1">Weight: {latestMetric.weight ?? "—"} lbs</Typography>
                <Typography variant="body1">Body Fat: {latestMetric.bodyFatPercent ?? "—"}%</Typography>
                <Typography variant="body1">BMI: {latestMetric.bmi ?? "—"}</Typography>
                <Typography variant="body1">RHR: {latestMetric.restingHeartRate ?? "—"} bpm</Typography>
              </Stack>
            </Paper>
          </Paper>
        </Grid>
      )}
      {localWorkouts && (
        <WorkoutOverview
          localWorkouts={localWorkouts}
          setLocalWorkouts={setLocalWorkouts}
          selectedDate={selectedDate}
          handleCancelEdit={handleCancelEdit}
          workoutOptionModalViewProps={{
            modalOpen,
            handleModalToggle,
            handleSetModalAction,
            modalActionType,
            openCreateWorkoutDialog,
            handleOpenCreateWorkoutDialog,
            handleCloseCreateWorkoutDialog,
            setSelectedDate,
          }}
          user={user}
        />
      )}
    </>
  );
}

export default Home;
