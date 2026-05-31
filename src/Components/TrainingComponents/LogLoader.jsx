import React, { useEffect, useState } from "react";
import { Button, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import {
  displayWeightUnit,
  formatWeightInputValue,
  normalizeWeightUnit,
  toStoredLbs,
} from "../../utils/weightUnits";

const DECIMAL_INPUT_PATTERN = /^\d*\.?\d*$/;

const isIncompleteDecimal = (value) => value === "" || value === ".";

const LoggedField = (props) => {
  const {
    exercise,
    exerciseIndex,
    field,
    parentProps,
    setIndex,
    exerciseSetIndex,
    setLocalTraining,
    weightUnit = "lbs",
    onToggleWeightUnit,
  } = props;
  const normalizedWeightUnit = normalizeWeightUnit(weightUnit);
  const weightUnitLabel = displayWeightUnit(normalizedWeightUnit);
  const isWeightField = field.achievedAttribute === "weight";
  const storedValue = exercise.achieved[field.achievedAttribute][exerciseSetIndex];
  const [draftValue, setDraftValue] = useState(null);

  useEffect(() => {
    setDraftValue(null);
  }, [normalizedWeightUnit]);

  const toStoredValue = (value) =>
    isWeightField ? toStoredLbs(value, normalizedWeightUnit) ?? 0 : value;

  const toDisplayValue = (value) =>
    isWeightField ? formatWeightInputValue(value, normalizedWeightUnit) : value;

  const handleFocus = (e) => {
    if (Number(e.target.value) === 0) {
      e.target.select();
    }
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    if (isWeightField && !DECIMAL_INPUT_PATTERN.test(rawValue)) return;

    let answer = 0;
    if (isWeightField) {
      setDraftValue(rawValue);
    }

    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              if (isWeightField) {
                exercise.achieved[field.achievedAttribute][exerciseSetIndex] = isIncompleteDecimal(rawValue)
                  ? 0
                  : toStoredValue(rawValue);
              } else if (rawValue === "" && rawValue.length === 0) {
                exercise.achieved[field.achievedAttribute][exerciseSetIndex] = toStoredValue(answer);
              }
              // remove extra zeros from the front
              else if (Number(rawValue) || rawValue === "0") {
                if (rawValue.length > 1 && rawValue[0] === "0") {
                  answer = rawValue.split("");
                  while (answer[0] === "0") {
                    answer.shift();
                  }
                  exercise.achieved[field.achievedAttribute][exerciseSetIndex] = toStoredValue(answer.join(""));
                } else {
                  // update the local state variable
                  answer = rawValue;
                  exercise.achieved[field.achievedAttribute][exerciseSetIndex] = toStoredValue(answer);
                }
              } else {
                exercise.achieved[field.achievedAttribute][exerciseSetIndex] = toStoredValue(
                  Number(rawValue)
                );
              }
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  const handleBlur = () => {
    setDraftValue(null);
  };

  const handleGoalAdornmentClick = (e, goalValue) => {
    e.target.value = Number(toDisplayValue(goalValue));
    if (e.detail === 1) {
      handleChange(e);
    }
  };

  return (
    <Grid size={5}>
      <TextField
        label={isWeightField ? `${field.label} (${weightUnitLabel})` : field.label}
        value={draftValue ?? (toDisplayValue(storedValue) || 0)}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        size="small"
        slotProps={{
          htmlInput: {
            inputMode: "decimal",
            pattern: "^[0-9]*\\.?[0-9]*$",
          },
          inputLabel:
            isWeightField && onToggleWeightUnit
              ? { onClick: onToggleWeightUnit, sx: { cursor: "pointer" } }
              : undefined,
          input: {
            endAdornment: (
              <InputAdornment
                position="start"
                sx={{ fontSize: "10px", textAlign: "right", userSelect: "none" }}
              >
                <Button
                  sx={{
                    color: "#fff",
                    display: "inline-block",
                    padding: 0,
                    minHeight: 0,
                    minWidth: 0,
                  }}
                  onClick={(e) => {
                    exercise.exerciseType === "Reps with %" && field.goalAttribute === "weight"
                      ? handleGoalAdornmentClick(
                          e,
                          Number(parentProps.exercise.goals.oneRepMax) *
                            (Number(parentProps.exercise.goals.percent[exerciseSetIndex]) / 100)
                        )
                      : handleGoalAdornmentClick(
                          e,
                          parentProps.exercise.goals[field.goalAttribute][exerciseSetIndex]
                        );
                  }}
                >
                  <Typography variant="body2" noWrap>
                    {exercise.exerciseType === "Reps with %" && field.goalAttribute === "weight"
                      ? `/${
                          toDisplayValue(
                            Number(parentProps.exercise.goals.oneRepMax) *
                              (Number(parentProps.exercise.goals.percent[exerciseSetIndex]) / 100)
                          )
                        }`
                      : `/${toDisplayValue(parentProps.exercise.goals[field.goalAttribute][exerciseSetIndex])}`}
                  </Typography>
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />
    </Grid>
  );
};

export default function LogLoader(props) {
  const { fields, exercise, localTraining, sets, setIndex, setLocalTraining, exerciseIndex, weightUnit, onToggleWeightUnit } =
    props;

  let exerciseSets = [];
  let count = 0;
  while (exerciseSets.length < sets) {
    exerciseSets.push(count);
    count++;
  }

  const handleAutofillSet = (exerciseSetIndex) => {
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.achieved.reps.map((exerciseSet, esIndex) => {
                if (esIndex === exerciseSetIndex) {
                  switch (exercise.exerciseType) {
                    case "Reps":
                      exercise.achieved.reps[exerciseSetIndex] =
                        Number(exercise.achieved.reps[exerciseSetIndex]) ||
                        exercise.goals.exactReps[exerciseSetIndex];
                      exercise.achieved.weight[exerciseSetIndex] =
                        Number(exercise.achieved.weight[exerciseSetIndex]) ||
                        exercise.goals.weight[exerciseSetIndex];
                      break;
                    case "Time":
                      exercise.achieved.seconds[exerciseSetIndex] =
                        Number(exercise.achieved.seconds[exerciseSetIndex]) ||
                        exercise.goals.seconds[exerciseSetIndex];
                      break;
                    case "Reps with %":
                      exercise.achieved.reps[exerciseSetIndex] =
                        Number(exercise.achieved.reps[exerciseSetIndex]) ||
                        exercise.goals.exactReps[exerciseSetIndex];
                      exercise.achieved.weight[exerciseSetIndex] =
                        Number(exercise.achieved.weight[exerciseSetIndex]) ||
                        (Number(exercise.goals.percent[exerciseSetIndex]) / 100) *
                          exercise.goals.oneRepMax;
                      break;
                    default:
                      break;
                  }
                }
                return exerciseSet;
              });
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  return (
    <Grid container size={12} spacing={1}>
      {exerciseSets.map((count, exerciseSetIndex) => {
        return (
          <Grid
            container
            size={12}
            spacing={2}
            key={`exercise-Set-${count}-${exerciseSetIndex}`}
          >
            <Grid size={2} container sx={{ justifyContent: "flex-end", alignContent: "center" }}>
              <Button
                sx={{
                  color: "#fff",
                  display: "inline-block",
                  padding: 0,
                  minHeight: 0,
                  minWidth: 0,
                }}
                onClick={() => handleAutofillSet(exerciseSetIndex)}
              >
                <Typography noWrap>
                  Set {exerciseSetIndex + 1}:
                </Typography>
              </Button>
            </Grid>

            {fields.map((field, fieldIndex) => {
              return (
                <LoggedField
                  key={`${field.label}-${exerciseSetIndex}`}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  field={field}
                  localTraining={localTraining}
                  parentProps={props}
                  exerciseSetIndex={exerciseSetIndex}
                  setIndex={setIndex}
                  setLocalTraining={setLocalTraining}
                  weightUnit={weightUnit}
                  onToggleWeightUnit={onToggleWeightUnit}
                />
              );
            })}
          </Grid>
        );
      })}
    </Grid>
  );
}
