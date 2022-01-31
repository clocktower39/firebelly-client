import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Paper,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Edit, FactCheck } from "@mui/icons-material";
import { createTraining, requestTraining, updateTraining } from "../../Redux/actions";
import SwipeableSet from "./TrainingSections/SwipeableSet";
import SelectedDate from "./SelectedDate";
import AuthNavbar from '../AuthNavbar';

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

  const [editMode, setEditMode] = useState(false);

  const [trainingCategory, setTrainingCategory] = useState("");

  const [localTraining, setLocalTraining] = useState([]);

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
        category: trainingCategory,
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
        category: trainingCategory,
        training: [...newTraining],
      })
    );
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    const newTraining = localTraining.filter((item, index) => index !== setIndex);

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: trainingCategory,
        training: [...newTraining],
      })
    );
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
        category: trainingCategory,
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = () => {
    dispatch(
      updateTraining(training._id, {
        ...training,
        category: trainingCategory,
        training: localTraining,
      })
    );
  };

  useEffect(() => {
    setTrainingCategory(training.category || "");
    setLocalTraining(training.training || []);
  }, [training]);

  useEffect(() => {
    dispatch(requestTraining(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: '75px', }}>
        <Paper sx={{ padding: '15px', borderRadius: '15px', }}>
        <SelectedDate setParentSelectedDate={setSelectedDate} input/>
        <Grid container sx={{ alignItems: "center", paddingBottom: '15px', }}>
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
            <Grid item xs={11} container alignContent="center">
              <TextField
                label="Training Category"
                onChange={(e) => setTrainingCategory(e.target.value)}
                value={trainingCategory}
                fullWidth
                disabled={!editMode}
              />
            </Grid>
            <Grid container style={{ alignContent: "center" }} item xs={1}>
              <Grid container style={{ justifyContent: "center" }} item xs={12}>
                <IconButton variant="contained" onClick={() => setEditMode(!editMode)}>
                  {editMode ? <FactCheck /> : <Edit />}
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider style={{ margin: "25px 0px" }} />
          </Grid>
          <SwipeableSet
            editMode={editMode}
            newExercise={newExercise}
            removeSet={removeSet}
            removeExercise={removeExercise}
            localTraining={localTraining}
            setLocalTraining={setLocalTraining}
            save={save}
          />
          {editMode ? (
            <Grid item xs={12} container style={{ justifyContent: "space-between" }}>
              <Button variant="contained" onClick={newSet}>
                New Set
              </Button>
              <Button variant="contained" onClick={save}>
                Save
              </Button>
            </Grid>
          ) : (
            <Grid item xs={12} container style={{ justifyContent: "flex-end" }}>
              <Button variant="contained" onClick={save}>
                Save
              </Button>
            </Grid>
          )}
        </Grid>
        ):(
          <Grid container item xs={12} sx={{ justifyContent: 'center', }}>
            <Button onClick={()=> dispatch(createTraining(selectedDate)) } >Create Workout</Button>
          </Grid>
        )}
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
