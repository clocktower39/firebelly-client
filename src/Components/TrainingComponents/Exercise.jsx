import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  FactCheck,
  Info,
  RemoveCircle,
  MoreVertSharp,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { requestExerciseProgress } from "../../Redux/actions";
import LogLoader from "./LogLoader";
import EditLoader from "./EditLoader";
import { ModalBarChartHistory } from "../../Pages/AppPages/Progress";

const createZeroArray = (setCount) => Array(setCount).fill(0);

const normalizeToSets = (values, setCount) => {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: setCount }, (_, idx) => source[idx] ?? 0);
};

const formatHistoryLabel = (historyItem) => {
  if (!historyItem) return "No history";

  const achieved = historyItem.achieved || {};
  const weight = Array.isArray(achieved.weight) ? achieved.weight.filter(Boolean) : [];
  const reps = Array.isArray(achieved.reps) ? achieved.reps.filter(Boolean) : [];
  const seconds = Array.isArray(achieved.seconds) ? achieved.seconds.filter(Boolean) : [];
  const percent = Array.isArray(achieved.percent) ? achieved.percent.filter(Boolean) : [];
  const details = [];

  if (reps.length) details.push(`${reps.join(", ")} reps`);
  if (weight.length) details.push(`${weight.join(", ")} lb`);
  if (seconds.length) details.push(`${seconds.join(", ")} sec`);
  if (percent.length) details.push(`${percent.join(", ")}%`);

  const summary = details.length ? ` • ${details.join(" | ")}` : "";
  return `${dayjs(historyItem.date).format("MM/DD/YYYY")}${summary}`;
};

const getHistoryOptionKey = (historyItem, index) =>
  `${historyItem?._id || "history"}-${historyItem?.date || "no-date"}-${index}`;

const buildExercisePresetFromHistory = (historyItem, setCount, fallbackExerciseType = "Reps") => {
  const nextExerciseType = historyItem?.exerciseType || fallbackExerciseType || "Reps";
  const historyGoals = historyItem?.goals || {};
  const achieved = historyItem?.achieved || {};
  const zeroArray = createZeroArray(setCount);
  const goals = {
    sets: setCount,
    minReps: [...zeroArray],
    maxReps: [...zeroArray],
    exactReps: [...zeroArray],
    weight: [...zeroArray],
    percent: [...zeroArray],
    seconds: [...zeroArray],
    oneRepMax: Number(historyGoals.oneRepMax) || 0,
  };

  switch (nextExerciseType) {
    case "Time":
      goals.seconds = normalizeToSets(achieved.seconds, setCount);
      break;
    case "Rep Range":
      goals.weight = normalizeToSets(achieved.weight, setCount);
      goals.minReps = normalizeToSets(achieved.reps, setCount);
      goals.maxReps = normalizeToSets(achieved.reps, setCount);
      break;
    case "Reps with %":
      goals.exactReps = normalizeToSets(
        Array.isArray(achieved.reps) && achieved.reps.length > 0
          ? achieved.reps
          : historyGoals.exactReps,
        setCount
      );
      goals.percent = normalizeToSets(
        Array.isArray(achieved.percent) && achieved.percent.length > 0
          ? achieved.percent
          : normalizeToSets(
              achieved.weight,
              setCount
            ).map((weight) =>
              Number(historyGoals.oneRepMax)
                ? Math.round((Number(weight) / Number(historyGoals.oneRepMax)) * 100)
                : 0
            ),
        setCount
      );
      break;
    case "Reps":
    default:
      goals.exactReps = normalizeToSets(achieved.reps, setCount);
      goals.weight = normalizeToSets(achieved.weight, setCount);
      break;
  }

  return {
    exerciseType: nextExerciseType,
    goals,
    achieved: {
      sets: 0,
      reps: [...zeroArray],
      weight: [...zeroArray],
      percent: [...zeroArray],
      seconds: [...zeroArray],
    },
  };
};

export default function Exercise(props) {
  const {
    workoutUser,
    exercise,
    setLocalTraining,
    exerciseIndex,
    setIndex,
    localTraining,
    removeExercise,
    setHeightToggle,
  } = props;
  const dispatch = useDispatch();
  const pendingPresetExerciseIdRef = useRef(null);

  const [title, setTitle] = useState(exercise.exercise);
  const [exerciseType, setExerciseType] = useState(exercise.exerciseType || "Reps");
  const [sets, setSets] = useState(exercise.goals.sets || 0);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [targetExerciseProgress, setTargetExerciseProgess] = useState({});
  const [selectedHistoryKey, setSelectedHistoryKey] = useState("");
  const handleClose = () => setOpen(false);
  const handleModalToggle = () => setOpen((prev) => !prev);
  const handleModalExercise = () => {
    if (!title) return;
    dispatch(requestExerciseProgress(title, workoutUser)).then(() =>{
      setTargetExerciseProgess(title)
      handleModalToggle()
    });
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const exerciseOptionsOpen = Boolean(anchorEl);
  const handleExerciseOptionsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExerciseOptionsClose = () => {
    setAnchorEl(null);
  };

  const user = useSelector((state) => state.user);
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const handleTypeChange = (e) => setExerciseType(e.target.value);

  const handleSetChange = (e) => setSets(Number(e.target.value));

  const historyUserId = workoutUser?._id || user._id;
  const recentHistoryOptions = useMemo(() => {
    const selectedExerciseId = title?._id;
    if (!selectedExerciseId || !historyUserId) return [];

    const reduxExercise = exerciseList.find((item) => item._id === selectedExerciseId);
    const history = reduxExercise?.history?.[historyUserId] || [];
    return history.slice(Math.max(history.length - 3, 0)).map((historyItem, index) => ({
      key: getHistoryOptionKey(historyItem, index),
      historyItem,
    }));
  }, [exerciseList, historyUserId, title?._id]);

  const applyExerciseHistoryPreset = useCallback(
    (selectedExercise, historyItem = null) => {
      if (!selectedExercise) return;

      const preset = buildExercisePresetFromHistory(historyItem, sets, exerciseType);
      setExerciseType(preset.exerciseType);

      setLocalTraining((prev) =>
        prev.map((set, sIndex) => {
          if (setIndex !== sIndex) {
            return set;
          }

          return set.map((currentExercise, eIndex) => {
            if (eIndex !== exerciseIndex) {
              return currentExercise;
            }

            return {
              ...currentExercise,
              exercise: selectedExercise,
              exerciseType: preset.exerciseType,
              goals: preset.goals,
              achieved: preset.achieved,
            };
          });
        })
      );
    },
    [exerciseIndex, exerciseType, setIndex, setLocalTraining, sets]
  );

  const handleExerciseSelectionChange = (e, newSelection) => {
    if (!newSelection) return;

    setTitle(newSelection);

    const reduxExercise = exerciseList.find((item) => item._id === newSelection._id);
    const history = reduxExercise?.history?.[historyUserId] || [];
    const latestHistory = history.length > 0 ? history[history.length - 1] : null;

    setSelectedHistoryKey(
      latestHistory ? getHistoryOptionKey(latestHistory, history.length - Math.max(history.length - 3, 0) - 1) : ""
    );
    applyExerciseHistoryPreset(newSelection, latestHistory);

    if (history.length === 0) {
      pendingPresetExerciseIdRef.current = newSelection._id;
      dispatch(requestExerciseProgress(newSelection, workoutUser || user));
    } else {
      pendingPresetExerciseIdRef.current = null;
    }
  };

  const handleHistoryPresetChange = (event) => {
    const nextHistoryKey = event.target.value;
    setSelectedHistoryKey(nextHistoryKey);

    const selectedHistory =
      recentHistoryOptions.find((option) => option.key === nextHistoryKey)?.historyItem || null;

    applyExerciseHistoryPreset(title, selectedHistory);
  };

  useEffect(() => {
    if (!title?._id) {
      setSelectedHistoryKey("");
      pendingPresetExerciseIdRef.current = null;
      return;
    }

    if (recentHistoryOptions.length === 0) {
      setSelectedHistoryKey("");
      return;
    }

    const latestHistoryOption = recentHistoryOptions[recentHistoryOptions.length - 1];

    setSelectedHistoryKey((prev) => {
      if (prev && recentHistoryOptions.some((option) => option.key === prev)) {
        return prev;
      }

      return latestHistoryOption.key;
    });

    if (pendingPresetExerciseIdRef.current === title._id) {
      applyExerciseHistoryPreset(title, latestHistoryOption.historyItem);
      pendingPresetExerciseIdRef.current = null;
    }
  }, [applyExerciseHistoryPreset, recentHistoryOptions, title]);

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
              switch (exercise.exerciseType) {
                case "Reps":
                  exercise.achieved.reps = exercise.achieved.reps.map(
                    (rep, repIndex) => (rep = Number(rep) || exercise.goals.exactReps[repIndex])
                  );
                  exercise.achieved.weight = exercise.achieved.weight.map(
                    (weight, weightIndex) =>
                      (weight = Number(weight) || exercise.goals.weight[weightIndex])
                  );
                  break;
                case "Time":
                  exercise.achieved.seconds = exercise.achieved.seconds.map(
                    (second, secondIndex) =>
                      (second = Number(second) || exercise.goals.seconds[secondIndex])
                  );
                  break;
                case "Reps with %":
                  exercise.achieved.reps = exercise.achieved.reps.map(
                    (rep, repIndex) => (rep = Number(rep) || exercise.goals.exactReps[repIndex])
                  );
                  exercise.achieved.weight = exercise.achieved.weight.map(
                    (weight, weightIndex) =>
                      (weight =
                        Number(weight) ||
                        (Number(exercise.goals.percent[weightIndex]) / 100) *
                          exercise.goals.oneRepMax)
                  );
                  break;
                default:
                  break;
              }
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

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({
    confirmFuction: null,
    index: null,
  });

  const handleConfirmDialogOpen = (removeExercise, setIndex, exerciseIndex) => {
    setConfirmDialogData({
      confirmFunction: removeExercise,
      setIndex,
      exerciseIndex,
    });
    setConfirmDialogOpen((prev) => true);
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen((prev) => false);

  const handleDeleteConfirmationSubmit = () => {
    confirmDialogData.confirmFunction(confirmDialogData.setIndex, confirmDialogData.exerciseIndex);
    handleConfirmDialogClose();
  };
  
  const matchWords = (option, inputValue) => {
    if(!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  useEffect(() => {
    setHeightToggle((prev) => !prev);
  }, [editMode, setHeightToggle]);

  return (
    <Card sx={{ mb: 3, width: '100%', overflow: 'visible' }}>
      <CardContent>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {editMode ? (
            <>
              <Grid container size={12} spacing={1}>
                <Grid size={12}>
                  <Autocomplete
                    disableCloseOnSelect
                    fullWidth
                    value={title}
                    options={exerciseList
                      .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
                      .map((option) => option)}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    getOptionLabel={(option) => option.exerciseTitle}
                    onChange={handleExerciseSelectionChange}
                    filterOptions={(options, { inputValue }) => 
                      options.filter(option => matchWords(option.exerciseTitle, inputValue))
                    }
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
                <Grid size={12}>
                  {recentHistoryOptions.length > 0 ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>Goal preset</InputLabel>
                      <Select
                        label="Goal preset"
                        value={selectedHistoryKey}
                        onChange={handleHistoryPresetChange}
                      >
                        {recentHistoryOptions.map((option) => (
                          <MenuItem key={option.key} value={option.key}>
                            {formatHistoryLabel(option.historyItem)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent history for this exercise. Swapping exercises will clear the old
                      movement goals.
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, }} >
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
                <Grid size={{ xs: 12, sm: 6, }} >
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
              <Grid container size={12} sx={{ alignContent: "center" }}>
                <Grid container size={12} sx={{ justifyContent: "center", alignContent: "center" }}>
                  <Grid >
                    <Tooltip title="Remove exercise">
                      <IconButton
                        onClick={() => handleConfirmDialogOpen(removeExercise, setIndex, exerciseIndex)}
                      >
                        <RemoveCircle />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
              {confirmDialogOpen && (
                <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
                  <DialogTitle>
                    <Grid container>
                      <Grid container size={12}>
                        Delete Confirmation
                      </Grid>
                    </Grid>
                  </DialogTitle>
                  <DialogContent>
                    <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
                      <Grid container size={12}>
                        <Typography variant="body1">
                          Are you sure you would like to remove the exercise?
                        </Typography>
                      </Grid>
                      <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                        <Grid >
                          <Button
                            color="secondaryButton"
                            variant="contained"
                            onClick={handleConfirmDialogClose}
                          >
                            Cancel
                          </Button>
                        </Grid>
                        <Grid >
                          <Button variant="contained" onClick={handleDeleteConfirmationSubmit}>
                            Confirm
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </Dialog>
              )}
            </>
          ) : (
            <>
              <Grid container size={12} spacing={2}>
                <Grid
                  container
                  size={2}
                  sx={{ justifyContent: "flex-end", alignContent: "center" }}
                ></Grid>
                <Grid
                  container
                  size={8}
                  sx={{ justifyContent: "flex-start", alignContent: "center" }}
                >
                  <Typography color="text.primary" variant="h6">
                    {title?.exerciseTitle || "Select an exercise"}
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={2}
                  sx={{ justifyContent: "flex-start", alignContent: "center" }}
                >
                  <Tooltip title="Exercise Options">
                    <IconButton onClick={handleExerciseOptionsClick} ref={anchorEl}>
                      <MoreVertSharp />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Menu open={exerciseOptionsOpen} onClose={handleExerciseOptionsClose} anchorEl={anchorEl}>
                <MenuItem
                  onClick={() => {
                    handleAutoFillExercise();
                    handleExerciseOptionsClose();
                  }}
                >
                  Autocomplete Exercise
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleModalExercise();
                    handleExerciseOptionsClose();
                  }}
                >
                  View Progress Chart
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    setEditMode((prev) => {
                      handleExerciseOptionsClose();
                      return !prev;
                    })
                  }
                >
                  Edit Exercise
                </MenuItem>
              </Menu>
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
              workoutUser={workoutUser}
              exerciseList={exerciseList}
              targetExerciseProgress={targetExerciseProgress}
              open={open}
              handleClose={handleClose}
            />
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
