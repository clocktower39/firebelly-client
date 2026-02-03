import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { serverURL } from "../../Redux/actions";

const roleLabels = {
  TRAINER: "Trainer",
  COACH: "Coach",
  ATHLETE: "Athlete",
  ADMIN: "Trainer",
};

const roleColors = {
  TRAINER: "info",
  COACH: "warning",
  ATHLETE: "default",
  ADMIN: "info",
};

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSport, setCreateSport] = useState("");
  const [createSeason, setCreateSeason] = useState("");
  const [createTimezone, setCreateTimezone] = useState("UTC");
  const [successMessage, setSuccessMessage] = useState("");

  const loadGroups = async () => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    setLoading(true);
    try {
      const response = await fetch(`${serverURL}/groups`, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroups(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!createName.trim()) return;
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    try {
      const response = await fetch(`${serverURL}/groups`, {
        method: "post",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription,
          sport: createSport,
          season: createSeason,
          timezone: createTimezone,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setOpenCreateDialog(false);
      setCreateName("");
      setCreateDescription("");
      setCreateSport("");
      setCreateSeason("");
      setCreateTimezone("UTC");
      setSuccessMessage("Group created.");
      await loadGroups();
    } catch (err) {
      setError(err.message || "Unable to create group.");
    }
  };

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ flex: 1 }}>
              Groups
            </Typography>
            <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
              New Group
            </Button>
          </Stack>

          {loading && <Typography>Loading groups...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && !error && groups.length === 0 && (
            <Typography color="text.secondary">No groups yet.</Typography>
          )}

          <Grid container spacing={2}>
            {groups.map((entry) => {
              const group = entry.group;
              if (!group) return null;
              const roleLabel = roleLabels[entry.role] || entry.role || "Member";
              const roleColor = roleColors[entry.role] || "default";
              return (
                <Grid key={group._id} size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Avatar
                              src={group.picture ? `${serverURL}/groups/picture/${group.picture}` : null}
                              alt={group.name}
                              sx={{ width: 36, height: 36 }}
                            >
                              {group.name?.[0]}
                            </Avatar>
                            <Typography variant="h6">{group.name}</Typography>
                            <Chip label={roleLabel} color={roleColor} size="small" />
                            {group.archivedAt && (
                            <Chip label="Archived" size="small" variant="outlined" />
                          )}
                        </Stack>
                        {group.description && (
                          <Typography variant="body2" color="text.secondary">
                            {group.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {[group.sport, group.season].filter(Boolean).join(" • ") || ""}
                        </Typography>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/groups/${group._id}`)}
                      >
                        Open
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Box>

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Group</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Group name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={createDescription}
              onChange={(event) => setCreateDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Sport"
                value={createSport}
                onChange={(event) => setCreateSport(event.target.value)}
                fullWidth
              />
              <TextField
                label="Season"
                value={createSeason}
                onChange={(event) => setCreateSeason(event.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label="Timezone"
              value={createTimezone}
              onChange={(event) => setCreateTimezone(event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!createName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
