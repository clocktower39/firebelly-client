import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  rectIntersection, // works better for circuits
  closestCorners, // works better for exercises
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { DragHandle as DragHandleIcon, Settings } from "@mui/icons-material";
import { updateTraining, createTraining } from "../../Redux/actions";
import { WorkoutOptionModalView } from "../WorkoutOptionModal";

const WORKOUT_TYPES = [
  { label: "Strength", value: "Strength", enabled: true },
  { label: "Cardio", value: "Cardio", enabled: true },
  { label: "Yoga", value: "Yoga", enabled: false, hint: "Coming soon" },
  { label: "Pilates", value: "Pilates", enabled: false, hint: "Coming soon" },
  { label: "Sports", value: "Sports", enabled: false, hint: "Coming soon" },
];

const CARDIO_PREVIEW_DEFAULTS = {
  activity: "Run",
  style: "",
  distance: "",
  distanceUnit: "mi",
  duration: "",
  avgPace: "",
  avgSpeed: "",
  routeType: "",
  surface: "",
  elevationGain: "",
  weather: "",
  temperature: "",
  temperatureUnit: "F",
  rpe: "",
  hrZone: "",
  notes: "",
  segments: [],
};

const hasCardioPreviewValue = (value) =>
  !(value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0));

const normalizeCardioPreviewFields = (cardioFields) => {
  const source = cardioFields && typeof cardioFields === "object" ? cardioFields : {};
  return {
    ...CARDIO_PREVIEW_DEFAULTS,
    ...source,
    segments: Array.isArray(source.segments) ? source.segments : [],
  };
};

const normalizeCardioPreview = (cardio) => {
  const source = cardio && typeof cardio === "object" ? cardio : {};
  if (source.plan || source.actual) {
    return {
      plan: normalizeCardioPreviewFields(source.plan),
      actual: normalizeCardioPreviewFields(source.actual),
    };
  }

  return {
    plan: normalizeCardioPreviewFields(source),
    actual: normalizeCardioPreviewFields({}),
  };
};

const isCardioPreviewEmpty = (cardioFields) =>
  ![
    cardioFields?.style,
    cardioFields?.distance,
    cardioFields?.duration,
    cardioFields?.avgPace,
    cardioFields?.avgSpeed,
    cardioFields?.routeType,
    cardioFields?.surface,
    cardioFields?.weather,
    cardioFields?.temperature,
    cardioFields?.rpe,
    cardioFields?.hrZone,
    cardioFields?.notes,
    cardioFields?.segments?.length,
  ].some((value) => hasCardioPreviewValue(value));

const parseCardioPreviewDurationToSeconds = (value) => {
  if (!hasCardioPreviewValue(value)) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parts = text.split(":").map((part) => Number(part.trim()));
  if (parts.some((part) => Number.isNaN(part))) return null;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 1) {
    return parts[0] * 60;
  }

  return null;
};

const formatCardioPreviewPace = (secondsPerUnit) => {
  if (!Number.isFinite(secondsPerUnit) || secondsPerUnit <= 0) return "";
  const totalSeconds = Math.round(secondsPerUnit);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getCardioPreviewPaceUnit = (activity, distanceUnit) => {
  if (activity === "Swim") {
    return distanceUnit === "yd" ? "min/100yd" : "min/100m";
  }
  return distanceUnit === "km" ? "min/km" : "min/mi";
};

const getCardioPreviewSpeedUnit = (distanceUnit) => {
  if (distanceUnit === "km") return "km/h";
  if (distanceUnit === "mi") return "mph";
  return "";
};

const getCardioPreviewMetric = (cardioFields) => {
  const paceUnit = getCardioPreviewPaceUnit(cardioFields.activity, cardioFields.distanceUnit);
  const speedUnit = getCardioPreviewSpeedUnit(cardioFields.distanceUnit);
  const prefersSpeed = ["Bike", "Kayak"].includes(cardioFields.activity);
  const distance = Number(cardioFields.distance);
  const durationSeconds = parseCardioPreviewDurationToSeconds(cardioFields.duration);

  if (prefersSpeed && hasCardioPreviewValue(cardioFields.avgSpeed)) {
    return { label: "Avg speed", value: `${cardioFields.avgSpeed} ${speedUnit}`.trim() };
  }

  if (hasCardioPreviewValue(cardioFields.avgPace)) {
    return { label: cardioFields.activity === "Swim" ? "Pace /100" : "Avg pace", value: `${cardioFields.avgPace} ${paceUnit}` };
  }

  if (hasCardioPreviewValue(cardioFields.avgSpeed)) {
    return { label: "Avg speed", value: `${cardioFields.avgSpeed} ${speedUnit}`.trim() };
  }

  if (!Number.isFinite(distance) || distance <= 0 || !durationSeconds) {
    return { label: prefersSpeed ? "Avg speed" : cardioFields.activity === "Swim" ? "Pace /100" : "Avg pace", value: "—" };
  }

  if (prefersSpeed && speedUnit) {
    return {
      label: "Avg speed",
      value: `${(distance / (durationSeconds / 3600)).toFixed(2)} ${speedUnit}`,
    };
  }

  const secondsPerUnit = cardioFields.activity === "Swim" ? durationSeconds / (distance / 100) : durationSeconds / distance;
  const paceValue = formatCardioPreviewPace(secondsPerUnit);
  return {
    label: cardioFields.activity === "Swim" ? "Pace /100" : "Avg pace",
    value: paceValue ? `${paceValue} ${paceUnit}` : "—",
  };
};

const formatCardioPreviewTemperature = (temperature, unit) => {
  if (!hasCardioPreviewValue(temperature)) return "";
  return unit ? `${temperature} ${unit}` : `${temperature}`;
};

const truncateCardioPreviewText = (value, maxLength = 150) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
};

// Helper to find an exercise's current location in localWorkouts
const findExerciseLocationByExerciseId = (workouts, exerciseId) => {
  for (let workoutIndex = 0; workoutIndex < workouts.length; workoutIndex += 1) {
    const workout = workouts[workoutIndex];
    if (!workout?.training) continue;

    for (let circuitIndex = 0; circuitIndex < workout.training.length; circuitIndex += 1) {
      const circuit = workout.training[circuitIndex];
      if (!Array.isArray(circuit)) continue;

      for (let exerciseIndex = 0; exerciseIndex < circuit.length; exerciseIndex += 1) {
        const exercise = circuit[exerciseIndex];
        if (exercise && exercise._id === exerciseId) {
          return { workoutIndex, circuitIndex, exerciseIndex };
        }
      }
    }
  }

  return null;
};

function SortableExercise({ id, index, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    index,
    animateLayoutChanges: (args) => (args.isSorting ? false : defaultAnimateLayoutChanges(args)),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes, isDragging)}
    </div>
  );
}

function SortableCircuit({ id, index, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    index,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes, isDragging)}
    </div>
  );
}

export default function WorkoutOverview({
  selectedDate,
  localWorkouts,
  setLocalWorkouts,
  handleCancelEdit,
  workoutOptionModalViewProps,
  user,
}) {
  const {
    modalOpen,
    handleModalToggle,
    handleSetModalAction,
    modalActionType,
    openCreateWorkoutDialog,
    handleOpenCreateWorkoutDialog,
    handleCloseCreateWorkoutDialog,
    setSelectedDate,
  } = workoutOptionModalViewProps;
  const dispatch = useDispatch();
  const [selectedWorkout, setSelectedWorkout] = useState({});
  const [viewModes, setViewModes] = useState(
    localWorkouts.reduce((acc, workout) => {
      acc[workout._id] = workout.complete ? "achieved" : "goals";
      return acc;
    }, {})
  );
  const [activeId, setActiveId] = useState(null);
  const [newWorkoutType, setNewWorkoutType] = useState("Strength");

  const handleViewToggleChange = (workoutId, newViewMode) => {
    if (newViewMode !== null) {
      setViewModes((prev) => ({
        ...prev,
        [workoutId]: newViewMode,
      }));
    }
  };

  // Save and start workout
  const saveStart = (training) => {
    const localTraining = localWorkouts.filter((w) => w._id === training._id);
    dispatch(
      updateTraining(training._id, {
        ...training,
        title: training.title,
        category: training.category,
        training: localTraining[0].training,
      })
    );
  };

  // Create new workout
  const handleAddWorkout = () =>
    dispatch(
      createTraining({
        training: {
          date: selectedDate,
          workoutType: newWorkoutType,
        },
        user,
      })
    );

  useEffect(() => {
    if (openCreateWorkoutDialog) {
      setNewWorkoutType("Strength");
    }
  }, [openCreateWorkoutDialog]);

  useEffect(() => {
    setViewModes(
      localWorkouts.reduce((acc, workout) => {
        acc[workout._id] = workout.complete ? "achieved" : "goals";
        return acc;
      }, {})
    );
  }, [localWorkouts]);

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [draggedItem, setDraggedItem] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeCircuit, setActiveCircuit] = useState(null);

  const flattenedCircuits = useMemo(
    () =>
      localWorkouts.reduce((acc, workout) => {
        const workoutCircuits = workout.training.map((_, idx) => `circuit-${workout._id}-${idx}`);
        return acc.concat(workoutCircuits);
      }, []),
    [localWorkouts]
  );

  const handleDragStart = ({ active }) => {
    setDraggedItem(active.id);

    // Find and store the active exercise data for DragOverlay
    if (active.id.startsWith("exercise-")) {
      const parts = active.id.split("-");
      const workoutId = parts[1];
      const circuitIndex = parseInt(parts[2]);

      const workout = localWorkouts.find((w) => w._id === workoutId);
      if (workout) {
        const circuit = workout.training[circuitIndex];
        const exerciseIndex = circuit.findIndex(
          (ex, idx) => `exercise-${workoutId}-${circuitIndex}-${ex._id}-${idx}` === active.id
        );
        if (exerciseIndex !== -1) {
          setActiveExercise(circuit[exerciseIndex]);
        }
      }
    }

    // Find and store the active circuit data for DragOverlay
    if (active.id.startsWith("circuit-")) {
      const parts = active.id.split("-");
      const workoutId = parts[1];
      const circuitIndex = parseInt(parts[2]);

      const workout = localWorkouts.find((w) => w._id === workoutId);
      if (workout && workout.training[circuitIndex]) {
        setActiveCircuit({
          circuitIndex,
          exercises: workout.training[circuitIndex],
        });
      }
    }
  };

  const handleDragOver = ({ active, over }) => {
    if (!over || !active.id || typeof active.id !== "string") return;

    // Only handle exercises here; circuit reordering still happens in handleDragEnd
    if (!active.id.startsWith("exercise-")) return;

    const activeParts = active.id.split("-");
    // exercise-<workoutId>-<circuitIndex>-<exerciseId>-<index>
    if (activeParts.length < 4) return;
    const activeExerciseId = activeParts[3];

    const overId = String(over.id);

    setLocalWorkouts((prevData) => {
      if (!Array.isArray(prevData)) return prevData;

      const updatedData = JSON.parse(JSON.stringify(prevData));

      const activeLocation = findExerciseLocationByExerciseId(updatedData, activeExerciseId);
      if (!activeLocation) return prevData;

      const {
        workoutIndex: activeWorkoutIndex,
        circuitIndex: activeCircuitIndex,
        exerciseIndex: activeExerciseIndex,
      } = activeLocation;

      let targetWorkoutIndex = activeWorkoutIndex;
      let targetCircuitIndex = activeCircuitIndex;
      let targetExerciseIndex = activeExerciseIndex;

      if (overId.startsWith("exercise-")) {
        const overParts = overId.split("-");
        if (overParts.length < 4) return prevData;
        const overExerciseId = overParts[3];

        const overLocation = findExerciseLocationByExerciseId(updatedData, overExerciseId);
        if (!overLocation) return prevData;

        targetWorkoutIndex = overLocation.workoutIndex;
        targetCircuitIndex = overLocation.circuitIndex;
        targetExerciseIndex = overLocation.exerciseIndex;
      } else if (overId.startsWith("placeholder-") || overId.startsWith("circuit-")) {
        const overParts = overId.split("-");
        if (overParts.length < 3) return prevData;
        const overWorkoutId = overParts[1];
        targetCircuitIndex = parseInt(overParts[2], 10);

        targetWorkoutIndex = updatedData.findIndex((w) => w._id === overWorkoutId);
        if (targetWorkoutIndex === -1) return prevData;

        const targetCircuit = updatedData[targetWorkoutIndex].training[targetCircuitIndex] || [];
        targetExerciseIndex = targetCircuit.length;
      } else {
        return prevData;
      }

      const sameContainer =
        activeWorkoutIndex === targetWorkoutIndex && activeCircuitIndex === targetCircuitIndex;

      // Reorder within the same circuit
      if (sameContainer) {
        if (activeExerciseIndex === targetExerciseIndex) return prevData;

        const circuit = updatedData[activeWorkoutIndex].training[activeCircuitIndex];
        updatedData[activeWorkoutIndex].training[activeCircuitIndex] = arrayMove(
          circuit,
          activeExerciseIndex,
          targetExerciseIndex
        );

        return updatedData;
      }

      // Move across circuits
      const sourceCircuit = updatedData[activeWorkoutIndex].training[activeCircuitIndex];
      const targetCircuit = updatedData[targetWorkoutIndex].training[targetCircuitIndex];

      if (!Array.isArray(sourceCircuit) || !Array.isArray(targetCircuit)) return prevData;

      const [movedItem] = sourceCircuit.splice(activeExerciseIndex, 1);

      const insertIndex =
        typeof targetExerciseIndex === "number" ? targetExerciseIndex : targetCircuit.length;
      targetCircuit.splice(insertIndex, 0, movedItem);

      return updatedData;
    });
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggedItem(null);
    setActiveExercise(null);
    setActiveCircuit(null);
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("circuit-") && over.id.startsWith("circuit-")) {
      handleCircuitDragEnd(active, over);
    }
  };

  const handleDragCancel = () => {
    setDraggedItem(null);
    setActiveExercise(null);
    setActiveCircuit(null);
  };



  const handleCircuitDragEnd = (active, over) => {
    const [activeWorkoutId, activeCircuitIndex] = active.id.split("-").slice(1);
    const [overWorkoutId, overCircuitIndex] = over.id.split("-").slice(1);

    setLocalWorkouts((prevData) => {
      const updatedData = [...prevData];
      const activeWorkoutIndex = updatedData.findIndex((w) => w._id === activeWorkoutId);
      const overWorkoutIndex = updatedData.findIndex((w) => w._id === overWorkoutId);

      if (activeWorkoutIndex === -1 || overWorkoutIndex === -1) return updatedData;

      if (activeWorkoutIndex === overWorkoutIndex) {
        // Reorder circuits within the same workout
        updatedData[activeWorkoutIndex].training = arrayMove(
          updatedData[activeWorkoutIndex].training,
          parseInt(activeCircuitIndex),
          parseInt(overCircuitIndex)
        );
      } else {
        // Moving circuits between workouts
        const [movedCircuit] = updatedData[activeWorkoutIndex].training.splice(
          parseInt(activeCircuitIndex),
          1
        );
        updatedData[overWorkoutIndex].training.splice(parseInt(overCircuitIndex), 0, movedCircuit);
      }

      return updatedData;
    });
  };

  const customCollisionDetection = (args) => {
    const { active } = args;
    if (active.id.startsWith("exercise-")) {
      // Use closestCorners for exercises
      return closestCorners(args);
    } else if (active.id.startsWith("circuit-")) {
      // Use rectIntersection for circuits
      return rectIntersection(args);
    }
    // Fallback (if needed)
    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      {localWorkouts?.length > 0 &&
        // Each day may have multiple workouts, this separates the workouts
        localWorkouts.map((workout, index) => {
          const handleSelectWorkout = () => {
            setSelectedWorkout(workout);
            handleModalToggle();
          };

          const currentViewMode = viewModes[workout._id] || "goals"; // Default to 'goals' if not set
          const isCardioWorkout = workout.workoutType === "Cardio";

          return (
            <React.Fragment key={`workout-${index}`}>
              <Paper
                elevation={5}
                sx={{
                  margin: "5px",
                  padding: "8px",
                  borderTop: isCardioWorkout ? "4px solid" : undefined,
                  borderColor: isCardioWorkout ? "info.main" : undefined,
                }}
              >
                <Grid container sx={{ justifyContent: "center", alignItems: "center" }}>
                  <Grid size={11} container>
                    <Typography variant="h6">{workout.title}</Typography>
                  </Grid>
                  <Grid size={1} container sx={{ justifyContent: "center", alignItems: "center" }}>
                    <Tooltip title="Workout Settings">
                      <IconButton variant="contained" onClick={handleSelectWorkout}>
                        <Settings />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Typography variant="h6">{workout.category.join(", ")}</Typography>

                <ToggleButtonGroup
                  value={currentViewMode}
                  exclusive
                  onChange={(event, newViewMode) =>
                    handleViewToggleChange(workout._id, newViewMode)
                  }
                  aria-label="goals or achieved"
                  size="small"
                >
                  <ToggleButton value="goals" aria-label="goals">
                    {isCardioWorkout ? "Plan" : "Goals"}
                  </ToggleButton>
                  <ToggleButton value="achieved" aria-label="achieved">
                    {isCardioWorkout ? "Results" : "Achieved"}
                  </ToggleButton>
                </ToggleButtonGroup>
                <div style={{ padding: "10px 0px" }}>
                  {isCardioWorkout ? (
                    <CardioWorkoutPreview workout={workout} viewMode={currentViewMode} />
                  ) : (
                    <SortableContext items={flattenedCircuits} strategy={verticalListSortingStrategy}>
                      {
                        // iterates through each workout set (supersets)
                        workout.training.map((circuit, circuitIndex) => {
                          return (
                            <Grid container key={`circuit-${workout._id}-${circuitIndex}`}>
                              <Grid size={12}>
                                <SortableCircuit
                                  id={`circuit-${workout._id}-${circuitIndex}`}
                                  index={circuitIndex}
                                >
                                  {(listeners, attributes) => (
                                    <WorkoutSet
                                      workout={workout}
                                      circuit={circuit}
                                      circuitIndex={circuitIndex}
                                      viewMode={currentViewMode}
                                      activeId={activeId}
                                      listeners={listeners}
                                      attributes={attributes}
                                    />
                                  )}
                                </SortableCircuit>
                              </Grid>
                            </Grid>
                          );
                        })
                      }
                    </SortableContext>
                  )}
                </div>
                <Grid container size={12} sx={{ justifyContent: "center", padding: "5px" }}>
                  <Link to={`/workout/${workout._id}`}>
                    <Button onClick={() => saveStart(workout)} variant="contained">
                      {workout.complete ? "Review" : "Start"}
                    </Button>
                  </Link>
                </Grid>
              </Paper>
            </React.Fragment>
          );
        })}
      <Grid container sx={{ justifyContent: "center", alignItems: "center" }}>
        <Grid>
          <Button
            onClick={handleOpenCreateWorkoutDialog}
            variant="contained"
            sx={{ margin: "15px" }}
          >
            Add Workout
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={openCreateWorkoutDialog}
        onClose={handleCloseCreateWorkoutDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Create a workout"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Select a workout type to create. More options coming soon.
        </DialogContentText>
        <Box sx={{ marginTop: "12px" }}>
          <TextField
            select
            fullWidth
            label="Workout type"
            value={newWorkoutType}
            onChange={(event) => setNewWorkoutType(event.target.value)}
          >
            {WORKOUT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value} disabled={!type.enabled}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body1">{type.label}</Typography>
                  {!type.enabled && (
                    <Typography variant="caption" color="text.secondary">
                      {type.hint || "Coming soon"}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateWorkoutDialog}>Cancel</Button>
          <Button onClick={() => handleAddWorkout().then(() => handleCloseCreateWorkoutDialog())}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <WorkoutOptionModalView
        modalOpen={modalOpen}
        handleModalToggle={handleModalToggle}
        handleSetModalAction={handleSetModalAction}
        modalActionType={modalActionType}
        training={selectedWorkout}
        setSelectedDate={setSelectedDate}
      />
      <DragOverlay
        adjustScale={false}
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeExercise ? (
          <Paper sx={{ opacity: 0.9, boxShadow: 3 }}>
            <Grid container>
              <Grid container size={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                <DragHandleIcon />
              </Grid>
              <Grid container size={11} spacing={1} sx={{ padding: "5px" }}>
                <Grid container size={{ xs: 12, sm: 6 }} sx={{ alignItems: "center" }}>
                  <Typography variant="body1">
                    {activeExercise?.exercise?.exerciseTitle || "Select an exercise"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        ) : activeCircuit ? (
          <Paper sx={{ padding: "0 5px", marginBottom: "10px", opacity: 0.9, boxShadow: 3 }}>
            <Grid container alignItems="center">
              <Grid size={12}>
                <Typography variant="h6">
                  <span>Circuit {activeCircuit.circuitIndex + 1}</span>
                </Typography>
              </Grid>
            </Grid>
            <div style={{ padding: "5px 0px", margin: "5px 0px" }}>
              {activeCircuit.exercises.length > 0 ? (
                activeCircuit.exercises.map((exercise, index) => (
                  <Grid container component={Paper} key={index}>
                    <Grid container size={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                      <DragHandleIcon />
                    </Grid>
                    <Grid container size={11} spacing={1} sx={{ padding: "5px" }}>
                      <Grid container size={{ xs: 12, sm: 6 }} sx={{ alignItems: "center" }}>
                        <Typography variant="body1">
                          {exercise?.exercise?.exerciseTitle || "Select an exercise"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <div style={{ color: "#aaa" }}>Empty Circuit</div>
              )}
            </div>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const CardioWorkoutPreview = ({ workout, viewMode }) => {
  const cardio = useMemo(() => normalizeCardioPreview(workout.cardio), [workout.cardio]);
  const isResultsMode = viewMode === "achieved";
  const requestedEntry = isResultsMode ? cardio.actual : cardio.plan;
  const showingPlanFallback = isResultsMode && isCardioPreviewEmpty(requestedEntry) && !isCardioPreviewEmpty(cardio.plan);
  const cardioFields = showingPlanFallback ? cardio.plan : requestedEntry;
  const metric = getCardioPreviewMetric(cardioFields);
  const activityLabel = cardioFields.activity || "Cardio";
  const detailChips = [
    cardioFields.routeType,
    cardioFields.surface,
    cardioFields.weather,
    formatCardioPreviewTemperature(cardioFields.temperature, cardioFields.temperatureUnit),
    hasCardioPreviewValue(cardioFields.elevationGain) ? `Gain ${cardioFields.elevationGain}` : "",
    hasCardioPreviewValue(cardioFields.rpe) ? `RPE ${cardioFields.rpe}` : "",
    cardioFields.hrZone,
    cardioFields.segments?.length ? `${cardioFields.segments.length} split${cardioFields.segments.length === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  if (isCardioPreviewEmpty(cardioFields)) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          padding: 2,
          border: "1px solid",
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.success.light}18 100%)`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {isResultsMode ? "No cardio results logged yet." : "Add cardio details to preview this workout."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 3,
        padding: 2,
        border: "1px solid",
        borderColor: "divider",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.info.light}22 0%, ${theme.palette.success.light}15 100%)`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            <Chip size="small" color="info" label={activityLabel} />
            {hasCardioPreviewValue(cardioFields.style) && (
              <Chip size="small" variant="outlined" label={cardioFields.style} />
            )}
            {showingPlanFallback && (
              <Chip size="small" variant="outlined" label="Showing plan until results are logged" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {isResultsMode && !showingPlanFallback ? "Logged results" : "Workout preview"}
          </Typography>
        </Stack>

        <Grid container spacing={1.5}>
          {[
            {
              label: "Distance",
              value: hasCardioPreviewValue(cardioFields.distance)
                ? `${cardioFields.distance} ${cardioFields.distanceUnit}`
                : "—",
              background: (theme) => `${theme.palette.warning.light}12`,
            },
            {
              label: "Duration",
              value: hasCardioPreviewValue(cardioFields.duration) ? cardioFields.duration : "—",
              background: (theme) => `${theme.palette.warning.light}12`,
            },
            {
              label: metric.label,
              value: metric.value || "—",
              background: (theme) => `${theme.palette.warning.light}12`,
            },
          ].map((item) => (
            <Grid key={`${workout._id}-${item.label}`} size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  padding: 1.25,
                  background: item.background,
                  borderColor: "rgba(255,255,255,0.45)",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6">{item.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {detailChips.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            {detailChips.slice(0, 6).map((detail) => (
              <Chip key={`${workout._id}-${detail}`} label={detail} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {hasCardioPreviewValue(cardioFields.notes) && (
          <Paper
            variant="outlined"
            sx={{
              padding: 1.25,
              backgroundColor: "rgba(255,255,255,0.65)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Notes
            </Typography>
            <Typography variant="body2">{truncateCardioPreviewText(cardioFields.notes, 140)}</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

const WorkoutSet = (props) => {
  const {
    workout,
    circuit,
    circuitIndex,
    viewMode,
    activeId,
    listeners,
    attributes,
  } = props;

  // Generate circuit-specific items for SortableContext
  const circuitExerciseIds = useMemo(() => {
    if (circuit.length > 0) {
      return circuit.map(
        (exercise, index) =>
          `exercise-${workout._id}-${circuitIndex}-${exercise._id}-${index}`
      );
    }
    return [`placeholder-${workout._id}-${circuitIndex}`];
  }, [circuit, workout._id, circuitIndex]);

  const renderType = (exercise) => {
    const { exerciseType, goals, achieved } = exercise;

    switch (exerciseType) {
      case "Reps":
        return viewMode === "goals" ? (
          <Typography variant="body1">
            {goals.exactReps.length} sets: {goals.exactReps.join(", ")} reps
          </Typography>
        ) : (
          <Typography variant="body1">
            {achieved.reps.length} sets: {achieved.reps.join(", ")} reps
          </Typography>
        );
      case "Time":
        return viewMode === "goals" ? (
          <Typography variant="body1">
            {goals.seconds.length} sets: {goals.seconds.join(", ")} seconds
          </Typography>
        ) : (
          <Typography variant="body1">
            {achieved.seconds.length} sets: {achieved.seconds.join(", ")} seconds
          </Typography>
        );
      case "Reps with %":
        return viewMode === "goals" ? (
          <>
            <Grid container>
              <Typography variant="body1">One Rep Max: {goals.oneRepMax} lbs</Typography>
            </Grid>
            <Grid container>
              <Typography variant="body1">
                {goals.percent.length} sets: {goals.exactReps.join(", ")} reps
              </Typography>
            </Grid>
          </>
        ) : (
          <>
            <Grid container>
              <Typography variant="body1">One Rep Max: {goals.oneRepMax} lbs</Typography>
            </Grid>
            <Grid container>
              <Typography variant="body1">
                {achieved.percent.length} sets: {achieved.reps.join(", ")} reps
              </Typography>
            </Grid>
          </>
        );
      default:
        break;
    }
  };

  return (
    <Paper sx={{ padding: "0 5px", marginBottom: "10px" }}>
      <Grid container alignItems="center">
        <Grid size={12}>
          <Typography variant="h6">
            <Box
              {...listeners}
              {...attributes}
              sx={{ touchAction: "none", display: "inline-block" }}
            >
              <span>Circuit {circuitIndex + 1}</span>
            </Box>
          </Typography>
        </Grid>
      </Grid>
      <div style={{ padding: "5px 0px", margin: "5px 0px" }}>
        <SortableContext items={circuitExerciseIds} strategy={verticalListSortingStrategy}>
          {circuit.length > 0 ? (
            circuit.map((exercise, index) => (
              <SortableExercise
                id={`exercise-${workout._id}-${circuitIndex}-${exercise._id}-${index}`}
                key={`exercise-${workout._id}-${circuitIndex}-${exercise._id}-${index}`}
                index={index}
              >
                {(listeners, attributes) => (
                  <Grid container component={Paper}>
                    <Grid
                      container
                      size={1}
                      sx={{ justifyContent: "center", alignItems: "center" }}
                    >
                      {/* Drag handle */}
                      <div {...listeners} {...attributes} style={{ touchAction: "none" }}>
                        <DragHandleIcon />
                      </div>
                    </Grid>
                    <Grid container size={11} spacing={1} sx={{ padding: "5px" }}>
                      {/* Rest of your item content */}
                      <Grid container size={{ xs: 12, sm: 6 }} sx={{ alignItems: "center" }}>
                        <Typography variant="body1">
                          {exercise?.exercise?.exerciseTitle || "Select an exercise"}
                        </Typography>
                      </Grid>
                      <Grid container size={{ xs: 12, sm: 6 }}>
                        {renderType(exercise)}
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </SortableExercise>
            ))
          ) : (
            <SortableExercise
              key={`placeholder-${workout._id}-${circuitIndex}`}
              id={`placeholder-${workout._id}-${circuitIndex}`}
              isPlaceholder
            >
              {(listeners, attributes) => (
                <div
                  style={{
                    color: "#aaa",
                  }}
                >
                  Empty Circuit : Drag here to add exercise
                </div>
              )}
            </SortableExercise>
          )}
        </SortableContext>
      </div>
    </Paper>
  );
};
