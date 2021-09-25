import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import {
    requestDailyNutrition,
    updateDailyNutrition,
} from "../../Redux/actions";

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

export default function Nutrition(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const today = useSelector((state) => state.calander.dailyView);

  let dailyNutritionAchieved = 0;
  let dailyNutritionGoal = 1;
  if(today.dailyNutrition.length > 0){
    dailyNutritionAchieved = today.dailyNutrition.reduce((a, b) => ({
      achieved: a.achieved + b.achieved,
    })).achieved;
    dailyNutritionGoal = today.dailyNutrition.reduce((a, b) => ({
      goal: a.goal + b.goal,
    })).goal;
  }

  const [localNutrition, setLocalNutrition] = useState(today.dailyNutrition);

  const saveChanges = () => {
    dispatch(updateDailyNutrition(localNutrition))
  }

  const NutritionStat = (props) => {
    const [taskAchieved, setTaskAchieved] = useState(props.task.achieved);
    const handleChange = (e) => {
      if (e.target.value === "" && e.target.value.length === 0) {
        setTaskAchieved(0);
      } else if (Number(e.target.value) || e.target.value === "0") {
        if (e.target.value.length > 1 && e.target.value[0] === "0") {
          let trimmed = e.target.value.split("");
          while (trimmed[0] === "0") {
            trimmed.shift();
          }
          setTaskAchieved(trimmed.join(""));
        } else {
          setTaskAchieved(e.target.value)
          
          setLocalNutrition(previous => {
            return previous.length>0?previous.map(nutrition => {
              if(nutrition._id === props.task._id){
                nutrition.achieved = e.target.value;
              }
              return nutrition;
            }):[]
          })
          
        }
      }
      
    };
    const handleKeyDown = (e) => {
      if (e.keyCode === 8) {
        setTaskAchieved(e.target.value);
      }
    };

    return (
      <Grid item xs={12} >
        <TextField
          fullWidth
          variant="outlined"
          label={props.task.title}
          value={taskAchieved}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          type="number"
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

  useEffect(() => {
    dispatch(
        requestDailyNutrition(
        user["_id"],
        props.selectedDate
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalNutrition(today.dailyNutrition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.dailyNutrition]);
  
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <Typography className={classes.heading}>Nutrition</Typography>
          </Grid>
          <Grid item xs={9}>
            <LinearProgress
              variant="determinate"
              value={(dailyNutritionAchieved / dailyNutritionGoal) * 100}
            />
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {today.dailyNutrition.map((task) => (
            <NutritionStat key={task.title} task={task} />
          ))}
          <Grid xs={12} item container justifyContent="center">
            <Button variant="outlined" onClick={saveChanges}>Save</Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
