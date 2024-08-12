import React, { Fragment, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Badge,
  Box,
  Button,
  Grid,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { serverURL } from "../../Redux/actions";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

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

export default function WorkoutHistory(props) {
  const { view = "client", client } = props;
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([1, 2, 2, 3, 3, 3, 30]);
  const [currentMonth, setCurrentMonth] = useState(dayjs(new Date()).month());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [expandedWorkout, setExpandedWorkout] = useState(null); // State for managing which accordion is expanded

  const getWorkoutMonthData = (e) => {
    setIsLoading(true);
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

    const fetchData = async () => {
      const endpoint = "workoutMonth";

      const payload = JSON.stringify({
        date: e ? e.format("YYYY-MM-DD") : dayjs(new Date()).format("YYYY-MM-DD"),
        client,
      });

      const response = await fetch(`${serverURL}/${endpoint}`, {
        method: "post",
        dataType: "json",
        body: payload,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDateCalanderChange = (e) => {
    const newDate = e.utc(e);
    setSelectedDate(newDate);
    setExpandedWorkout(null); // Collapse all accordions first
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {view === "trainer" && (
        <Grid container item xs={12} sx={{ justifyContent: "center", padding: "15px 0" }}>
          <Avatar
            src={
              client?.profilePicture && `${serverURL}/user/profilePicture/${client.profilePicture}`
            }
            sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
            alt={`${client?.firstName?.[0]} ${client?.lastName?.[0]}`}
          />
          <Typography variant="h5">
            {client?.firstName} {client?.lastName}
          </Typography>
        </Grid>
      )}
      <Box sx={{ height: "90vh", minHeight: "650px", display: "flex", flexDirection: "column" }}>
        {/* DateCalendar takes 20% of the available height */}
        <Box sx={{ flex: "0 0 20%" }}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateCalanderChange}
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
        </Box>

        {/* Workouts List takes the remaining space */}
        <Box sx={{ flex: "1", overflow: "auto" }}>
          <Workouts
            currentMonth={currentMonth}
            history={history}
            scrollToDate={selectedDate.format("YYYY-MM-DD")}
            expandedWorkout={expandedWorkout} // Pass down the expanded state
            setExpandedWorkout={setExpandedWorkout} // Pass down the function to set the expanded workout
            view={view}
            client={client}
          />
        </Box>
      </Box>
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

const Workouts = ({ currentMonth, history, scrollToDate, expandedWorkout, setExpandedWorkout }) => {
  return (
    <List>
      {history
        .sort((a, b) => a.date > b.date)
        .map((workout) => {
          if (dayjs.utc(new Date(workout.date)).month() === currentMonth) {
            return (
              <Workout
                key={workout._id}
                workout={workout}
                scrollToDate={scrollToDate}
                expandedWorkout={expandedWorkout}
                setExpandedWorkout={setExpandedWorkout}
              />
            );
          }
          return null;
        })}
    </List>
  );
};

const Workout = ({ workout, scrollToDate, expandedWorkout, setExpandedWorkout }) => {
  const workoutRef = useRef(null);
  const workoutId = workout._id;
  const to = `/workout/${workoutId}`;
  const theme = useTheme();
  const isSelected = dayjs(workout.date).utc().format("YYYY-MM-DD") === scrollToDate;

  const handleScroll = () => {
    const scrollContainer = workoutRef.current.parentElement.parentElement;
    const elementTop = workoutRef.current.offsetTop;
    const elementHeight = workoutRef.current.offsetHeight;
    const containerHeight = scrollContainer.clientHeight;

    let scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);

    if (scrollPosition < 0) {
      scrollPosition = 0;
    } else if (scrollPosition > scrollContainer.scrollHeight - containerHeight) {
      scrollPosition = scrollContainer.scrollHeight - containerHeight;
    }

    scrollContainer.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (isSelected) {
      setExpandedWorkout(workoutId); // Expand this workout
    }
  }, [scrollToDate]);

  useEffect(() => {
    if (expandedWorkout === workoutId) {
      const handleTransitionEnd = () => {
        handleScroll(); // Scroll after the transition ends
      };

      const element = workoutRef.current;
      element.addEventListener('transitionend', handleTransitionEnd);

      return () => {
        element.removeEventListener('transitionend', handleTransitionEnd);
      };
    }
  }, [expandedWorkout]);

  return (
    <ListItem sx={{ justifyContent: "center" }} ref={workoutRef}>
      <Box
        sx={{
          border: isSelected ? `3px solid ${theme.palette.primary.main}` : "1px solid white",
          borderRadius: "5px",
          padding: "2.5px",
          width: "100%",
        }}
      >
        <Accordion
          expanded={expandedWorkout === workoutId}
          onChange={() => setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h6">{workout?.title}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {dayjs.utc(workout.date).format("MMMM Do, YYYY")}
                </Typography>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    Muscle Group{workout?.category?.length > 1 && "s"}:{" "}
                    {workout?.category?.join(", ")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {workout.training.map((workoutSet, workoutSetIndex) => (
                <Grid container key={`${workout._id}-set-${workoutSetIndex}`}>
                  <Grid item xs={12} sx={{ marginLeft: "8px" }}>
                    <Typography variant="body1">Circuit {workoutSetIndex + 1}</Typography>
                  </Grid>
                  {workoutSet.map((exercise, exerciseIndex) => (
                    <Fragment key={`${exercise.exercise}-${exerciseIndex}`}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ marginLeft: "16px" }}>
                          {exercise.exercise}
                        </Typography>
                      </Grid>
                      <Grid container item xs={12} sm={6}>
                        {exerciseTypeFields(exercise.exerciseType).repeating.map((field) => (
                          <Grid item xs={12} key={field.goalAttribute}>
                            <Typography variant="caption" sx={{ marginLeft: "32px" }}>
                              {field.label}: {exercise.achieved[field.goalAttribute]?.join(", ")}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Fragment>
                  ))}
                </Grid>
              ))}
              <Grid container item xs={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                <Button variant="outlined" component={Link} to={to}>
                  Open
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </ListItem>
  );
};
