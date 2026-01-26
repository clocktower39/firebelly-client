import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editUser } from "../../Redux/actions";
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function WorkoutPreferences() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [weeklyFrequency, setWeeklyFrequency] = useState(user.weeklyFrequency || "");
  const [selectedDays, setSelectedDays] = useState(user.preferredWorkoutDays || []);

  const handleFrequencyChange = (event) => {
    setWeeklyFrequency(event.target.value);
  };

  const handleDayChange = (event, newDays) => {
    setSelectedDays(newDays);
  };

  const savePreferences = () => {
    dispatch(editUser({ weeklyFrequency, preferredWorkoutDays: selectedDays }));
  };

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container size={12} sx={{ padding: "15px" }}>
        <Typography color="primary.contrastText" variant="h5" gutterBottom>
          Workout Preferences
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container size={12}>
            <Typography variant="subtitle1" gutterBottom>
              Weekly Frequency
            </Typography>
          </Grid>
          <Grid container size={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              How many times per week do you plan to train?
            </Typography>
          </Grid>
          <Grid container size={12}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="weekly-frequency-label">Days per week</InputLabel>
              <Select
                labelId="weekly-frequency-label"
                id="weekly-frequency"
                value={weeklyFrequency}
                label="Days per week"
                onChange={handleFrequencyChange}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container size={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Preferred Workout Days
            </Typography>
          </Grid>
          <Grid container size={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select the days you generally want to workout. This will be used as the default when adding programs to your account.
            </Typography>
          </Grid>
          <Grid container size={12} sx={{ justifyContent: "center" }}>
            <ToggleButtonGroup
              value={selectedDays}
              onChange={handleDayChange}
              aria-label="preferred workout days"
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleButton
                  key={day.value}
                  value={day.value}
                  aria-label={day.label}
                  sx={{ minWidth: 48 }}
                >
                  {day.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
          <Grid container size={12} sx={{ justifyContent: "center", mt: 2 }}>
            <Button variant="contained" onClick={savePreferences}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
