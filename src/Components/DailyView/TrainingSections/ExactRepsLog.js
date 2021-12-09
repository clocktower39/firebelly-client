import React, { useState } from "react";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";

export default function ExactRepsLog(props) {
  const [reps, setReps] = useState(props.exercise.achieved.reps);
  const [weight, setWeight] = useState(props.exercise.achieved.weight);

  const handleChange = (e, setter, index, type) => {
    // initialize answer to be used at the end of the conditional
    let answer = 0;
    setter((prev) => {
      const newState = prev.map((item, i) => {
        if (index === i) {
          if (e.target.value === "" && e.target.value.length === 0) {
            item = answer;
          }
          // remove extra zeros from the front
          else if (Number(e.target.value) || e.target.value === "0") {
            if (e.target.value.length > 1 && e.target.value[0] === "0") {
              answer = e.target.value.split("");
              while (answer[0] === "0") {
                answer.shift();
              }
              item = answer.join("");
            } else {
              // update the local state variable
              answer = e.target.value;
              item = answer;
            }
          }
          else {
            item = Number(e.target.value);
          }
        }
        return item;
      });
      props.setLocalTraining((prev) => {
        return prev.map((set, index) => {
          if (index === props.setIndex) {
            set = set.map((item, index) => {
              if (index === props.exerciseIndex) {
                item = {
                  ...item,
                  achieved: {
                    ...item.achieved,
                    reps: type === "reps" ? newState : reps,
                    weight: type === "weight" ? newState : weight,
                  },
                };
              }
              return item;
            });
          }
          return set;
        });
      });
      return newState;
    });
  };

  return (
    <Grid container item xs={12} spacing={1}>
      {reps.map((rep, i) => {
        return (
          <Grid container item xs={12} spacing={2} key={i}>
            <Grid
              item
              xs={2}
              container
              style={{ justifyContent: "flex-end", alignContent: "center" }}
            >
              <Typography noWrap >Set {i + 1}:</Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Reps"
                value={reps[i]}
                onChange={(e) => handleChange(e, setReps, i, "reps")}
                type="number"
                inputProps={{
                  type: "number",
                  inputMode: "decimal",
                  pattern: "[0-9]*",
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start" style={{ fontSize: '10px', textAlign: 'right', }} >
                      /{props.exercise.goals.exactReps[i]}
                    </InputAdornment>
                  ),
                }}
                InputBase={{
                  padding: 0,
                }}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Weight"
                value={weight[i]}
                onChange={(e) => handleChange(e, setWeight, i, "weight")}
                type="number"
                inputProps={{
                  type: "number",
                  inputMode: "decimal",
                  pattern: "[0-9]*",
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start" style={{ fontSize: '10px', textAlign: 'right', }} >
                      /{props.exercise.goals.weight[i]}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
}
