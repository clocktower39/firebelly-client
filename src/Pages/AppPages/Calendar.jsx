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
  IconButton,
  List,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { serverURL } from "../../Redux/actions";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { WorkoutOptionModalView } from "../../Pages/AppPages/Workout";

// Function to determine the fields based on exercise type
const exerciseTypeFields = (exerciseType) => {
  switch (exerciseType) {
    case "Rep Range":
      return {
        repeating: [
          { goalAttribute: "weight", label: "Weight" },
          { goalAttribute: "minReps", label: "Min Reps" },
          { goalAttribute: "maxReps", label: "Max Reps" },
        ],
        nonRepeating: [],
      };
    case "Reps":
      return {
        repeating: [
          { goalAttribute: "weight", label: "Weight" },
          { goalAttribute: "reps", label: "Reps" },
        ],
        nonRepeating: [],
      };
    case "Reps with %":
      return {
        repeating: [
          { goalAttribute: "percent", label: "Percent" },
          { goalAttribute: "reps", label: "Reps" },
        ],
        nonRepeating: [{ goalAttribute: "maxWeight", label: "One Rep Max" }],
      };
    case "Time":
      return {
        repeating: [{ goalAttribute: "seconds", label: "Seconds" }],
        nonRepeating: [],
      };
    default:
      return <Typography color="text.primary">Type Error</Typography>;
  }
};

export default function Calendar(props) {
  const { view = "client", client } = props;
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]); // Initialize as an empty array
  const [currentMonth, setCurrentMonth] = useState(dayjs(new Date()).month());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };
  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);
  const [selectedWorkout, setSelectedWorkout] = useState({});

  // Function to fetch workout month data
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
      setHistory(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHighlightedDays(() => {
      return history
        .filter((item) => dayjs.utc(item.date).month() === currentMonth)
        .map((item) => ({
          date: dayjs.utc(item.date).date(),
          complete: item.complete,
        }));
    });
  }, [history, currentMonth]);

  const handleMonthChange = (e) => {
    setSelectedDate(null); // Reset the selected date
    setCurrentMonth(dayjs(e).month());
    const fetchData = getWorkoutMonthData(e);

    fetchData().then((data) => {
      setHistory(data);
    });
  };

  const [scrollToDate, setScrollToDate] = useState(dayjs().format("YYYY-MM-DD"));

  const handleDateCalendarChange = (e) => {
    const newDate = dayjs(e);
    setScrollToDate(newDate.format("YYYY-MM-DD"));
    setSelectedDate(newDate);
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
            onChange={handleDateCalendarChange}
            loading={isLoading}
            renderLoading={() => <DayCalendarSkeleton />}
            views={["month", "day"]}
            slots={{ day: ServerDay }}
            slotProps={{ day: { highlightedDays } }}
            onMonthChange={handleMonthChange}
          />
        </Box>

        {/* Workouts List takes the remaining space */}
        <Box sx={{ flex: "1", overflow: "auto" }}>
          <Workouts
            currentMonth={currentMonth}
            history={history}
            scrollToDate={scrollToDate}
            view={view}
            client={client}
            setSelectedWorkout={setSelectedWorkout}
            handleModalToggle={handleModalToggle} 
          />
        </Box>
      </Box>
      <WorkoutOptionModalView
        modalOpen={modalOpen}
        handleModalToggle={handleModalToggle}
        handleSetModalAction={handleSetModalAction}
        modalActionType={modalActionType}
        training={selectedWorkout}
      />
    </LocalizationProvider>
  );
}

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const highlightedDay = highlightedDays.find((highlight) => highlight.date === day.date());
  const isSelected = !outsideCurrentMonth && highlightedDay;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={
        isSelected ? (
          highlightedDay.complete ? (
            <CheckBoxIcon fontSize="small" sx={{ color: "green" }} />
          ) : (
            <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: "red" }} />
          )
        ) : undefined
      }
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}

const Workouts = ({ currentMonth, history, scrollToDate, setSelectedWorkout, handleModalToggle, }) => {
  return (
    <List>
      {history
        .sort((a, b) => a.date > b.date)
        .map((workout) => {
          if (dayjs.utc(new Date(workout.date)).month() === currentMonth) {
            return <Workout key={workout._id} workout={workout} scrollToDate={scrollToDate} setSelectedWorkout={setSelectedWorkout} handleModalToggle={handleModalToggle} />;
          }
          return null;
        })}
    </List>
  );
};

const Workout = ({ workout, scrollToDate, setSelectedWorkout, handleModalToggle, }) => {
  const workoutRef = useRef(null);
  const workoutId = workout._id;
  const to = `/workout/${workoutId}`;
  const theme = useTheme();
  const [isDateSelected, setIsDateSelected] = useState(false);

  const handleScroll = (ref) => {
    const testDate = dayjs(workout.date).utc().format("YYYY-MM-DD");
    const scrollDate = dayjs(scrollToDate).format("YYYY-MM-DD");

    if (testDate === scrollDate) {
      ref.current.parentElement.parentElement.scrollTo({
        top: ref.current.offsetTop,
        left: 0,
        behavior: "smooth",
      });
      setIsDateSelected(true); // Set true when dates match
    } else {
      setIsDateSelected(false); // Set false otherwise
    }
  };

  const handleSelectWorkout = () => {
    setSelectedWorkout(workout);
    handleModalToggle();
  };

  useEffect(() => {
    // When scrollToDate changes, call handleScroll to scroll to the workout
    if (scrollToDate) {
      handleScroll(workoutRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToDate]);

  return (
    <ListItem sx={{ justifyContent: "center" }} ref={workoutRef}>
      <Box
        sx={{
          border: isDateSelected ? `3px solid ${theme.palette.primary.main}` : "1px solid white",
          borderRadius: "5px",
          padding: "2.5px",
          width: "100%",
        }}
      >
        <Accordion>
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
              <Grid container item justifyContent="flex-end">
                <IconButton onClick={handleSelectWorkout}>
                  <SettingsIcon />
                </IconButton>
              </Grid>
              {workout.training.map((workoutSet, workoutSetIndex) => (
                <Grid container key={`${workout._id}-set-${workoutSetIndex}`}>
                  <Grid item xs={12} sx={{ marginLeft: "8px" }}>
                    <Typography variant="body1">Circuit {workoutSetIndex + 1}</Typography>
                  </Grid>
                  {workoutSet.map((exercise, exerciseIndex) => (
                    <Fragment key={`${exercise.exercise.exerciseTitle}-${exerciseIndex}`}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ marginLeft: "16px" }}>
                          {exercise.exercise.exerciseTitle}
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
