import React from "react";
import {
  Collapse,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CARDIO_WEATHER_OPTIONS } from "../../utils/workoutUtils";

export default function CardioConditionsSection({
  activeCardio,
  cardioSectionsOpen,
  handleCardioChange,
}) {
  return (
    <Grid size={12}>
      <Collapse in={cardioSectionsOpen.conditions} unmountOnExit>
        <Paper variant="outlined" sx={{ padding: "16px" }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Conditions</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  select
                  label="Weather"
                  value={activeCardio.weather}
                  onChange={handleCardioChange("weather")}
                  fullWidth
                >
                  {CARDIO_WEATHER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Temperature"
                  type="number"
                  value={activeCardio.temperature}
                  onChange={handleCardioChange("temperature")}
                  fullWidth
                  slotProps={{
                    htmlInput: { step: "0.1" },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Select
                            size="small"
                            variant="standard"
                            value={activeCardio.temperatureUnit}
                            onChange={handleCardioChange("temperatureUnit")}
                          >
                            <MenuItem value="F">F</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                          </Select>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Collapse>
    </Grid>
  );
}
