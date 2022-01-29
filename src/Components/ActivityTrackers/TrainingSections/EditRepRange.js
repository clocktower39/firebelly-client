import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditRepRange(props) {
  const { exercise, index} = props;
  const [minReps, setMinReps] = useState(exercise.goals.minReps || 0);
  const [maxReps, setMaxReps] = useState(exercise.goals.maxReps || 0);
  const { setLocalTraining, setIndex, exerciseIndex } = props;

  // input accepts an empty string or a number above zero
  const handleChange = (e, setter, index) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setter((prev) => prev.map((item, i) => {
          if (index === i) {
            item = e.target.value.match(re);
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
    setMinReps(exercise.goals.minReps);
    setMaxReps(exercise.goals.maxReps);
  },[exercise.goals.minReps, exercise.goals.maxReps])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Min Reps"
          value={minReps[index]===0?"":minReps[index]}
          onChange={(e) => handleChange(e, setMinReps, index)}
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
          value={maxReps[index]===0?"":maxReps[index]}
          onChange={(e) => handleChange(e, setMaxReps, index)}
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
