import React, { useEffect, useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";
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
    setIndex,
    exerciseSetIndex,
    setLocalTraining,
    amountOfFields,
    weightUnit = "lbs",
    onToggleWeightUnit,
  } = props;
  const normalizedWeightUnit = normalizeWeightUnit(weightUnit);
  const weightUnitLabel = displayWeightUnit(normalizedWeightUnit);
  const isWeightField = field.goalAttribute === "weight";
  const storedValue = exercise.goals[field.goalAttribute][exerciseSetIndex];
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
                exercise.goals[field.goalAttribute][exerciseSetIndex] = isIncompleteDecimal(rawValue)
                  ? 0
                  : toStoredValue(rawValue);
              } else if (rawValue === "" && rawValue.length === 0) {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer);
              }
              // remove extra zeros from the front
              else if (Number(rawValue) || rawValue === "0") {
                if (rawValue.length > 1 && rawValue[0] === "0") {
                  answer = rawValue.split("");
                  while (answer[0] === "0") {
                    answer.shift();
                  }
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer.join(""));
                } else {
                  // update the local state variable
                  answer = rawValue;
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer);
                }
              } else {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(Number(rawValue));
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

  return (
    <Grid size={amountOfFields % 2 === 0 ? 6 : amountOfFields === 1 ? 12 : 4}>
      <TextField
        label={isWeightField ? `${field.label} (${weightUnitLabel})` : field.label}
        value={draftValue ?? (toDisplayValue(storedValue) || 0)}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        size="small"
        fullWidth
        slotProps={{
          htmlInput: {
            inputMode: "decimal",
            pattern: "^[0-9]*\\.?[0-9]*$",
          },
          inputLabel:
            isWeightField && onToggleWeightUnit
              ? { onClick: onToggleWeightUnit, sx: { cursor: "pointer" } }
              : undefined,
        }}
      />
    </Grid>
  );
};

export default function EditLoader(props) {
  const { fields, exercise, sets, setIndex, setLocalTraining, exerciseIndex, weightUnit, onToggleWeightUnit } = props;
  const normalizedWeightUnit = normalizeWeightUnit(weightUnit);
  const weightUnitLabel = displayWeightUnit(normalizedWeightUnit);
  const [oneRepMax, setOneRepMax] = useState(
    formatWeightInputValue(exercise.goals.oneRepMax || 0, normalizedWeightUnit)
  );
  const [oneRepMaxFocused, setOneRepMaxFocused] = useState(false);

  useEffect(() => {
    if (oneRepMaxFocused) return;
    setOneRepMax(formatWeightInputValue(exercise.goals.oneRepMax || 0, normalizedWeightUnit));
  }, [exercise.goals.oneRepMax, normalizedWeightUnit, oneRepMaxFocused]);

  const handleOneRepMaxChange = (e) => {
    const rawValue = e.target.value;
    if (!DECIMAL_INPUT_PATTERN.test(rawValue)) return;

    const storedOneRepMax = isIncompleteDecimal(rawValue)
      ? 0
      : toStoredLbs(rawValue, normalizedWeightUnit) ?? 0;

    setOneRepMax(rawValue);
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.goals.oneRepMax = storedOneRepMax;
            }
            return exercise;
          });
        }
        return set;
      });
    });
  }

  const handleOneRepMaxBlur = () => {
    setOneRepMaxFocused(false);
    setOneRepMax(formatWeightInputValue(exercise.goals.oneRepMax || 0, normalizedWeightUnit));
  };

  const handleOneRepMaxFocus = (e) => {
    setOneRepMaxFocused(true);
    if (Number(e.target.value) === 0) {
      e.target.select();
    }
  };

  let exerciseSets = [];
  let count = 0;
  while (exerciseSets.length < sets) {
    exerciseSets.push(count);
    count++;
  }

  return (
    <Grid container size={12} spacing={1}>
      {fields?.nonRepeating?.map((field) => (
        <Grid
          key={`nonRepeating-${field.label}`}
          container
          size={12}
          sx={{ justifyContent: "center" }}
        >
          <TextField
            label={`One Rep Max (${weightUnitLabel})`}
            value={oneRepMax}
            onChange={handleOneRepMaxChange}
            onBlur={handleOneRepMaxBlur}
            onFocus={handleOneRepMaxFocus}
            fullWidth
            slotProps={{
              inputLabel: onToggleWeightUnit
                ? { onClick: onToggleWeightUnit, sx: { cursor: "pointer" } }
                : undefined,
            }}
          />
        </Grid>
      ))}
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
              >
                <Typography variant color="text.primary" noWrap>
                  Set {exerciseSetIndex + 1}:
                </Typography>
              </Button>
            </Grid>
            <Grid container size={10} spacing={1}>
              {fields.repeating.map((field) => {
                return (
                  <LoggedField
                    key={`${field.label}-${exerciseSetIndex}`}
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    field={field}
                    setIndex={setIndex}
                    exerciseSetIndex={exerciseSetIndex}
                    setLocalTraining={setLocalTraining}
                    amountOfFields={fields.repeating.length}
                    oneRepMax={oneRepMax}
                    weightUnit={weightUnit}
                    onToggleWeightUnit={onToggleWeightUnit}
                  />
                );
              })}
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
}
