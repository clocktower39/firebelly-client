import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditRepsWithPercent(props) {
  const [reps, setReps] = useState(props.exercise.goals.exactReps);
  const [percent, setPercent] = useState(props.exercise.goals.percent);
  const { setLocalTraining, setIndex, exerciseIndex } = props;

  const handleChange = (e, setter, index) => {
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
    setLocalTraining((prev) => {
      return prev.map((set, index) => {
        if (index === setIndex) {
          set = set.map((item, index) => {
            if (index === exerciseIndex) {
              item = {
                ...item,
                goals: {
                  ...item.goals,
                  exactReps: reps,
                  percent,
                },
              };
            }
            return item;
          });
        }
        return set;
      });
    });
  },[ setLocalTraining, setIndex, exerciseIndex, reps, percent])

  
  useEffect(()=>{
    setReps(props.exercise.goals.exactReps);
    setPercent(props.exercise.goals.percent);
  },[props.exercise.goals.exactReps, props.exercise.goals.percent])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {props.index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Reps"
          value={reps[props.index]}
          onChange={(e) => handleChange(e, setReps, props.index)}
          type="number"
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          label="Percent"
          value={percent[props.index]}
          onChange={(e) => handleChange(e, setPercent, props.index)}
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
