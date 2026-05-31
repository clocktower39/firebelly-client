import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  AppBar,
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { requestExerciseProgress } from "../../../Redux/actions";
import { displayWeightUnit, formatWeightList, normalizeWeightUnit } from "../../../utils/weightUnits";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const ExerciseListAutocomplete = ({ exerciseList, selectedExercises, setSelectedExercises, disableCloseOnSelect = false, }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const matchWords = (option, inputValue) => {
    if (!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  return (
    <Autocomplete
      multiple
      fullWidth
      value={selectedExercises}
      options={exerciseList
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option)}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => option.exerciseTitle}
      onChange={(e, newSelection) => {
        setSelectedExercises(newSelection);

        // Find newly added exercise
        const newExercise = newSelection.find(
          (ex) => !selectedExercises.some((sel) => sel._id === ex._id)
        );

        if (newExercise) {
          dispatch(requestExerciseProgress(newExercise, user));
        }
      }}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) => matchWords(option.exerciseTitle, inputValue))
      }
      renderValue={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option._id}
            variant="outlined"
            label={option.exerciseTitle}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Search" placeholder="Exercises" />}
      disableCloseOnSelect={disableCloseOnSelect}
    />
  );
};

const AddExercisesDialog = ({ addExerciseOpen, handleAddExerciseClose, confirmedNewExercise, activeStep, user, weightUnit: weightUnitOverride, }) => {
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const weightUnit = normalizeWeightUnit(weightUnitOverride || user.workoutWeightUnit);

  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedExercisesSetCount, setSelectedExercisesSetCount] = useState(4);
  const [selectedHistoryByExercise, setSelectedHistoryByExercise] = useState({});

  const handleSelectedExercisesSetCountChange = (e) =>
    setSelectedExercisesSetCount(Number(e.target.value));

  useEffect(() => {
    setSelectedHistoryByExercise((prev) => {
      const next = { ...prev };
      selectedExercises.forEach((exercise) => {
        if (next[exercise._id] !== undefined) return;
        const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
        const history = reduxExercise?.history?.[user._id] || [];
        next[exercise._id] = history.length > 0 ? history[history.length - 1]._id : "";
      });
      Object.keys(next).forEach((exerciseId) => {
        if (!selectedExercises.some((exercise) => exercise._id === exerciseId)) {
          delete next[exerciseId];
        }
      });
      return next;
    });
  }, [exerciseList, selectedExercises, user._id]);

  const formatHistoryLabel = (historyItem) => {
    if (!historyItem) return "No history";
    const achieved = historyItem.achieved || {};
    const weight = Array.isArray(achieved.weight) ? formatWeightList(achieved.weight, weightUnit) : "";
    const reps = Array.isArray(achieved.reps) ? achieved.reps.filter(Boolean) : [];
    const seconds = Array.isArray(achieved.seconds) ? achieved.seconds.filter(Boolean) : [];
    const percent = Array.isArray(achieved.percent) ? achieved.percent.filter(Boolean) : [];
    const details = [];
    if (reps.length) details.push(`${reps.join(", ")} reps`);
    if (weight.length) details.push(`${weight} ${displayWeightUnit(weightUnit)}`);
    if (seconds.length) details.push(`${seconds.join(", ")} sec`);
    if (percent.length) details.push(`${percent.join(", ")}%`);
    const summary = details.length ? ` • ${details.join(" | ")}` : "";
    return `${dayjs(historyItem.date).format("MM/DD/YYYY")}${summary}`;
  };

  return (
    <Dialog
      open={addExerciseOpen}
      TransitionComponent={Transition}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          height: "80%",
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleAddExerciseClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Add Exercises
          </Typography>
          <Button
            variant="contained"
            onClick={() =>
              confirmedNewExercise(
                activeStep,
                selectedExercises,
                setSelectedExercises,
                selectedExercisesSetCount,
                setSelectedExercisesSetCount,
                selectedHistoryByExercise,
                exerciseList
              )
            }
          >
            Confirm
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid container size={12}>
            <ExerciseListAutocomplete
              exerciseList={exerciseList}
              selectedExercises={selectedExercises}
              setSelectedExercises={setSelectedExercises}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Sets"
              select
              SelectProps={{ native: true }}
              fullWidth
              value={selectedExercisesSetCount}
              onChange={handleSelectedExercisesSetCountChange}
            >
              {[...Array(21)].map((x, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </TextField>

            {selectedExercises.length > 0 && (
              <List sx={{ bgcolor: "background.paper", width: "100%" }}>
                {selectedExercises.map((exercise, exerciseIndex, exercises) => {
                  const reduxExercise = exerciseList.find((ex) => ex._id === exercise._id);
                  const history = reduxExercise?.history?.[user._id];
                  const historyOptions = history ? history.slice(history.length - 3, history.length) : [];

                  return (
                    <Fragment key={`${exercise.exerciseTitle}-${exerciseIndex}`} >
                      <ListItem >
                        <Stack spacing={1} sx={{ width: "100%" }}>
                          <Typography variant="subtitle1">{exercise?.exerciseTitle}</Typography>
                          {historyOptions.length > 0 ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Use previous achieved</InputLabel>
                              <Select
                                label="Use previous achieved"
                                value={selectedHistoryByExercise[exercise._id] ?? ""}
                                onChange={(event) =>
                                  setSelectedHistoryByExercise((prev) => ({
                                    ...prev,
                                    [exercise._id]: event.target.value,
                                  }))
                                }
                              >
                                {historyOptions.map((historyItem) => (
                                  <MenuItem key={historyItem._id} value={historyItem._id}>
                                    {formatHistoryLabel(historyItem)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No recent history for this exercise.
                            </Typography>
                          )}
                        </Stack>
                      </ListItem>
                      {exerciseIndex !== exercises.length - 1 && <Divider component="li" />}
                    </Fragment>
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AddExercisesDialog;
