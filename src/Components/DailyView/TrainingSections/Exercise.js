import React, { useState } from "react";
import { Grid, IconButton, TextField, Typography } from "@mui/material";
import { RemoveCircle } from "@mui/icons-material";
import ExerciseSet from "./ExerciseSet";

export default function Exercise(props) {
  const [title, setTitle] = useState(props.exercise.exercise);
  const [sets, setSets] = useState(props.exercise.goals.sets);
  const [minReps, setMinReps] = useState(props.exercise.goals.minReps);
  const [maxReps, setMaxReps] = useState(props.exercise.goals.maxReps);

  const handleSetChange = (e) => {
    setSets(e.target.value);
    props.setLocalTraining((prev) => {
      return prev.map((set, setIndex) => {
        if (setIndex === props.setIndex) {
          set.map((exercise, exerciseIndex) => {
            if (exerciseIndex === props.exerciseIndex) {
              exercise.exercise = title;
              exercise.goals = {
                sets: e.target.value,
                minReps,
                maxReps,
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
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  const handleChange = (e, setter) => {
    setter(e.target.value);
    props.setLocalTraining((prev) => {
      return prev.map((set, setIndex) => {
        if (setIndex === props.setIndex) {
          set.map((exercise, exerciseIndex) => {
            if (exerciseIndex === props.exerciseIndex) {
              exercise.exercise = title;
              exercise.goals = {
                sets,
                minReps,
                maxReps,
              };
              while (Number(exercise.achieved.reps.length) !== Number(sets)) {
                if (Number(exercise.achieved.reps.length) > Number(sets)) {
                  exercise.achieved.reps.pop();
                } else if (Number(exercise.achieved.reps.length) < Number(sets)) {
                  exercise.achieved.reps.push(0);
                }
              }
              while (Number(exercise.achieved.weight.length) !== Number(sets)) {
                Number(exercise.achieved.weight.length) > Number(sets)
                  ? exercise.achieved.weight.pop()
                  : exercise.achieved.weight.push(0);
              }
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  return (
    <Grid container spacing={2} style={{ marginBottom: "25px", justifyContent: "center" }}>
      {props.editMode ? (
        <>
          <Grid container item xs={10} spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Exercise Title"
                value={title}
                onChange={(e) => handleChange(e, setTitle)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Type" fullWidth />
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
            <Grid item xs={4} sm={2}>
              <TextField
                label="Min Reps"
                value={minReps}
                onChange={(e) => handleChange(e, setMinReps)}
                type="number"
                inputProps={{ type: "number", inputMode: "decimal", pattern: "[0-9]*" }}
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                label="Max Reps"
                value={maxReps}
                onChange={(e) => handleChange(e, setMaxReps)}
                type="number"
                inputProps={{ type: "number", inputMode: "decimal", pattern: "[0-9]*" }}
              />
            </Grid>
          </Grid>
          <Grid container item xs={2} style={{ alignContent: "center" }} spacing={1}>
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
