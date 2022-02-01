import React from "react";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";

const LoggedField = (props) => {
  const { exercise, exerciseIndex, field, parentProps, setIndex, setLocalTraining } = props;

  const handleChange = (e) => {
    let answer = 0;
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        set.map((exercise, eIndex) => {
          if (eIndex === exerciseIndex) {
            if (e.target.value === "" && e.target.value.length === 0) {
              exercise.achieved[field.achievedAttribute][setIndex] = answer;
            }
            // remove extra zeros from the front
            else if (Number(e.target.value) || e.target.value === "0") {
              if (e.target.value.length > 1 && e.target.value[0] === "0") {
                answer = e.target.value.split("");
                while (answer[0] === "0") {
                  answer.shift();
                }
                exercise.achieved[field.achievedAttribute][setIndex] = answer.join("");
              } else {
                // update the local state variable
                answer = e.target.value;
                exercise.achieved[field.achievedAttribute][setIndex] = answer;
              }
            } else {
              exercise.achieved[field.achievedAttribute][setIndex] = Number(e.target.value);
            }
          }
          return exercise;
        });
        return set;
      });
    });
  };

  return (
    <Grid item xs={5}>
      <TextField
        label={field.label}
        value={exercise.achieved[field.achievedAttribute][setIndex]}
        type="number"
        inputProps={{
          type: "number",
          inputMode: "decimal",
          pattern: "[0-9]*",
        }}
        onChange={handleChange}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="start" style={{ fontSize: "10px", textAlign: "right" }}>
              /{parentProps.exercise.goals[field.goalAttribute][setIndex]}
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default function LogLoader(props) {
  const { fields, exercise, localTraining, sets, setLocalTraining, exerciseIndex } = props;

  let exerciseSets = [];
  let count = 0;
  while (exerciseSets.length < sets) {
    exerciseSets.push(count);
    count++;
  }

  return (
    <Grid container item xs={12} spacing={1}>
      {exerciseSets.map((count, setIndex) => {
        return (
          <Grid container item xs={12} spacing={2} key={`exercise-Set-${count}-${setIndex}`}>
            <Grid
              item
              xs={2}
              container
              style={{ justifyContent: "flex-end", alignContent: "center" }}
            >
              <Typography noWrap>Set {setIndex + 1}:</Typography>
            </Grid>

            {fields.map((field, fieldIndex) => {
              return (
                <LoggedField
                  key={`${field.label}-${setIndex}`}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  field={field}
                  localTraining={localTraining}
                  parentProps={props}
                  setIndex={setIndex}
                  setLocalTraining={setLocalTraining}
                />
              );
            })}
          </Grid>
        );
      })}
    </Grid>
  );
}
