import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
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
import { DragHandle as DragHandleIcon, Settings } from "@mui/icons-material";
import { updateTraining, createTraining } from "../../Redux/actions";
import { WorkoutOptionModalView } from "../../Pages/AppPages/Workout";

export default function WorkoutOverview({
  selectedDate,
  localWorkouts,
  setLocalWorkouts,
  handleCancelEdit,
  workoutOptionModalViewProps,
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleViewToggleChange = (workoutId, newViewMode) => {
    if (newViewMode !== null) {
      setViewModes((prev) => ({
        ...prev,
        [workoutId]: newViewMode,
      }));
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    if (active.id !== over.id) {
      setLocalWorkouts((prevWorkouts) => {
        const oldIndex = prevWorkouts.findIndex(
          (workout) => workout._id === active.id
        );
        const newIndex = prevWorkouts.findIndex(
          (workout) => workout._id === over.id
        );
        return arrayMove(prevWorkouts, oldIndex, newIndex);
      });
    }
  };

  const handleExerciseDragEnd = ({ active, over }) => {
    if (!over) return;

    const [activeWorkoutId, activeCircuitIndex, activeExerciseIndex] = active.id.split("-");
    const [overWorkoutId, overCircuitIndex, overExerciseIndex] = over.id.split("-");

    setLocalWorkouts((prevWorkouts) => {
      return prevWorkouts.map((workout) => {
        if (workout._id !== activeWorkoutId && workout._id !== overWorkoutId) {
          return workout;
        }

        const updatedWorkout = { ...workout };

        if (workout._id === activeWorkoutId) {
          const activeCircuit = updatedWorkout.training[activeCircuitIndex];
          const [movedExercise] = activeCircuit.splice(activeExerciseIndex, 1);

          if (workout._id === overWorkoutId) {
            updatedWorkout.training[overCircuitIndex].splice(overExerciseIndex, 0, movedExercise);
          } else {
            updatedWorkout.training[activeCircuitIndex] = activeCircuit;
          }
        }

        return updatedWorkout;
      });
    });
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
        date: selectedDate,
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localWorkouts} strategy={verticalListSortingStrategy}>
        {localWorkouts?.length > 0 &&
          localWorkouts.map((workout, index) => {
            const handleSelectWorkout = () => {
              setSelectedWorkout(workout);
              handleModalToggle();
            };

            const currentViewMode = viewModes[workout._id] || "goals"; // Default to 'goals' if not set

            return (
              <SortableItem key={workout._id} id={workout._id} index={index}>
                <Paper elevation={5} sx={{ margin: "5px", padding: "5px" }}>
                  <Grid container sx={{ justifyContent: "center", alignItems: "center" }}>
                    <Grid item xs={11} container>
                      <Typography variant="h6">{workout.title}</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={1}
                      container
                      sx={{ justifyContent: "center", alignItems: "center" }}
                    >
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

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleExerciseDragEnd}
                  >
                    <SortableContext
                      items={workout.training.flatMap((circuit, circuitIndex) =>
                        circuit.map((exercise, exerciseIndex) =>
                          `${workout._id}-${circuitIndex}-${exerciseIndex}`
                        )
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <Grid container spacing={2} sx={{ marginTop: "10px" }}>
                        {workout.training.map((circuit, circuitIndex) => (
                          <Grid item xs={12} key={`circuit-${circuitIndex}`}>
                            <Paper elevation={3} sx={{ padding: "10px" }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Circuit {circuitIndex + 1}
                              </Typography>
                              {circuit.map((exercise, exerciseIndex) => (
                                <SortableItem
                                  key={`${workout._id}-${circuitIndex}-${exerciseIndex}`}
                                  id={`${workout._id}-${circuitIndex}-${exerciseIndex}`}
                                >
                                  <Grid
                                    container
                                    alignItems="center"
                                    sx={{ marginBottom: "10px" }}
                                  >
                                    <Grid item xs={1} sx={{ textAlign: "center" }}>
                                      <DragHandleIcon />
                                    </Grid>
                                    <Grid item xs={11}>
                                      <Typography variant="body1">
                                        {exercise.exercise} - {exercise.goals.sets} sets: {exercise.goals.exactReps.join(", ")} reps
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </SortableItem>
                              ))}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </SortableContext>
                  </DndContext>

                  <Grid container item xs={12} sx={{ justifyContent: "center", padding: "5px" }}>
                    <Link to={`/workout/${workout._id}`}>
                      <Button onClick={() => saveStart(workout)} variant="contained">
                        {workout.complete ? "Review" : "Start"}
                      </Button>
                    </Link>
                  </Grid>
                </Paper>
              </SortableItem>
            );
          })}
      </SortableContext>
      <DragOverlay>{/* Add DragOverlay content if needed */}</DragOverlay>
      <Grid container sx={{ justifyContent: "center", alignItems: "center" }}>
        <Grid item>
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

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
