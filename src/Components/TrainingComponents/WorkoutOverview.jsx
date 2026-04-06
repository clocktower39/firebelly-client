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
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  useDroppable,
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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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

const CIRCUIT_DND_KEY = "__firebellyCircuitDndKey";
const EXERCISE_DND_KEY = "__firebellyExerciseDndKey";
let dndKeyCounter = 0;

const createDndKey = (prefix) => {
  dndKeyCounter += 1;
  return `${prefix}-${dndKeyCounter}`;
};

const ensureHiddenDndKey = (target, keyName, prefix) => {
  if (!target || typeof target !== "object") {
    return `${prefix}-missing`;
  }

  if (!target[keyName]) {
    Object.defineProperty(target, keyName, {
      value: createDndKey(prefix),
      configurable: true,
      writable: true,
    });
  }

  return target[keyName];
};

const copyHiddenArrayKey = (source, target, keyName) => {
  if (!source?.[keyName]) return target;

  Object.defineProperty(target, keyName, {
    value: source[keyName],
    configurable: true,
    writable: true,
  });

  return target;
};

const getWorkoutKey = (workout, workoutIndex) => workout?._id ? `workout-${workout._id}` : `workout-index-${workoutIndex}`;
const getCircuitKey = (circuit) => ensureHiddenDndKey(circuit, CIRCUIT_DND_KEY, "circuit");
const getExerciseKey = (exercise) => ensureHiddenDndKey(exercise, EXERCISE_DND_KEY, "exercise");
const getWorkoutContainerId = (workoutKey) => `workout-container:${workoutKey}`;
const getCircuitSortableId = (circuitKey) => `circuit:${circuitKey}`;
const getCircuitContainerId = (circuitKey) => `exercise-container:${circuitKey}`;
const getExerciseSortableId = (exerciseKey) => `exercise:${exerciseKey}`;

const cloneCircuitWithKey = (circuit, nextItems) =>
  copyHiddenArrayKey(circuit, [...nextItems], CIRCUIT_DND_KEY);

const ensureWorkoutDndKeys = (workouts = []) => {
  workouts.forEach((workout) => {
    const circuits = Array.isArray(workout?.training) ? workout.training : [];
    circuits.forEach((circuit) => {
      if (!Array.isArray(circuit)) return;
      getCircuitKey(circuit);
      circuit.forEach((exercise) => {
        if (exercise && typeof exercise === "object") {
          getExerciseKey(exercise);
        }
      });
    });
  });
};

const buildWorkoutDndModel = (workouts = []) => {
  ensureWorkoutDndKeys(workouts);

  return workouts.map((workout, workoutIndex) => {
    const workoutKey = getWorkoutKey(workout, workoutIndex);
    const circuits = (Array.isArray(workout?.training) ? workout.training : []).map(
      (circuit, circuitIndex) => {
        const circuitKey = getCircuitKey(circuit);
        const exerciseItems = (Array.isArray(circuit) ? circuit : []).map((exercise, exerciseIndex) => {
          const exerciseKey = getExerciseKey(exercise);
          return {
            exercise,
            exerciseIndex,
            exerciseKey,
            exerciseId: getExerciseSortableId(exerciseKey),
          };
        });

        return {
          circuit,
          circuitIndex,
          circuitKey,
          circuitId: getCircuitSortableId(circuitKey),
          exerciseContainerId: getCircuitContainerId(circuitKey),
          exerciseItems,
          exerciseIds: exerciseItems.map((item) => item.exerciseId),
        };
      }
    );

    return {
      workout,
      workoutIndex,
      workoutKey,
      workoutContainerId: getWorkoutContainerId(workoutKey),
      circuits,
      circuitIds: circuits.map((circuit) => circuit.circuitId),
    };
  });
};

const findWorkoutIndexByKey = (workouts, workoutKey) =>
  workouts.findIndex((workout, workoutIndex) => getWorkoutKey(workout, workoutIndex) === workoutKey);

const findCircuitLocationByKey = (workouts, circuitKey) => {
  ensureWorkoutDndKeys(workouts);

  for (let workoutIndex = 0; workoutIndex < workouts.length; workoutIndex += 1) {
    const workout = workouts[workoutIndex];
    const circuits = Array.isArray(workout?.training) ? workout.training : [];

    for (let circuitIndex = 0; circuitIndex < circuits.length; circuitIndex += 1) {
      if (getCircuitKey(circuits[circuitIndex]) === circuitKey) {
        return { workoutIndex, circuitIndex };
      }
    }
  }

  return null;
};

const findExerciseLocationByKey = (workouts, exerciseKey) => {
  ensureWorkoutDndKeys(workouts);

  for (let workoutIndex = 0; workoutIndex < workouts.length; workoutIndex += 1) {
    const workout = workouts[workoutIndex];
    const circuits = Array.isArray(workout?.training) ? workout.training : [];

    for (let circuitIndex = 0; circuitIndex < circuits.length; circuitIndex += 1) {
      const circuit = circuits[circuitIndex];
      if (!Array.isArray(circuit)) continue;

      for (let exerciseIndex = 0; exerciseIndex < circuit.length; exerciseIndex += 1) {
        if (getExerciseKey(circuit[exerciseIndex]) === exerciseKey) {
          return { workoutIndex, circuitIndex, exerciseIndex };
        }
      }
    }
  }

  return null;
};

const moveCircuitByKey = (workouts, circuitKey, targetWorkoutKey, targetCircuitIndex) => {
  ensureWorkoutDndKeys(workouts);

  const sourceLocation = findCircuitLocationByKey(workouts, circuitKey);
  const targetWorkoutIndex = findWorkoutIndexByKey(workouts, targetWorkoutKey);

  if (!sourceLocation || targetWorkoutIndex === -1) {
    return workouts;
  }

  const { workoutIndex: sourceWorkoutIndex, circuitIndex: sourceCircuitIndex } = sourceLocation;
  const safeTargetIndex = Math.max(
    0,
    Math.min(Number.isInteger(targetCircuitIndex) ? targetCircuitIndex : 0, (workouts[targetWorkoutIndex]?.training || []).length)
  );

  if (
    sourceWorkoutIndex === targetWorkoutIndex &&
    sourceCircuitIndex === safeTargetIndex
  ) {
    return workouts;
  }

  const nextWorkouts = workouts.map((workout, workoutIndex) => {
    if (workoutIndex !== sourceWorkoutIndex && workoutIndex !== targetWorkoutIndex) {
      return workout;
    }

    return {
      ...workout,
      training: Array.isArray(workout.training) ? [...workout.training] : [],
    };
  });

  const [movedCircuit] = nextWorkouts[sourceWorkoutIndex].training.splice(sourceCircuitIndex, 1);
  if (!movedCircuit) return workouts;

  let insertIndex = safeTargetIndex;
  if (sourceWorkoutIndex === targetWorkoutIndex && sourceCircuitIndex < insertIndex) {
    insertIndex -= 1;
  }

  if (
    sourceWorkoutIndex === targetWorkoutIndex &&
    sourceCircuitIndex === insertIndex
  ) {
    return workouts;
  }

  nextWorkouts[targetWorkoutIndex].training.splice(insertIndex, 0, movedCircuit);
  return nextWorkouts;
};

const moveExerciseByKey = (workouts, exerciseKey, targetCircuitKey, targetExerciseIndex) => {
  ensureWorkoutDndKeys(workouts);

  const sourceLocation = findExerciseLocationByKey(workouts, exerciseKey);
  const targetLocation = findCircuitLocationByKey(workouts, targetCircuitKey);

  if (!sourceLocation || !targetLocation) {
    return workouts;
  }

  const {
    workoutIndex: sourceWorkoutIndex,
    circuitIndex: sourceCircuitIndex,
    exerciseIndex: sourceExerciseIndex,
  } = sourceLocation;
  const {
    workoutIndex: targetWorkoutIndex,
    circuitIndex: targetCircuitIndex,
  } = targetLocation;

  const sourceCircuit = workouts[sourceWorkoutIndex]?.training?.[sourceCircuitIndex];
  const targetCircuit = workouts[targetWorkoutIndex]?.training?.[targetCircuitIndex];

  if (!Array.isArray(sourceCircuit) || !Array.isArray(targetCircuit)) {
    return workouts;
  }

  const safeTargetIndex = Math.max(
    0,
    Math.min(Number.isInteger(targetExerciseIndex) ? targetExerciseIndex : targetCircuit.length, targetCircuit.length)
  );

  if (sourceWorkoutIndex === targetWorkoutIndex && sourceCircuitIndex === targetCircuitIndex) {
    if (sourceExerciseIndex === safeTargetIndex) {
      return workouts;
    }

    const reorderedCircuit = cloneCircuitWithKey(
      sourceCircuit,
      arrayMove(sourceCircuit, sourceExerciseIndex, safeTargetIndex)
    );

    return workouts.map((workout, workoutIndex) => {
      if (workoutIndex !== sourceWorkoutIndex) return workout;

      return {
        ...workout,
        training: workout.training.map((circuit, circuitIndex) =>
          circuitIndex === sourceCircuitIndex ? reorderedCircuit : circuit
        ),
      };
    });
  }

  const movedExercise = sourceCircuit[sourceExerciseIndex];
  if (!movedExercise) return workouts;

  return workouts.map((workout, workoutIndex) => {
    if (workoutIndex !== sourceWorkoutIndex && workoutIndex !== targetWorkoutIndex) {
      return workout;
    }

    return {
      ...workout,
      training: workout.training.map((circuit, circuitIndex) => {
        if (workoutIndex === sourceWorkoutIndex && circuitIndex === sourceCircuitIndex) {
          const nextSourceCircuit = sourceCircuit.filter((_, index) => index !== sourceExerciseIndex);
          return cloneCircuitWithKey(sourceCircuit, nextSourceCircuit);
        }

        if (workoutIndex === targetWorkoutIndex && circuitIndex === targetCircuitIndex) {
          const nextTargetCircuit = [...targetCircuit];
          nextTargetCircuit.splice(safeTargetIndex, 0, movedExercise);
          return cloneCircuitWithKey(targetCircuit, nextTargetCircuit);
        }

        return circuit;
      }),
    };
  });
};

const getExerciseDropTarget = (overData) => {
  if (!overData) return null;

  if (overData.type === "exercise") {
    return {
      circuitKey: overData.circuitKey,
      exerciseIndex: overData.exerciseIndex,
    };
  }

  if (overData.type === "exercise-container") {
    return {
      circuitKey: overData.circuitKey,
      exerciseIndex: overData.exerciseCount,
    };
  }

  return null;
};

const getCircuitDropTarget = (overData) => {
  if (!overData) return null;

  if (overData.type === "circuit") {
    return {
      workoutKey: overData.workoutKey,
      circuitIndex: overData.circuitIndex,
    };
  }

  if (overData.type === "workout-container") {
    return {
      workoutKey: overData.workoutKey,
      circuitIndex: overData.circuitCount,
    };
  }

  return null;
};

const getTypedCollisions = (args, allowedTypes) => {
  const filteredContainers = args.droppableContainers.filter((container) =>
    allowedTypes.includes(container.data.current?.type)
  );

  if (filteredContainers.length === 0) {
    return [];
  }

  const pointerCollisions = pointerWithin({
    ...args,
    droppableContainers: filteredContainers,
  });

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return closestCorners({
    ...args,
    droppableContainers: filteredContainers,
  });
};

function SortableExercise({ id, data, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
    animateLayoutChanges: (args) => (args.isSorting ? false : defaultAnimateLayoutChanges(args)),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes, isDragging)}
    </div>
  );
}

function SortableCircuit({ id, data, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
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

function ExerciseDropZone({ id, data, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return children({ setNodeRef, isOver });
}

function WorkoutDropZone({ id, data, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return children({ setNodeRef, isOver });
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
  const [newWorkoutType, setNewWorkoutType] = useState("Strength");
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeCircuit, setActiveCircuit] = useState(null);

  const workoutDndModel = useMemo(() => buildWorkoutDndModel(localWorkouts), [localWorkouts]);

  const handleViewToggleChange = (workoutId, newViewMode) => {
    if (newViewMode !== null) {
      setViewModes((prev) => ({
        ...prev,
        [workoutId]: newViewMode,
      }));
    }
  };

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
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearActiveDrag = () => {
    setActiveExercise(null);
    setActiveCircuit(null);
  };

  const handleDragStart = ({ active }) => {
    const activeData = active?.data?.current;
    if (!activeData) return;

    if (activeData.type === "exercise") {
      setActiveExercise(activeData.exercise);
      setActiveCircuit(null);
      return;
    }

    if (activeData.type === "circuit") {
      setActiveExercise(null);
      setActiveCircuit({
        circuitIndex: activeData.circuitIndex,
        exercises: Array.isArray(activeData.circuit) ? activeData.circuit : [],
      });
    }
  };

  const handleDragOver = ({ active, over }) => {
    const activeData = active?.data?.current;
    const overData = over?.data?.current;

    if (!activeData || !overData) return;

    if (activeData.type === "exercise") {
      const target = getExerciseDropTarget(overData);
      if (!target) return;

      setLocalWorkouts((prevWorkouts) =>
        moveExerciseByKey(
          prevWorkouts,
          activeData.exerciseKey,
          target.circuitKey,
          target.exerciseIndex
        )
      );
      return;
    }

    if (activeData.type === "circuit") {
      const target = getCircuitDropTarget(overData);
      if (!target) return;

      setLocalWorkouts((prevWorkouts) =>
        moveCircuitByKey(
          prevWorkouts,
          activeData.circuitKey,
          target.workoutKey,
          target.circuitIndex
        )
      );
    }
  };

  const handleDragEnd = () => {
    clearActiveDrag();
  };

  const handleDragCancel = () => {
    clearActiveDrag();
  };

  const collisionDetection = (args) => {
    const activeType = args.active.data.current?.type;

    if (activeType === "exercise") {
      return getTypedCollisions(args, ["exercise", "exercise-container"]);
    }

    if (activeType === "circuit") {
      return getTypedCollisions(args, ["circuit", "workout-container"]);
    }

    return closestCorners(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      {workoutDndModel.length > 0 &&
        workoutDndModel.map(({ workout, workoutKey, workoutContainerId, circuits, circuitIds }, index) => {
          const handleSelectWorkout = () => {
            setSelectedWorkout(workout);
            handleModalToggle();
          };

          const currentViewMode = viewModes[workout._id] || "goals";
          const isCardioWorkout = workout.workoutType === "Cardio";

          return (
            <React.Fragment key={`workout-${workout._id || index}`}>
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

                <WorkoutDropZone
                  id={workoutContainerId}
                  data={{
                    type: "workout-container",
                    workoutKey,
                    circuitCount: circuits.length,
                  }}
                >
                  {({ setNodeRef, isOver }) => (
                    <Box
                      ref={setNodeRef}
                      sx={{
                        padding: "10px 0px",
                        minHeight: isCardioWorkout ? undefined : 72,
                        borderRadius: 2,
                        backgroundColor: isOver && !isCardioWorkout ? "action.hover" : "transparent",
                        border: !isCardioWorkout && (isOver || circuits.length === 0)
                          ? "1px dashed"
                          : "1px solid transparent",
                        borderColor: !isCardioWorkout && (isOver || circuits.length === 0)
                          ? isOver
                            ? "primary.main"
                            : "divider"
                          : "transparent",
                      }}
                    >
                      {isCardioWorkout ? (
                        <CardioWorkoutPreview workout={workout} viewMode={currentViewMode} />
                      ) : (
                        <SortableContext items={circuitIds} strategy={verticalListSortingStrategy}>
                          {circuits.length > 0 ? (
                            circuits.map(
                              ({
                                circuit,
                                circuitIndex,
                                circuitKey,
                                circuitId,
                                exerciseContainerId,
                                exerciseItems,
                                exerciseIds,
                              }) => (
                                <Grid container key={circuitId}>
                                  <Grid size={12}>
                                    <SortableCircuit
                                      id={circuitId}
                                      data={{
                                        type: "circuit",
                                        workoutKey,
                                        circuitKey,
                                        circuitIndex,
                                        circuit,
                                      }}
                                    >
                                      {(listeners, attributes) => (
                                        <WorkoutSet
                                          workout={workout}
                                          workoutKey={workoutKey}
                                          circuit={circuit}
                                          circuitIndex={circuitIndex}
                                          circuitKey={circuitKey}
                                          exerciseContainerId={exerciseContainerId}
                                          exerciseItems={exerciseItems}
                                          exerciseIds={exerciseIds}
                                          viewMode={currentViewMode}
                                          listeners={listeners}
                                          attributes={attributes}
                                        />
                                      )}
                                    </SortableCircuit>
                                  </Grid>
                                </Grid>
                              )
                            )
                          ) : (
                            <Paper
                              variant="outlined"
                              sx={{
                                padding: "12px",
                                color: "text.secondary",
                                textAlign: "center",
                              }}
                            >
                              Drag a circuit here
                            </Paper>
                          )}
                        </SortableContext>
                      )}
                    </Box>
                  )}
                </WorkoutDropZone>

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
                  <Grid container component={Paper} key={`${getExerciseKey(exercise)}-${index}`}>
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
    workoutKey,
    circuit,
    circuitIndex,
    circuitKey,
    exerciseContainerId,
    exerciseItems,
    exerciseIds,
    viewMode,
    listeners,
    attributes,
  } = props;

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
      <ExerciseDropZone
        id={exerciseContainerId}
        data={{
          type: "exercise-container",
          workoutKey,
          circuitKey,
          exerciseCount: exerciseItems.length,
        }}
      >
        {({ setNodeRef, isOver }) => (
          <Box
            ref={setNodeRef}
            sx={{
              padding: "5px 0px",
              margin: "5px 0px",
              borderRadius: 2,
              backgroundColor: isOver ? "action.hover" : "transparent",
              border: isOver || exerciseItems.length === 0 ? "1px dashed" : "1px solid transparent",
              borderColor: isOver ? "primary.main" : exerciseItems.length === 0 ? "divider" : "transparent",
            }}
          >
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              {exerciseItems.length > 0 ? (
                exerciseItems.map(({ exercise, exerciseIndex, exerciseKey, exerciseId }) => (
                  <SortableExercise
                    id={exerciseId}
                    key={exerciseId}
                    data={{
                      type: "exercise",
                      workoutKey,
                      circuitKey,
                      exerciseKey,
                      exerciseIndex,
                      exercise,
                    }}
                  >
                    {(exerciseListeners, exerciseAttributes) => (
                      <Grid container component={Paper}>
                        <Grid
                          container
                          size={1}
                          sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                          <div
                            {...exerciseListeners}
                            {...exerciseAttributes}
                            style={{ touchAction: "none" }}
                          >
                            <DragHandleIcon />
                          </div>
                        </Grid>
                        <Grid container size={11} spacing={1} sx={{ padding: "5px" }}>
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
                <Box
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Empty circuit: drag an exercise here
                </Box>
              )}
            </SortableContext>
          </Box>
        )}
      </ExerciseDropZone>
    </Paper>
  );
};
