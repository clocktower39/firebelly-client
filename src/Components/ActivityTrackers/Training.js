import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { ExpandMore, Edit, FactCheck } from "@mui/icons-material";
import { requestDailyTraining, updateDailyTraining } from "../../Redux/actions";
import Set from "./TrainingSections/Set";
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
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
}));

export default function Training(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const today = useSelector((state) => state.calander.dailyView);

  // toggle edit mode
  const [selectedDate, setSelectedDate] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [trainingCategory, setTrainingCategory] = useState("");

  const [localTraining, setLocalTraining] = useState([]);

  let allTraining = [];

  let dailyTrainingAchieved = 0;
  let dailyTrainingGoal = 1;

  if (today.dailyTraining) {
    if (today.dailyTraining.training.length > 0 && allTraining.length > 0) {
      dailyTrainingAchieved = allTraining.reduce((a, b) => ({
        achieved: a.achieved + b.achieved,
      })).achieved;
      dailyTrainingGoal = allTraining.reduce((a, b) => ({
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
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
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
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        category: trainingCategory,
        training: [...newTraining],
      })
    );
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    const newTraining = localTraining.filter((item, index) => index !== setIndex);

    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
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
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        category: trainingCategory,
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = () => {
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        category: trainingCategory,
        training: localTraining,
      })
    );
  };

  useEffect(() => {
    setTrainingCategory(today.dailyTraining.category || "");
    setLocalTraining(today.dailyTraining.training || []);
  }, [today]);

  useEffect(() => {
    dispatch(requestDailyTraining(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <>
      <Container maxWidth="md" style={{ height: "100%", paddingTop: "25px" }}>
        <SelectedDate setParentSelectedDate={setSelectedDate} />
        <Accordion defaultExpanded>
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
              <Set
                today={today}
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
          </AccordionDetails>
        </Accordion>
      </Container>
      <AuthNavbar />
    </>
  );
}
