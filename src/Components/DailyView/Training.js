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
import { makeStyles } from '@mui/styles';
import {
  ExpandMore,
  AddCircle,
  RemoveCircle,
  CheckCircle,
  Edit,
  FactCheck,
} from "@mui/icons-material";
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
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
}));

const Set = (props) => {
  return props.today.dailyTraining.training.map((group, index) =>
    props.editMode ? (
      <Grid item xs={12} key={index}>
        <Grid container item xs={12}>
          <Grid item container xs={12} alignContent="center">
            <Typography variant="h5" gutterBottom>
              Set {index + 1}{" "}
              <IconButton onClick={() => props.removeSet(index)}>
                <RemoveCircle />
              </IconButton>
            </Typography>
          </Grid>
        </Grid>
        {group.map((exercise, exerciseIndex) => (
          <Exercise
            key={exercise._id}
            editMode={props.editMode}
            exercise={exercise}
            setIndex={index}
            exerciseIndex={exerciseIndex}
            removeExercise={props.removeExercise}
            saveExercise={props.saveExercise}
          />
        ))}
        <Grid container item xs={12}>
          <Grid container item xs={12} style={{ justifyContent: "center" }} >
            <IconButton onClick={() => props.newExercise(index)}>
              <AddCircle />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    ) : (
      <Grid item xs={12} key={index}>
        <Grid container item xs={12}>
          <Grid item container xs={12} alignContent="center">
            <Typography variant="h5" gutterBottom>
              Set {index + 1}
            </Typography>
          </Grid>
        </Grid>
        {group.map((exercise, exerciseIndex) => (
          <Exercise
            key={exercise._id}
            editMode={props.editMode}
            exercise={exercise}
            setIndex={index}
            exerciseIndex={exerciseIndex}
            removeExercise={props.removeExercise}
            saveExerciseSet={props.saveExerciseSet}
          />
        ))}
        <Grid item xs={12}>
          <Divider style={{ margin: "25px 0px" }} />
        </Grid>
      </Grid>
    )
  );
};

const ExerciseSet = (props) => {
  const [reps, setReps] = useState(props.exercise.achieved.reps);
  const [weight, setWeight] = useState(props.exercise.achieved.weight);

  const handleChange = (e, setter, index) =>
    setter((prev) => {
      const newState = prev.map((item, i) => {
        if (index === i) {
          item = Number(e.target.value) || 0;
        }
        return item;
      });
      return newState;
    });

  let exerciseSets = [];
  for (let i = 0; i < props.sets; i++) {
    exerciseSets.push(
      <Grid container item xs={12}>
        <Grid item xs={6}>
          <TextField
            label="Reps"
            value={reps[i]}
            onChange={(e) => handleChange(e, setReps, i)}
            type="number"
            inputProps={{ type: 'number', inputMode: 'decimal', pattern: '[0-9]*', }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Weight"
            value={weight[i]}
            onChange={(e) => handleChange(e, setWeight, i)}
            type="number"
            inputProps={{ type: 'number', inputMode: 'decimal', pattern: '[0-9]*', }}
          />
        </Grid>
      </Grid>
    );
  }
  return (
    <>
      <Grid container item xs={8} spacing={1}>
        {exerciseSets}
      </Grid>
      <Grid container item xs={1} alignContent="center">
        <Grid item xs={12}>
          <IconButton
            onClick={() =>
              props.saveExerciseSet(props.setIndex, props.exerciseIndex, {
                reps,
                weight,
              })
            }
          >
            <CheckCircle />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
};

const Exercise = (props) => {
  const [title, setTitle] = useState(props.exercise.exercise);
  const [sets, setSets] = useState(props.exercise.goals.sets);
  const [minReps, setMinReps] = useState(props.exercise.goals.minReps);
  const [maxReps, setMaxReps] = useState(props.exercise.goals.maxReps);

  const handleChange = (e, setter) => setter(e.target.value);

  return (
    <Grid
      container
      spacing={2}
      style={{ marginBottom: "25px", justifyContent: "center" }}
    >
      {props.editMode ? (
        <>
          <Grid container item xs={10} spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Exercise Title"
                value={title}
                onChange={(e) => handleChange(e, setTitle)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Type"
                fullWidth
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                label="Sets"
                value={sets}
                onChange={(e) => handleChange(e, setSets)}
                type="number"
                inputProps={{ type: 'number', pattern: '\\d*', }}
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                label="Min Reps"
                value={minReps}
                onChange={(e) => handleChange(e, setMinReps)}
                type="number"
                inputProps={{ type: 'number', inputMode: 'decimal', pattern: '[0-9]*', }}
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                label="Max Reps"
                value={maxReps}
                onChange={(e) => handleChange(e, setMaxReps)}
                type="number"
                inputProps={{ type: 'number', inputMode: 'decimal', pattern: '[0-9]*', }}
              />
            </Grid>
          </Grid>
          <Grid container item xs={2} style={{ alignContent: "center" }} spacing={1} >
            <Grid container item xs={12} sm={6} style={{ justifyContent: 'center', alignContent: "center" }}>
              <Grid item>
                <IconButton
                  onClick={() =>
                    props.removeExercise(props.setIndex, props.exerciseIndex)
                  }
                >
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={6} style={{ justifyContent: 'center', alignContent: "center" }}>
              <Grid item>
                <IconButton
                  onClick={() =>
                    props.saveExercise(props.setIndex, props.exerciseIndex, {
                      title,
                      sets,
                      minReps,
                      maxReps,
                      reps: props.exercise.achieved.reps,
                    })
                  }
                >
                  <CheckCircle />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" style={{ textAlign: 'center' }}>
              {title || "Enter an exercise"}:
            </Typography>
          </Grid>
          <ExerciseSet
            exercise={props.exercise}
            sets={sets}
            saveExerciseSet={props.saveExerciseSet}
            setIndex={props.setIndex}
            exerciseIndex={props.exerciseIndex}
          />
        </>
      )}
    </Grid>
  );
};

export default function Training(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const today = useSelector((state) => state.calander.dailyView);

  const [editMode, setEditMode] = useState(false);

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
    const newTraining = today.dailyTraining.training.filter(
      (item, index) => index !== setIndex
    );

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
            while (
              Number(newExercise.reps.length) !== Number(newExercise.sets)
            ) {
              if (Number(newExercise.reps.length) > Number(newExercise.sets)) {
                newExercise.reps.pop();
              } else {
                newExercise.reps.push(0);
              }
            }
            if (!newExercise.weight) {
              newExercise.weight = [0];
            }
            while (
              Number(newExercise.weight.length) !== Number(newExercise.sets)
            ) {
              if (
                Number(newExercise.weight.length) > Number(newExercise.sets)
              ) {
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

  useEffect(() => {
    setTrainingCategory(today.dailyTraining.category || "");
  }, [today]);

  useEffect(() => {
    dispatch(requestDailyTraining(user["_id"], props.selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedDate]);

  return (
    <Accordion defaultExpanded >
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
          <Grid
            item
            xs={12}
            container
            className={classes.TrainingCategoryInputContainer}
          >
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
                <IconButton
                  variant="contained"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? <FactCheck /> : <Edit />}
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}><Divider style={{ margin: "25px 0px" }} /></Grid>
          {today.dailyTraining.training.length > 0 ? (
            <Set
              today={today}
              editMode={editMode}
              newExercise={newExercise}
              removeSet={removeSet}
              removeExercise={removeExercise}
              saveExercise={saveExercise}
              saveExerciseSet={saveExerciseSet}
            />
          ) : (
            <></>
          )}
          {editMode ? (
            <Grid item xs={12}>
              <Button variant="contained" onClick={newSet}>
                New Set
              </Button>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
