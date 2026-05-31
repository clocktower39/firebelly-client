import React from "react";
import dayjs from "dayjs";
import { ArrowBack, Settings } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { serverURL } from "../../../Redux/actions";
import { WEIGHT_UNIT_OPTIONS } from "../../../utils/weightUnits";

export default function WorkoutHeader({
  activeWorkoutType,
  activeWorkoutWeightUnit,
  canManageTrainerSession,
  isPersonalWorkout,
  isProgramBuilder,
  onBack,
  onOpenSettings,
  onOpenTrainerSessionDialog,
  onWorkoutWeightUnitChange,
  scheduleEvent,
  training,
}) {
  const title = training.date
    ? dayjs.utc(training.date).format("MMMM Do, YYYY")
    : isProgramBuilder
      ? "Workout Builder"
      : training.isTemplate
        ? "Template Workout"
        : "Workout Builder";

  return (
    <>
      {!isPersonalWorkout && training.user.firstName && (
        <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
          <Avatar
            src={
              training?.user?.profilePicture &&
              `${serverURL}/user/profilePicture/${training.user.profilePicture}`
            }
            sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
            alt={training?.user ? `${training?.user.firstName[0]} ${training?.user.lastName[0]}` : "loading"}
          />
          <Typography variant="h5">
            {training?.user.firstName} {training?.user.lastName}
          </Typography>
        </Grid>
      )}
      <Grid container size={1} sx={{ justifyContent: "center", alignItems: "center" }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
      </Grid>
      <Grid size={10} container sx={{ justifyContent: "center" }}>
        <Stack spacing={0.5} sx={{ alignItems: "center" }}>
          <Typography variant="h5">{title}</Typography>
          {activeWorkoutType && (
            <Chip label={`${activeWorkoutType} Workout`} size="small" variant="outlined" />
          )}
          {training.isTemplate && (
            <Chip label="Template Workout" size="small" variant="outlined" />
          )}
          <ToggleButtonGroup
            value={activeWorkoutWeightUnit}
            exclusive
            size="small"
            onChange={onWorkoutWeightUnitChange}
          >
            {WEIGHT_UNIT_OPTIONS.map((unit) => (
              <ToggleButton key={unit.value} value={unit.value}>
                {unit.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Grid>
      <Grid size={1} container sx={{ justifyContent: "center", alignItems: "center" }}>
        <Tooltip title="Workout Settings">
          <IconButton variant="contained" onClick={onOpenSettings}>
            <Settings />
          </IconButton>
        </Tooltip>
      </Grid>
      {scheduleEvent && (
        <Grid container size={12} sx={{ justifyContent: "center", paddingTop: "5px" }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Chip
              label={scheduleEvent.eventType}
              color={
                scheduleEvent.eventType === "APPOINTMENT"
                  ? "primary"
                  : scheduleEvent.eventType === "INDEPENDENT"
                    ? "secondary"
                    : "info"
              }
              size="small"
            />
            <Chip label={scheduleEvent.status} size="small" />
            <Chip
              label={`${dayjs(scheduleEvent.startDateTime).format("h:mm A")} - ${dayjs(
                scheduleEvent.endDateTime
              ).format("h:mm A")}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Grid>
      )}
      {canManageTrainerSession && (
        <Grid
          container
          size={12}
          sx={{ justifyContent: "center", paddingTop: scheduleEvent ? "8px" : "5px" }}
        >
          <Button
            size="small"
            variant={scheduleEvent ? "outlined" : "contained"}
            onClick={onOpenTrainerSessionDialog}
          >
            {scheduleEvent ? "Edit Trainer Session" : "Mark as Trainer Session"}
          </Button>
        </Grid>
      )}
    </>
  );
}
