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
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  FitnessCenter as FitnessCenterIcon,
  GridView as GridViewIcon,
  List as ListIcon,
  Search as SearchIcon,
  Today as TodayIcon,
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
  const [viewMode, setViewMode] = useState("list");
  const [showCalendar, setShowCalendar] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

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
      <Box sx={{ minHeight: "650px", display: "flex", flexDirection: "column" }} data-calendar-scroll>
        <Box sx={{ px: 2, py: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Calendar</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" variant="outlined" onClick={() => setShowCalendar((prev) => !prev)}>
                {showCalendar ? "Hide calendar" : "Show calendar"}
              </Button>
              <Button size="small" variant="outlined" onClick={() => setShowFilters((prev) => !prev)}>
                {showFilters ? "Hide filters" : "Show filters"}
              </Button>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                size="small"
                onChange={(event, value) => value && setViewMode(value)}
              >
                <ToggleButton value="list" aria-label="List view">
                  <ListIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="Grid view">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Box>

        <Collapse in={showFilters} timeout="auto" unmountOnExit>
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
        </Collapse>

        <Collapse in={showCalendar} timeout="auto" unmountOnExit>
          <Box>
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
        </Collapse>

        <Box sx={{ flex: "1" }}>
          <Workouts
            history={filteredWorkouts}
            scrollToDate={scrollToDate}
            setSelectedWorkout={setSelectedWorkout}
            handleModalToggle={handleModalToggle}
            viewMode={viewMode}
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

const Workouts = ({ history, scrollToDate, setSelectedWorkout, handleModalToggle, viewMode }) => {
  if (!history.length) {
    return (
      <List>
        <ListItem>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            No workouts match your filters for this month.
          </Typography>
        </ListItem>
      </List>
    );
  }

  if (viewMode === "grid") {
    return (
      <Grid container spacing={2} sx={{ px: 2, pb: 2 }} alignItems="stretch">
        {history.map((workout) => (
          <Grid key={workout._id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Workout
              workout={workout}
              scrollToDate={scrollToDate}
              setSelectedWorkout={setSelectedWorkout}
              handleModalToggle={handleModalToggle}
              viewMode="grid"
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <List sx={{ px: 1 }}>
      {history.map((workout) => (
        <Workout
          key={workout._id}
          workout={workout}
          scrollToDate={scrollToDate}
          setSelectedWorkout={setSelectedWorkout}
          handleModalToggle={handleModalToggle}
          viewMode="list"
        />
      ))}
    </List>
  );
};

const Workout = ({ workout, scrollToDate, setSelectedWorkout, handleModalToggle, viewMode }) => {
  const workoutRef = useRef(null);
  const workoutId = workout._id;
  const to = `/workout/${workoutId}`;
  const theme = useTheme();
  const [isDateSelected, setIsDateSelected] = useState(false);
  const totalExercises =
    workout?.training?.reduce((count, circuit) => count + circuit.length, 0) || 0;
  const categories = workout?.category || [];
  const previewExercises =
    workout?.training?.flatMap((circuit) =>
      circuit.map((exercise) => exercise?.exercise?.exerciseTitle).filter(Boolean),
    ) || [];
  const previewList = previewExercises.slice(0, 3);

  const handleScroll = (ref) => {
    const testDate = dayjs(workout.date).utc().format("YYYY-MM-DD");
    const scrollDate = dayjs(scrollToDate).format("YYYY-MM-DD");

    if (testDate === scrollDate) {
    const scrollContainer = ref.current?.closest("[data-calendar-scroll]");
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
      scrollContainer.scrollTo({
        top: ref.current.offsetTop,
        left: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: ref.current.getBoundingClientRect().top + window.scrollY - 16,
        behavior: "smooth",
      });
    }
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

  const Wrapper = viewMode === "grid" ? Box : ListItem;
  const wrapperProps =
    viewMode === "grid"
      ? { sx: { width: "100%" }, ref: workoutRef }
      : {
          sx: { justifyContent: "center", alignItems: "stretch", px: 1 },
          ref: workoutRef,
          disableGutters: false,
        };

  return (
    <Wrapper {...wrapperProps}>
      <Card
        elevation={isDateSelected ? 6 : 2}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: isDateSelected ? `2px solid ${theme.palette.primary.main}` : "1px solid transparent",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.palette.primary.light}22, ${theme.palette.background.paper} 65%)`,
          "&::before": {
            content: "\"\"",
            position: "absolute",
            top: 0,
            left: 0,
            width: "6px",
            height: "100%",
            background: workout.complete
              ? theme.palette.success.main
              : theme.palette.warning.main,
          },
        }}
      >
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h6">{workout?.title}</Typography>
              <Typography variant="caption" sx={{ display: "block", opacity: 0.8 }}>
                {dayjs.utc(workout.date).format("MMMM Do, YYYY")}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={workout.complete ? "Complete" : "Incomplete"}
              color={workout.complete ? "success" : "warning"}
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip
              size="small"
              icon={<TodayIcon fontSize="small" />}
              label={`${totalExercises} exercise${totalExercises !== 1 ? "s" : ""}`}
            />
            <Chip
              size="small"
              icon={<FitnessCenterIcon fontSize="small" />}
              label={`${workout.training.length} circuit${workout.training.length !== 1 ? "s" : ""}`}
            />
            {categories.length ? (
              categories.slice(0, 3).map((category) => (
                <Chip key={category} size="small" variant="outlined" label={category} />
              ))
            ) : (
              <Chip size="small" variant="outlined" label="No categories" />
            )}
          </Stack>
          {previewList.length ? (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {previewList.join(" • ")}
              {previewExercises.length > previewList.length ? " • ..." : ""}
            </Typography>
          ) : null}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "space-between", px: 2, mt: "auto" }}>
          <Button size="small" variant="text" onClick={handleSelectWorkout} startIcon={<SettingsIcon />}>
            Options
          </Button>
          <Button size="small" variant="outlined" component={Link} to={to}>
            Open workout
          </Button>
        </CardActions>
        <Accordion sx={{ boxShadow: "none", background: "transparent" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container size={12}>
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
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Card>
    </Wrapper>
  );
};
