import React, { useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { displayWeightUnit, formatWeightValue, normalizeWeightUnit, toStoredLbs } from "../../utils/weightUnits";

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

  const toStoredValue = (value) =>
    isWeightField ? toStoredLbs(value, normalizedWeightUnit) ?? 0 : value;

  const toDisplayValue = (value) =>
    isWeightField ? formatWeightValue(value, normalizedWeightUnit) : value;

  const handleFocus = (e) => {
    if (Number(e.target.value) === 0) {
      e.target.select();
    }
  };

  const handleChange = (e) => {
    let answer = 0;
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              if (e.target.value === "" && e.target.value.length === 0) {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer);
              }
              // remove extra zeros from the front
              else if (Number(e.target.value) || e.target.value === "0") {
                if (e.target.value.length > 1 && e.target.value[0] === "0") {
                  answer = e.target.value.split("");
                  while (answer[0] === "0") {
                    answer.shift();
                  }
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer.join(""));
                } else {
                  // update the local state variable
                  answer = e.target.value;
                  exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(answer);
                }
              } else {
                exercise.goals[field.goalAttribute][exerciseSetIndex] = toStoredValue(Number(e.target.value));
              }
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  return (
    <Grid size={amountOfFields % 2 === 0 ? 6 : amountOfFields === 1 ? 12 : 4}>
      <TextField
        label={isWeightField ? `${field.label} (${weightUnitLabel})` : field.label}
        value={toDisplayValue(exercise.goals[field.goalAttribute][exerciseSetIndex]) || 0}
        inputProps={{
          inputMode: "decimal",
          pattern: "^[0-9]*\\.?[0-9]*$",
        }}
        onChange={handleChange}
        onFocus={handleFocus}
        size="small"
        fullWidth
        InputLabelProps={
          isWeightField && onToggleWeightUnit
            ? { onClick: onToggleWeightUnit, sx: { cursor: "pointer" } }
            : undefined
        }
      />
    </Grid>
  );
};

export default function EditLoader(props) {
  const { fields, exercise, sets, setIndex, setLocalTraining, exerciseIndex, weightUnit, onToggleWeightUnit } = props;
  const normalizedWeightUnit = normalizeWeightUnit(weightUnit);
  const weightUnitLabel = displayWeightUnit(normalizedWeightUnit);
  const [oneRepMax, setOneRepMax] = useState(
    formatWeightValue(exercise.goals.oneRepMax || 0, normalizedWeightUnit)
  );

  const handleOneRepMaxChange = (e) => {
    const storedOneRepMax = toStoredLbs(e.target.value, normalizedWeightUnit) ?? 0;
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              if(Number(e.target.value)) {
                setOneRepMax(e.target.value);
                exercise.goals.oneRepMax = storedOneRepMax;
              } else {
                  setOneRepMax(0)
                  exercise.goals.oneRepMax = 0;
              };
            }
            return exercise;
          });
        }
        return set;
      });
    });
  }

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
            fullWidth
            InputLabelProps={
              onToggleWeightUnit
                ? { onClick: onToggleWeightUnit, sx: { cursor: "pointer" } }
                : undefined
            }
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
