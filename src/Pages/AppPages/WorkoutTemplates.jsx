import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { serverURL } from "../../Redux/actions";

const formatTemplateSummary = (workout) => {
  const totalExercises =
    workout?.training?.reduce((count, circuit) => count + circuit.length, 0) || 0;
  const exerciseLabel = totalExercises === 1 ? "exercise" : "exercises";
  return `${totalExercises} ${exerciseLabel}`;
};

export default function WorkoutTemplates() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isTrainer) return;
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${serverURL}/workoutTemplates`, {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: bearer,
          },
        });
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setTemplates(Array.isArray(data.workouts) ? data.workouts : []);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load template workouts.");
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, [user?.isTrainer]);

  if (!user?.isTrainer) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h5">Template Workouts</Typography>
          <Typography color="text.secondary">
            Template workouts are only available to trainers.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/calendar")}>
            Back to calendar
          </Button>
        </Stack>
      </Box>
    );
  }

  const sortedTemplates = useMemo(() => {
    return [...templates].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).valueOf() - new Date(a.updatedAt || a.createdAt).valueOf()
    );
  }, [templates]);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <Typography variant="h4" sx={{ flex: 1 }}>
            Template Workouts
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/calendar")}>
            Workout Calendar
          </Button>
        </Stack>

        {loading && <Typography>Loading templates...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && sortedTemplates.length === 0 && (
          <Typography color="text.secondary">No template workouts yet.</Typography>
        )}

        <Grid container spacing={2}>
          {sortedTemplates.map((workout) => (
            <Grid key={workout._id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">{workout.title || "Untitled Workout"}</Typography>
                      <Chip label="Template" size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatTemplateSummary(workout)}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      navigate(`/workout/${workout._id}?source=template&return=/workout-templates`)
                    }
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
