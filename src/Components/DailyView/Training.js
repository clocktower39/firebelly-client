import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  const user = useSelector((state) => state.user);
  const today = useSelector((state) => state.calander.dailyView);

  const [editMode, setEditMode] = useState(false);

  const [trainingCategory, setTrainingCategory] = useState("");
  const handleTrainingCategoryChange = (e) => setTrainingCategory(e.target.value);

  const [localTraining, setLocalTraining] = useState([]);

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
          exercise: "",
          goals: {
            sets: 1,
            minReps: 0,
            maxReps: 0,
          },
          achieved: {
            sets: 1,
            reps: [0],
            weight: [0],
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
        exercise: "",
        goals: {
          sets: 1,
          minReps: 0,
          maxReps: 0,
        },
        achieved: {
          sets: 0,
          reps: [0],
          weight: [0],
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

  const removeSet = (setIndex) => {
    const newTraining = today.dailyTraining.training.filter((item, index) => index !== setIndex);

    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining],
      })
    );
  };

  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = today.dailyTraining.training.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining],
      })
    );
  };

  const saveExercise = (setIndex, exerciseIndex, newExercise) => {
    const newTraining = today.dailyTraining.training.map((set, index) => {
      if (index === setIndex) {
        set = set.map((item, index) => {
          if (index === exerciseIndex) {
            while (Number(newExercise.reps.length) !== Number(newExercise.sets)) {
              if (Number(newExercise.reps.length) > Number(newExercise.sets)) {
                newExercise.reps.pop();
              } else {
                newExercise.reps.push(0);
              }
            }
            if (!newExercise.weight) {
              newExercise.weight = [0];
            }
            while (Number(newExercise.weight.length) !== Number(newExercise.sets)) {
              if (Number(newExercise.weight.length) > Number(newExercise.sets)) {
                newExercise.weight.pop();
              } else {
                newExercise.weight.push(0);
              }
            }
            item = {
              ...item,
              exercise: newExercise.title,
              goals: {
                sets: newExercise.sets,
                minReps: newExercise.minReps,
                maxReps: newExercise.maxReps,
              },
              achieved: {
                ...item.achieved,
                reps: [...newExercise.reps],
                weight: [...newExercise.weight],
              },
            };
          }
          return item;
        });
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

  const saveExerciseSet = (setIndex, exerciseIndex, newAchieved) => {
    const newTraining = today.dailyTraining.training.map((set, index) => {
      if (index === setIndex) {
        set = set.map((item, index) => {
          if (index === exerciseIndex) {
            item = {
              ...item,
              achieved: {
                ...item.achieved,
                reps: [...newAchieved.reps],
                weight: [...newAchieved.weight],
              },
            };
          }
          return item;
        });
      }
      return set;
    });

    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: [...newTraining],
      })
    );
  };

  const save = () => {
    dispatch(
      updateDailyTraining(today.dailyTraining._id, {
        ...today.dailyTraining,
        training: localTraining,
      })
    );
  };

  useEffect(() => {
    setTrainingCategory(today.dailyTraining.category || "");
    setLocalTraining(today.dailyTraining.training || []);
  }, [today]);

  useEffect(() => {
    dispatch(requestDailyTraining(user["_id"], props.selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedDate]);

  return (
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
                onChange={handleTrainingCategoryChange}
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
            saveExercise={saveExercise}
            saveExerciseSet={saveExerciseSet}
            localTraining={localTraining}
            setLocalTraining={setLocalTraining}
          />
          {editMode ? (
            <Grid item xs={12} container style={{justifyContent: "space-between"}}>
              <Button variant="contained" onClick={newSet}>
                New Set
              </Button>
              <Button variant="contained" onClick={save}>
                Save
              </Button>
            </Grid>
          ) : (
            <Grid item xs={12} container style={{justifyContent: "flex-end"}}>
              <Button variant="contained" onClick={save}>
                Save
              </Button>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
