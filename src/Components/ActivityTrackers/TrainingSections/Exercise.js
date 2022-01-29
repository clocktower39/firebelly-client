import React, { useState, useEffect } from "react";
import { Grid, IconButton, TextField, Typography } from "@mui/material";
import { RemoveCircle } from "@mui/icons-material";
import EditRepRange from "./EditRepRange";
import EditExactReps from "./EditExactReps";
import EditRepsWithPercent from "./EditRepsWithPercent";
import EditTime from "./EditTime";
import RepRangeLog from "./RepRangeLog";
import ExactRepsLog from "./ExactRepsLog";
import RepsWithPercentLog from "./RepsWithPercentLog";
import TimeLog from "./TimeLog";

export default function Exercise(props) {
  const { exercise, setLocalTraining, exerciseIndex, setIndex, localTraining, editMode, removeExercise } = props;

  const [title, setTitle] = useState(exercise.exercise || "");
  const [exerciseType, setExerciseType] = useState(exercise.exerciseType || "Reps");
  const [sets, setSets] = useState(exercise.goals.sets);

  const handleTypeChange = (e) => setExerciseType(e.target.value);

  const handleSetChange = (e) => {
    if (Number(e.target.value) > 0 && Number(e.target.value) <= Number(8)) {
      setSets(Number(e.target.value));
    } else if (Number(e.target.value) > Number(8)) {
      setSets(Number(8));
    } else if (e.target.value === "") {
      setSets(e.target.value);
    }
  };

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

  const renderEditSwitch = () => {
    switch (exerciseType) {
      case "Rep Range":
        return exercise.goals.minReps.length > 0 && (
          exercise.goals.minReps.map((exerciseSet, index) => (
            <EditRepRange
              key={`exerciseSet-${index}`}
              exercise={exercise}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              index={index}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          ))
        );
      case "Reps":
        return exercise.goals.minReps.length > 0 && (
          exercise.goals.minReps.map((exerciseSet, index) => (
            <EditExactReps
              key={`exerciseSet-${index}`}
              exercise={exercise}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              index={index}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          ))
        );
      case "Reps with %":
        return exercise.goals.minReps.length > 0 && (
          exercise.goals.minReps.map((exerciseSet, index) => (
            <EditRepsWithPercent
              key={`exerciseSet-${index}`}
              exercise={exercise}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              index={index}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          ))
        );
      case "Time":
        return exercise.goals.minReps.length > 0 && (
          exercise.goals.minReps.map((exerciseSet, index) => (
            <EditTime
              key={`exerciseSet-${index}`}
              exercise={exercise}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              index={index}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          ))
        );
      default:
        return <Typography>Type Error</Typography>;
    }
  };

  const renderLogSwitch = () => {
    switch (exerciseType) {
      case "Rep Range":
        return <RepRangeLog
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
      case "Reps":
        return <ExactRepsLog
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
      case "Reps with %":
        return <RepsWithPercentLog
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
      case "Time":
        return <TimeLog
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
      default:
        return <Typography>Type Error</Typography>;
    }
  };

  return (
    <Grid container spacing={2} style={{ marginBottom: "25px", justifyContent: "center" }}>
      {editMode ? (
        <>
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={12}>
              <TextField
                label="Exercise Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
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
                value={sets}
                onChange={(e) => handleSetChange(e)}
                type="number"
                inputProps={{ type: "number", pattern: "\\d*" }}
                fullWidth
              />
            </Grid>
            {renderEditSwitch()}
          </Grid>
          <Grid container item xs={1} style={{ alignContent: "center" }} spacing={1}>
            <Grid
              container
              item
              xs={12}
              sm={6}
              style={{ justifyContent: "center", alignContent: "center" }}
            >
              <Grid item>
                <IconButton
                  onClick={() => removeExercise(setIndex, exerciseIndex)}
                >
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12}>
            <Typography variant="h6" style={{ textAlign: "center" }}>
              {title || "Enter an exercise"}:
            </Typography>
          </Grid>
          {renderLogSwitch()}
        </>
      )}
    </Grid>
  );
}
