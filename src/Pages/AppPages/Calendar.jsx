import React, { Fragment, useMemo, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { requestWorkoutsByMonth, serverURL } from "../../Redux/actions";
import dayjs from "dayjs";
import {
  LocalizationProvider,
  DateCalendar,
  DayCalendarSkeleton,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { WorkoutOptionModalView } from "../../Components/WorkoutOptionModal";

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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const targetAccount = view === "client" ? user : client;
  const workouts = useSelector((state) => {
    const accountId = targetAccount?._id;
    if (!accountId) return []; // Don't access state.workouts at all
    return state.workouts?.[accountId]?.workouts ?? [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]); // Initialize as an empty array
  const [currentMonth, setCurrentMonth] = useState(dayjs(new Date()).month());
  const [currentYear, setCurrentYear] = useState(dayjs(new Date()).year());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [sortMode, setSortMode] = useState("date-desc");

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
    const date = e ? e.format("YYYY-MM-DD") : dayjs(new Date()).format("YYYY-MM-DD");

    dispatch(requestWorkoutsByMonth(date, view === "client" ? user : client)).then(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    getWorkoutMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHighlightedDays(() => {
      return workouts
        .filter((item) => dayjs.utc(item.date).month() === currentMonth && dayjs.utc(item.date).year() === currentYear)
        .map((item) => ({
          date: dayjs.utc(item.date).date(),
          complete: item.complete,
        }));
    });
  }, [workouts, currentMonth, currentYear]);

  const handleMonthChange = (e) => {
    setCurrentMonth(dayjs(e).month());
    setCurrentYear(dayjs(e).year());
    getWorkoutMonthData(e);
  };

  const [scrollToDate, setScrollToDate] = useState(dayjs().format("YYYY-MM-DD"));

  const handleDateCalendarChange = (e) => {
    const newDate = dayjs(e);
    setScrollToDate(newDate.format("YYYY-MM-DD"));
    setSelectedDate(newDate);
  };

  const monthWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) =>
        dayjs.utc(workout.date).month() === currentMonth &&
        dayjs.utc(workout.date).year() === currentYear,
    );
  }, [workouts, currentMonth, currentYear]);

  const categoryOptions = useMemo(() => {
    const categories = new Set();
    monthWorkouts.forEach((workout) => {
      workout?.category?.forEach((item) => categories.add(item));
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [monthWorkouts]);

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const words = query.split(" ").filter(Boolean);
    const matchesSearch = (workout) => {
      if (!words.length) return true;
      const categories = workout?.category || [];
      const exercises =
        workout?.training?.flatMap((circuit) =>
          circuit.map((exercise) => exercise?.exercise?.exerciseTitle).filter(Boolean),
        ) || [];
      const searchTarget = [workout?.title, ...categories, ...exercises]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return words.every((word) => searchTarget.includes(word));
    };

    const matchesStatus = (workout) => {
      if (statusFilter === "all") return true;
      return statusFilter === "complete" ? workout.complete : !workout.complete;
    };

    const matchesCategories = (workout) => {
      if (!categoryFilter.length) return true;
      const workoutCategories = workout?.category || [];
      return categoryFilter.every((category) => workoutCategories.includes(category));
    };

    return [...monthWorkouts]
      .filter((workout) => matchesSearch(workout) && matchesStatus(workout) && matchesCategories(workout))
      .sort((a, b) => {
        if (sortMode === "date-asc") return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
        if (sortMode === "title-asc") return (a.title || "").localeCompare(b.title || "");
        if (sortMode === "title-desc") return (b.title || "").localeCompare(a.title || "");
        return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
      });
  }, [categoryFilter, monthWorkouts, searchQuery, sortMode, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter([]);
    setSortMode("date-desc");
  };

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setCategoryFilter(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {view === "trainer" && (
        <Grid container size={12} sx={{ justifyContent: "center", padding: "15px 0" }}>
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
            views={["year", "month", "day"]}
            slots={{ day: ServerDay }}
            slotProps={{ day: { highlightedDays } }}
            onMonthChange={handleMonthChange}
          />
        </Box>

        <Box sx={{ px: 2, py: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, }}>
              <TextField
                fullWidth
                label="Search workouts"
                placeholder="Title, muscle group, or exercise"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="All"
                    clickable
                    color={statusFilter === "all" ? "primary" : "default"}
                    variant={statusFilter === "all" ? "filled" : "outlined"}
                    onClick={() => setStatusFilter("all")}
                  />
                  <Chip
                    label="Complete"
                    clickable
                    color={statusFilter === "complete" ? "success" : "default"}
                    variant={statusFilter === "complete" ? "filled" : "outlined"}
                    onClick={() => setStatusFilter("complete")}
                  />
                  <Chip
                    label="Incomplete"
                    clickable
                    color={statusFilter === "incomplete" ? "warning" : "default"}
                    variant={statusFilter === "incomplete" ? "filled" : "outlined"}
                    onClick={() => setStatusFilter("incomplete")}
                  />
                </Stack>
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel id="calendar-category-filter-label">Muscle group</InputLabel>
                  <Select
                    labelId="calendar-category-filter-label"
                    multiple
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    input={<OutlinedInput label="Muscle group" />}
                    renderValue={(selected) =>
                      selected.length ? selected.join(", ") : "Any"
                    }
                  >
                    {categoryOptions.length ? (
                      categoryOptions.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No categories
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }} size="small">
                  <InputLabel id="calendar-sort-label">Sort</InputLabel>
                  <Select
                    labelId="calendar-sort-label"
                    value={sortMode}
                    label="Sort"
                    onChange={(event) => setSortMode(event.target.value)}
                  >
                    <MenuItem value="date-desc">Newest first</MenuItem>
                    <MenuItem value="date-asc">Oldest first</MenuItem>
                    <MenuItem value="title-asc">Title A-Z</MenuItem>
                    <MenuItem value="title-desc">Title Z-A</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" size="small" onClick={handleResetFilters}>
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
            <Typography variant="body2">
              Showing {filteredWorkouts.length} of {monthWorkouts.length} workouts
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`Complete: ${monthWorkouts.filter((workout) => workout.complete).length}`} variant="outlined" />
              <Chip label={`Incomplete: ${monthWorkouts.filter((workout) => !workout.complete).length}`} variant="outlined" />
            </Stack>
          </Stack>
        </Box>

        {/* Workouts List takes the remaining space */}
        <Box sx={{ flex: "1", overflow: "auto" }}>
          <Workouts
            history={filteredWorkouts}
            scrollToDate={scrollToDate}
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

const Workouts = ({ history, scrollToDate, setSelectedWorkout, handleModalToggle }) => {
  return (
    <List>
      {history.length ? (
        history.map((workout) => (
          <Workout
            key={workout._id}
            workout={workout}
            scrollToDate={scrollToDate}
            setSelectedWorkout={setSelectedWorkout}
            handleModalToggle={handleModalToggle}
          />
        ))
      ) : (
        <ListItem>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No workouts match your filters for this month.
          </Typography>
        </ListItem>
      )}
    </List>
  );
};

const Workout = ({ workout, scrollToDate, setSelectedWorkout, handleModalToggle }) => {
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
              <Grid size={12}>
                <Typography variant="h6">{workout?.title}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" sx={{ ml: 2 }}>
                  {dayjs.utc(workout.date).format("MMMM Do, YYYY")}
                </Typography>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ ml: 2 }}>
                    Muscle Group{workout?.category?.length > 1 && "s"}:{" "}
                    {workout?.category?.join(", ")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container size={12}>
              <Grid container size={12} justifyContent="flex-end">
                <IconButton onClick={handleSelectWorkout}>
                  <SettingsIcon />
                </IconButton>
              </Grid>
              {workout.training.map((workoutSet, workoutSetIndex) => (
                <Grid container size={12} key={`${workout._id}-set-${workoutSetIndex}`}>
                  <Grid size={12} sx={{ marginLeft: "8px" }}>
                    <Typography variant="body1">Circuit {workoutSetIndex + 1}</Typography>
                  </Grid>
                  {workoutSet.map((exercise, exerciseIndex) => (
                    <Fragment key={`${exercise?.exercise?.exerciseTitle}-${exerciseIndex}`}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" sx={{ marginLeft: "16px" }}>
                          {exercise?.exercise?.exerciseTitle || "Select an exercise"}
                        </Typography>
                      </Grid>
                      <Grid container size={{ xs: 12, sm: 6 }}>
                        {exerciseTypeFields(exercise.exerciseType).repeating.map((field) => (
                          <Grid size={12} key={field.goalAttribute}>
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
              <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
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
