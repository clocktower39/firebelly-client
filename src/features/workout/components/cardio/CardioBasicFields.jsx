import React from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import {
  CARDIO_ACTIVITY_OPTIONS,
  getDerivedMetricErrorText,
  getDurationHelperText,
  renderAutoAdornment,
} from "../../utils/workoutUtils";

export default function CardioBasicFields({
  activeCardio,
  cardioAuto,
  cardioDistanceUnitOptions,
  cardioStyleOptions,
  cardioViewMode,
  durationHasError,
  handleCardioActivityChange,
  handleCardioChange,
  handleCardioDerivedChange,
  handleCardioDistanceUnitChange,
  primaryCardioMetric,
  primaryCardioMetricAutoKey,
  primaryCardioMetricField,
  primaryCardioMetricHelperText,
  primaryCardioMetricLabel,
  primaryCardioMetricPlaceholder,
  primaryMetricHasError,
}) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          select
          label="Activity"
          value={activeCardio.activity}
          onChange={handleCardioActivityChange}
          helperText="Changing activity clears details that do not apply."
          fullWidth
        >
          {CARDIO_ACTIVITY_OPTIONS.map((activity) => (
            <MenuItem key={activity} value={activity}>
              {activity}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          select
          label="Session type"
          value={activeCardio.style}
          onChange={handleCardioChange("style")}
          helperText="Choose a preset or pick a custom type."
          fullWidth
        >
          {cardioStyleOptions.map((style) => (
            <MenuItem key={style} value={style}>
              {style}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 8, sm: 2 }}>
        <TextField
          label="Distance"
          type="number"
          value={activeCardio.distance}
          onChange={handleCardioChange("distance")}
          fullWidth
          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
        />
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }}>
        <TextField
          select
          label="Unit"
          value={activeCardio.distanceUnit}
          onChange={handleCardioDistanceUnitChange}
          fullWidth
        >
          {cardioDistanceUnitOptions.map((unit) => (
            <MenuItem key={unit} value={unit}>
              {unit}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          label="Duration"
          placeholder="hh:mm:ss"
          value={activeCardio.duration}
          onChange={handleCardioChange("duration")}
          error={durationHasError}
          helperText={durationHasError ? "Use mm:ss or hh:mm:ss." : getDurationHelperText()}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <TextField
          label={primaryCardioMetricLabel}
          placeholder={primaryCardioMetricPlaceholder}
          type={primaryCardioMetric === "speed" ? "number" : "text"}
          value={activeCardio[primaryCardioMetricField]}
          onChange={handleCardioDerivedChange(primaryCardioMetricField)}
          fullWidth
          slotProps={{
            htmlInput: primaryCardioMetric === "speed" ? { min: 0, step: "0.1" } : undefined,
            input: {
              endAdornment: renderAutoAdornment(
                cardioAuto?.[cardioViewMode]?.[primaryCardioMetricAutoKey]
              ),
            },
          }}
          error={primaryMetricHasError}
          helperText={
            primaryMetricHasError
              ? getDerivedMetricErrorText(primaryCardioMetric)
              : primaryCardioMetricHelperText
          }
        />
      </Grid>
    </Grid>
  );
}
