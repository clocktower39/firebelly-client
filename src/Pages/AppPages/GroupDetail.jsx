import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { requestClients, serverURL } from "../../Redux/actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Delete } from "@mui/icons-material";

const roleLabels = {
  TRAINER: "Trainer",
  COACH: "Coach",
  ATHLETE: "Athlete",
  ADMIN: "Trainer",
};

const roleDescriptions = {
  TRAINER: "Full control, including billing, settings, and programs.",
  COACH: "Can assign programs and view analytics.",
  ATHLETE: "Can view and complete their own workouts.",
  ADMIN: "Full control, including billing, settings, and programs.",
};

const roleOptions = ["TRAINER", "COACH", "ATHLETE"];

const roleColors = {
  TRAINER: "info",
  COACH: "warning",
  ATHLETE: "default",
  ADMIN: "info",
};

const assignRoles = new Set(["TRAINER", "COACH"]);

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
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState("");

  const [invites, setInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ATHLETE");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState("");

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

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsStartDate, setAnalyticsStartDate] = useState("");
  const [analyticsEndDate, setAnalyticsEndDate] = useState("");

  const [billingStatus, setBillingStatus] = useState("INACTIVE");
  const [billingPlanId, setBillingPlanId] = useState("");
  const [billingTrialEndsAt, setBillingTrialEndsAt] = useState("");
  const [billingSaving, setBillingSaving] = useState(false);

  const [chat, setChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatMessage, setChatMessage] = useState("");

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

  const normalizedRole = role === "ADMIN" ? "TRAINER" : role;
  const canAdmin = normalizedRole === "TRAINER";
  const canAssign = assignRoles.has(normalizedRole);
  const groupPictureUrl = group?.picture
    ? `${serverURL}/groups/picture/${group.picture}`
    : null;

  const analyticsSummary = analytics?.summary || {
    totalAssigned: 0,
    completed: 0,
    completionRate: 0,
  };

  const analyticsMemberData = useMemo(
    () =>
      (analytics?.byMember || []).map((entry) => ({
        name: `${entry.firstName || ""} ${entry.lastName || ""}`.trim() || "Member",
        completionRate: Math.round((entry.completionRate || 0) * 100),
        completed: entry.completed || 0,
        totalAssigned: entry.totalAssigned || 0,
      })),
    [analytics]
  );

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
    setBillingStatus(group.billing?.status || "INACTIVE");
    setBillingPlanId(group.billing?.planId || "");
    setBillingTrialEndsAt(
      group.billing?.trialEndsAt
        ? new Date(group.billing.trialEndsAt).toISOString().slice(0, 10)
        : ""
    );
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
    if (!groupId || !canAdmin) return;
    loadInvites();
  }, [groupId, canAdmin]);

  useEffect(() => {
    if (activeTab !== 3 || !groupId) return;
    loadAnalytics();
  }, [activeTab, analyticsStartDate, analyticsEndDate, groupId]);

  useEffect(() => {
    if (activeTab !== 1 || !groupId) return;
    loadChat();
  }, [activeTab, groupId]);

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
    setInviteEmail("");
    setInviteRole("ATHLETE");
    setInviteError("");
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

  const loadInvites = async () => {
    if (!canAdmin) return;
    setInviteError("");
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/invitations`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      setInviteError(err.message || "Unable to load invites.");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    setInviteError("");
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/invitations`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setInviteEmail("");
      setSuccessMessage("Invite sent.");
      await loadInvites();
    } catch (err) {
      setInviteError(err.message || "Unable to send invite.");
    } finally {
      setInviteSending(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!inviteId) return;
    if (!window.confirm("Revoke this invite?")) return;
    try {
      const response = await fetch(
        `${serverURL}/groups/${groupId}/invitations/${inviteId}`,
        {
          method: "delete",
          headers: authHeaders,
        }
      );
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      await loadInvites();
      setSuccessMessage("Invite revoked.");
    } catch (err) {
      setInviteError(err.message || "Unable to revoke invite.");
    }
  };

  const handleUploadPicture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPictureUploading(true);
    setPictureError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const response = await fetch(`${serverURL}/groups/${groupId}/picture`, {
        method: "post",
        headers: {
          Authorization: bearer,
        },
        body: formData,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroup(data);
      setSuccessMessage("Group picture updated.");
    } catch (err) {
      setPictureError(err.message || "Unable to upload picture.");
    } finally {
      setPictureUploading(false);
      event.target.value = "";
    }
  };

  const handleRemovePicture = async () => {
    if (!group?.picture) return;
    if (!window.confirm("Remove group picture?")) return;
    setPictureUploading(true);
    setPictureError("");
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/picture`, {
        method: "delete",
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroup(data);
      setSuccessMessage("Group picture removed.");
    } catch (err) {
      setPictureError(err.message || "Unable to remove picture.");
    } finally {
      setPictureUploading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const params = new URLSearchParams();
      if (analyticsStartDate) params.append("startDate", analyticsStartDate);
      if (analyticsEndDate) params.append("endDate", analyticsEndDate);
      const url = params.toString()
        ? `${serverURL}/groups/${groupId}/analytics?${params.toString()}`
        : `${serverURL}/groups/${groupId}/analytics`;
      const response = await fetch(url, { headers: authHeaders });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setAnalytics(data);
    } catch (err) {
      setAnalyticsError(err.message || "Unable to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSaveBilling = async () => {
    if (!canAdmin) return;
    setBillingSaving(true);
    setError("");
    try {
      const payload = {
        status: billingStatus,
        planId: billingPlanId || null,
        trialEndsAt: billingTrialEndsAt || null,
      };
      const response = await fetch(`${serverURL}/groups/${groupId}/billing`, {
        method: "put",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setGroup(data);
      setSuccessMessage("Billing updated.");
    } catch (err) {
      setError(err.message || "Unable to update billing.");
    } finally {
      setBillingSaving(false);
    }
  };

  const loadChat = async () => {
    setChatLoading(true);
    setChatError("");
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/chat`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setChat(data);
    } catch (err) {
      setChatError(err.message || "Unable to load chat.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    try {
      const response = await fetch(`${serverURL}/groups/${groupId}/chat/messages`, {
        method: "post",
        headers: authHeaders,
        body: JSON.stringify({ message: chatMessage.trim() }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setChat(data);
      setChatMessage("");
    } catch (err) {
      setChatError(err.message || "Unable to send message.");
    }
  };

  const handleDeleteChatMessage = async (messageId) => {
    if (!messageId) return;
    try {
      const response = await fetch(
        `${serverURL}/groups/${groupId}/chat/messages/${messageId}`,
        {
          method: "delete",
          headers: authHeaders,
        }
      );
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setChat(data);
    } catch (err) {
      setChatError(err.message || "Unable to delete message.");
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
            <Tab label="Chat" />
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
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                            gap: 1.5,
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                              justifyContent: { xs: "flex-start", sm: "flex-end" },
                              width: { xs: "100%", sm: "auto" },
                              marginLeft: { sm: "auto" },
                            }}
                          >
                            {canAdmin ? (
                              <FormControl
                                size="small"
                                sx={{ minWidth: 160, maxWidth: 220, width: { xs: "100%", sm: "auto" } }}
                              >
                                <InputLabel>Role</InputLabel>
                              <Select
                                label="Role"
                                value={member.role}
                                renderValue={(value) => roleLabels[value] || value}
                                onChange={(event) =>
                                  handleUpdateMemberRole(member._id, event.target.value)
                                }
                              >
                                {roleOptions.map((roleOption) => (
                                  <MenuItem key={roleOption} value={roleOption}>
                                    <Stack spacing={0.5}>
                                      <Typography variant="body2">
                                        {roleLabels[roleOption]}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {roleDescriptions[roleOption]}
                                      </Typography>
                                    </Stack>
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
                    {canAdmin && invites.length > 0 && (
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">Pending Invites</Typography>
                        {invites.map((invite) => (
                        <Box
                          key={invite._id}
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            borderRadius: 1,
                            px: 1.5,
                            py: 1,
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">{invite.email}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Role: {roleLabels[invite.role] || invite.role}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: { xs: "flex-start", sm: "flex-end" },
                              width: { xs: "100%", sm: "auto" },
                              marginLeft: { sm: "auto" },
                            }}
                          >
                            <Button
                              color="error"
                              size="small"
                              onClick={() => handleRevokeInvite(invite._id)}
                            >
                              Revoke
                            </Button>
                          </Box>
                        </Box>
                        ))}
                      </Stack>
                    )}
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
                  <Typography variant="h6">Group Chat</Typography>
                  {chatError && (
                    <Typography variant="caption" color="error">
                      {chatError}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: 1,
                      p: 2,
                      minHeight: 240,
                      maxHeight: 420,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    {chatLoading && (
                      <Typography variant="body2" color="text.secondary">
                        Loading chat...
                      </Typography>
                    )}
                    {!chatLoading && (!chat?.messages || chat.messages.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No messages yet. Start the conversation.
                      </Typography>
                    )}
                    {!chatLoading &&
                      chat?.messages?.map((message) => {
                        const isMine = String(message.user?._id) === String(user?._id);
                        const senderName = message.user
                          ? `${message.user.firstName || ""} ${message.user.lastName || ""}`.trim()
                          : "Member";
                        return (
                          <Box
                            key={message._id || message.timestamp}
                            sx={{
                              display: "flex",
                              justifyContent: isMine ? "flex-end" : "flex-start",
                              gap: 1,
                            }}
                          >
                            {!isMine && (
                              <Avatar
                                src={
                                  message.user?.profilePicture
                                    ? `${serverURL}/user/profilePicture/${message.user.profilePicture}`
                                    : undefined
                                }
                                sx={{ width: 32, height: 32 }}
                              >
                                {senderName?.[0]}
                              </Avatar>
                            )}
                            <Box
                              sx={{
                                bgcolor: isMine ? "primary.main" : "background.paper",
                                color: isMine ? "primary.contrastText" : "text.primary",
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                maxWidth: "75%",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                position: "relative",
                              }}
                            >
                              {!isMine && (
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {senderName}
                                </Typography>
                              )}
                              <Typography variant="body2">{message.message}</Typography>
                              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                {message.timestamp
                                  ? new Date(message.timestamp).toLocaleString()
                                  : ""}
                              </Typography>
                              {isMine && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteChatMessage(message._id)}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    color: "inherit",
                                    opacity: 0.7,
                                  }}
                                >
                                  <Delete fontSize="inherit" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                  </Box>
                  <TextField
                    label="Message"
                    value={chatMessage}
                    onChange={(event) => setChatMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    multiline
                    minRows={2}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <Button
                          variant="contained"
                          onClick={handleSendChatMessage}
                          disabled={!chatMessage.trim()}
                        >
                          Send
                        </Button>
                      ),
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Group Settings</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <Avatar
                      src={groupPictureUrl || undefined}
                      alt={group.name}
                      sx={{ width: 96, height: 96 }}
                    >
                      {group.name?.[0]}
                    </Avatar>
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={!canAdmin || pictureUploading}
                      >
                        {pictureUploading ? "Uploading..." : "Upload Picture"}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleUploadPicture}
                        />
                      </Button>
                      {group.picture && (
                        <Button
                          variant="text"
                          color="error"
                          onClick={handleRemovePicture}
                          disabled={!canAdmin || pictureUploading}
                        >
                          Remove Picture
                        </Button>
                      )}
                      {pictureError && (
                        <Typography variant="caption" color="error">
                          {pictureError}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
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
                      Only trainers can edit settings.
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

          {activeTab === 3 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Analytics</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Start date"
                      type="date"
                      value={analyticsStartDate}
                      onChange={(event) => setAnalyticsStartDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="End date"
                      type="date"
                      value={analyticsEndDate}
                      onChange={(event) => setAnalyticsEndDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={loadAnalytics}
                      disabled={analyticsLoading}
                      sx={{ minWidth: 140 }}
                    >
                      {analyticsLoading ? "Loading..." : "Refresh"}
                    </Button>
                  </Stack>
                  {analyticsError && (
                    <Typography variant="caption" color="error">
                      {analyticsError}
                    </Typography>
                  )}
                  {analyticsLoading && (
                    <Typography variant="body2" color="text.secondary">
                      Loading analytics...
                    </Typography>
                  )}
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle2">Total Assigned</Typography>
                        <Typography variant="h5">{analyticsSummary.totalAssigned}</Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle2">Completed</Typography>
                        <Typography variant="h5">{analyticsSummary.completed}</Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle2">Completion Rate</Typography>
                        <Typography variant="h5">
                          {Math.round(analyticsSummary.completionRate * 100)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Stack>
                  <Box sx={{ height: 280 }}>
                    {analyticsMemberData.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No analytics data yet.
                      </Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsMemberData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="completionRate" fill="#38bdf8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {activeTab === 4 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Billing</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={billingStatus}
                      onChange={(event) => setBillingStatus(event.target.value)}
                      disabled={!canAdmin}
                    >
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                      <MenuItem value="TRIALING">Trialing</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="PAST_DUE">Past Due</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Plan ID"
                    value={billingPlanId}
                    onChange={(event) => setBillingPlanId(event.target.value)}
                    fullWidth
                    disabled={!canAdmin}
                  />
                  <TextField
                    label="Trial ends"
                    type="date"
                    value={billingTrialEndsAt}
                    onChange={(event) => setBillingTrialEndsAt(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled={!canAdmin}
                  />
                  <Typography variant="caption" color="text.secondary">
                    This is manual billing metadata until subscriptions/invoices are live.
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveBilling}
                  disabled={!canAdmin || billingSaving}
                >
                  {billingSaving ? "Saving..." : "Save Billing"}
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
              Invites are emailed and must be accepted from the invited address.
            </Typography>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Invite by email</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  fullWidth
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={inviteRole}
                    renderValue={(value) => roleLabels[value] || value}
                    onChange={(event) => setInviteRole(event.target.value)}
                  >
                {roleOptions.map((roleOption) => (
                  <MenuItem key={roleOption} value={roleOption}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {roleLabels[roleOption]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roleDescriptions[roleOption]}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
                <Button
                  variant="outlined"
                  onClick={handleSendInvite}
                  disabled={!inviteEmail.trim() || inviteSending}
                >
                  {inviteSending ? "Sending..." : "Send Invite"}
                </Button>
              </Stack>
              {inviteError && (
                <Typography variant="caption" color="error">
                  {inviteError}
                </Typography>
              )}
            </Stack>
            <Divider />
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
            <TextField
              label="User ID (optional)"
              value={memberUserId}
              onChange={(event) => {
                setMemberUserId(event.target.value);
                if (selectedClientId) setSelectedClientId("");
              }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={memberRole}
                renderValue={(value) => roleLabels[value] || value}
                onChange={(event) => setMemberRole(event.target.value)}
              >
                {roleOptions.map((roleOption) => (
                  <MenuItem key={roleOption} value={roleOption}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {roleLabels[roleOption]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roleDescriptions[roleOption]}
                      </Typography>
                    </Stack>
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
