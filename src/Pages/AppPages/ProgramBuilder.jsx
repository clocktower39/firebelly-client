import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Alert } from "@mui/material";
import { serverURL } from "../../Redux/actions";

const DEFAULT_WEEKS = 4;
const DEFAULT_DAYS = 5;
const AUTOSAVE_MS = 10000;

const buildWeeks = (weeksCount, daysPerWeek, existingWeeks = []) => {
  const weeks = [];
  for (let weekIndex = 0; weekIndex < weeksCount; weekIndex += 1) {
    const days = [];
    for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex += 1) {
      const existingDay = existingWeeks?.[weekIndex]?.[dayIndex];
      days.push({
        dayIndex: dayIndex + 1,
        workoutId: existingDay?.workoutId || null,
        notes: existingDay?.notes || "",
      });
    }
    weeks.push(days);
  }
  return weeks;
};

const formatWorkoutSummary = (workout) => {
  if (!workout) return "Workout";
  const title = workout.title || "Workout";
  const totalExercises =
    workout?.training?.reduce((count, circuit) => count + circuit.length, 0) || 0;
  const exerciseLabel = totalExercises === 1 ? "exercise" : "exercises";
  return `${title} • ${totalExercises} ${exerciseLabel}`;
};

export default function ProgramBuilder() {
  const user = useSelector((state) => state.user);
  const { programId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [workoutCache, setWorkoutCache] = useState({});

  const saveTimerRef = useRef(null);
  const inFlightRef = useRef(false);

  const authHeaders = useMemo(() => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    return {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: bearer,
    };
  }, []);

  const setSavedMessage = useCallback((message) => {
    setSaveMessage(message);
    setSaveError("");
  }, []);

  const setErrorMessage = useCallback((message) => {
    setSaveError(message);
    setSaveMessage("");
  }, []);

  const loadProgram = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${serverURL}/programs/${id}`, {
          headers: authHeaders,
        });
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setProgram(data);
        setActiveWeekIndex(0);
        setDirty(false);
      } catch (err) {
        setErrorMessage(err.message || "Unable to load program.");
      } finally {
        setIsLoading(false);
      }
    },
    [authHeaders, setErrorMessage]
  );

  const createProgram = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${serverURL}/programs`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify({
          title: "",
          description: "",
          weeksCount: DEFAULT_WEEKS,
          daysPerWeek: DEFAULT_DAYS,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setProgram(data);
      setActiveWeekIndex(0);
      navigate(`/programs/${data._id}/edit`, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || "Unable to create program.");
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, navigate, setErrorMessage]);

  const saveDraft = useCallback(async () => {
    if (!program?._id || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsSaving(true);
    try {
      const response = await fetch(`${serverURL}/programs/${program._id}`, {
        method: "put",
        headers: authHeaders,
        body: JSON.stringify({
          title: program.title,
          description: program.description,
          weeksCount: program.weeksCount,
          daysPerWeek: program.daysPerWeek,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setProgram(data);
      setDirty(false);
      setSavedMessage("Draft saved.");
    } catch (err) {
      setErrorMessage(err.message || "Unable to save draft.");
    } finally {
      inFlightRef.current = false;
      setIsSaving(false);
    }
  }, [authHeaders, program, setErrorMessage, setSavedMessage]);

  const publishProgram = useCallback(async () => {
    if (!program?._id || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsSaving(true);
    try {
      const response = await fetch(`${serverURL}/programs/${program._id}/publish`, {
        method: "post",
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.errors?.length) {
        throw new Error(data.errors.join(" "));
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      setProgram(data);
      setDirty(false);
      setSavedMessage("Program published.");
    } catch (err) {
      setErrorMessage(err.message || "Unable to publish program.");
    } finally {
      inFlightRef.current = false;
      setIsSaving(false);
    }
  }, [authHeaders, program, setErrorMessage, setSavedMessage]);

  const updateDaySlot = useCallback(
    async (weekIndex, dayIndex, workoutId) => {
      if (!program?._id) return;
      try {
        const response = await fetch(
          `${serverURL}/programs/${program._id}/days/${weekIndex + 1}/${dayIndex + 1}`,
          {
            method: "put",
            headers: authHeaders,
            body: JSON.stringify({ workoutId }),
          }
        );
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setProgram((prev) => ({
          ...prev,
          weeks: data.weeks,
          status: data.status,
          publishedAt: data.publishedAt,
        }));
      } catch (err) {
        setErrorMessage(err.message || "Unable to update day.");
      }
    },
    [authHeaders, program, setErrorMessage]
  );

  const createWorkoutForDay = useCallback(
    async (weekIndex, dayIndex) => {
      if (!program?._id || !user?._id) return;
      try {
        const response = await fetch(`${serverURL}/createTraining`, {
          method: "post",
          headers: authHeaders,
          body: JSON.stringify({
            userId: user._id,
            title: `${program.title || "Program"} • Week ${weekIndex + 1} Day ${dayIndex + 1}`,
            category: [],
            training: [[]],
          }),
        });
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        const newWorkout = data.training;
        setWorkoutCache((prev) => ({ ...prev, [newWorkout._id]: newWorkout }));
        await updateDaySlot(weekIndex, dayIndex, newWorkout._id);
        navigate(`/workout/${newWorkout._id}?return=${encodeURIComponent(location.pathname)}`);
      } catch (err) {
        setErrorMessage(err.message || "Unable to create workout.");
      }
    },
    [authHeaders, location.pathname, navigate, program, updateDaySlot, user]
  );

  const handleEditDay = useCallback(
    (weekIndex, dayIndex, workoutId) => {
      if (workoutId) {
        navigate(`/workout/${workoutId}?return=${encodeURIComponent(location.pathname)}`);
        return;
      }
      createWorkoutForDay(weekIndex, dayIndex);
    },
    [createWorkoutForDay, location.pathname, navigate]
  );

  useEffect(() => {
    if (programId) {
      loadProgram(programId);
    } else {
      createProgram();
    }
  }, [createProgram, loadProgram, programId]);

  useEffect(() => {
    if (!dirty || !program?._id) return;
    clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(() => {
      saveDraft();
    }, AUTOSAVE_MS);
    return () => clearInterval(saveTimerRef.current);
  }, [dirty, program, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!program?.weeks) return;
    const assignedIds = new Set();
    program.weeks.forEach((week) =>
      week.forEach((day) => {
        if (day.workoutId) assignedIds.add(day.workoutId);
      })
    );
    const missingIds = Array.from(assignedIds).filter((id) => !workoutCache[id]);
    if (missingIds.length === 0) return;

    missingIds.forEach(async (id) => {
      try {
        const response = await fetch(`${serverURL}/training`, {
          method: "post",
          headers: authHeaders,
          body: JSON.stringify({ _id: id }),
        });
        const data = await response.json();
        if (data?._id) {
          setWorkoutCache((prev) => ({ ...prev, [data._id]: data }));
        }
      } catch (err) {
        setErrorMessage("Unable to load workout details.");
      }
    });
  }, [authHeaders, program, setErrorMessage, workoutCache]);

  if (isLoading || !program) {
    return (
      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="body1">Loading Program Builder...</Typography>
      </Box>
    );
  }

  const weeksCount = Number(program.weeksCount) || DEFAULT_WEEKS;
  const daysPerWeek = Number(program.daysPerWeek) || DEFAULT_DAYS;
  const weeks = program.weeks?.length ? program.weeks : buildWeeks(weeksCount, daysPerWeek);
  const activeWeek = weeks[activeWeekIndex] || [];

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Program Builder</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <TextField
              label="Program Title"
              value={program.title}
              onChange={(event) => {
                setProgram((prev) => ({ ...prev, title: event.target.value }));
                setDirty(true);
              }}
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={program.description}
              onChange={(event) => {
                setProgram((prev) => ({ ...prev, description: event.target.value }));
                setDirty(true);
              }}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
          <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
            <Chip
              label={program.status === "PUBLISHED" ? "Published" : "Draft"}
              color={program.status === "PUBLISHED" ? "success" : "default"}
              variant={program.status === "PUBLISHED" ? "filled" : "outlined"}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={saveDraft} disabled={isSaving}>
                Save Draft
              </Button>
              <Button variant="contained" onClick={publishProgram} disabled={isSaving}>
                Publish
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Card>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Weeks"
                  type="number"
                  inputProps={{ min: 1, max: 52 }}
                  value={weeksCount}
                  onChange={(event) => {
                    const next = Math.max(1, Math.min(52, Number(event.target.value)));
                    setProgram((prev) => ({
                      ...prev,
                      weeksCount: next,
                      weeks: buildWeeks(next, prev.daysPerWeek, prev.weeks),
                    }));
                    setActiveWeekIndex(0);
                    setDirty(true);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Days per week"
                  type="number"
                  inputProps={{ min: 1, max: 7 }}
                  value={daysPerWeek}
                  onChange={(event) => {
                    const next = Math.max(1, Math.min(7, Number(event.target.value)));
                    setProgram((prev) => ({
                      ...prev,
                      daysPerWeek: next,
                      weeks: buildWeeks(prev.weeksCount, next, prev.weeks),
                    }));
                    setDirty(true);
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Week Structure</Typography>
              <Tabs
                value={activeWeekIndex}
                onChange={(event, value) => setActiveWeekIndex(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {Array.from({ length: weeksCount }, (_, index) => (
                  <Tab key={`week-${index}`} label={`Week ${index + 1}`} />
                ))}
              </Tabs>
              <Grid container spacing={2}>
                {activeWeek.map((day, dayIndex) => {
                  const workout = day.workoutId ? workoutCache[day.workoutId] : null;
                  const summary = workout ? formatWorkoutSummary(workout) : "No workout assigned";
                  return (
                    <Grid key={`day-${dayIndex}`} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography variant="subtitle1">Day {dayIndex + 1}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {summary}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEditDay(activeWeekIndex, dayIndex, day.workoutId)}
                          >
                            {day.workoutId ? "Edit workout" : "Add workout"}
                          </Button>
                          {day.workoutId && (
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => updateDaySlot(activeWeekIndex, dayIndex, null)}
                            >
                              Clear
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={Boolean(saveMessage)}
        autoHideDuration={3000}
        onClose={() => setSaveMessage("")}
      >
        <Alert severity="success" variant="filled">
          {saveMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(saveError)}
        autoHideDuration={6000}
        onClose={() => setSaveError("")}
      >
        <Alert severity="error" variant="filled">
          {saveError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
