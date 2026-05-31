import React from "react";
import {
  Add,
  Delete,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CARDIO_ACTIVITY_OPTIONS,
  CARDIO_CLIENT_PROMPT_LOOKUP,
  CARDIO_CLIENT_PROMPT_OPTIONS,
  CARDIO_HR_ZONE_OPTIONS,
  CARDIO_OPTIONAL_SECTIONS,
  CARDIO_WEATHER_OPTIONS,
  getDerivedMetricErrorText,
  getDurationHelperText,
  renderAutoAdornment,
} from "../utils/workoutUtils";

export default function CardioDetailsEditor({
  activeCardio,
  activeCardioConfig,
  cardioAuto,
  cardioComparisonItems,
  cardioDistanceUnitOptions,
  cardioEditorMode,
  cardioRouteOptions,
  cardioSectionHasData,
  cardioSectionSummaries,
  cardioSectionsOpen,
  cardioStatus,
  cardioStyleOptions,
  cardioStylePresets,
  cardioSurfaceOptions,
  cardioViewMode,
  durationHasError,
  handleAddCardioSegment,
  handleCardioActivityChange,
  handleCardioChange,
  handleCardioDerivedChange,
  handleCardioDistanceUnitChange,
  handleCardioEditorModeChange,
  handleCardioSegmentChange,
  handleCardioViewModeChange,
  handleCopyPlanFieldToActual,
  handleCopyPlanToActual,
  handleRemoveCardioSegment,
  handleStylePreset,
  handleToggleClientPrompt,
  isTrainerEditingClient,
  missingClientPromptKeys,
  paceUnitLabel,
  planClientPrompts,
  planCopyActions,
  primaryCardioMetric,
  primaryCardioMetricAutoKey,
  primaryCardioMetricField,
  primaryCardioMetricHelperText,
  primaryCardioMetricLabel,
  primaryCardioMetricPlaceholder,
  primaryMetricHasError,
  secondaryCardioMetric,
  secondaryCardioMetricAutoKey,
  secondaryCardioMetricField,
  secondaryCardioMetricHelperText,
  secondaryCardioMetricLabel,
  secondaryCardioMetricPlaceholder,
  secondaryMetricHasError,
  shoeMileageHelper,
  speedUnitLabel,
  splitMetricLabel,
  splitMetricUnitLabel,
  splitMetricValue,
  splitSummary,
  toggleCardioSection,
}) {
  return (
    <>
      <Grid size={12}>
        <Paper variant="outlined" sx={{ padding: "16px" }}>
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">Cardio Details</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with the basics. Open the plus buttons for the extras.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ToggleButtonGroup
                  value={cardioViewMode}
                  exclusive
                  size="small"
                  onChange={handleCardioViewModeChange}
                >
                  <ToggleButton value="plan">Plan</ToggleButton>
                  <ToggleButton value="actual">Results</ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  value={cardioEditorMode}
                  exclusive
                  size="small"
                  onChange={handleCardioEditorModeChange}
                >
                  <ToggleButton value="quick">Quick Log</ToggleButton>
                  <ToggleButton value="full">Full Details</ToggleButton>
                </ToggleButtonGroup>
                {cardioViewMode === "actual" && (
                  <Button variant="outlined" size="small" onClick={handleCopyPlanToActual}>
                    Copy plan
                  </Button>
                )}
              </Stack>
            </Stack>
            <Alert severity={cardioStatus.severity} variant="outlined">
              {cardioStatus.message}
            </Alert>
            {cardioComparisonItems.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                {cardioComparisonItems.map((item) => (
                  <Chip
                    key={`compare-${item.key}`}
                    size="small"
                    variant="outlined"
                    label={`${item.label}: ${item.plan} -> ${item.actual}`}
                  />
                ))}
              </Stack>
            )}
            {cardioViewMode === "actual" && planClientPrompts.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Trainer requested:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                  {planClientPrompts.map((key) => {
                    const option = CARDIO_CLIENT_PROMPT_LOOKUP[key];
                    if (!option) return null;
                    const isMissing = missingClientPromptKeys.includes(key);

                    return (
                      <Chip
                        key={`requested-${key}`}
                        size="small"
                        clickable
                        color={isMissing ? "warning" : "success"}
                        variant={isMissing ? "filled" : "outlined"}
                        label={option.label}
                        onClick={() => toggleCardioSection(option.section)}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            )}
            {cardioViewMode === "actual" && planCopyActions.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Use planned details:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                  {planCopyActions.map((action) => (
                    <Chip
                      key={`copy-${action.key}`}
                      size="small"
                      clickable
                      variant="outlined"
                      label={action.label}
                      onClick={() => handleCopyPlanFieldToActual(action)}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
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
                    htmlInput:
                      primaryCardioMetric === "speed"
                        ? { min: 0, step: "0.1" }
                        : undefined,
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
            {cardioStylePresets.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Quick presets
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                  {cardioStylePresets.map((style) => (
                    <Chip
                      key={`preset-${style}`}
                      label={style}
                      size="small"
                      clickable
                      color={activeCardio.style === style ? "primary" : "default"}
                      variant={activeCardio.style === style ? "filled" : "outlined"}
                      onClick={() => handleStylePreset(style)}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
            {isTrainerEditingClient && cardioViewMode === "plan" && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Ask the client to complete
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                  {CARDIO_CLIENT_PROMPT_OPTIONS.map((option) => (
                    <Chip
                      key={`prompt-${option.key}`}
                      label={option.label}
                      size="small"
                      clickable
                      color={planClientPrompts.includes(option.key) ? "primary" : "default"}
                      variant={planClientPrompts.includes(option.key) ? "filled" : "outlined"}
                      onClick={() => handleToggleClientPrompt(option.key)}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
              {CARDIO_OPTIONAL_SECTIONS.map((section) => (
                <Button
                  key={section.key}
                  variant={cardioSectionsOpen[section.key] ? "contained" : "outlined"}
                  color={
                    cardioSectionsOpen[section.key] || cardioSectionHasData[section.key]
                      ? "primary"
                      : "inherit"
                  }
                  size="small"
                  onClick={() => toggleCardioSection(section.key)}
                  startIcon={
                    <Add
                      sx={{
                        transform: cardioSectionsOpen[section.key]
                          ? "rotate(45deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  }
                >
                  {section.label}
                </Button>
              ))}
            </Stack>
            {CARDIO_OPTIONAL_SECTIONS.some(
              (section) => cardioSectionHasData[section.key] && !cardioSectionsOpen[section.key]
            ) && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                {CARDIO_OPTIONAL_SECTIONS.filter(
                  (section) =>
                    cardioSectionHasData[section.key] &&
                    !cardioSectionsOpen[section.key] &&
                    cardioSectionSummaries[section.key]
                ).map((section) => (
                  <Chip
                    key={`${section.key}-summary`}
                    label={`${section.summaryLabel}: ${cardioSectionSummaries[section.key]}`}
                    variant="outlined"
                    size="small"
                    clickable
                    onClick={() => toggleCardioSection(section.key)}
                    sx={{
                      maxWidth: "100%",
                      "& .MuiChip-label": {
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={12}>
        <Collapse in={cardioSectionsOpen.metrics} unmountOnExit>
          <Paper variant="outlined" sx={{ padding: "16px" }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Metrics</Typography>
              <Grid container spacing={2}>
                {secondaryCardioMetric && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label={secondaryCardioMetricLabel}
                      placeholder={secondaryCardioMetricPlaceholder}
                      type={secondaryCardioMetric === "speed" ? "number" : "text"}
                      value={activeCardio[secondaryCardioMetricField]}
                      onChange={handleCardioDerivedChange(secondaryCardioMetricField)}
                      fullWidth
                      slotProps={{
                        htmlInput:
                          secondaryCardioMetric === "speed"
                            ? { min: 0, step: "0.1" }
                            : undefined,
                        input: {
                          endAdornment: renderAutoAdornment(
                            cardioAuto?.[cardioViewMode]?.[secondaryCardioMetricAutoKey]
                          ),
                        },
                      }}
                      error={secondaryMetricHasError}
                      helperText={
                        secondaryMetricHasError
                          ? getDerivedMetricErrorText(secondaryCardioMetric)
                          : secondaryCardioMetricHelperText
                      }
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 4, sm: 3 }}>
                  <TextField
                    label="RPE"
                    type="number"
                    value={activeCardio.rpe}
                    onChange={handleCardioChange("rpe")}
                    fullWidth
                    slotProps={{ htmlInput: { min: 1, max: 10 } }}
                  />
                </Grid>
                <Grid size={{ xs: 8, sm: 3 }}>
                  <TextField
                    select
                    label="HR zone"
                    value={activeCardio.hrZone}
                    onChange={handleCardioChange("hrZone")}
                    fullWidth
                  >
                    {CARDIO_HR_ZONE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 8, sm: 3 }}>
                  <TextField
                    label="Avg heart rate"
                    type="number"
                    value={activeCardio.avgHeartRate}
                    onChange={handleCardioChange("avgHeartRate")}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
                {activeCardioConfig.showCadence && (
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label={activeCardioConfig.cadenceLabel}
                      type="number"
                      value={activeCardio.cadence}
                      onChange={handleCardioChange("cadence")}
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: "1" } }}
                    />
                  </Grid>
                )}
                {activeCardioConfig.showStride && (
                  <>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <TextField
                        label="Stride length"
                        type="number"
                        value={activeCardio.strideLength}
                        onChange={handleCardioChange("strideLength")}
                        fullWidth
                        slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <TextField
                        select
                        label="Stride unit"
                        value={activeCardio.strideUnit}
                        onChange={handleCardioChange("strideUnit")}
                        fullWidth
                      >
                        <MenuItem value="in">in</MenuItem>
                        <MenuItem value="cm">cm</MenuItem>
                        <MenuItem value="m">m</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}
              </Grid>
            </Stack>
          </Paper>
        </Collapse>
      </Grid>
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
      <Grid size={12}>
        <Collapse in={cardioSectionsOpen.notes} unmountOnExit>
          <Paper variant="outlined" sx={{ padding: "16px" }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Notes</Typography>
              <TextField
                label="Notes"
                placeholder="How did it feel? Surface, weather, goal pacing..."
                value={activeCardio.notes}
                onChange={handleCardioChange("notes")}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </Paper>
        </Collapse>
      </Grid>
      <Grid size={12}>
        <Collapse in={cardioSectionsOpen.segments} unmountOnExit>
          <Paper variant="outlined" sx={{ padding: "16px" }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle1">Splits & Intervals</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddCardioSegment}
                  startIcon={<Add />}
                >
                  Add split
                </Button>
              </Stack>
              {(activeCardio.segments || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Add splits to track warmups, repeats, or cooldowns.
                </Typography>
              ) : (
                (activeCardio.segments || []).map((segment, index) => (
                  <Paper key={`cardio-segment-${index}`} variant="outlined" sx={{ padding: "12px" }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Label"
                          value={segment.label}
                          onChange={handleCardioSegmentChange(index, "label")}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          label={`Distance (${activeCardio.distanceUnit})`}
                          type="number"
                          value={segment.distance}
                          onChange={handleCardioSegmentChange(index, "distance")}
                          fullWidth
                          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          label="Duration"
                          placeholder="mm:ss"
                          value={segment.duration}
                          onChange={handleCardioSegmentChange(index, "duration")}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                          label={
                            primaryCardioMetric === "speed"
                              ? `Speed (${speedUnitLabel})`
                              : `Pace (${paceUnitLabel})`
                          }
                          placeholder={primaryCardioMetric === "speed" ? "0.0" : "mm:ss"}
                          value={segment.pace}
                          onChange={handleCardioSegmentChange(index, "pace")}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 4, sm: 2 }}>
                        <TextField
                          label="RPE"
                          type="number"
                          value={segment.rpe}
                          onChange={handleCardioSegmentChange(index, "rpe")}
                          fullWidth
                          slotProps={{ htmlInput: { min: 1, max: 10 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 2, sm: 1 }} container sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Remove split">
                          <IconButton onClick={() => handleRemoveCardioSegment(index)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              )}
              {(activeCardio.segments || []).length > 0 && (
                <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total distance: {splitSummary.totalDistance || "—"} {activeCardio.distanceUnit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total time: {splitSummary.totalDuration || "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {splitMetricLabel}: {splitMetricValue || "—"} {splitMetricUnitLabel}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Collapse>
      </Grid>
    </>
  );
}
