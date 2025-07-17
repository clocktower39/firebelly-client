import React, { useState, useEffect } from "react";
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
  const { date } = queryString.parse(location.search);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const workouts = useSelector((state) => {
    return state.workouts?.[user._id]?.workouts ?? [];
  });
  // const workouts = useSelector((state) => state.LEGACY_workouts);
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
    if (selectedDate !== null) {
      const newDate = dayjs(selectedDate).utc().format("YYYYMMDD");
      const newUrl = `/?date=${newDate}`;
      window.history.replaceState(null, "", newUrl);
      
      setLoading(true);
      dispatch(requestWorkoutsByDate(selectedDate, "client", user._id)).then(() => {
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
