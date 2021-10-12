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

const Set = (props) => {
  return props.today.dailyTraining.training.map((group, index) => (
    <Grid item xs={12} key={index}>
      <Typography variant="h5" gutterBottom>
        Set {index + 1}
      </Typography>
      {group.map((exercise) => (
        <Exercise key={exercise._id} exercise={exercise} />
      ))}
      <Grid item xs={12}>
        <Button variant="contained" onClick={() => props.newExercise(index)}>
          New Exercise
        </Button>
      </Grid>
    </Grid>
  ));
};

const Exercise = (props) => {
  const [title, setTitle] = useState(props.exercise.exercise);
  const [sets, setSets] = useState(props.exercise.goals.sets);
  const [minReps, setMinReps] = useState(props.exercise.goals.minReps);
  const [maxReps, setMaxReps] = useState(props.exercise.goals.maxReps);

  const handleChange = (e,setter) => setter(e.target.value);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={3}>
        <TextField label="Exercise Title" value={title} onChange={(e)=>handleChange(e, setTitle)} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField label="Sets" value={sets} onChange={(e)=>handleChange(e, setSets)} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField label="Min Reps" value={minReps} onChange={(e)=>handleChange(e, setMinReps)} />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField label="Max Reps" value={maxReps} onChange={(e)=>handleChange(e, setMaxReps)} />
      </Grid>
    </Grid>
  );
};

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
        if (task.goals) {
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
      if (index === i) {
        group.push({
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
        });
      }
      return group;
    });
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining],
      })
    );
  };

  const newSet = () => {
    let newTraining = [...today.dailyTraining.training];
    newTraining.push([
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
    ]);
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining],
      })
    );
  };

  const save = () => {};

  useEffect(() => {
    setTrainingCategory(today.dailyTraining.category);
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
            <Set today={today} newExercise={newExercise} />
          ) : (
            <></>
          )}
          <Grid item xs={12}>
            <Button variant="contained" onClick={newSet}>
              New Set
            </Button>
            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
