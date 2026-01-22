import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
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
} from "@mui/icons-material";
import { serverURL } from "../../Redux/actions";

export default function TrainerConnections() {
  const [connections, setConnections] = useState({ pending: { incoming: [], outgoing: [] }, accepted: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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
      setConnections(data);
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
        body: JSON.stringify({ recipientId }),
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color="primary.contrastText">
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

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        {connections.pending.incoming.length > 0 && (
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
                      secondary="Wants to connect with you"
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

        {connections.pending.outgoing.length > 0 && (
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
                      secondary="Pending approval"
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
                  const otherUser = conn.requester?._id ? 
                    (conn.requester._id === conn.recipient?._id ? conn.recipient : 
                      (conn.recipient ? conn.recipient : conn.requester)) : conn.recipient;
                  const user = conn.requester?.firstName ? conn.requester : conn.recipient;
                  const displayUser = conn.requester?._id !== conn.recipient?._id ? 
                    conn.recipient : conn.requester;
                  return (
                    <ListItem key={conn._id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          {(conn.requester?.firstName?.[0] || conn.recipient?.firstName?.[0])}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <span>
                              {conn.requester?.firstName} {conn.requester?.lastName}
                              {conn.requester?._id !== conn.recipient?._id && (
                                <> / {conn.recipient?.firstName} {conn.recipient?.lastName}</>
                              )}
                            </span>
                            <Chip label="Connected" size="small" color="success" variant="outlined" />
                          </Stack>
                        }
                        secondary={`Sharing: ${conn.permissions?.join(", ") || "templates, programs"}`}
                      />
                      <ListItemSecondaryAction>
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
    </Box>
  );
}
