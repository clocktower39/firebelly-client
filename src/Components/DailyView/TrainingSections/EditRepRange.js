import React, { useState, useEffect } from "react";
import { Grid, TextField } from "@mui/material";

export default function EditRepRange(props) {
  const [minReps, setMinReps] = useState(props.exercise.goals.minReps);
  const [maxReps, setMaxReps] = useState(props.exercise.goals.maxReps);

  const handleChange = (e, setter, index, type) => {
    if (Number(e.target.value) >= 0) {
      setter((prev) => {
        const newState = prev.map((item, i) => {
          if (index === i) {
            item = Number(e.target.value) || 0;
          }
          return item;
        });
        return newState;
      });
    }
  };

  useEffect(()=>{
    props.setLocalTraining((prev) => {
      return prev.map((set, index) => {
        if (index === props.setIndex) {
          set = set.map((item, index) => {
            if (index === props.exerciseIndex) {
              item = {
                ...item,
                goals: {
                  ...item.goals,
                  minReps,
                  maxReps,
                },
              };
            }
            return item;
          });
        }
        return set;
      });
    });
  },[props, minReps, maxReps])

  
  useEffect(()=>{
    setMinReps(props.exercise.goals.minReps);
    setMaxReps(props.exercise.goals.maxReps);
  },[props.exercise.goals.minReps, props.exercise.goals.maxReps])

  return (
    <Grid container item xs={12} spacing={1}>
      <Grid item xs={6}>
        <TextField
          label="Min Reps"
          value={minReps[props.index]}
          onChange={(e) => handleChange(e, setMinReps, props.index, "minReps")}
          type="number"
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Max Reps"
          value={maxReps[props.index]}
          onChange={(e) => handleChange(e, setMaxReps, props.index, "maxReps")}
          type="number"
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
