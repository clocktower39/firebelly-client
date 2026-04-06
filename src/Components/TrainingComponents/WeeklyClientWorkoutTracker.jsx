import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";
import { enterClientAccount, requestClients, requestWorkoutsByRange } from "../../Redux/actions";
import {
  getRelationshipEngagementStatus,
  isRelationshipActivelyCoached,
} from "../../utils/clientRelationships";
import WorkoutTrainerSessionDialog from "./WorkoutTrainerSessionDialog";

dayjs.extend(utc);

const formatClientName = (client) =>
  `${client?.firstName || ""} ${client?.lastName || ""}`.trim() || "Unnamed client";

export default function WeeklyClientWorkoutTracker({
  selectedDate = dayjs().format("YYYY-MM-DD"),
  mode = "week",
  title = "",
  description = "",
  showViewFullButton = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const workoutsByAccount = useSelector((state) => state.workouts);
  const [showMode, setShowMode] = useState("all");
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [openingEntryKey, setOpeningEntryKey] = useState("");
  const [entryError, setEntryError] = useState("");
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionDialogWorkouts, setSessionDialogWorkouts] = useState([]);
  const [sessionDialogInitialWorkoutId, setSessionDialogInitialWorkoutId] = useState("");
  const displayDate = useMemo(() => dayjs(selectedDate), [selectedDate]);
  const clientRelationships = useMemo(() => (Array.isArray(clients) ? clients : []), [clients]);

  const activeClientRelationships = useMemo(
    () =>
      clientRelationships
        .filter(
          (relationship) => isRelationshipActivelyCoached(relationship) && relationship?.client?._id
        )
        .sort((a, b) => formatClientName(a.client).localeCompare(formatClientName(b.client))),
    [clientRelationships]
  );
  const acceptedClients = useMemo(
    () => activeClientRelationships.map((relationship) => relationship.client),
    [activeClientRelationships]
  );
  const deferredClientRelationships = useMemo(
    () =>
      clientRelationships.filter(
        (relationship) =>
          relationship?.accepted &&
          relationship?.client?._id &&
          getRelationshipEngagementStatus(relationship) !== "active"
      ),
    [clientRelationships]
  );

  const weekStart = useMemo(() => displayDate.startOf("week"), [displayDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, "day")),
    [weekStart]
  );
  const acceptedClientKey = useMemo(
    () => acceptedClients.map((client) => client._id).join("|"),
    [acceptedClients]
  );
  const rangeStart = weekStart.format("YYYY-MM-DD");
  const rangeEnd = weekStart.add(6, "day").format("YYYY-MM-DD");

  useEffect(() => {
    if (user?.isTrainer) {
      dispatch(requestClients());
    }
  }, [dispatch, user?.isTrainer]);

  useEffect(() => {
    if (!user?.isTrainer || acceptedClients.length === 0) {
      setLoadingWeek(false);
      return;
    }

    let active = true;
    setLoadingWeek(true);

    Promise.all(
      acceptedClients.map((client) =>
        dispatch(requestWorkoutsByRange(rangeStart, rangeEnd, client._id))
      )
    ).finally(() => {
      if (active) {
        setLoadingWeek(false);
      }
    });

    return () => {
      active = false;
    };
  }, [acceptedClientKey, acceptedClients, dispatch, rangeEnd, rangeStart, user?.isTrainer]);

  const unscheduledClients = useMemo(
    () =>
      acceptedClients.filter(
        (client) =>
          !Array.isArray(client?.preferredWorkoutDays) || client.preferredWorkoutDays.length === 0
      ),
    [acceptedClients]
  );

  const dayCards = useMemo(
    () =>
      weekDays.map((day) => {
        const weekday = day.day();
        const scheduledClients = acceptedClients.filter((client) =>
          (client.preferredWorkoutDays || []).map(Number).includes(weekday)
        );

        const entries = scheduledClients
          .map((client) => {
            const workouts =
              (Array.isArray(workoutsByAccount?.[client._id]?.workouts)
                ? workoutsByAccount[client._id].workouts
                : []
              ).filter((workout) =>
                dayjs.utc(workout.date).isSame(day, "day")
              );

            return {
              client,
              workouts,
              workoutCount: workouts.length,
              hasWorkout: workouts.length > 0,
            };
          })
          .sort(
            (a, b) =>
              Number(a.hasWorkout) - Number(b.hasWorkout) ||
              formatClientName(a.client).localeCompare(formatClientName(b.client))
          );

        const coveredCount = entries.filter((entry) => entry.hasWorkout).length;
        const visibleEntries =
          showMode === "missing" ? entries.filter((entry) => !entry.hasWorkout) : entries;

        return {
          key: day.format("YYYY-MM-DD"),
          day,
          totalScheduled: entries.length,
          coveredCount,
          entries: visibleEntries,
        };
      }),
    [acceptedClients, showMode, weekDays, workoutsByAccount]
  );

  const totals = useMemo(() => {
    const totalScheduled = dayCards.reduce((sum, day) => sum + day.totalScheduled, 0);
    const totalCovered = dayCards.reduce((sum, day) => sum + day.coveredCount, 0);
    return {
      totalScheduled,
      totalCovered,
      missing: totalScheduled - totalCovered,
    };
  }, [dayCards]);

  const unscheduledPreview = unscheduledClients
    .slice(0, 4)
    .map((client) => formatClientName(client))
    .join(", ");
  const deferredPreview = deferredClientRelationships
    .slice(0, 4)
    .map((relationship) => formatClientName(relationship.client))
    .join(", ");
  const focusedDayCard = useMemo(
    () => dayCards.find((dayCard) => dayCard.key === displayDate.format("YYYY-MM-DD")) || null,
    [dayCards, displayDate]
  );
  const focusedDayMissing = focusedDayCard
    ? focusedDayCard.totalScheduled - focusedDayCard.coveredCount
    : 0;
  const resolvedTitle =
    title || (mode === "day" ? "Today's Coverage" : "Weekly Client Coverage");
  const resolvedDescription =
    description ||
    (mode === "day"
      ? `Clients expected on ${displayDate.format("dddd, MMM D")}.`
      : "Based on each active client's preferred workout days for the selected week.");

  const handleOpenClientAccount = async (clientId, day) => {
    const targetDate = day.format("YYYYMMDD");
    const nextOpeningKey = `${clientId}-${targetDate}`;

    setEntryError("");
    setOpeningEntryKey(nextOpeningKey);

    const data = await dispatch(enterClientAccount(clientId));
    if (data?.error) {
      setEntryError(data.error);
      setOpeningEntryKey("");
      return;
    }

    navigate(`/?date=${targetDate}`);
  };

  const handleOpenSessionDialog = (event, workouts) => {
    event.stopPropagation();
    event.preventDefault();

    if (!workouts?.length) return;

    setSessionDialogWorkouts(workouts);
    setSessionDialogInitialWorkoutId(workouts[0]?._id || "");
    setSessionDialogOpen(true);
  };

  const handleCloseSessionDialog = () => {
    setSessionDialogOpen(false);
    setSessionDialogWorkouts([]);
    setSessionDialogInitialWorkoutId("");
  };

  const handleViewFullCoverage = () => {
    navigate(`/coverage?date=${displayDate.format("YYYYMMDD")}`);
  };

  const renderEntry = (entry, day) => {
    const entryKey = `${entry.client._id}-${day.format("YYYYMMDD")}`;
    const isOpening = openingEntryKey === entryKey;

    return (
      <Box
        key={`${day.format("YYYY-MM-DD")}-${entry.client._id}`}
        role="button"
        tabIndex={0}
        onClick={() => handleOpenClientAccount(entry.client._id, day)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenClientAccount(entry.client._id, day);
          }
        }}
        sx={{
          width: "100%",
          textAlign: "left",
          textDecoration: "none",
          color: "inherit",
          border: "1px solid",
          borderColor: entry.hasWorkout ? "success.light" : "divider",
          borderRadius: 2,
          padding: "8px 10px",
          backgroundColor: entry.hasWorkout
            ? "rgba(76, 175, 80, 0.08)"
            : "rgba(255, 255, 255, 0.02)",
          cursor: openingEntryKey ? "progress" : "pointer",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            backgroundColor: entry.hasWorkout
              ? "rgba(76, 175, 80, 0.12)"
              : "rgba(255, 152, 0, 0.12)",
            borderColor: entry.hasWorkout ? "success.main" : "warning.main",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: entry.hasWorkout ? "success.main" : "warning.main",
            outlineOffset: 2,
          },
          opacity: openingEntryKey && !isOpening ? 0.65 : 1,
          pointerEvents: openingEntryKey && !isOpening ? "none" : "auto",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            {entry.hasWorkout ? (
              <CheckBoxIcon fontSize="small" color="success" />
            ) : (
              <CheckBoxOutlineBlankIcon fontSize="small" color="warning" />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: entry.hasWorkout ? 500 : 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatClientName(entry.client)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexShrink: 0 }}>
            {entry.hasWorkout && (
              <Button
                size="small"
                variant="outlined"
                onClick={(event) => handleOpenSessionDialog(event, entry.workouts)}
                disabled={Boolean(openingEntryKey)}
              >
                Session
              </Button>
            )}
            {isOpening ? (
              <CircularProgress size={16} />
            ) : entry.workoutCount > 1 ? (
              <Chip size="small" variant="outlined" label={entry.workoutCount} />
            ) : null}
          </Stack>
        </Stack>
      </Box>
    );
  };

  const renderDayCard = (dayCard, compact = false) => {
    if (!dayCard) return null;

    const isComplete =
      dayCard.totalScheduled > 0 && dayCard.coveredCount === dayCard.totalScheduled;

    return (
      <Paper
        key={dayCard.key}
        variant="outlined"
        sx={{
          padding: "14px",
          minHeight: compact ? "auto" : 220,
          borderColor:
            dayCard.totalScheduled === 0
              ? "divider"
              : isComplete
                ? "success.light"
                : "warning.light",
          backgroundColor:
            dayCard.totalScheduled === 0
              ? "background.paper"
              : isComplete
                ? "rgba(76, 175, 80, 0.05)"
                : "rgba(255, 152, 0, 0.06)",
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Stack spacing={0.25}>
              <Typography variant="subtitle1">{dayCard.day.format("dddd")}</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayCard.day.format("MMM D")}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={`${dayCard.coveredCount}/${dayCard.totalScheduled}`}
              color={isComplete ? "success" : dayCard.totalScheduled > 0 ? "warning" : "default"}
            />
          </Stack>

          {dayCard.totalScheduled === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No clients scheduled.
            </Typography>
          ) : dayCard.entries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nothing missing.
            </Typography>
          ) : (
            <Stack spacing={0.75}>
              {dayCard.entries.map((entry) => renderEntry(entry, dayCard.day))}
            </Stack>
          )}
        </Stack>
      </Paper>
    );
  };

  if (!user?.isTrainer) return null;

  return (
    <Paper variant="outlined" sx={{ width: "100%", margin: "10px 0", padding: "16px" }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", lg: "center" } }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">{resolvedTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {resolvedDescription}
            </Typography>
          </Stack>
          {mode === "week" ? (
            <ToggleButtonGroup
              value={showMode}
              exclusive
              size="small"
              onChange={(event, nextMode) => {
                if (nextMode) setShowMode(nextMode);
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="missing">Missing only</ToggleButton>
            </ToggleButtonGroup>
          ) : showViewFullButton ? (
            <Button size="small" variant="outlined" onClick={handleViewFullCoverage}>
              View Full Coverage
            </Button>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
          <Chip
            size="small"
            color={
              mode === "day"
                ? focusedDayMissing === 0
                  ? "success"
                  : "warning"
                : totals.missing === 0
                  ? "success"
                  : "warning"
            }
            label={
              mode === "day"
                ? `${focusedDayCard?.coveredCount || 0}/${focusedDayCard?.totalScheduled || 0} entered`
                : `${totals.totalCovered}/${totals.totalScheduled} entered`
            }
          />
          <Chip
            size="small"
            variant="outlined"
            color={
              mode === "day"
                ? focusedDayMissing === 0
                  ? "success"
                  : "warning"
                : totals.missing === 0
                  ? "success"
                  : "warning"
            }
            label={mode === "day" ? `${focusedDayMissing} missing` : `${totals.missing} missing`}
          />
          {unscheduledClients.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              color="info"
              label={`${unscheduledClients.length} need preferred days`}
            />
          )}
          {deferredClientRelationships.length > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={`${deferredClientRelationships.length} paused/inactive`}
            />
          )}
          {loadingWeek && (
            <Chip
              size="small"
              variant="outlined"
              icon={<CircularProgress size={14} />}
              label="Refreshing week"
            />
          )}
        </Stack>

        {unscheduledClients.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Missing preferred workout days: {unscheduledPreview}
            {unscheduledClients.length > 4 ? ` +${unscheduledClients.length - 4} more` : ""}
          </Typography>
        )}
        {deferredClientRelationships.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Coverage excludes paused/inactive clients: {deferredPreview}
            {deferredClientRelationships.length > 4
              ? ` +${deferredClientRelationships.length - 4} more`
              : ""}
          </Typography>
        )}
        {entryError && (
          <Typography variant="caption" color="error">
            {entryError}
          </Typography>
        )}

        {mode === "day" ? (
          renderDayCard(focusedDayCard, true)
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {dayCards.map((dayCard) => renderDayCard(dayCard))}
          </Box>
        )}
      </Stack>
      <WorkoutTrainerSessionDialog
        open={sessionDialogOpen}
        onClose={handleCloseSessionDialog}
        workouts={sessionDialogWorkouts}
        initialWorkoutId={sessionDialogInitialWorkoutId}
      />
    </Paper>
  );
}
