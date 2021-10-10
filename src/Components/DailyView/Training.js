import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  LinearProgress,
  TextField,
  Typography,
  makeStyles,
  Button,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { requestDailyTraining, updateDailyTraining } from "../../Redux/actions";

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

export default function Training(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const today = useSelector((state) => state.calander.dailyView);

  const [trainingCategory, setTrainingCategory] = useState("");
  const handleTrainingCategoryChange = (e) =>
    setTrainingCategory(e.target.value);

  let allTraining = [];

  let dailyTrainingAchieved = 0;
  let dailyTrainingGoal = 1;

  if (today.dailyTraining) {
    today.dailyTraining.training.forEach((set) => {
      set.forEach((task) => {
          if(task.goals){
            allTraining.push({
              goal: task.goals.sets,
              achieved: task.achieved.sets,
            });
          }
      });
    });

    if (today.dailyTraining.training.length > 0) {
      dailyTrainingAchieved = allTraining.reduce((a, b) => ({
        achieved: a.achieved + b.achieved,
      })).achieved;
      dailyTrainingGoal = allTraining.reduce((a, b) => ({
        goal: a.goal + b.goal,
      })).goal;
    }
  }

  const newExercise = (index) => {
    const newTraining = today.dailyTraining.training.map((group, i) => {
      if(index === i){
        group.push(
          {
            exercise: "Unset",
            goals: {
              sets: 0,
              minReps: 0,
              maxReps: 0,
            },
            achieved: {
              sets: 0,
              reps: [],
            },
          }
        )
      }
      return group;
    })
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining]
      })
    );
  }

  const newSet = () =>
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [
          ...today.dailyTraining.training,
          [
            [
              {
                exercise: "Unset",
                goals: {
                  sets: 0,
                  minReps: 0,
                  maxReps: 0,
                },
                achieved: {
                  sets: 0,
                  reps: [],
                },
              },
            ],
          ],
        ],
      })
    );

  useEffect(() => {
    setTrainingCategory(today.dailyTraining.trainingCategory);
  }, [today]);

  useEffect(() => {
    dispatch(requestDailyTraining(user["_id"], props.selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedDate]);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <Typography className={classes.heading}>Training</Typography>
          </Grid>
          <Grid item xs={9}>
            <LinearProgress
              variant="determinate"
              value={(dailyTrainingAchieved / dailyTrainingGoal) * 100}
            />
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Training Category"
              onChange={handleTrainingCategoryChange}
              value={trainingCategory}
              fullWidth
            />
          </Grid>
          {today.dailyTraining.training.length > 0 ? (
            today.dailyTraining.training.map((group, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="h5">Set {index + 1}</Typography>
                {group.map((exercise) => (
                  <Grid container>
                    {/* <TextField key={exercise.exercise} fullWidth variant="outlined" label={exercise.exercise} /> */}
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Exercise Title"
                        value={exercise.exercise}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField label="Sets" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField label="Min Reps" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField label="Max Reps" />
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button variant="contained" onClick={()=>newExercise(index)}>New Exercise</Button>
                </Grid>
              </Grid>
            ))
          ) : (
            <></>
          )}
          <Grid item xs={12}>
            <Button variant="contained" onClick={newSet} >New Set</Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
