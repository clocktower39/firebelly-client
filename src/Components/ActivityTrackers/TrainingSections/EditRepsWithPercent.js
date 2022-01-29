import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditRepsWithPercent(props) {
  const { exercise, index} = props;
  const [reps, setReps] = useState(exercise.goals.exactReps);
  const [percent, setPercent] = useState(exercise.goals.percent);
  const { setLocalTraining, setIndex, exerciseIndex } = props;

  // input accepts an empty string or a number above zero
  const handleChange = (e, setter, index) => {
    setter((prev) => {
      const newState = prev.map((item, i) => {
        if (index === i) {
          item = Number(e.target.value) > 0 ? Number(e.target.value) : "";
        }
        return item;
      });
      return newState;
    });
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
    setReps(exercise.goals.exactReps);
    setPercent(exercise.goals.percent);
  },[exercise.goals.exactReps, exercise.goals.percent])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Reps"
          value={reps[index]}
          onChange={(e) => handleChange(e, setReps, index)}
          type="number"
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
          label="Percent"
          value={percent[index]}
          onChange={(e) => handleChange(e, setPercent, index)}
          type="number"
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
