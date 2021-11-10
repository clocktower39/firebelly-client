import React, { useState, useEffect } from "react";
import { Grid, TextField, Typography } from "@mui/material";

export default function EditTime(props) {
  const [seconds, setSeconds] = useState(props.exercise.goals.seconds);
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
    setSeconds(props.exercise.goals.seconds);
  },[props.exercise.goals.seconds])

  return (
    <Grid container item xs={12} spacing={1}>
    <Grid item xs={2} container style={{justifyContent: 'flex-end', alignContent: 'center'}} >
      <Typography >Set {props.index + 1}:</Typography>
    </Grid>
      <Grid item xs={5}>
        <TextField
          label="Seconds"
          value={seconds[props.index]}
          onChange={(e) => handleChange(e, setSeconds, props.index)}
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
