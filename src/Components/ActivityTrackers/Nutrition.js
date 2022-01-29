import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { requestNutrition, updateNutrition } from "../../Redux/actions";
import SelectedDate from "./SelectedDate";
import AuthNavbar from '../AuthNavbar';

const useStyles = makeStyles((theme) => ({
  heading: {},
  ModalPaper: {
    position: "absolute",
    padding: "17.5px",
    width: "65%",
    backgroundColor: "#fcfcfc",
    left: "50%",
    transform: "translate(-50%, 50%)",
  },
}));

const NutritionStat = (props) => {
  const [taskAchieved, setTaskAchieved] = useState(props.task.achieved);
  const handleChange = (e) => {
    // initialize answer to be used at the end of the conditional
    let answer = 0;
    // input can not be an empty string
    if (e.target.value === "" && e.target.value.length === 0) {
      setTaskAchieved(answer);
    }
    // remove extra zeros from the front
    else if (Number(e.target.value) || e.target.value === "0") {
      if (e.target.value.length > 1 && e.target.value[0] === "0") {
        answer = e.target.value.split("");
        while (answer[0] === "0") {
          answer.shift();
        }
        setTaskAchieved(answer.join(""));
      } else {
        // update the local state variable
        answer = e.target.value;
        setTaskAchieved(answer);
      }
    }
    props.setLocalNutrition((previous) => {
      const newLocalNutrition = { ...previous };
      newLocalNutrition.stats[props.nutritionObjectProperty].achieved = Number(answer);
      return {
        ...newLocalNutrition,
      };
    });
  };

  // allow backspace
  const handleKeyDown = (e) => {
    if (e.keyCode === 8) {
      setTaskAchieved(e.target.value);
    }
  };

  useEffect(() => {
    setTaskAchieved(props.task.achieved);
  }, [props.task.achieved]);

  return (
    <Grid item xs={12}>
      <TextField
        fullWidth
        variant="outlined"
        label={props.task.title}
        value={taskAchieved}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="number"
        inputProps={{ type: "number", pattern: "\\d*" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              /{props.task.goal} {props.task.unit}
            </InputAdornment>
          ),
        }}
      />
    </Grid>
  );
};

export default function Nutrition(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const nutrition = useSelector((state) => state.nutrition);
  const [selectedDate, setSelectedDate] = useState(null);

  let nutritionAchieved = 0;
  let nutritionGoal = 1;
  if (nutrition.stats && Object.keys(nutrition.stats).length > 0) {
    nutritionAchieved = Object.keys(nutrition.stats)
      .map((item) => nutrition.stats[item])
      .reduce((a, b) => ({
        achieved: a.achieved + b.achieved,
      })).achieved;
    nutritionGoal = Object.keys(nutrition.stats)
      .map((item) => nutrition.stats[item])
      .reduce((a, b) => ({
        goal: a.goal + b.goal,
      })).goal;
  }

  // stores all nutrition info as a buffer
  const [localNutrition, setLocalNutrition] = useState(nutrition);

  // Updates DB with local nutrition
  const saveChanges = () => {
    dispatch(updateNutrition(localNutrition));
  };

  useEffect(() => {
    dispatch(requestNutrition(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    setLocalNutrition(nutrition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutrition]);

  return (
    <>
      <Container maxWidth="md" sx={{ minHeight: "100%", paddingTop: "15px", paddingBottom: '75px', }}>
        <Paper sx={{ padding: '7.5px', minHeight: "100%" }}>
          <Grid container sx={{ alignItems: "center", paddingBottom: '15px', }}>
            <SelectedDate setParentSelectedDate={setSelectedDate} />
            <Grid item xs={3}>
              <Typography className={classes.heading}>Nutrition</Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(nutritionAchieved / nutritionGoal) * 100}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {localNutrition.stats &&
              Object.keys(nutrition.stats).map((task) => (
                <NutritionStat
                  key={task}
                  nutritionObjectProperty={task}
                  task={localNutrition.stats[task]}
                  setLocalNutrition={setLocalNutrition}
                />
              ))}
            <Grid xs={12} item container style={{ justifyContent: "center" }}>
              <Button variant="outlined" onClick={saveChanges}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}