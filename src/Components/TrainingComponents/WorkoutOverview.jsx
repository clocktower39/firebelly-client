import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  DndContext,
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

function SortableExercise({ id, index, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    index,
    animateLayoutChanges: (args) => (args.isSorting ? false : defaultAnimateLayoutChanges(args)),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
}

function SortableCircuit({ id, index, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    index,
    animateLayoutChanges: (args) => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
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
        },
        user,
      })
    );

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
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggedItem(null);
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("circuit-") && over.id.startsWith("circuit-")) {
      handleCircuitDragEnd(active, over);
    } else if (
      active.id.startsWith("exercise-") &&
      (over.id.startsWith("exercise-") || over.id.startsWith("placeholder-"))
    ) {
      handleExerciseDragEnd(active, over);
    }
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

  const handleExerciseDragEnd = (active, over) => {
    const activeParts = active.id.split("-");
    const activeWorkoutId = activeParts[1];
    const activeCircuitIndex = parseInt(activeParts[2]);

    let overWorkoutId, overCircuitIndex;
    if (over.id.startsWith("exercise-")) {
      const overParts = over.id.split("-");
      overWorkoutId = overParts[1];
      overCircuitIndex = parseInt(overParts[2]);
    } else if (over.id.startsWith("placeholder-")) {
      const overParts = over.id.split("-");
      overWorkoutId = overParts[1];
      overCircuitIndex = parseInt(overParts[2]);
    } else {
      return;
    }

    const isSameContainer =
      activeWorkoutId === overWorkoutId && activeCircuitIndex === overCircuitIndex;

    setLocalWorkouts((prevData) => {
      const updatedData = JSON.parse(JSON.stringify(prevData));
      const activeWorkoutIndex = updatedData.findIndex((w) => w._id === activeWorkoutId);
      const overWorkoutIndex = updatedData.findIndex((w) => w._id === overWorkoutId);

      if (activeWorkoutIndex === -1 || overWorkoutIndex === -1) return prevData;

      const sourceCircuit = updatedData[activeWorkoutIndex].training[activeCircuitIndex];
      const activeItemIndex = sourceCircuit.findIndex(
        (exercise, index) =>
          `exercise-${activeWorkoutId}-${activeCircuitIndex}-${exercise._id}-${index}` === active.id
      );

      if (activeItemIndex === -1) return prevData;

      if (isSameContainer) {
        // Same container: reorder with animation
        const overItemIndex = sourceCircuit.findIndex(
          (exercise, index) =>
            `exercise-${overWorkoutId}-${overCircuitIndex}-${exercise._id}-${index}` === over.id
        );
        if (overItemIndex === -1) return prevData;

        updatedData[activeWorkoutIndex].training[activeCircuitIndex] = arrayMove(
          sourceCircuit,
          activeItemIndex,
          overItemIndex
        );
      } else {
        // Cross-container: remove from source, insert at end of target
        const [movedItem] = sourceCircuit.splice(activeItemIndex, 1);
        updatedData[overWorkoutIndex].training[overCircuitIndex].push(movedItem);
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
      onDragEnd={handleDragEnd}
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

          return (
            <React.Fragment key={`workout-${index}`}>
              <Paper elevation={5} sx={{ margin: "5px", padding: "5px" }}>
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
                    Goals
                  </ToggleButton>
                  <ToggleButton value="achieved" aria-label="achieved">
                    Achieved
                  </ToggleButton>
                </ToggleButtonGroup>
                <div style={{ padding: "10px 0px" }}>
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
            {/* Options */}
            {/* import from queue, custom set & reps per set (default: 4 X (4 X 10)) */}- Default
            (more options coming soon)
          </DialogContentText>
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
    </DndContext>
  );
}

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
