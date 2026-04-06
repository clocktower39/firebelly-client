import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import queryString from "query-string";
import dayjs from "dayjs";
import SelectedDate from "../../Components/SelectedDate";
import WeeklyClientWorkoutTracker from "../../Components/TrainingComponents/WeeklyClientWorkoutTracker";

function Coverage() {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { date } = queryString.parse(location.search);

  const isValidDate = (value) => dayjs(value, "YYYYMMDD").isValid();
  const formatDate = (value) => dayjs(value, "YYYYMMDD").format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");
  const initialDate = isValidDate(date) ? formatDate(date) : today;
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    const queryDate = isValidDate(date) ? formatDate(date) : today;
    setSelectedDate((prev) => (prev === queryDate ? prev : queryDate));
  }, [date, today]);

  useEffect(() => {
    if (!selectedDate) return;

    const newDate = dayjs(selectedDate).format("YYYYMMDD");
    const currentQuery = queryString.parse(location.search);
    const nextQuery = { ...currentQuery, date: newDate };
    const nextSearch = queryString.stringify(nextQuery, {
      skipNull: true,
      skipEmptyString: true,
    });
    const currentSearch = location.search.replace(/^\?/, "");

    if (nextSearch !== currentSearch) {
      navigate(`/coverage?${nextSearch}`, { replace: true });
    }
  }, [location.search, navigate, selectedDate]);

  if (!user?.isTrainer) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SelectedDate selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <WeeklyClientWorkoutTracker selectedDate={selectedDate} mode="week" />
    </>
  );
}

export default Coverage;
