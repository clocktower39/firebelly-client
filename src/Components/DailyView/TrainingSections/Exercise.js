import React, { useState } from "react";
import { Grid, IconButton, TextField, Typography } from "@mui/material";
import { RemoveCircle } from "@mui/icons-material";
import EditRepRange from "./EditRepRange";
import ExerciseSet from "./ExerciseSet";

export default function Exercise(props) {
  const [title, setTitle] = useState(props.exercise.exercise);
  const [exerciseType, setExerciseType] = useState(props.exercise.exerciseType||"Rep Range");
  const [sets, setSets] = useState(props.exercise.goals.sets);

  const handleTypeChange = (e) => {
    setExerciseType(e.target.value);
  }

  const handleSetChange = (e) => {
    if(Number(e.target.value) > 0){
      setSets(Number(e.target.value));
      props.setLocalTraining((prev) => {
        return prev.map((set, setIndex) => {
          if (setIndex === props.setIndex) {
            set.map((exercise, exerciseIndex) => {
              if (exerciseIndex === props.exerciseIndex) {
                exercise.exercise = title;
                exercise.goals = {
                  ...exercise.goals,
                  sets: e.target.value,
                };
                while (Number(exercise.achieved.reps.length) !== Number(e.target.value)) {
                  if (Number(exercise.achieved.reps.length) > Number(e.target.value)) {
                    exercise.achieved.reps.pop();
                  } else if (Number(exercise.achieved.reps.length) < Number(e.target.value)) {
                    exercise.achieved.reps.push(0);
                  }
                }
                while (Number(exercise.achieved.weight.length) !== Number(e.target.value)) {
                  Number(exercise.achieved.weight.length) > Number(e.target.value)
                    ? exercise.achieved.weight.pop()
                    : exercise.achieved.weight.push(0);
                }
                while (Number(exercise.goals.minReps.length) !== Number(e.target.value)) {
                  Number(exercise.goals.minReps.length) > Number(e.target.value)
                    ? exercise.goals.minReps.pop()
                    : exercise.goals.minReps.push(0);
                }
                while (Number(exercise.goals.maxReps.length) !== Number(e.target.value)) {
                  Number(exercise.goals.maxReps.length) > Number(e.target.value)
                    ? exercise.goals.maxReps.pop()
                    : exercise.goals.maxReps.push(0);
                }
              }
              return exercise;
            });
          }
          return set;
        });
      });
    }
  };

  return (
    <Grid container spacing={2} style={{ marginBottom: "25px", justifyContent: "center" }}>
      {props.editMode ? (
        <>
          <Grid container item xs={11} spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Exercise Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Type" select SelectProps={{ native: true }} fullWidth value={exerciseType} onChange={handleTypeChange}>
                <option value="Rep Range">Rep Range</option>
                <option value="Reps">Reps</option>
                <option value="Reps with %">Reps with %</option>
                <option value="Time">Time</option>
              </TextField>
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                label="Sets"
                value={sets}
                onChange={(e) => handleSetChange(e)}
                type="number"
                inputProps={{ type: "number", pattern: "\\d*" }}
              />
            </Grid>
            {props.exercise.goals.minReps.map((exerciseSet, index) => <EditRepRange exercise={props.exercise} setIndex={props.setIndex} exerciseIndex={props.exerciseIndex} index={index} localTraining={props.localTraining} setLocalTraining={props.setLocalTraining} />)}
          </Grid>
          <Grid container item xs={1} style={{ alignContent: "center" }} spacing={1}>
            <Grid
              container
              item
              xs={12}
              sm={6}
              style={{ justifyContent: "center", alignContent: "center" }}
            >
              <Grid item>
                <IconButton
                  onClick={() => props.removeExercise(props.setIndex, props.exerciseIndex)}
                >
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" style={{ textAlign: "center" }}>
              {title || "Enter an exercise"}:
            </Typography>
          </Grid>
          <ExerciseSet
            exercise={props.exercise}
            sets={sets}
            saveExerciseSet={props.saveExerciseSet}
            setIndex={props.setIndex}
            exerciseIndex={props.exerciseIndex}
            localTraining={props.localTraining}
            setLocalTraining={props.setLocalTraining}
          />
        </>
      )}
    </Grid>
  );
}
