import React, { useState } from "react";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";

export default function TimeLog(props) {
  const [seconds, setSeconds] = useState(props.exercise.achieved.seconds);

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
                      seconds: type === "seconds" ? newState : seconds,
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
    <Grid container item xs={12} spacing={1}>
      {seconds.map((second, i) => {
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
                style={{ padding: 0, }}
                label="Seconds"
                value={seconds[i]}
                onChange={(e) => handleChange(e, setSeconds, i, "seconds")}
                type="number"
                inputProps={{
                  type: "number",
                  inputMode: "decimal",
                  pattern: "[0-9]*",
                }}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start" style={{ fontSize: '10px', textAlign: 'right', paddingRight: 0, }} >
                      /{props.exercise.goals.seconds[i]}
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
