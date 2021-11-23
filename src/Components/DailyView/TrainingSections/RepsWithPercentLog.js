import React, { useState } from "react";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";

export default function RepsWithPercentLog(props) {
  const [reps, setReps] = useState(props.exercise.achieved.reps);
  const [weight, setWeight] = useState(props.exercise.achieved.weight);
  const [oneRepMax, setOneRepMax] = useState(0);

  const handleChange = (e, setter, index, type) => {
    if (Number(e.target.value) >= 0) {
      setter((prev) => {
        const newState = prev.map((item, i) => {
          if (index === i) {
            item = Number(e.target.value) || 0;
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
    }
  };

  return (
    <Grid container item xs={8} spacing={1}>
      <Grid item xs={12}>
        <TextField
          label="One Rep Max Weight"
          value={oneRepMax}
          onChange={(e) => setOneRepMax(e.target.value)}
          type="number"
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          size="small"
        />
      </Grid>
      {reps.map((rep, i) => {
        return (
          <Grid container item xs={12} spacing={2} key={i}>
            <Grid
              item
              xs={2}
              container
              style={{ justifyContent: "flex-end", alignContent: "center" }}
            >
              <Typography>Set {i + 1}:</Typography>
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
                    <InputAdornment position="start">
                      /{props.exercise.goals.exactReps[i]} reps
                    </InputAdornment>
                  ),
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
                    <InputAdornment position="start">
                      /{(oneRepMax / 100) * props.exercise.goals.percent[i]} lbs
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