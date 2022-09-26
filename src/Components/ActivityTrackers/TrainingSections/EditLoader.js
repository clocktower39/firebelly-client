import React from "react";
import { Grid, TextField, Typography } from "@mui/material";

const LoggedField = (props) => {
  const {
    exercise,
    exerciseIndex,
    field,
    setIndex,
    exerciseSetIndex,
    setLocalTraining,
    amountOfFields,
  } = props;

  const handleFocus = (e) => {
    if(Number(e.target.value) === 0){
      e.target.select();
    }
  }

  const handleChange = (e) => {
    let answer = 0;
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              if (e.target.value === "" && e.target.value.length === 0) {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = answer;
              }
              // remove extra zeros from the front
              else if (Number(e.target.value) || e.target.value === "0") {
                if (e.target.value.length > 1 && e.target.value[0] === "0") {
                  answer = e.target.value.split("");
                  while (answer[0] === "0") {
                    answer.shift();
                  }
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = answer.join("");
                } else {
                  // update the local state variable
                  answer = e.target.value;
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = answer;
                }
              } else {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = Number(
                  e.target.value
                );
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
    <Grid item xs={(amountOfFields % 2 === 0) ? 6 : (amountOfFields === 1) ? 12 : 4}>
      <TextField
        label={field.label}
        value={exercise.goals[field.goalAttribute][exerciseSetIndex]}
        type="number"
        inputProps={{
          type: "number",
          inputMode: "decimal",
          pattern: "[0-9]*",
        }}
        onChange={handleChange}
        onFocus={handleFocus}
        size="small"
        fullWidth
      />
    </Grid>
  );
};

export default function EditLoader(props) {
  const { fields, exercise, sets, setIndex, setLocalTraining, exerciseIndex } =
    props;

  let exerciseSets = [];
  let count = 0;
  while (exerciseSets.length < sets) {
    exerciseSets.push(count);
    count++;
  }

  return (
    <Grid container item xs={12} spacing={1}>
      {fields.nonRepeating && fields.nonRepeating.map((field) => <Grid key={`nonRepeating-${field.label}`} container item xs={12} sx={{ justifyContent: 'center', }} ><TextField label="One Rep Max" fullWidth /></Grid>)}
      {exerciseSets.map((count, exerciseSetIndex) => {
        return (
          <Grid
            container
            item
            xs={12}
            spacing={2}
            key={`exercise-Set-${count}-${exerciseSetIndex}`}
          >
            <Grid
              item
              xs={2}
              container
              sx={{ justifyContent: "flex-end", alignContent: "center" }}
            >
              <Typography color="text.primary" noWrap>Set {exerciseSetIndex + 1}:</Typography>
            </Grid>
            <Grid container item xs={10} spacing={1} >

              {fields.repeating.map((field) => {
                return (
                  <LoggedField
                    key={`${field.label}-${exerciseSetIndex}`}
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    field={field}
                    setIndex={setIndex}
                    exerciseSetIndex={exerciseSetIndex}
                    setLocalTraining={setLocalTraining}
                    amountOfFields={fields.repeating.length}
                  />
                );
              })}
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
}
