import React from "react";
import { Collapse, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export default function CardioRouteSection({
  activeCardio,
  activeCardioConfig,
  cardioRouteOptions,
  cardioSectionsOpen,
  cardioSurfaceOptions,
  handleCardioChange,
  shoeMileageHelper,
}) {
  return (
    <Grid size={12}>
      <Collapse in={cardioSectionsOpen.route} unmountOnExit>
        <Paper variant="outlined" sx={{ padding: "16px" }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Route & Gear</Typography>
            <Grid container spacing={2}>
              {activeCardioConfig.showRouteType && cardioRouteOptions.length > 0 && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    label={activeCardioConfig.routeTypeLabel}
                    value={activeCardio.routeType}
                    onChange={handleCardioChange("routeType")}
                    fullWidth
                  >
                    {cardioRouteOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              {activeCardioConfig.showSurface && cardioSurfaceOptions.length > 0 && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    label={activeCardioConfig.surfaceLabel}
                    value={activeCardio.surface}
                    onChange={handleCardioChange("surface")}
                    fullWidth
                  >
                    {cardioSurfaceOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              {activeCardioConfig.showFootwear && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label={activeCardio.activity === "Hike" ? "Shoes / footwear" : "Shoes"}
                    placeholder="e.g., Nike Pegasus 41"
                    value={activeCardio.shoes}
                    onChange={handleCardioChange("shoes")}
                    fullWidth
                    helperText={shoeMileageHelper}
                  />
                </Grid>
              )}
              {activeCardioConfig.showElevation && (
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Elevation gain"
                    type="number"
                    value={activeCardio.elevationGain}
                    onChange={handleCardioChange("elevationGain")}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
              )}
              <Grid size={12}>
                <TextField
                  label="Route link"
                  placeholder={activeCardioConfig.routeLinkPlaceholder}
                  value={activeCardio.routeLink}
                  onChange={handleCardioChange("routeLink")}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Collapse>
    </Grid>
  );
}
