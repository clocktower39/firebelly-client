import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditTime(props) {
  const { exercise, index} = props;
  const [seconds, setSeconds] = useState(exercise.goals.seconds);
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
                  seconds,
                },
              };
            }
            return item;
          });
        }
        return set;
      });
    });
  },[ setLocalTraining, setIndex, exerciseIndex, seconds])

  
  useEffect(()=>{
    setSeconds(exercise.goals.seconds);
  },[exercise.goals.seconds])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Seconds"
          value={seconds[index]}
          onChange={(e) => handleChange(e, setSeconds, index)}
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
