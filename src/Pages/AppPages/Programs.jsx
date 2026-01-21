import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { requestClients, serverURL } from "../../Redux/actions";

export default function Programs() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignProgram, setAssignProgram] = useState(null);
  const [assignClientId, setAssignClientId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignDayMap, setAssignDayMap] = useState([]);
  const [assignDayMapTouched, setAssignDayMapTouched] = useState(false);
  const [assignStatus, setAssignStatus] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const weekDayOptions = useMemo(
    () => [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    []
  );

  useEffect(() => {
    if (!assignProgram) return;
    if (assignDayMapTouched) return;
    const daysPerWeek = assignProgram.daysPerWeek || 0;
    if (!daysPerWeek) {
      setAssignDayMap([]);
      return;
    }
    const startDateValue = assignStartDate
      ? new Date(`${assignStartDate}T00:00:00`)
      : null;
    const startDay = startDateValue && !Number.isNaN(startDateValue.valueOf())
      ? startDateValue.getDay()
      : 0;
    const nextMap = Array.from(
      { length: daysPerWeek },
      (_, index) => (startDay + index) % 7
    );
    setAssignDayMap(nextMap);
  }, [assignProgram, assignStartDate, assignDayMapTouched]);

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

  useEffect(() => {
    if (!user?.isTrainer) return;
    dispatch(requestClients());
  }, [dispatch, user?.isTrainer]);

  const sortedPrograms = useMemo(() => {
    return [...programs].sort(
      (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
    );
  }, [programs]);

  const acceptedClients = useMemo(
    () => clients.filter((clientRel) => clientRel.accepted),
    [clients]
  );

  const handleOpenAssign = (program) => {
    setAssignProgram(program);
    setAssignClientId("");
    setAssignStartDate("");
    setAssignDayMap([]);
    setAssignDayMapTouched(false);
    setAssignStatus("");
    setOpenAssignDialog(true);
  };

  const handleAssignProgram = async () => {
    if (!assignProgram?._id || !assignClientId || !assignStartDate) return;
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    try {
      setAssignStatus("");
      const payload = {
        clientId: assignClientId,
        startDate: assignStartDate,
      };
      if (assignDayMap.length) {
        payload.dayMap = assignDayMap;
      }
      const response = await fetch(`${serverURL}/programs/${assignProgram._id}/assign`, {
        method: "post",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setAssignSuccess(`Assigned ${data.count || 0} workouts to the client.`);
      setOpenAssignDialog(false);
    } catch (err) {
      setAssignStatus(err.message || "Unable to assign program.");
    }
  };

  return (
    <>
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
                  {user?.isTrainer && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenAssign(program)}
                    >
                      Assign to client
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Stack>
      </Box>
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Assign Program</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select a client and the start date for this program.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                label="Client"
                value={assignClientId}
                onChange={(event) => setAssignClientId(event.target.value)}
              >
                {acceptedClients.map((clientRel) => (
                  <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                    {clientRel.client.firstName} {clientRel.client.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start date"
              type="date"
              value={assignStartDate}
              onChange={(event) => setAssignStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            {!!assignProgram?.daysPerWeek && (
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Map program days to weekdays for the client schedule.
                </Typography>
                <Grid container spacing={1}>
                  {Array.from({ length: assignProgram.daysPerWeek }, (_, index) => (
                    <Grid key={`assign-day-${index}`} size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{`Day ${index + 1}`}</InputLabel>
                        <Select
                          label={`Day ${index + 1}`}
                          value={assignDayMap[index] ?? ""}
                          onChange={(event) => {
                            const nextMap = [...assignDayMap];
                            nextMap[index] = event.target.value;
                            setAssignDayMap(nextMap);
                            setAssignDayMapTouched(true);
                          }}
                        >
                          {weekDayOptions.map((label, dayIndex) => (
                            <MenuItem key={`${label}-${dayIndex}`} value={dayIndex}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}
            {assignStatus && (
              <Typography variant="caption" color="text.secondary">
                {assignStatus}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleAssignProgram}
            disabled={!assignClientId || !assignStartDate}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(assignSuccess)}
        autoHideDuration={3000}
        onClose={() => setAssignSuccess("")}
      >
        <Alert severity="success" variant="filled">
          {assignSuccess}
        </Alert>
      </Snackbar>
    </>
  );
}
