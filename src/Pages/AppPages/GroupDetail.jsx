import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { requestClients, serverURL } from "../../Redux/actions";

const roleLabels = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  COACH: "Coach",
  ATHLETE: "Athlete",
};

const roleColors = {
  ADMIN: "primary",
  TRAINER: "info",
  COACH: "warning",
  ATHLETE: "default",
};

const assignRoles = new Set(["ADMIN", "TRAINER", "COACH"]);

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);

  const [group, setGroup] = useState(null);
  const [role, setRole] = useState("");
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsSport, setSettingsSport] = useState("");
  const [settingsSeason, setSettingsSeason] = useState("");
  const [settingsTimezone, setSettingsTimezone] = useState("UTC");
  const [settingsArchived, setSettingsArchived] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("ATHLETE");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchError, setMemberSearchError] = useState("");

  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignProgramId, setAssignProgramId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignDayMap, setAssignDayMap] = useState([]);
  const [assignDayMapTouched, setAssignDayMapTouched] = useState(false);
  const [applyToCurrentMembers, setApplyToCurrentMembers] = useState(true);
  const [autoAddNewMembers, setAutoAddNewMembers] = useState(false);
  const [assignStatus, setAssignStatus] = useState("");

  const weekDayOptions = useMemo(
    () => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    []
  );

  const acceptedClients = useMemo(
    () => clients.filter((clientRel) => clientRel.accepted),
    [clients]
  );

  const selectedProgram = useMemo(
    () => programs.find((program) => program._id === assignProgramId),
    [programs, assignProgramId]
  );

  const canAdmin = role === "ADMIN";
  const canAssign = assignRoles.has(role);

  const authHeaders = useMemo(() => {
    const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
    return {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: bearer,
    };
  }, []);

  const loadGroup = async () => {
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroup(data.group || null);
      setRole(data.role || "");
    } catch (err) {
      setError(err.message || "Unable to load group.");
    }
  };

  const loadMembers = async () => {
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/members`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load members.");
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/assignments`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load assignments.");
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await fetch(`${serverURL}/programs?includeShared=true`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load programs.");
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    await Promise.all([loadGroup(), loadMembers(), loadAssignments()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!groupId) return;
    loadAll();
  }, [groupId]);

  useEffect(() => {
    if (!group) return;
    setSettingsName(group.name || "");
    setSettingsDescription(group.description || "");
    setSettingsSport(group.sport || "");
    setSettingsSeason(group.season || "");
    setSettingsTimezone(group.timezone || "UTC");
    setSettingsArchived(Boolean(group.archivedAt));
  }, [group]);

  useEffect(() => {
    if (user?.isTrainer) {
      dispatch(requestClients());
    }
  }, [dispatch, user?.isTrainer]);

  useEffect(() => {
    if (!openAssignDialog) return;
    if (programs.length > 0) return;
    loadPrograms();
  }, [openAssignDialog]);

  useEffect(() => {
    if (!selectedProgram) return;
    if (assignDayMapTouched) return;
    const daysPerWeek = selectedProgram.daysPerWeek || 0;
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
    const nextMap = Array.from({ length: daysPerWeek }, (_, index) => (startDay + index) % 7);
    setAssignDayMap(nextMap);
  }, [selectedProgram, assignStartDate, assignDayMapTouched]);

  const handleOpenMemberDialog = () => {
    setMemberUserId("");
    setMemberRole("ATHLETE");
    setSelectedClientId("");
    setMemberSearchQuery("");
    setMemberSearchResults([]);
    setMemberSearchError("");
    setOpenMemberDialog(true);
  };

  const handleSearchMembers = async () => {
    if (!memberSearchQuery.trim()) return;
    setMemberSearchLoading(true);
    setMemberSearchError("");
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/member-search`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify({ query: memberSearchQuery.trim() }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setMemberSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setMemberSearchError(err.message || "Unable to search users.");
    } finally {
      setMemberSearchLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!canAdmin || !settingsName.trim()) return;
    setSettingsSaving(true);
    setError("");
    try {
      const payload = {
        name: settingsName.trim(),
        description: settingsDescription,
        sport: settingsSport,
        season: settingsSeason,
        timezone: settingsTimezone,
        archivedAt: settingsArchived
          ? group?.archivedAt || new Date().toISOString()
          : null,
      };
      const response = await fetch(`${serverURL}/groups/${groupId}`, {
        method: "put",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroup(data);
      setSuccessMessage("Group settings saved.");
    } catch (err) {
      setError(err.message || "Unable to update group settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberUserId) return;
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/members`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify({
          userId: memberUserId,
          role: memberRole,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setOpenMemberDialog(false);
      setMemberUserId("");
      setMemberRole("ATHLETE");
      setSelectedClientId("");
      setMemberSearchResults([]);
      setSuccessMessage("Member added.");
      await loadMembers();
    } catch (err) {
      setError(err.message || "Unable to add member.");
    }
  };

  const handleUpdateMemberRole = async (memberId, nextRole) => {
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/members/${memberId}`, {
        method: "put",
        headers: authHeaders,
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setMembers((prev) =>
        prev.map((member) =>
          member._id === memberId ? { ...member, role: nextRole } : member
        )
      );
      setSuccessMessage("Member updated.");
    } catch (err) {
      setError(err.message || "Unable to update member.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/members/${memberId}`, {
        method: "delete",
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setMembers((prev) => prev.filter((member) => member._id !== memberId));
      setSuccessMessage("Member removed.");
    } catch (err) {
      setError(err.message || "Unable to remove member.");
    }
  };

  const handleOpenAssignDialog = () => {
    setAssignProgramId("");
    setAssignStartDate("");
    setAssignDayMap([]);
    setAssignDayMapTouched(false);
    setApplyToCurrentMembers(true);
    setAutoAddNewMembers(false);
    setAssignStatus("");
    setOpenAssignDialog(true);
  };

  const handleAssignProgram = async () => {
    if (!assignProgramId || !assignStartDate) return;
    try {
      const payload = {
        programId: assignProgramId,
        startDate: assignStartDate,
        applyToCurrentMembers,
        autoAddNewMembers,
      };
      if (assignDayMap.length) {
        payload.dayMap = assignDayMap;
      }

      const response = await fetch(`${serverURL}/groups/${groupId}/assignments`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setOpenAssignDialog(false);
      setSuccessMessage(`Assigned ${data.count || 0} workouts to the group.`);
      await loadAssignments();
    } catch (err) {
      setAssignStatus(err.message || "Unable to assign program.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography>Loading group...</Typography>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography color="error">{error || "Group not found."}</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/groups")}>Back to Groups</Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4">{group.name}</Typography>
              {group.description && (
                <Typography variant="body2" color="text.secondary">
                  {group.description}
                </Typography>
              )}
            </Box>
            <Chip
              label={roleLabels[role] || role}
              color={roleColors[role] || "default"}
              size="small"
            />
          </Stack>

          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="Overview" />
            <Tab label="Settings" />
            <Tab label="Analytics" />
            <Tab label="Billing" />
          </Tabs>

          {activeTab === 0 && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">Members</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {members.length} active member{members.length === 1 ? "" : "s"}
                    </Typography>
                    {members.length === 0 && (
                      <Typography color="text.secondary">No members yet.</Typography>
                    )}
                    <Stack spacing={1}>
                      {members.map((member) => (
                        <Box
                          key={member._id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                            gap: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">
                              {member.userId?.firstName} {member.userId?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.userId?.email || member.userId?._id}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {canAdmin ? (
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                  label="Role"
                                  value={member.role}
                                  onChange={(event) =>
                                    handleUpdateMemberRole(member._id, event.target.value)
                                  }
                                >
                                  {Object.keys(roleLabels).map((roleOption) => (
                                    <MenuItem key={roleOption} value={roleOption}>
                                      {roleLabels[roleOption]}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            ) : (
                              <Chip
                                label={roleLabels[member.role] || member.role}
                                size="small"
                                color={roleColors[member.role] || "default"}
                              />
                            )}
                            {canAdmin && (
                              <Button
                                color="error"
                                size="small"
                                onClick={() => handleRemoveMember(member._id)}
                              >
                                Remove
                              </Button>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
                {canAdmin && (
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button variant="contained" onClick={handleOpenMemberDialog}>
                      Add Member
                    </Button>
                  </CardActions>
                )}
              </Card>

              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">Program Assignments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignments.length} assignment{assignments.length === 1 ? "" : "s"}
                    </Typography>
                    {assignments.length === 0 && (
                      <Typography color="text.secondary">No assignments yet.</Typography>
                    )}
                    <Stack spacing={1}>
                      {assignments.map((assignment) => (
                        <Box
                          key={assignment._id}
                          sx={{
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {assignment.programId?.title || "Untitled Program"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Start: {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : "-"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Assigned by: {assignment.assignedBy
                              ? `${assignment.assignedBy.firstName || ""} ${assignment.assignedBy.lastName || ""}`.trim()
                              : "Unknown"}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            {assignment.autoAddNewMembers && (
                              <Chip label="Auto-add new members" size="small" />
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
                {canAssign && (
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button variant="contained" onClick={handleOpenAssignDialog}>
                      Assign Program
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Stack>
          )}

          {activeTab === 1 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Group Settings</Typography>
                  <TextField
                    label="Group name"
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    fullWidth
                    disabled={!canAdmin}
                  />
                  <TextField
                    label="Description"
                    value={settingsDescription}
                    onChange={(event) => setSettingsDescription(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={!canAdmin}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Sport"
                      value={settingsSport}
                      onChange={(event) => setSettingsSport(event.target.value)}
                      fullWidth
                      disabled={!canAdmin}
                    />
                    <TextField
                      label="Season"
                      value={settingsSeason}
                      onChange={(event) => setSettingsSeason(event.target.value)}
                      fullWidth
                      disabled={!canAdmin}
                    />
                  </Stack>
                  <TextField
                    label="Timezone"
                    value={settingsTimezone}
                    onChange={(event) => setSettingsTimezone(event.target.value)}
                    fullWidth
                    disabled={!canAdmin}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settingsArchived}
                        onChange={(event) => setSettingsArchived(event.target.checked)}
                        disabled={!canAdmin}
                      />
                    }
                    label="Archive group"
                  />
                  {!canAdmin && (
                    <Typography variant="caption" color="text.secondary">
                      Only admins can edit settings.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
              {canAdmin && (
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveSettings}
                    disabled={!settingsName.trim() || settingsSaving}
                  >
                    Save Settings
                  </Button>
                </CardActions>
              )}
            </Card>
          )}

          {activeTab === 2 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Analytics</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion and adherence analytics are coming soon.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    We will surface workout completion %, missed sessions, and streaks once backend reporting is ready.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Billing</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {group.billing?.status || "INACTIVE"}
                  </Typography>
                  {group.billing?.trialEndsAt && (
                    <Typography variant="body2" color="text.secondary">
                      Trial ends: {new Date(group.billing.trialEndsAt).toLocaleDateString()}
                    </Typography>
                  )}
                  {group.billing?.planId && (
                    <Typography variant="body2" color="text.secondary">
                      Plan: {group.billing.planId}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Billing management will be added once invoices and subscriptions are wired up.
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="outlined" disabled>
                  Manage Billing (Coming Soon)
                </Button>
              </CardActions>
            </Card>
          )}

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </Box>

      <Dialog
        open={openMemberDialog}
        onClose={() => setOpenMemberDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Search by name, email, or phone, or select a client.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Invite emails for brand new users will be added next.
            </Typography>
            {acceptedClients.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  label="Client"
                  value={selectedClientId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setSelectedClientId(nextId);
                    setMemberUserId(nextId);
                    if (nextId) {
                      setMemberSearchQuery("");
                      setMemberSearchResults([]);
                    }
                  }}
                >
                  <MenuItem value="">Select a client</MenuItem>
                  {acceptedClients.map((clientRel) => (
                    <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                      {clientRel.client.firstName} {clientRel.client.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Search users"
                placeholder="Name, email, or phone"
                value={memberSearchQuery}
                onChange={(event) => setMemberSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearchMembers();
                  }
                }}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleSearchMembers}
                disabled={memberSearchQuery.trim().length < 2 || memberSearchLoading}
              >
                {memberSearchLoading ? "Searching..." : "Search"}
              </Button>
            </Stack>
            {memberSearchError && (
              <Typography variant="caption" color="error">
                {memberSearchError}
              </Typography>
            )}
            {!memberSearchLoading &&
              memberSearchQuery.trim().length >= 2 &&
              memberSearchResults.length === 0 &&
              !memberSearchError && (
                <Typography variant="caption" color="text.secondary">
                  No matches found.
                </Typography>
              )}
            {memberSearchResults.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Search results</InputLabel>
                <Select
                  label="Search results"
                  value={memberUserId}
                  onChange={(event) => {
                    setMemberUserId(event.target.value);
                    if (selectedClientId) setSelectedClientId("");
                  }}
                >
                  <MenuItem value="">Select a user</MenuItem>
                  {memberSearchResults.map((result) => (
                    <MenuItem key={result._id} value={result._id}>
                      {result.firstName} {result.lastName} • {result.email || result.phoneNumber || result._id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={memberRole}
                onChange={(event) => setMemberRole(event.target.value)}
              >
                {Object.keys(roleLabels).map((roleOption) => (
                  <MenuItem key={roleOption} value={roleOption}>
                    {roleLabels[roleOption]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemberDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={!memberUserId}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Assign Program</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Program</InputLabel>
              <Select
                label="Program"
                value={assignProgramId}
                onChange={(event) => setAssignProgramId(event.target.value)}
              >
                {programs.map((program) => (
                  <MenuItem key={program._id} value={program._id}>
                    {program.title || "Untitled Program"}
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
            {!!selectedProgram?.daysPerWeek && (
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Map program days to weekdays for the group schedule.
                </Typography>
                <Grid container spacing={1}>
                  {Array.from({ length: selectedProgram.daysPerWeek }, (_, index) => (
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyToCurrentMembers}
                  onChange={(event) => setApplyToCurrentMembers(event.target.checked)}
                />
              }
              label="Add to current members"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoAddNewMembers}
                  onChange={(event) => setAutoAddNewMembers(event.target.checked)}
                />
              }
              label="Auto-add for new members"
            />
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
            disabled={!assignProgramId || !assignStartDate}
          >
            Assign
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
