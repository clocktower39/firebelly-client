import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { serverURL } from "../../Redux/actions";
import Messages from "../Messages";

const DEFAULT_PERMISSION_STORAGE_KEY = "TRAINER_CONNECTION_DEFAULT_PERMISSIONS";
const DEFAULT_PERMISSIONS = { templates: true, programs: true };

const loadDefaultPermissions = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DEFAULT_PERMISSION_STORAGE_KEY));
    if (stored && typeof stored === "object") {
      return {
        templates: stored.templates ?? DEFAULT_PERMISSIONS.templates,
        programs: stored.programs ?? DEFAULT_PERMISSIONS.programs,
      };
    }
  } catch (err) {
    // ignore
  }
  return DEFAULT_PERMISSIONS;
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPermission = (permission) => {
  if (permission === "templates") return "Templates";
  if (permission === "programs") return "Programs";
  return permission;
};

const formatPermissions = (permissions) => {
  if (!permissions || permissions.length === 0) return "None";
  return permissions.map((permission) => formatPermission(permission)).join(", ");
};

export default function TrainerConnections({ embedded = false, socket = null }) {
  const user = useSelector((state) => state.user);
  const [connections, setConnections] = useState({
    pending: { incoming: [], outgoing: [] },
    accepted: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [defaultPermissions, setDefaultPermissions] = useState(loadDefaultPermissions);
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false);

  const authHeaders = {
    "Content-type": "application/json; charset=UTF-8",
    Authorization: `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`,
  };

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverURL}/trainer-connections`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setConnections({
        pending: data.pending || { incoming: [], outgoing: [] },
        accepted: data.accepted || [],
        archived: data.archived || [],
      });
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_PERMISSION_STORAGE_KEY, JSON.stringify(defaultPermissions));
  }, [defaultPermissions]);

  const permissionList = useMemo(
    () => Object.keys(defaultPermissions).filter((key) => defaultPermissions[key]),
    [defaultPermissions]
  );

  const defaultPermissionList = permissionList.length
    ? permissionList
    : ["templates", "programs"];

  const searchTrainers = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await fetch(`${serverURL}/trainer-connections/search`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const requestConnection = async (recipientId) => {
    try {
      const response = await fetch(`${serverURL}/trainer-connections/request`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ recipientId, permissions: defaultPermissionList }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSearchDialogOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      loadConnections();
    } catch (err) {
      setError(err.message || "Failed to send request");
    }
  };

  const respondToConnection = async (connectionId, accept) => {
    try {
      const response = await fetch(`${serverURL}/trainer-connections/respond`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ connectionId, accept }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      loadConnections();
    } catch (err) {
      setError(err.message || "Failed to respond");
    }
  };

  const removeConnection = async (connectionId) => {
    try {
      const response = await fetch(`${serverURL}/trainer-connections/remove`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ connectionId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      loadConnections();
    } catch (err) {
      setError(err.message || "Failed to remove connection");
    }
  };

  const getOtherUser = (connection, currentUserId) => {
    const isRequester = connection.requester?._id === currentUserId;
    return isRequester ? connection.recipient : connection.requester;
  };

  const pendingConnections = [
    ...(connections.pending?.incoming || []),
    ...(connections.pending?.outgoing || []),
  ];
  const acceptedConnections = connections.accepted || [];
  const archivedConnections = connections.archived || [];
  const statusCounts = {
    all: pendingConnections.length + acceptedConnections.length + archivedConnections.length,
    active: acceptedConnections.length,
    pending: pendingConnections.length,
    archived: archivedConnections.length,
  };

  const showPending = statusFilter === "all" || statusFilter === "pending";
  const showActive = statusFilter === "all" || statusFilter === "active";
  const showArchived = statusFilter === "all" || statusFilter === "archived";

  const hasResults =
    (showPending && pendingConnections.length > 0) ||
    (showActive && acceptedConnections.length > 0) ||
    (showArchived && archivedConnections.length > 0);

  const handlePermissionToggle = (key) => {
    setDefaultPermissions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.templates && !next.programs) {
        return prev;
      }
      return next;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: embedded ? 0 : 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant={embedded ? "h6" : "h5"} color="primary.contrastText">
            Trainer Connections
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setSearchDialogOpen(true)}
          >
            Connect
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Connect with other trainers to share workout templates and programs.
        </Typography>

        {user?.isTrainer && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Collaboration settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Default sharing when you connect with other trainers.
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={defaultPermissions.templates}
                        onChange={() => handlePermissionToggle("templates")}
                      />
                    }
                    label="Templates"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={defaultPermissions.programs}
                        onChange={() => handlePermissionToggle("programs")}
                      />
                    }
                    label="Programs"
                  />
                </FormGroup>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {[
            { value: "all", label: `All (${statusCounts.all})` },
            { value: "active", label: `Active (${statusCounts.active})` },
            { value: "pending", label: `Pending (${statusCounts.pending})` },
            { value: "archived", label: `Archived (${statusCounts.archived})` },
          ].map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? "contained" : "outlined"}
              size="small"
              onClick={() => setStatusFilter(option.value)}
              sx={{ textTransform: "none" }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        {showPending && connections.pending.incoming.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Requests
              </Typography>
              <List disablePadding>
                {connections.pending.incoming.map((conn) => (
                  <ListItem key={conn._id} divider>
                    <ListItemAvatar>
                      <Avatar>{conn.requester?.firstName?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${conn.requester?.firstName} ${conn.requester?.lastName}`}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Wants to connect with you
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permissions: {formatPermissions(conn.permissions)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last activity: {formatDate(conn.updatedAt || conn.createdAt)}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        color="success"
                        onClick={() => respondToConnection(conn._id, true)}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => respondToConnection(conn._id, false)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {showPending && connections.pending.outgoing.length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sent Requests
              </Typography>
              <List disablePadding>
                {connections.pending.outgoing.map((conn) => (
                  <ListItem key={conn._id} divider>
                    <ListItemAvatar>
                      <Avatar>{conn.recipient?.firstName?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${conn.recipient?.firstName} ${conn.recipient?.lastName}`}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Pending approval
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permissions: {formatPermissions(conn.permissions)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last activity: {formatDate(conn.updatedAt || conn.createdAt)}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        color="error"
                        onClick={() => removeConnection(conn._id)}
                        title="Cancel request"
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {showActive && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connected Trainers
              </Typography>
              {connections.accepted.length === 0 ? (
                <Typography color="text.secondary">
                  No connections yet. Connect with other trainers to share templates and programs.
                </Typography>
              ) : (
                <List disablePadding>
                  {connections.accepted.map((conn) => {
                    const otherUser = getOtherUser(conn, user?._id);
                    return (
                      <ListItem key={conn._id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            {(otherUser?.firstName?.[0] || otherUser?.lastName?.[0])}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <span>
                                {otherUser?.firstName} {otherUser?.lastName}
                              </span>
                              <Chip label="Connected" size="small" color="success" variant="outlined" />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                Sharing: {formatPermissions(conn.permissions)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Last activity: {formatDate(conn.updatedAt || conn.createdAt)}
                              </Typography>
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={() => setOpenMessageDrawer(true)}
                            title="Message"
                          >
                            <MessageIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => removeConnection(conn._id)}
                            title="Remove connection"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {showArchived && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Archived Connections
              </Typography>
              {connections.archived.length === 0 ? (
                <Typography color="text.secondary">
                  No archived connections yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {connections.archived.map((conn) => {
                    const otherUser = getOtherUser(conn, user?._id);
                    return (
                      <ListItem key={conn._id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            {(otherUser?.firstName?.[0] || otherUser?.lastName?.[0])}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${otherUser?.firstName} ${otherUser?.lastName}`}
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                Status: Archived
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Last activity: {formatDate(conn.updatedAt || conn.createdAt)}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {!hasResults && (
          <Typography color="text.secondary">
            No connections match this filter.
          </Typography>
        )}
      </Stack>

      <Dialog
        open={searchDialogOpen}
        onClose={() => {
          setSearchDialogOpen(false);
          setSearchQuery("");
          setSearchResults([]);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Find Trainers</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchTrainers()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={searchTrainers} disabled={searching}>
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            {searching && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {searchResults.length > 0 && (
              <List>
                {searchResults.map((trainer) => (
                  <ListItem key={trainer._id} divider>
                    <ListItemAvatar>
                      <Avatar>{trainer.firstName?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${trainer.firstName} ${trainer.lastName}`}
                      secondary={trainer.email}
                    />
                    <ListItemSecondaryAction>
                      {trainer.connectionStatus === "accepted" ? (
                        <Chip label="Connected" size="small" color="success" />
                      ) : trainer.connectionStatus === "pending" ? (
                        <Chip label="Pending" size="small" color="warning" />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => requestConnection(trainer._id)}
                        >
                          Connect
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
            {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
              <Typography color="text.secondary" align="center">
                No trainers found
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSearchDialogOpen(false);
            setSearchQuery("");
            setSearchResults([]);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Messages open={openMessageDrawer} handleClose={() => setOpenMessageDrawer(false)} socket={socket} />
    </Box>
  );
}
