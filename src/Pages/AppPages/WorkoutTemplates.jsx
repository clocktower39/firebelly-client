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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from "@mui/icons-material";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [ownerFilter, setOwnerFilter] = useState("all");

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
          body: JSON.stringify({ includeShared: true }),
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

  const allCategories = useMemo(() => {
    const cats = new Set();
    templates.forEach((t) => {
      if (Array.isArray(t.category)) {
        t.category.forEach((c) => cats.add(c));
      }
    });
    return Array.from(cats).sort();
  }, [templates]);

  const hasSharedTemplates = useMemo(() => 
    templates.some((t) => t.isShared), [templates]);

  const filteredAndSortedTemplates = useMemo(() => {
    let result = [...templates];

    // Owner filter
    if (ownerFilter === "mine") {
      result = result.filter((t) => t.isOwn);
    } else if (ownerFilter === "shared") {
      result = result.filter((t) => t.isShared);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((t) =>
        (t.title || "").toLowerCase().includes(query) ||
        (t.category || []).some((c) => c.toLowerCase().includes(query)) ||
        (t.user?.firstName || "").toLowerCase().includes(query) ||
        (t.user?.lastName || "").toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((t) =>
        Array.isArray(t.category) && t.category.includes(categoryFilter)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.updatedAt || b.createdAt).valueOf() - new Date(a.updatedAt || a.createdAt).valueOf());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.updatedAt || a.createdAt).valueOf() - new Date(b.updatedAt || b.createdAt).valueOf());
        break;
      case "title-asc":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "exercises":
        result.sort((a, b) => {
          const aCount = a.training?.reduce((sum, c) => sum + c.length, 0) || 0;
          const bCount = b.training?.reduce((sum, c) => sum + c.length, 0) || 0;
          return bCount - aCount;
        });
        break;
      default:
        break;
    }

    return result;
  }, [templates, searchQuery, categoryFilter, sortBy, ownerFilter]);

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

        {!loading && !error && templates.length > 0 && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              size="small"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            {hasSharedTemplates && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Owner</InputLabel>
                <Select
                  value={ownerFilter}
                  label="Owner"
                  onChange={(e) => setOwnerFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="mine">My Templates</MenuItem>
                  <MenuItem value="shared">Shared with Me</MenuItem>
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {allCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                <MenuItem value="exercises">Most Exercises</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}

        {loading && <Typography>Loading templates...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && templates.length === 0 && (
          <Typography color="text.secondary">No template workouts yet.</Typography>
        )}
        {!loading && !error && templates.length > 0 && filteredAndSortedTemplates.length === 0 && (
          <Typography color="text.secondary">No templates match your filters.</Typography>
        )}

        {viewMode === "grid" ? (
          <Grid container spacing={2}>
            {filteredAndSortedTemplates.map((workout) => (
              <Grid key={workout._id} size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6">{workout.title || "Untitled Workout"}</Typography>
                        <Chip label="Template" size="small" variant="outlined" />
                        {workout.isShared && (
                          <Chip 
                            label={`From ${workout.user?.firstName} ${workout.user?.lastName}`} 
                            size="small" 
                            color="info" 
                            variant="outlined" 
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {formatTemplateSummary(workout)}
                      </Typography>
                      {workout.category?.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {workout.category.map((cat) => (
                            <Chip key={cat} label={cat} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      )}
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
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {filteredAndSortedTemplates.map((workout, index) => (
                <ListItem
                  key={workout._id}
                  divider={index < filteredAndSortedTemplates.length - 1}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        navigate(`/workout/${workout._id}?source=template&return=/workout-templates`)
                      }
                    >
                      Open
                    </Button>
                  }
                  disablePadding
                >
                  <ListItemButton
                    onClick={() =>
                      navigate(`/workout/${workout._id}?source=template&return=/workout-templates`)
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography>{workout.title || "Untitled Workout"}</Typography>
                          <Chip label="Template" size="small" variant="outlined" />
                          {workout.isShared && (
                            <Chip 
                              label={`From ${workout.user?.firstName} ${workout.user?.lastName}`} 
                              size="small" 
                              color="info" 
                              variant="outlined" 
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" component="span">
                            {formatTemplateSummary(workout)}
                          </Typography>
                          {workout.category?.length > 0 && (
                            <>
                              <Typography variant="body2" component="span" color="text.secondary">•</Typography>
                              {workout.category.map((cat) => (
                                <Chip key={cat} label={cat} size="small" variant="outlined" sx={{ height: 20 }} />
                              ))}
                            </>
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
