import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge, Box, Button, Grid, List, ListItem, Typography } from "@mui/material";
import { serverURL } from "../../Redux/actions";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

export default function WorkoutHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState([1, 2, 2, 3, 3, 3, 30]);
  const [currentMonth, setCurrentMonth] = useState(dayjs(new Date()).month());

  const getWorkoutMonthData = (e) => {
    setIsLoading(true);
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const fetchData = async () => {
      const response = await fetch(`${serverURL}/workoutMonth`, {
        method: "post",
        dataType: "json",
        body: JSON.stringify({
          // this is this issue, it can only be todays date when first rendering
          date: e ? e.format("YYYY-MM-DD") : dayjs(new Date()).format("YYYY-MM-DD"),
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();
      return data;
    };

    setIsLoading(false);
    return fetchData;
  };

  useEffect(() => {
    const fetchData = getWorkoutMonthData();

    fetchData().then((data) => {
      setHistory((prev) => data);
    });
  }, []);

  useEffect(() => {
    setHighlightedDays(() => {
      return history.map((item) => {
        const itemMonth = dayjs.utc(item.date).month();
        if (currentMonth === itemMonth) {
          return dayjs.utc(item.date).date();
        }
        return null;
      });
    });
  }, [history, currentMonth]);

  const handleMonthChange = (e) => {
    setCurrentMonth(dayjs(e).month());
    const fetchData = getWorkoutMonthData(e);

    fetchData().then((data) => {
      setHistory((prev) => data);
    });
  };

  const [scrollToDate, setScrollToDate] = useState(null);
  const handleDateCalanderChange = (e) => {
    setScrollToDate(e.utc().format("YYYY-MM-DD"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container>
        <DateCalendar
          onChange={handleDateCalanderChange}
          maxDate={dayjs.utc(new Date())}
          loading={isLoading}
          renderLoading={() => <DayCalendarSkeleton />}
          views={["month", "day"]}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              highlightedDays,
            },
          }}
          onMonthChange={(e) => handleMonthChange(e)}
        />
      </Grid>
      <Workouts currentMonth={currentMonth} history={history} scrollToDate={scrollToDate} />
    </LocalizationProvider>
  );
}

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

  return (
    <Badge
      key={props.day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "✅" : undefined}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

const Workouts = ({ currentMonth, history, scrollToDate }) => {
  return (
    <List sx={{ maxHeight: "500px", overflow: "auto" }}>
      {history
        .sort((a, b) => a.date > b.date)
        .map((workout) => {
          if (dayjs.utc(new Date(workout.date)).month() === currentMonth) {
            return <Workout key={workout._id} workout={workout} scrollToDate={scrollToDate} />;
          }
          return null;
        })}
    </List>
  );
};

const Workout = ({ workout, scrollToDate }) => {
  const workoutRef = useRef(null);

  const handleScroll = (ref) => {
    const testDate = dayjs(workout.date).utc().format("YYYY-MM-DD");
    const scrollDate = dayjs(scrollToDate).format("YYYY-MM-DD");

    if (testDate === scrollDate) {
      ref.current.parentElement.scrollTo({
        top: ref.current.offsetTop,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // When scrollToDate changes, call handleScroll to scroll to the workout
    if (scrollToDate) {
      handleScroll(workoutRef);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToDate]);

  return (
    <ListItem
      xs={12}
      sx={{ justifyContent: "center" }}
      ref={workoutRef}
    >
      <Box
        sx={{
          width: "100%",
          border: "1px solid white",
          borderRadius: "5px",
          padding: "2.5px",
        }}
      >
        <Grid sx={{ padding: "5px" }}>
          <Typography variant="h6">{workout?.title}</Typography>
        </Grid>
        <Grid sx={{ padding: "5px" }}>
          <Typography variant="caption">
            {dayjs.utc(workout.date).format("MMMM Do, YYYY")}
          </Typography>
        </Grid>
        <Grid sx={{ padding: "5px" }}>{workout?.category?.join(", ")}</Grid>
        <Grid sx={{ padding: "5px" }}>
          <Button variant="outlined" component={Link} to={`/workout/${workout._id}`}>
            Open
          </Button>
        </Grid>
      </Box>
    </ListItem>
  );
};
