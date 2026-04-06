import React from "react";
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { formatHistoryLabel } from "./utils/exercisePresetUtils";

export default function ExerciseGoalPresetField({
  recentHistoryOptions,
  selectedHistoryKey,
  onChange,
}) {
  if (recentHistoryOptions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent history for this exercise. Swapping exercises will clear the old movement goals.
      </Typography>
    );
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Goal preset</InputLabel>
      <Select label="Goal preset" value={selectedHistoryKey} onChange={onChange}>
        {recentHistoryOptions.map((option) => (
          <MenuItem key={option.key} value={option.key}>
            {formatHistoryLabel(option.historyItem)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
