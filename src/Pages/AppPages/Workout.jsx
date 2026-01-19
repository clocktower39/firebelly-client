import React, { useCallback, useState, useEffect, useRef, Fragment, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import deepEqual from "fast-deep-equal/react";
import { debounce } from "lodash";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Slide,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack, Close as CloseIcon, Settings } from "@mui/icons-material";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import { WorkoutOptionModalView } from "../../Components/WorkoutOptionModal";
import { requestTraining, updateTraining, getExerciseList, requestExerciseProgress, serverURL } from "../../Redux/actions";
import Loading from "../../Components/Loading";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const classes = {
  modalStyle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  },
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
};

export const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Workout({ socket }) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isLocalUpdate = useRef(true);
  const hasSynced = useRef(false);

  const user = useSelector((state) => state.user);
  const training = useSelector((state) => state.training);
  const [size = 900, setBorderHighlight] = useOutletContext();

  const isPersonalWorkout = useCallback(
    () => user._id.toString() === training?.user?._id?.toString(),
    [user._id, training?.user?._id]
  );

  const [localTraining, setLocalTraining] = useState([]);
  const [trainingCategory, setTrainingCategory] = useState([]);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [workoutCompleteStatus, setWorkoutCompleteStatus] = useState(training?.complete || false);
  const [loading, setLoading] = useState(true);
  const [workoutFeedback, setWorkoutFeedback] = useState(training?.workoutFeedback || { difficulty: 1, comments: [] });
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scheduleEvent, setScheduleEvent] = useState(null);

  // ---------------------- Dirty check infra (baseline + normalize + composite) ----------------------
  const baselineRef = useRef(null);

  const normalize = useCallback((obj) => {
    // Create a structured clone; if not supported, JSON clone is fine for plain data
    const clone = typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj ?? {}));

    // Drop volatile fields you don't want affecting dirtiness
    delete clone?._id;
    delete clone?.user; // or keep only user._id if you care about assignment changes

    // Normalize arrays for stable compare
    if (Array.isArray(clone?.training)) {
      clone.training = clone.training.map((block) =>
        Array.isArray(block)
          ? block.map((set) => {
            // Normalize exercise refs to id strings when present
            if (set?.exercise && typeof set.exercise === "object" && set.exercise._id) {
              set.exercise = String(set.exercise._id);
            }
            return set;
          })
          : block
      );
    }

    if (Array.isArray(clone?.category)) {
      clone.category = [...clone.category].map(String).sort((a, b) => a.localeCompare(b));
    }

    if (clone?.workoutFeedback?.comments) {
      clone.workoutFeedback.comments = clone.workoutFeedback.comments.map((c) => ({
        ...c,
        _id: undefined, // ignore DB ids
        timestamp: c?.timestamp ? new Date(c.timestamp).toISOString() : null,
      }));
    }

    clone.complete = !!clone.complete;
    clone.title = clone.title ?? "";
    clone.category = clone.category ?? [];
    clone.workoutFeedback = clone.workoutFeedback ?? { difficulty: 1, comments: [] };
    clone.training = clone.training ?? [];

    return clone;
  }, []);

  const buildLocalComposite = useCallback(() => ({
    title: trainingTitle,
    category: trainingCategory,
    complete: workoutCompleteStatus,
    workoutFeedback,
    training: localTraining,
  }), [trainingTitle, trainingCategory, workoutCompleteStatus, workoutFeedback, localTraining]);

  // Hydrate locals when Redux training changes and set the baseline snapshot
  useEffect(() => {
    if (!training) return;

    // Optional: hydrate local UI from Redux when workout is loaded/switched
    setLocalTraining(training.training ?? []);
    setTrainingCategory(training.category ?? []);
    setTrainingTitle(training.title ?? "");
    setWorkoutCompleteStatus(!!training.complete);
    setWorkoutFeedback(training.workoutFeedback ?? { difficulty: 1, comments: [] });

    baselineRef.current = normalize({
      title: training.title ?? "",
      category: training.category ?? [],
      complete: !!training.complete,
      workoutFeedback: training.workoutFeedback ?? { difficulty: 1, comments: [] },
      training: training.training ?? [],
    });

    setLoading(false);
  }, [training, normalize]);

  useEffect(() => {
    const eventId = new URLSearchParams(location.search).get("event");
    const workoutId = params._id;

    if (!eventId && !workoutId) {
      setScheduleEvent(null);
      return;
    }

    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const url = eventId ? `${serverURL}/schedule/event` : `${serverURL}/schedule/event/by-workout`;
    const body = eventId ? { _id: eventId } : { workoutId };

    fetch(url, {
      method: "post",
      dataType: "json",
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.event) {
          setScheduleEvent(data.event);
        } else {
          setScheduleEvent(null);
        }
      })
      .catch(() => setScheduleEvent(null));
  }, [location.search, params._id]);

  // Compute isDirty by comparing normalized local composite vs. baseline snapshot
  const isDirty = useMemo(() => {
    if (!baselineRef.current) return false;
    const localComposite = buildLocalComposite();
    return !deepEqual(baselineRef.current, normalize(localComposite));
  }, [buildLocalComposite, normalize, trainingTitle, trainingCategory, workoutCompleteStatus, workoutFeedback, localTraining]);

  // Save handler — replace with your thunk/API call
  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = buildLocalComposite();

      // TODO: dispatch your save thunk here, e.g. dispatch(saveTraining(payload))
      await new Promise((r) => setTimeout(r, 500)); // simulate IO

      // After successful save, update baseline so button returns to clean immediately
      baselineRef.current = normalize(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------------------------------


  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps);
  };

  const handleTitleChange = (e) => {
    setTrainingTitle(e.target.value);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  const handleAddExerciseOpen = () => setAddExerciseOpen(true);
  const handleAddExerciseClose = () => setAddExerciseOpen(false);

  const categories = [
    "Abdominals",
    "Back",
    "Biceps",
    "Calves",
    "Chest",
    "Core",
    "Forearms",
    "Full Body",
    "Hamstrings",
    "Legs",
    "Quadriceps",
    "Shoulders",
    "Triceps",
  ];

  const newExercise = (index) => {
    handleAddExerciseOpen();
  };

  // Create a new exercise on the current set
  const confirmedNewExercise = (
    index,
    selectedExercises,
    setSelectedExercises,
    setCount,
    setSelectedExercisesSetCount,
    selectedHistoryByExercise,
    exerciseList,
  ) => {
    if (selectedExercises.length > 0) {
      const newTraining = localTraining.map((group, i) => {
        if (index === i) {
          selectedExercises.forEach((exercise) => {
            const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
            const history = reduxExercise?.history?.[user._id] || [];
            const selectedHistoryId = selectedHistoryByExercise?.[exercise._id];
            const selectedHistory =
              history.find((item) => item._id === selectedHistoryId) ||
              history[history.length - 1];
            const achieved = selectedHistory?.achieved || {};
            const normalizeToSets = (values) => {
              const source = Array.isArray(values) ? values : [];
              return Array.from({ length: setCount }, (_, idx) => source[idx] ?? 0);
            };
            group.push({
              exercise: exercise,
              exerciseType: "Reps",
              goals: {
                sets: setCount,
                minReps: Array(setCount).fill(0),
                maxReps: Array(setCount).fill(0),
                exactReps: normalizeToSets(achieved.reps),
                weight: normalizeToSets(achieved.weight),
                percent: normalizeToSets(achieved.percent),
                seconds: normalizeToSets(achieved.seconds),
              },
              achieved: {
                sets: 0,
                reps: Array(setCount).fill(0),
                weight: Array(setCount).fill(0),
                percent: Array(setCount).fill(0),
                seconds: Array(setCount).fill(0),
              },
            });
          });
        }
        return group;
      });
      dispatch(
        updateTraining(training._id, {
          ...training,
          category: [...trainingCategory],
          training: [...newTraining],
        })
      );
    }
    setSelectedExercises([]);
    setSelectedExercisesSetCount(4);
    handleAddExerciseClose();
  };

  // Create a new set on the current day
  const newSet = () => {
    setLocalTraining((prev) => {
      prev.push([]);
      return prev;
    });
    setToggleNewSet((prev) => !prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    if (localTraining.length > 1) {
      setLocalTraining((prev) => prev.filter((item, index) => index !== setIndex));
      setToggleRemoveSet((prev) => !prev);
    }
  };

  // Remove the current exercise
  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = localTraining.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = async () => {
    dispatch(
      updateTraining(training._id, {
        ...training,
        title: trainingTitle,
        category: [...trainingCategory],
        training: localTraining,
        complete: workoutCompleteStatus,
        workoutFeedback: workoutFeedback,
      })
    ).then(() => {
      socket.emit("liveTrainingUpdate", {
        workoutId: params._id,
        updatedTraining: localTraining,
      });
    });
  };

  useEffect(() => {
    dispatch(getExerciseList());
  }, [dispatch]);

  useEffect(() => {
    setLocalTraining([]);
    setLoading(true);

    dispatch(requestTraining(params._id)).then(() => {
      setLoading(false);
    });
  }, [params, dispatch, user._id]);

  useEffect(() => {
    setLocalTraining(training.training || []);
    setTrainingCategory(training.category && training.category.length > 0 ? training.category : []);
    setTrainingTitle(training.title || "");
    setWorkoutCompleteStatus(training?.complete || false);
    setWorkoutFeedback(training?.workoutFeedback || { difficulty: 1, comments: [] });
    if (training?.user?._id) {
      setBorderHighlight(!isPersonalWorkout());
    }
  }, [isPersonalWorkout, setBorderHighlight, training]);

  ///////////////////////////////
  // 1. Join Room & Request State
  ///////////////////////////////
  useEffect(() => {
    if (socket && params._id) {
      // Join the workout room.
      socket.emit("joinWorkout", { workoutId: params._id });
      // Immediately ask any existing clients for their current state.
      socket.emit("requestCurrentState", { workoutId: params._id });
    }
    return () => {
      if (socket && params._id) {
        socket.emit("leaveWorkout", { workoutId: params._id });
      }
    };
  }, [socket, params._id]);

  ///////////////////////////////
  // 2. Handshake: Listen for Current State
  ///////////////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleCurrentState = (currentState) => {
      // Only update if we haven’t already synced.
      if (!hasSynced.current) {
        setLocalTraining(currentState);
        hasSynced.current = true;
        // You can also log here if needed.
        console.log("Synced from handshake:", currentState);
      }
    };

    socket.on("currentState", handleCurrentState);
    return () => {
      socket.off("currentState", handleCurrentState);
    };
  }, [socket]);

  ///////////////////////////////
  // 3. Timeout: Mark as Synced If No Handshake Arrives
  ///////////////////////////////
  useEffect(() => {
    if (!socket || !params._id) return;
    // If no handshake is received within 2 seconds, allow local emissions.
    const timer = setTimeout(() => {
      if (!hasSynced.current) {
        hasSynced.current = true;
        console.log("No handshake received, marking as synced.");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [socket, params._id]);

  ///////////////////////////////
  // 4. Listen for Live Training Updates
  ///////////////////////////////
  useEffect(() => {
    if (!socket) return;

    const handleLiveUpdate = (updatedTraining) => {
      // This update is coming from another client.
      isLocalUpdate.current = false;
      setLocalTraining(updatedTraining);
    };

    socket.on("liveTrainingUpdate", handleLiveUpdate);
    return () => {
      socket.off("liveTrainingUpdate", handleLiveUpdate);
    };
  }, [socket]);

  ///////////////////////////////
  // 5. Debounced Emission for Local Updates
  ///////////////////////////////
  useEffect(() => {
    if (!socket || !params._id) return;

    // If the change came from a remote update, skip emitting.
    if (!isLocalUpdate.current) {
      isLocalUpdate.current = true;
      return;
    }
    // If we haven't yet been synced by an existing client, do not emit.
    if (!hasSynced.current) return;

    const debouncedEmit = debounce(() => {
      socket.emit("liveTrainingUpdate", {
        workoutId: params._id,
        updatedTraining: localTraining,
      });
      console.log("Emitted live update", localTraining);
    }, 1000); // 1-second debounce

    debouncedEmit();

    return () => {
      debouncedEmit.cancel();
    };
  }, [localTraining, socket, params._id]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : training._id ? (
        <>
          <WorkoutOptionModalView
            modalOpen={modalOpen}
            handleModalToggle={handleModalToggle}
            handleSetModalAction={handleSetModalAction}
            modalActionType={modalActionType}
            training={training}
            setLocalTraining={setLocalTraining}
          />
          {training._id ? (
            <>
              <Grid
                container
                sx={{
                  justifyContent: "flex-start",
                  minHeight: "100%",
                  paddingTop: "15px",
                }}
              >
                {!isPersonalWorkout() && training.user.firstName && (
                  <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                    <Avatar
                      src={
                        training?.user?.profilePicture &&
                        `${serverURL}/user/profilePicture/${training.user.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={training?.user ? `${training?.user.firstName[0]} ${training?.user.lastName[0]}` : 'loading'}
                    />
                    <Typography variant="h5">
                      {training?.user.firstName} {training?.user.lastName}
                    </Typography>
                  </Grid>
                )}
                <Grid container size={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                  {training.date ? (
                    <IconButton
                      onClick={async () => {
                        const isToday = dayjs.utc(training.date).format("YYYY-MM-DD") ===
                          dayjs(new Date()).format("YYYY-MM-DD");

                        const link =
                          isPersonalWorkout()
                            ? `/?date=${dayjs.utc(training.date).format("YYYYMMDD")}`
                            : `/?date=${dayjs.utc(training.date).format("YYYYMMDD")}&client=${training.user._id}`;
                        // Navigate after saving
                        await save();
                        navigate(link);
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => {
                        save();
                        navigate("/sessions");
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  )}
                </Grid>
                <Grid size={10} container sx={{ justifyContent: "center" }}>
                  <Typography variant="h5">
                    {training.date
                      ? dayjs.utc(training.date).format("MMMM Do, YYYY")
                      : "Queued Workout"}
                  </Typography>
                </Grid>
                <Grid size={1} container sx={{ justifyContent: "center", alignItems: "center" }}>
                  <Tooltip title="Workout Settings">
                    <IconButton variant="contained" onClick={handleModalToggle}>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {scheduleEvent && (
                  <Grid container size={12} sx={{ justifyContent: "center", paddingTop: "5px" }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                      <Chip
                        label={scheduleEvent.eventType}
                        color={
                          scheduleEvent.eventType === "APPOINTMENT"
                            ? "primary"
                            : scheduleEvent.eventType === "INDEPENDENT"
                            ? "secondary"
                            : "info"
                        }
                        size="small"
                      />
                      <Chip label={scheduleEvent.status} size="small" />
                      <Chip
                        label={`${dayjs(scheduleEvent.startDateTime).format("h:mm A")} - ${dayjs(
                          scheduleEvent.endDateTime
                        ).format("h:mm A")}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Grid>
                )}

                <Grid container size={12} spacing={2} sx={{ paddingTop: "15px" }}>
                  <Grid size={12} container alignContent="center">
                    <TextField
                      label="Title"
                      placeholder="Workout Title"
                      value={trainingTitle}
                      onChange={handleTitleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12} container sx={classes.TrainingCategoryInputContainer}>
                    <Grid size={12} container alignContent="center">
                      <Autocomplete
                        disableCloseOnSelect
                        value={trainingCategory}
                        fullWidth
                        multiple
                        id="tags-filled"
                        defaultValue={trainingCategory.map((category) => category)}
                        options={categories.map((option) => option)}
                        freeSolo
                        onChange={(e, getTagProps) => handleTrainingCategory(getTagProps)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                              <Chip key={`${option}-${index}`} variant="outlined" label={option} {...tagProps} />
                            )
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Muscle Groups"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: <>{params.InputProps.endAdornment}</>,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ margin: "25px 0px" }} />
                </Grid>
                {training.training.length > 0 && (
                  <SwipeableSet
                    workoutUser={training.user}
                    newExercise={newExercise}
                    newSet={newSet}
                    removeSet={removeSet}
                    removeExercise={removeExercise}
                    localTraining={localTraining}
                    setLocalTraining={setLocalTraining}
                    save={save}
                    toggleNewSet={toggleNewSet}
                    toggleRemoveSet={toggleRemoveSet}
                    maxSteps={localTraining.length + 1}
                    selectedDate={training.date}
                    size={size}
                    workoutCompleteStatus={workoutCompleteStatus}
                    setWorkoutCompleteStatus={setWorkoutCompleteStatus}
                    workoutFeedback={workoutFeedback}
                    setWorkoutFeedback={setWorkoutFeedback}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                )}
              </Grid>
              <Grid
                container
                size={12}
                sx={{
                  alignContent: "flex-end",
                  "&.MuiGrid-root": { flexGrow: 1 },
                  paddingBottom: "5px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={save}
                  fullWidth
                  disabled={loading}
                  color={isDirty ? "warning" : "primary"}
                >
                  Save
                </Button>
              </Grid>

              <AddExercisesDialog
                user={training.user}
                addExerciseOpen={addExerciseOpen}
                handleAddExerciseClose={handleAddExerciseClose}
                confirmedNewExercise={confirmedNewExercise}
                activeStep={activeStep}
              />
            </>
          ) : (
            <Grid
              container
              size={12}
              sx={{
                justifyContent: "center",
                alignContent: "center",
                flexGrow: 1,
              }}
            >
              <Button variant="contained" onClick={() => null}>
                Create Workout
              </Button>
            </Grid>
          )}
        </>
      ) : (
        <>Workout does not exist</>
      )}
    </>
  );
}

export const ExerciseListAutocomplete = ({ exerciseList, selectedExercises, setSelectedExercises, disableCloseOnSelect = false, }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const matchWords = (option, inputValue) => {
    if (!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  return (
    <Autocomplete
      multiple
      fullWidth
      value={selectedExercises}
      options={exerciseList
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option)}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => option.exerciseTitle}
      onChange={(e, newSelection) => {
        setSelectedExercises(newSelection);

        // Find newly added exercise
        const newExercise = newSelection.find(
          (ex) => !selectedExercises.some((sel) => sel._id === ex._id)
        );

        if (newExercise) {
          dispatch(requestExerciseProgress(newExercise, user));
        }
      }}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) => matchWords(option.exerciseTitle, inputValue))
      }
      renderValue={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option._id}
            variant="outlined"
            label={option.exerciseTitle}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Search" placeholder="Exercises" />}
      disableCloseOnSelect={disableCloseOnSelect}
    />
  );
};

const AddExercisesDialog = ({ addExerciseOpen, handleAddExerciseClose, confirmedNewExercise, activeStep, user, }) => {
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedExercisesSetCount, setSelectedExercisesSetCount] = useState(4);
  const [selectedHistoryByExercise, setSelectedHistoryByExercise] = useState({});

  const handleSelectedExercisesSetCountChange = (e) =>
    setSelectedExercisesSetCount(Number(e.target.value));

  useEffect(() => {
    setSelectedHistoryByExercise((prev) => {
      const next = { ...prev };
      selectedExercises.forEach((exercise) => {
        if (next[exercise._id] !== undefined) return;
        const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
        const history = reduxExercise?.history?.[user._id] || [];
        next[exercise._id] = history.length > 0 ? history[history.length - 1]._id : "";
      });
      Object.keys(next).forEach((exerciseId) => {
        if (!selectedExercises.some((exercise) => exercise._id === exerciseId)) {
          delete next[exerciseId];
        }
      });
      return next;
    });
  }, [exerciseList, selectedExercises, user._id]);

  const formatHistoryLabel = (historyItem) => {
    if (!historyItem) return "No history";
    const achieved = historyItem.achieved || {};
    const weight = Array.isArray(achieved.weight) ? achieved.weight.filter(Boolean) : [];
    const reps = Array.isArray(achieved.reps) ? achieved.reps.filter(Boolean) : [];
    const seconds = Array.isArray(achieved.seconds) ? achieved.seconds.filter(Boolean) : [];
    const percent = Array.isArray(achieved.percent) ? achieved.percent.filter(Boolean) : [];
    const details = [];
    if (reps.length) details.push(`${reps.join(", ")} reps`);
    if (weight.length) details.push(`${weight.join(", ")} lb`);
    if (seconds.length) details.push(`${seconds.join(", ")} sec`);
    if (percent.length) details.push(`${percent.join(", ")}%`);
    const summary = details.length ? ` • ${details.join(" | ")}` : "";
    return `${dayjs(historyItem.date).format("MM/DD/YYYY")}${summary}`;
  };

  return (
    <Dialog
      open={addExerciseOpen}
      TransitionComponent={Transition}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          height: "80%",
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleAddExerciseClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add Exercises
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              confirmedNewExercise(
                activeStep,
                selectedExercises,
                setSelectedExercises,
                selectedExercisesSetCount,
                setSelectedExercisesSetCount,
                selectedHistoryByExercise,
                exerciseList
              )
            }
          >
            Confirm
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid container size={12}>
            <ExerciseListAutocomplete
              exerciseList={exerciseList}
              selectedExercises={selectedExercises}
              setSelectedExercises={setSelectedExercises}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Sets"
              select
              SelectProps={{ native: true }}
              fullWidth
              value={selectedExercisesSetCount}
              onChange={handleSelectedExercisesSetCountChange}
            >
              {[...Array(21)].map((x, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </TextField>

            {selectedExercises.length > 0 && (
              <List sx={{ bgcolor: "background.paper", width: "100%" }}>
                {selectedExercises.map((exercise, exerciseIndex, exercises) => {
                  const reduxExercise = exerciseList.find((ex) => ex._id === exercise._id);
                  const history = reduxExercise?.history?.[user._id];
                  const historyOptions = history ? history.slice(history.length - 3, history.length) : [];

                  return (
                    <Fragment key={`${exercise.exerciseTitle}-${exerciseIndex}`} >
                      <ListItem >
                        <Stack spacing={1} sx={{ width: "100%" }}>
                          <Typography variant="subtitle1">{exercise?.exerciseTitle}</Typography>
                          {historyOptions.length > 0 ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Use previous achieved</InputLabel>
                              <Select
                                label="Use previous achieved"
                                value={selectedHistoryByExercise[exercise._id] ?? ""}
                                onChange={(event) =>
                                  setSelectedHistoryByExercise((prev) => ({
                                    ...prev,
                                    [exercise._id]: event.target.value,
                                  }))
                                }
                              >
                                {historyOptions.map((historyItem) => (
                                  <MenuItem key={historyItem._id} value={historyItem._id}>
                                    {formatHistoryLabel(historyItem)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No recent history for this exercise.
                            </Typography>
                          )}
                        </Stack>
                      </ListItem>
                      {exerciseIndex !== exercises.length - 1 && <Divider component="li" />}
                    </Fragment>
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
