import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditRepRange(props) {
  const [minReps, setMinReps] = useState(props.exercise.goals.minReps || 0);
  const [maxReps, setMaxReps] = useState(props.exercise.goals.maxReps || 0);
  const { setLocalTraining, setIndex, exerciseIndex } = props;

  // input accepts an empty string or a number above zero
  const handleChange = (e, setter, index) => {
    if(Number(e.target.value) > 0){
      setter((prev) => prev.map((item, i) => {
          if (index === i) {
            item = Number(e.target.value);
          }
          return item;
        })
      );
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
  },[ setLocalTraining, setIndex, exerciseIndex, minReps, maxReps])

  
  useEffect(()=>{
    setMinReps(props.exercise.goals.minReps);
    setMaxReps(props.exercise.goals.maxReps);
  },[props.exercise.goals.minReps, props.exercise.goals.maxReps])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {props.index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Min Reps"
          value={minReps[props.index]===0?"":minReps[props.index]}
          onChange={(e) => handleChange(e, setMinReps, props.index)}
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          size="small"
          fullWidth
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          label="Max Reps"
          value={maxReps[props.index]===0?"":maxReps[props.index]}
          onChange={(e) => handleChange(e, setMaxReps, props.index)}
          inputProps={{
            type: "number",
            inputMode: "decimal",
            pattern: "[0-9]*",
          }}
          size="small"
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
