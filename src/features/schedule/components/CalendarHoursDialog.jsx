import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

export default function CalendarHoursDialog({
  open,
  onClose,
  draftStartHour,
  setDraftStartHour,
  draftEndHour,
  setDraftEndHour,
  hourOptions,
  formatHourLabel,
  timeSettingsError,
  onSave,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Calendar hours</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Start time</InputLabel>
            <Select
              label="Start time"
              value={draftStartHour}
              onChange={(event) => setDraftStartHour(Number(event.target.value))}
            >
              {hourOptions.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {formatHourLabel(hour)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth error={timeSettingsError}>
            <InputLabel>End time</InputLabel>
            <Select
              label="End time"
              value={draftEndHour}
              onChange={(event) => setDraftEndHour(Number(event.target.value))}
            >
              {hourOptions.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {formatHourLabel(hour)}
                </MenuItem>
              ))}
            </Select>
            {timeSettingsError && (
              <Typography variant="caption" color="error">
                End time must be after the start time.
              </Typography>
            )}
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={timeSettingsError} onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

