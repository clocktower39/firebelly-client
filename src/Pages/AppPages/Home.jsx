import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import dayjs from "dayjs";
import Loading from "../../Components/Loading";
import LoadingPage from "../../Components/LoadingPage";
import SelectedDate from "../../Components/SelectedDate";
import WorkoutOverview from "../../Components/TrainingComponents/WorkoutOverview";
import WeeklyTrainingStatus from "../../Components/TrainingComponents/WeeklyTrainingStatus";
import { requestWorkoutsByDate } from "../../Redux/actions";

function Home() {
  const location = useLocation();
  const { date, client, } = queryString.parse(location.search);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isPersonalWorkout = useCallback(
    () => client ? user._id.toString() === client : true,
    [user._id, client]
  );
  const workouts = useSelector((state) => {
    return state.workouts?.[isPersonalWorkout() ? user._id : client]?.workouts ?? [];
  });
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
      dayjs(workout.date).add(1, "day").isSame(selectedDate, "day")
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
      dayjs(workout.date).add(1, "day").isSame(selectedDate, "day")
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
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);


  return loading ? (
    <LoadingPage PropComponent={Loading} />
  ) : (
    <>
      <SelectedDate selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <WeeklyTrainingStatus selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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
