import React, { useState } from "react";
import { Grid, InputAdornment, TextField, Typography } from "@mui/material";

export default function TimeLog(props) {
  const { exercise, setLocalTraining, setIndex, exerciseIndex } = props;
  const [seconds, setSeconds] = useState(exercise.achieved.seconds);

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
      setLocalTraining((prev) => {
        return prev.map((set, index) => {
          if (index === setIndex) {
            set = set.map((item, index) => {
              if (index === exerciseIndex) {
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
                      /{exercise.goals.seconds[i]}
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
