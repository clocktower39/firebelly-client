import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Autocomplete,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { createTraining, requestTraining, updateTraining } from "../../Redux/actions";
import SwipeableSet from "./TrainingSections/SwipeableSet";
import SelectedDate from "./SelectedDate";
import AuthNavbar from "../AuthNavbar";

const useStyles = makeStyles((theme) => ({
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
}));

export default function Training(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const training = useSelector((state) => state.training);

  // toggle edit mode
  const [selectedDate, setSelectedDate] = useState(null);

  const [trainingCategory, setTrainingCategory] = useState([]);

  const [localTraining, setLocalTraining] = useState([]);

  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const categories = ['Biceps', 'Triceps', 'Chest', 'Back', 'Shoulders', 'Legs'];

  let allTraining = [];

  let trainingAchieved = 0;
  let trainingGoal = 1;

  if (training) {
    if (training.training.length > 0 && allTraining.length > 0) {
      trainingAchieved = allTraining.reduce((a, b) => ({
        achieved: a.achieved + b.achieved,
      })).achieved;
      trainingGoal = allTraining.reduce((a, b) => ({
        goal: a.goal + b.goal,
      })).goal;
    }
  }

  // Create a new exercise on the current set
  const newExercise = (index) => {
    const newTraining = localTraining.map((group, i) => {
      if (index === i) {
        group.push({
          exercise: "",
          exerciseType: "Reps",
          goals: {
            sets: 1,
            minReps: [0],
            maxReps: [0],
            exactReps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
          },
          achieved: {
            sets: 0,
            reps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
          },
        });
      }
      return group;
    });
    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Create a new set on the current day
  const newSet = () => {
    let newTraining = [...localTraining];
    newTraining.push([
      {
        exercise: "",
        exerciseType: "Reps",
        goals: {
          sets: 1,
          minReps: [0],
          maxReps: [0],
          exactReps: [0],
          weight: [0],
          percent: [0],
          seconds: [0],
        },
        achieved: {
          sets: 0,
          reps: [0],
          weight: [0],
          percent: [0],
          seconds: [0],
        },
      },
    ]);
    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
    setToggleNewSet(prev=>!prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    const newTraining = localTraining.filter((item, index) => index !== setIndex);

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
    setToggleRemoveSet(prev=>!prev);
  };

  // Remove the current exercise
  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = localTraining.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = () => {
    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: localTraining,
      })
    );
  };

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps)
  }

  useEffect(() => {
    setTrainingCategory(training.category && training.category.length > 0 ? training.category : []);
    setLocalTraining(training.training || []);
  }, [training]);

  useEffect(() => {
    dispatch(requestTraining(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: "75px" }}>
        <Paper sx={{ padding: "15px", borderRadius: "15px" }}>
          <SelectedDate setParentSelectedDate={setSelectedDate} input />
          <Grid container sx={{ alignItems: "center", paddingBottom: "15px" }}>
            <Grid item xs={3}>
              <Typography className={classes.heading}>Training</Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(trainingAchieved / trainingGoal) * 100}
              />
            </Grid>
          </Grid>
          {training.training.length > 0 ? (
            <Grid container>
              <Grid item xs={12} container className={classes.TrainingCategoryInputContainer}>
                <Grid item xs={12} container alignContent="center">
                  <Autocomplete
                    disableCloseOnSelect
                    value={trainingCategory}
                    fullWidth
                    multiple
                    id="tags-filled"
                    defaultValue={trainingCategory.map(category => category)}
                    options={categories.map((option) => option)}
                    freeSolo
                    onChange={(e, getTagProps) => handleTrainingCategory(getTagProps)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Training Category"
                        placeholder="Categories"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider style={{ margin: "25px 0px" }} />
              </Grid>
              <SwipeableSet
                newExercise={newExercise}
                removeSet={removeSet}
                removeExercise={removeExercise}
                localTraining={localTraining}
                setLocalTraining={setLocalTraining}
                save={save}
                toggleNewSet={toggleNewSet}
                toggleRemoveSet={toggleRemoveSet}
                maxSteps={localTraining.length}
              />
              <Grid item xs={12} container style={{ justifyContent: "space-between" }}>
                <Button variant="contained" onClick={newSet}>
                  New Set
                </Button>
                <Button variant="contained" onClick={save}>
                  Save
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid container item xs={12} sx={{ justifyContent: "center" }}>
              <Button onClick={() => dispatch(createTraining(selectedDate))}>Create Workout</Button>
            </Grid>
          )}
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
