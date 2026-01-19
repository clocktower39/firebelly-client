import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Programs() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    const loadPrograms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${serverURL}/programs`, {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: bearer,
          },
        });
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setPrograms(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load programs.");
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, []);

  const sortedPrograms = useMemo(() => {
    return [...programs].sort(
      (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
    );
  }, [programs]);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <Typography variant="h4" sx={{ flex: 1 }}>
            Programs
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/programs/marketplace-preview")}>
            Marketplace Preview
          </Button>
          <Button variant="contained" onClick={() => navigate("/programs/builder")}>
            New Program
          </Button>
        </Stack>

        {loading && <Typography>Loading programs...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && sortedPrograms.length === 0 && (
          <Typography color="text.secondary">No programs yet.</Typography>
        )}

        <Grid container spacing={2}>
          {sortedPrograms.map((program) => (
            <Grid key={program._id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6">
                        {program.title || "Untitled Program"}
                      </Typography>
                      <Chip
                        label={program.status === "PUBLISHED" ? "Published" : "Draft"}
                        color={program.status === "PUBLISHED" ? "success" : "default"}
                        variant={program.status === "PUBLISHED" ? "filled" : "outlined"}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {program.description || "No description"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {program.weeksCount} weeks • {program.daysPerWeek} days/week
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/programs/${program._id}/edit`)}
                  >
                    Edit
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
