import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";
import { updateTraining, createTraining } from "../../Redux/actions";

export default function WorkoutOverview({
  selectedDate,
  localWorkouts,
  setLocalWorkouts,
  handleCancelEdit,
}) {
  const dispatch = useDispatch();

  const onDragEnd = (result) => {
    if (!result.destination) {
      // Item was not dropped in a valid location
      return;
    }

    const { source, destination, type } = result;

    if (type === "workoutSet") {
      if (source.droppableId === destination.droppableId) {
        // Reordering within the same workout
        const updatedWorkouts = localWorkouts.map((workout) => {
          if (workout._id === source.droppableId) {
            const updatedTraining = Array.from(workout.training);
            const [movedItem] = updatedTraining.splice(source.index, 1);
            updatedTraining.splice(destination.index, 0, movedItem);
            return { ...workout, training: updatedTraining };
          }
          return workout;
        });

        setLocalWorkouts(updatedWorkouts);
      } else {
        // Moving sets between workouts
        // const updatedSourceWorkout = localWorkouts.find(
        //   (w) => w._id === source.droppableId
        // );
        // const updatedDestinationWorkout = localWorkouts.find(
        //   (w) => w._id === destination.droppableId
        // );

        // const updatedSourceTraining = Array.from(updatedSourceWorkout.training);
        // const updatedDestinationTraining = Array.from(
        //   updatedDestinationWorkout.training
        // );

        // const [movedItem] = updatedSourceTraining.splice(source.index, 1);
        // updatedDestinationTraining.splice(destination.index, 0, movedItem);

        // const updatedWorkouts = localWorkouts.map((workout) => {
        //   if (workout._id === source.droppableId) {
        //     return { ...workout, training: updatedSourceTraining };
        //   }
        //   if (workout._id === destination.droppableId) {
        //     return { ...workout, training: updatedDestinationTraining };
        //   }
        //   return workout;
        // });

        // setLocalWorkouts(updatedWorkouts);
        // setModified(true)
      }
    } else if (type === "exercise") {
      // Moving exercise between sets in different workouts
      const sourceWorkoutId = source.droppableId.split("-")[0];
      const sourceSetIndex = Number(source.droppableId.split("-")[1]);
      const destinationWorkoutId = destination.droppableId.split("-")[0];
      const destinationSetIndex = Number(destination.droppableId.split("-")[1]);

      const sourceWorkout = localWorkouts.find(
        (w) => w._id === sourceWorkoutId
      );
      const destinationWorkout = localWorkouts.find(
        (w) => w._id === destinationWorkoutId
      );

      const updatedSourceWorkout = [...sourceWorkout.training];
      const updatedDestinationWorkout = [...destinationWorkout.training];

      const movedItem = updatedSourceWorkout[sourceSetIndex].splice(
        source.index,
        1
      )[0];
      updatedDestinationWorkout[destinationSetIndex].splice(
        destination.index,
        0,
        movedItem
      );

      const updatedWorkouts = localWorkouts.map((w) => {
        if (w._id === sourceWorkoutId) {
          return { ...w, training: updatedSourceWorkout };
        }
        if (w._id === destinationWorkoutId) {
          return { ...w, training: updatedDestinationWorkout };
        }
        return w;
      });

      setLocalWorkouts(updatedWorkouts);
    }
  };

  // Save and start workout
  const saveStart = (training) => {
    const localTraining = localWorkouts.filter(w => w._id === training._id);
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
  const handleAddWorkout = () => dispatch(createTraining(selectedDate));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <>
        {localWorkouts?.length > 0 &&
          // Each day may have multiple workouts, this separates the workouts
          localWorkouts.map((workout) => {
            return (
              <Paper
                key={workout._id}
                elevation={5}
                sx={{ margin: "5px", padding: "5px" }}
              >
                <Typography variant="h6">{workout.title}</Typography>
                <Typography variant="h6">
                  {workout.category.join(", ")}
                </Typography>
                <Droppable droppableId={workout._id} type="workoutSet">
                  {
                    // This creates the droppable area to move sets around, it is the parent container before mapping each set out
                    (provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ padding: "10px 0px" }}
                      >
                        {
                          // iterates through each workout set (supersets)
                          workout.training.map(
                            (workoutSet, workoutSetIndex) => {
                              const set = {
                                workoutSetIndex,
                                exercises: workoutSet,
                              };
                              return (
                                // allows each set to be draggable
                                <Draggable
                                  key={`${workout._id}-${workoutSetIndex}`}
                                  draggableId={`${workout._id}-${workoutSetIndex}`}
                                  index={workoutSetIndex}
                                >
                                  {(workoutSetProvided) => {
                                    return (
                                      <div
                                        ref={workoutSetProvided.innerRef}
                                        {...workoutSetProvided.draggableProps}
                                      >
                                        <Droppable
                                          droppableId={`${workout._id}-${workoutSetIndex}`}
                                          type="exercise"
                                          workoutId={workout._id}
                                          setIndex={workoutSetIndex}
                                        >
                                          {(exerciseDraggableProvided) => (
                                            <Grid container>
                                              <Grid item xs={12}>
                                                <WorkoutSet
                                                  workout={workout}
                                                  workoutSet={set}
                                                  provided={
                                                    exerciseDraggableProvided
                                                  }
                                                  workoutSetProvided={
                                                    workoutSetProvided
                                                  }
                                                />
                                              </Grid>
                                              {exerciseDraggableProvided.placeholder}
                                            </Grid>
                                          )}
                                        </Droppable>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            }
                          )
                        }
                        {provided.placeholder}
                      </div>
                    )
                  }
                </Droppable>
                <Grid
                  container
                  item
                  xs={12}
                  sx={{ justifyContent: "center", padding: "5px" }}
                >
                  <Link to={`/workout/${workout._id}`}>
                    <Button onClick={() => saveStart(workout)} variant="contained">Start</Button>
                  </Link>
                </Grid>
              </Paper>
            );
          })}
        <Grid container sx={{ justifyContent: "center", alignItems: "center" }}>
          <Grid item>
            <Button onClick={handleAddWorkout} variant="contained" sx={{ margin: "15px" }}>
              Add Workout
            </Button>
          </Grid>
        </Grid>
      </>
    </DragDropContext>
  );
}

const WorkoutSet = (props) => {
  const { workout, workoutSet, provided, workoutSetProvided } = props;
  return (
    <>
      <Paper sx={{ padding: "0 5px" }}>
        <Typography variant="h5">
          <span {...workoutSetProvided.dragHandleProps}>Set {workoutSet.workoutSetIndex + 1}</span>
        </Typography>
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ padding: "5px 0px", margin: "5px 0px" }}
        >
          {workoutSet.exercises.map((exercise, index) => {
            return (
              <Draggable
                key={`${workout._id}-${workoutSet.workoutSetIndex}-${index}`}
                draggableId={`${workout._id}-${workoutSet.workoutSetIndex}-${index}`}
                index={index}
              >
                {(exerciseDraggableProvided) => (
                  <Grid
                    container
                    ref={exerciseDraggableProvided.innerRef}
                    {...exerciseDraggableProvided.draggableProps}
                    component={Paper}
                  >
                    <Grid
                      container
                      item
                      xs={1}
                      sx={{ justifyContent: "center", alignItems: "center" }}
                      {...exerciseDraggableProvided.dragHandleProps}
                    >
                      <DragHandleIcon />
                    </Grid>
                    <Grid container item xs={5}>
                      <Typography variant="body1">
                      {exercise.exercise}
                      </Typography>
                    </Grid>
                    <Grid container item xs={6}>
                      <Typography variant="body1">
                      {exercise.goals.exactReps.length} sets:{" "}
                      {exercise.goals.exactReps.join(", ")} reps
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Draggable>
            );
          })}
        </div>
      </Paper>
    </>
  );
};
