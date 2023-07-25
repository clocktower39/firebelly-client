import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Chip,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircle, Edit, FactCheck, Info, RemoveCircle } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { requestMyExerciseList, requestExerciseProgess } from "../../Redux/actions";
import LogLoader from "./LogLoader";
import EditLoader from "./EditLoader";
import { ModalBarChartHistory } from "../../Pages/AppPages/Progress";

export default function Exercise(props) {
  const {
    exercise,
    setLocalTraining,
    exerciseIndex,
    setIndex,
    localTraining,
    removeExercise,
    setHeightToggle,
  } = props;
  const dispatch = useDispatch();

  const [title, setTitle] = useState(exercise.exercise || "");
  const [exerciseType, setExerciseType] = useState(exercise.exerciseType || "Reps");
  const [sets, setSets] = useState(exercise.goals.sets || 0);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleModalToggle = () => setOpen((prev) => !prev);
  const handleModalExercise = () => {
    dispatch(requestExerciseProgess(title)).then(() => handleModalToggle());
  };
  const targetExerciseHistory = useSelector((state) => state.progress.targetExerciseHistory);
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const handleTypeChange = (e) => setExerciseType(e.target.value);

  const handleSetChange = (e) => setSets(Number(e.target.value));

  useEffect(() => {
    dispatch(requestMyExerciseList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Ensures each proptery array length matches the amount of sets
    const setPropertyCheck = (property) => {
      while (Number(property.length) !== Number(sets)) {
        Number(property.length) > Number(sets) ? property.pop() : property.push(0);
      }
    };

    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.exercise = title;
              exercise.exerciseType = exerciseType;
              exercise.goals = {
                ...exercise.goals,
                sets: sets,
              };
              setPropertyCheck(exercise.achieved.reps);
              setPropertyCheck(exercise.achieved.weight);
              setPropertyCheck(exercise.achieved.percent);
              setPropertyCheck(exercise.achieved.seconds);
              setPropertyCheck(exercise.goals.minReps);
              setPropertyCheck(exercise.goals.maxReps);
              setPropertyCheck(exercise.goals.exactReps);
              setPropertyCheck(exercise.goals.weight);
              setPropertyCheck(exercise.goals.percent);
              setPropertyCheck(exercise.goals.seconds);
            }
            return exercise;
          });
        }
        return set;
      });
    });
  }, [setLocalTraining, exerciseIndex, setIndex, sets, title, exerciseType]);

  const handleAutoFillExercise = () => {
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.achieved.reps = exercise.goals.exactReps;
              exercise.achieved.weight = exercise.goals.weight;
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  const EditFields = () => {
    switch (exerciseType) {
      case "Rep Range":
        return {
          repeating: [
            {
              goalAttribute: "weight",
              label: "Weight",
            },
            {
              goalAttribute: "minReps",
              label: "Min Reps",
            },
            {
              goalAttribute: "maxReps",
              label: "Max Reps",
            },
          ],
          nonRepeating: [],
        };
      case "Reps":
        return {
          repeating: [
            {
              goalAttribute: "weight",
              label: "Weight",
            },
            {
              goalAttribute: "exactReps",
              label: "Reps",
            },
          ],
          nonRepeating: [],
        };
      case "Reps with %":
        return {
          repeating: [
            {
              goalAttribute: "percent",
              label: "Percent",
            },
            {
              goalAttribute: "exactReps",
              label: "Reps",
            },
          ],
          nonRepeating: [
            {
              goalAttribute: "maxWeight",
              label: "One Rep Max",
            },
          ],
        };
      case "Time":
        return {
          repeating: [
            {
              goalAttribute: "seconds",
              label: "Seconds",
            },
          ],
          nonRepeating: [],
        };
      default:
        return <Typography color="text.primary">Type Error</Typography>;
    }
  };

  const LoggedFields = () => {
    switch (exerciseType) {
      case "Rep Range":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Reps":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Reps with %":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Time":
        return [
          {
            achievedAttribute: "seconds",
            goalAttribute: "seconds",
            label: "Seconds",
          },
        ];
      default:
        return <Typography color="text.primary">Type Error</Typography>;
    }
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
  };

  useEffect(() => {
    setHeightToggle((prev) => !prev);
  }, [editMode, setHeightToggle]);

  const classes = {
    textFieldRoot: {
      "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
        // default paddingRight was 39px since clear icon was positioned absolute
        paddingRight: "9px",

        // Search icon
        "& button": {
          order: 3, // order 3 means the search icon will appear after the clear icon which has an order of 2
        },

        // Clear icon
        "& .MuiAutocomplete-endAdornment": {
          position: "relative", // default was absolute. we make it relative so that it is now within the flow of the other two elements
          order: 2,
        },
      },
    },
  };

  return (
    <Grid container spacing={2} sx={{ marginBottom: "25px", justifyContent: "center" }}>
      {editMode ? (
        <>
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={12}>
              <Autocomplete
                id="tags-filled"
                disableCloseOnSelect
                fullWidth
                freeSolo
                value={title}
                defaultValue={title}
                options={exerciseList
                  .filter((a) => a !== "")
                  .sort((a, b) => a > b)
                  .map((option) => option)}
                onChange={(e, getTagProps) => setTitle(getTagProps.replace(/\s+/g,' ').trim())}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exercise Title"
                    placeholder="Exercises"
                    sx={classes.textFieldRoot}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          <Tooltip title="View Progress Chart">
                            <IconButton variant="contained" onClick={handleModalExercise}>
                              <Info />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Log Exercise">
                            <IconButton variant="contained" onClick={handleEditToggle}>
                              <FactCheck />
                            </IconButton>
                          </Tooltip>
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Type"
                select
                SelectProps={{ native: true }}
                fullWidth
                value={exerciseType}
                onChange={handleTypeChange}
              >
                <option value="Rep Range">Rep Range</option>
                <option value="Reps">Reps</option>
                <option value="Reps with %">Reps with %</option>
                <option value="Time">Time</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sets"
                select
                SelectProps={{ native: true }}
                fullWidth
                value={sets}
                onChange={handleSetChange}
              >
                {[...Array(21)].map((x, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </TextField>
            </Grid>
            <EditLoader
              fields={EditFields()}
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          </Grid>
          <Grid container item xs={12} sx={{ alignContent: "center" }}>
            <Grid container item xs={12} sx={{ justifyContent: "center", alignContent: "center" }}>
              <Grid item>
                <Tooltip title="Remove Set">
                  <IconButton onClick={() => removeExercise(setIndex, exerciseIndex)}>
                    <RemoveCircle />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} >
            <Typography color="text.primary" variant="h6" sx={{ textAlign: "center" }}>
              {title || "Enter an exercise"}
            </Typography>
          </Grid>
          <Grid xs={12} container sx={{ justifyContent: 'center', }}>
            <Tooltip title="View Progress Chart">
              <IconButton variant="contained" onClick={handleModalExercise}>
                <Info />
              </IconButton>
            </Tooltip>
            <Tooltip title="Autofill Exercise">
              <IconButton variant="contained" onClick={handleAutoFillExercise}>
                <CheckCircle />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Exercise">
              <IconButton variant="contained" onClick={() => setEditMode((prev) => !prev)}>
                <Edit />
              </IconButton>
            </Tooltip>
          </Grid>
          <LogLoader
            fields={LoggedFields()}
            exercise={exercise}
            sets={sets}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            localTraining={localTraining}
            setLocalTraining={setLocalTraining}
          />
        </>
      )}
      {open && (
        <ModalBarChartHistory
          targetExerciseHistory={targetExerciseHistory}
          open={open}
          handleClose={handleClose}
        />
      )}
    </Grid>
  );
}
