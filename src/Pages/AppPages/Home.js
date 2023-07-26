import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import dayjs from "dayjs";
import Loading from "../../Components/Loading";
import SelectedDate from "../../Components/SelectedDate";
import WorkoutOverview from "../../Components/TrainingComponents/WorkoutOverview";
import WeeklyTrainingStatus from "../../Components/TrainingComponents/WeeklyTrainingStatus";
import { requestWorkoutsByDate } from "../../Redux/actions";

function Home() {
  const location = useLocation();
  const { date } = queryString.parse(location.search);
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workouts);
  const user = useSelector((state) => state.user);
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

  const [localWorkouts, setLocalWorkouts] = useState([]);

  const handleCancelEdit = () => {
    setLocalWorkouts([...workouts]);
  };

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  useEffect(() => {
    setLocalWorkouts(workouts || []);
  }, [workouts]);

  useEffect(() => {
    if (selectedDate !== null) {
      setLoading(true);
      dispatch(requestWorkoutsByDate(selectedDate, "client", user._id)).then(
        () => {
          setLoading(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, workouts.length]);

  return loading ? (
    <Loading />
  ) : (
    <>
        <SelectedDate
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <WeeklyTrainingStatus selectedDate={selectedDate} />
        {localWorkouts && (
          <WorkoutOverview
            localWorkouts={localWorkouts}
            setLocalWorkouts={setLocalWorkouts}
            selectedDate={selectedDate}
            handleCancelEdit={handleCancelEdit}
            workoutOptionModalViewProps={{ modalOpen, handleModalToggle, handleSetModalAction, modalActionType, openModal, handleOpenModal, handleCloseModal, setSelectedDate, }}
          />
        )}
        </>
  );
}

export default Home;
