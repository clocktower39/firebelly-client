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
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  ArrowBack,
  ArrowForward,
  FitnessCenter as FitnessCenterIcon,
  GridView as GridViewIcon,
  List as ListIcon,
  Search as SearchIcon,
  Today as TodayIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { requestWorkoutsByMonth, requestWorkoutsByYear, serverURL } from "../../Redux/actions";
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
  const [calendarViewMode, setCalendarViewMode] = useState("month");
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

  useEffect(() => {
    if (calendarViewMode !== "year") return;
    let cancelled = false;
    const loadYear = async () => {
      setIsLoading(true);
      const target = view === "client" ? user : client;
      await dispatch(requestWorkoutsByYear(currentYear, target));
      if (!cancelled) {
        setIsLoading(false);
      }
    };
    loadYear();
    return () => {
      cancelled = true;
    };
  }, [calendarViewMode, client, currentYear, dispatch, user, view]);

  const [scrollToDate, setScrollToDate] = useState(dayjs().format("YYYY-MM-DD"));

  const handleDateCalendarChange = (e) => {
    const newDate = dayjs(e);
    setScrollToDate(newDate.format("YYYY-MM-DD"));
    setSelectedDate(newDate);
  };

  const handleYearDaySelect = (day) => {
    handleMonthChange(day);
    handleDateCalendarChange(day);
    setCalendarViewMode("month");
  };

  const handleYearViewChange = (direction) => {
    const nextYear = currentYear + direction;
    const base = selectedDate.year(nextYear);
    setSelectedDate(base);
    setCurrentYear(nextYear);
  };

  const monthWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) =>
        dayjs.utc(workout.date).month() === currentMonth &&
        dayjs.utc(workout.date).year() === currentYear,
    );
  }, [workouts, currentMonth, currentYear]);

  const yearStatusMap = useMemo(() => {
    const statusMap = new Map();
    workouts.forEach((workout) => {
      const workoutDate = dayjs.utc(workout.date);
      if (workoutDate.year() !== currentYear) return;
      const key = workoutDate.format("YYYY-MM-DD");
      const existing = statusMap.get(key);
      if (workout.complete === false) {
        statusMap.set(key, "incomplete");
      } else if (!existing) {
        statusMap.set(key, "complete");
      }
    });
    return statusMap;
  }, [currentYear, workouts]);

  const yearGridDays = useMemo(() => {
    const yearStart = dayjs().year(currentYear).startOf("year").startOf("week");
    const yearEnd = dayjs().year(currentYear).endOf("year").endOf("week");
    const days = [];
    let current = yearStart;
    while (current.isBefore(yearEnd) || current.isSame(yearEnd, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }
    return days;
  }, [currentYear]);

  const yearWeekColumns = useMemo(() => {
    const columns = [];
    yearGridDays.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (!columns[weekIndex]) columns[weekIndex] = [];
      columns[weekIndex].push(day);
    });
    return columns;
  }, [yearGridDays]);

  const yearWorkouts = useMemo(() => {
    return workouts.filter((workout) => dayjs.utc(workout.date).year() === currentYear);
  }, [currentYear, workouts]);

  const categoryOptions = useMemo(() => {
    const source = calendarViewMode === "year" ? yearWorkouts : monthWorkouts;
    const categories = new Set();
    source.forEach((workout) => {
      workout?.category?.forEach((item) => categories.add(item));
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [calendarViewMode, monthWorkouts, yearWorkouts]);

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

    const source = calendarViewMode === "year" ? yearWorkouts : monthWorkouts;
    return [...source]
      .filter((workout) => matchesSearch(workout) && matchesStatus(workout) && matchesCategories(workout))
      .sort((a, b) => {
        if (sortMode === "date-asc") return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
        if (sortMode === "title-asc") return (a.title || "").localeCompare(b.title || "");
        if (sortMode === "title-desc") return (b.title || "").localeCompare(a.title || "");
        return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
      });
  }, [calendarViewMode, categoryFilter, monthWorkouts, yearWorkouts, searchQuery, sortMode, statusFilter]);

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
                value={calendarViewMode}
                exclusive
                size="small"
                onChange={(event, value) => value && setCalendarViewMode(value)}
              >
                <ToggleButton value="month" aria-label="Month view">
                  Month
                </ToggleButton>
                <ToggleButton value="year" aria-label="Year view">
                  Year
                </ToggleButton>
              </ToggleButtonGroup>
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
                Showing {filteredWorkouts.length} of{" "}
                {calendarViewMode === "year" ? yearWorkouts.length : monthWorkouts.length} workouts
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Complete: ${
                    calendarViewMode === "year"
                      ? yearWorkouts.filter((workout) => workout.complete).length
                      : monthWorkouts.filter((workout) => workout.complete).length
                  }`}
                  variant="outlined"
                />
                <Chip
                  label={`Incomplete: ${
                    calendarViewMode === "year"
                      ? yearWorkouts.filter((workout) => !workout.complete).length
                      : monthWorkouts.filter((workout) => !workout.complete).length
                  }`}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Box>
        </Collapse>

        <Collapse in={showCalendar} timeout="auto" unmountOnExit>
          <Box>
            {calendarViewMode === "year" ? (
              <Box sx={{ px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Button size="small" onClick={() => handleYearViewChange(-1)}>
                    <ArrowBack fontSize="small" />
                  </Button>
                  <Typography variant="subtitle1">{currentYear}</Typography>
                  <Button size="small" onClick={() => handleYearViewChange(1)}>
                    <ArrowForward fontSize="small" />
                  </Button>
                </Stack>
                <Box sx={{ overflowX: "auto", mt: 1, pb: 1 }}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {yearWeekColumns.map((week, weekIndex) => (
                      <Stack key={`week-${weekIndex}`} spacing={0.5}>
                        {week.map((day) => {
                          const dayKey = day.format("YYYY-MM-DD");
                          const status = yearStatusMap.get(dayKey);
                          const isCurrentYear = day.year() === currentYear;
                          const isSelected = day.isSame(selectedDate, "day");
                          const fill =
                            status === "complete"
                              ? "primary.main"
                              : status === "incomplete"
                              ? "warning.main"
                              : "transparent";
                          return (
                            <Tooltip
                              key={dayKey}
                              title={
                                status
                                  ? `${day.format("MMM D")}: ${
                                      status === "complete" ? "Completed" : "Incomplete"
                                    }`
                                  : day.format("MMM D")
                              }
                            >
                              <Box
                                onClick={() => handleYearDaySelect(day)}
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 0.5,
                                  backgroundColor: fill,
                                  border: isSelected ? "2px solid" : "1px solid",
                                  borderColor: isSelected ? "primary.dark" : "rgba(148, 163, 184, 0.4)",
                                  opacity: isCurrentYear ? 1 : 0.3,
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Stack>
                    ))}
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Complete
                  </Typography>
                  <Box sx={{ width: 12, height: 12, bgcolor: "primary.main", borderRadius: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Incomplete
                  </Typography>
                  <Box sx={{ width: 12, height: 12, bgcolor: "warning.main", borderRadius: 0.5 }} />
                </Stack>
              </Box>
            ) : (
              <DateCalendar
                value={selectedDate}
                onChange={handleDateCalendarChange}
                loading={isLoading}
                renderLoading={() => <DayCalendarSkeleton />}
                views={["year", "month", "day"]}
                openTo="day"
                slots={{ day: ServerDay }}
                slotProps={{ day: { highlightedDays } }}
                onMonthChange={handleMonthChange}
              />
            )}
          </Box>
        </Collapse>

        <Box sx={{ flex: "1" }}>
          <Workouts
            history={filteredWorkouts}
            scrollToDate={scrollToDate}
            setSelectedWorkout={setSelectedWorkout}
            handleModalToggle={handleModalToggle}
            viewMode={viewMode}
            isYearView={calendarViewMode === "year"}
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

const Workouts = ({ history, scrollToDate, setSelectedWorkout, handleModalToggle, viewMode, isYearView }) => {
  if (!history.length) {
    return (
      <List>
        <ListItem>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {isYearView
              ? "No workouts match your filters for this year."
              : "No workouts match your filters for this month."}
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
      const nav =
        document.querySelector("header.MuiAppBar-root") ||
        document.querySelector(".MuiAppBar-root") ||
        document.querySelector("nav");
      const navHeight = nav?.getBoundingClientRect().height || 0;
      window.scrollTo({
        top: ref.current.getBoundingClientRect().top + window.scrollY - navHeight - 16,
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
