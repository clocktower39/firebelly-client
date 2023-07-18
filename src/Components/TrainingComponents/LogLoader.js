import React from "react";
import { Button, Grid, InputAdornment, TextField, } from "@mui/material";

const LoggedField = (props) => {
  const {
    exercise,
    exerciseIndex,
    field,
    parentProps,
    setIndex,
    exerciseSetIndex,
    setLocalTraining,
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
                exercise.achieved[field.achievedAttribute][exerciseSetIndex] = answer;
              }
              // remove extra zeros from the front
              else if (Number(e.target.value) || e.target.value === "0") {
                if (e.target.value.length > 1 && e.target.value[0] === "0") {
                  answer = e.target.value.split("");
                  while (answer[0] === "0") {
                    answer.shift();
                  }
                  exercise.achieved[field.achievedAttribute][exerciseSetIndex] = answer.join("");
                } else {
                  // update the local state variable
                  answer = e.target.value;
                  exercise.achieved[field.achievedAttribute][exerciseSetIndex] = answer;
                }
              } else {
                exercise.achieved[field.achievedAttribute][exerciseSetIndex] = Number(
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

  const handleGoalAdornmentClick = (e, goalValue) => {
    e.target.value = goalValue.substr(0, goalValue.length);
    if(e.detail === 1){
      handleChange(e);
    }
  }

  return (
    <Grid item xs={5}>
      <TextField
        label={field.label}
        value={exercise.achieved[field.achievedAttribute][exerciseSetIndex] || 0}
        inputProps={{
          inputMode: "decimal",
          pattern: "^[0-9]*\\.?[0-9]*$",
        }}
        onChange={handleChange}
        onFocus={handleFocus}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="start" sx={{ fontSize: "10px", textAlign: "right", userSelect: 'none', }} >
              <Button sx={{ color: "#fff"}} onClick={(e) => handleGoalAdornmentClick(e, parentProps.exercise.goals[field.goalAttribute][exerciseSetIndex])} >/{parentProps.exercise.goals[field.goalAttribute][exerciseSetIndex]}</Button>
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default function LogLoader(props) {
  const { fields, exercise, localTraining, sets, setIndex, setLocalTraining, exerciseIndex } =
    props;

  let exerciseSets = [];
  let count = 0;
  while (exerciseSets.length < sets) {
    exerciseSets.push(count);
    count++;
  }

  const handleAutofillSet = (exerciseSetIndex) => {
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.achieved.reps.map((exerciseSet, esIndex) => {
                if(esIndex === exerciseSetIndex){
                  exercise.achieved.reps[exerciseSetIndex] = exercise.goals.exactReps[exerciseSetIndex];
                  exercise.achieved.weight[exerciseSetIndex] = exercise.goals.weight[exerciseSetIndex];
                }
                return exerciseSet;
              })
            }
            return exercise;
          });
        }
        return set;
      });
    });
  }

  return (
    <Grid container item xs={12} spacing={1}>
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
              <Button sx={{ color: '#fff', }} onClick={()=>handleAutofillSet(exerciseSetIndex)} >Set {exerciseSetIndex + 1}:</Button>
            </Grid>

            {fields.map((field, fieldIndex) => {
              return (
                <LoggedField
                  key={`${field.label}-${exerciseSetIndex}`}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  field={field}
                  localTraining={localTraining}
                  parentProps={props}
                  exerciseSetIndex={exerciseSetIndex}
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
