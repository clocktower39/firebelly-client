import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  requestClients,
  changeRelationshipStatus,
  removeRelationship,
  serverURL,
  enterClientAccount,
  updateRelationshipProfile,
} from "../../Redux/actions";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Done } from "@mui/icons-material";
import Calendar from "./Calendar";
import Goals from "./Goals";
import { styled } from "@mui/material/styles";
import {
  ENGAGEMENT_STATUS_OPTIONS,
  SERVICE_TAG_OPTIONS,
  getEngagementStatusColor,
  getEngagementStatusLabel,
  getRelationshipEngagementStatus,
  getRelationshipServiceTags,
  getServiceTagLabel,
} from "../../utils/clientRelationships";

const StyledBadge = styled(Badge)(({ theme, status }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: status === "online" ? "#44b700" : "grey",
    color: status === "online" ? "#44b700" : "grey",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: status === "online" ? "ripple 1.2s infinite ease-in-out" : "none",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const filterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const sortClientRelationships = (relationships, sortKey) =>
  [...relationships].sort((a, b) => {
    const nameA = (a?.client?.[sortKey] || "").toLowerCase();
    const nameB = (b?.client?.[sortKey] || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

export default function Clients({ socket }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const [clientStatuses, setClientStatuses] = useState({});
  const navigate = useNavigate();

  const clientRelationships = useMemo(() => (Array.isArray(clients) ? clients : []), [clients]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGoals, setOpenGoals] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [sortKey, setSortKey] = useState("firstName");

  const handleOpenCalendar = (client) => {
    setSelectedClient(client);
    setOpenCalendar(true);
  };

  const handleCloseCalendar = () => {
    setOpenCalendar(false);
    setSelectedClient("");
  };

  const handleOpenGoals = (client) => {
    setSelectedClient(client);
    setOpenGoals(true);
  };

  const handleCloseGoals = () => {
    setOpenGoals(false);
    setSelectedClient("");
  };

  const handleAcceptRelationship = (clientId) => {
    dispatch(changeRelationshipStatus(clientId, true));
  };

  const handleViewAsClient = async (client) => {
    setStatusMessage("");
    const data = await dispatch(enterClientAccount(client._id));
    if (data?.error) {
      setStatusMessage(data.error);
      return;
    }
    try {
      navigate("/");
    } catch (err) {
      setStatusMessage("Unable to enter client view.");
    }
  };

  const filteredClients = useMemo(() => {
    let filtered = clientRelationships.filter((relationship) => {
      const fullName =
        `${relationship?.client?.firstName || ""} ${relationship?.client?.lastName || ""}`.toLowerCase();

      if (!fullName.includes(searchTerm.toLowerCase())) {
        return false;
      }

      if (showOnlyOnline && clientStatuses[relationship?.client?._id] !== "online") {
        return false;
      }

      const engagementStatus = getRelationshipEngagementStatus(relationship);

      switch (engagementFilter) {
        case "active":
          return relationship?.accepted && engagementStatus === "active";
        case "paused":
          return relationship?.accepted && engagementStatus === "paused";
        case "inactive":
          return relationship?.accepted && engagementStatus === "inactive";
        case "pending":
          return !relationship?.accepted;
        case "all":
        default:
          return true;
      }
    });

    return sortClientRelationships(filtered, sortKey);
  }, [clientRelationships, clientStatuses, engagementFilter, searchTerm, showOnlyOnline, sortKey]);

  const filterCounts = useMemo(
    () => ({
      all: clientRelationships.length,
      active: clientRelationships.filter(
        (relationship) =>
          relationship?.accepted && getRelationshipEngagementStatus(relationship) === "active"
      ).length,
      paused: clientRelationships.filter(
        (relationship) =>
          relationship?.accepted && getRelationshipEngagementStatus(relationship) === "paused"
      ).length,
      inactive: clientRelationships.filter(
        (relationship) =>
          relationship?.accepted && getRelationshipEngagementStatus(relationship) === "inactive"
      ).length,
      pending: clientRelationships.filter((relationship) => !relationship?.accepted).length,
    }),
    [clientRelationships]
  );

  const ClientCard = ({ clientRelationship, isOnline }) => {
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [localEngagementStatus, setLocalEngagementStatus] = useState(
      getRelationshipEngagementStatus(clientRelationship)
    );
    const [localServiceTags, setLocalServiceTags] = useState(
      getRelationshipServiceTags(clientRelationship)
    );

    useEffect(() => {
      setLocalEngagementStatus(getRelationshipEngagementStatus(clientRelationship));
      setLocalServiceTags(getRelationshipServiceTags(clientRelationship));
    }, [clientRelationship]);

    const handleDeleteConfirmationOpen = () => setDeleteConfirmationOpen(true);
    const handleDeleteConfirmationClose = () => setDeleteConfirmationOpen(false);

    const saveRelationshipProfile = async (nextEngagementStatus, nextServiceTags) => {
      setStatusMessage("");
      setSavingProfile(true);
      const data = await dispatch(
        updateRelationshipProfile({
          client: clientRelationship.client._id,
          engagementStatus: nextEngagementStatus,
          serviceTags: nextServiceTags,
        })
      );
      setSavingProfile(false);

      if (data?.error) {
        setStatusMessage(data.error);
        return false;
      }

      return true;
    };

    const handleEngagementStatusChange = async (nextStatus) => {
      if (!clientRelationship.accepted || savingProfile || nextStatus === localEngagementStatus) {
        return;
      }

      const previousStatus = localEngagementStatus;
      setLocalEngagementStatus(nextStatus);
      const updated = await saveRelationshipProfile(nextStatus, localServiceTags);
      if (!updated) {
        setLocalEngagementStatus(previousStatus);
      }
    };

    const handleToggleServiceTag = async (serviceTag) => {
      if (!clientRelationship.accepted || savingProfile) return;

      const previousTags = localServiceTags;
      const nextTags = previousTags.includes(serviceTag)
        ? previousTags.filter((value) => value !== serviceTag)
        : [...previousTags, serviceTag].sort(
            (a, b) =>
              SERVICE_TAG_OPTIONS.findIndex((option) => option.value === a) -
              SERVICE_TAG_OPTIONS.findIndex((option) => option.value === b)
          );

      setLocalServiceTags(nextTags);
      const updated = await saveRelationshipProfile(localEngagementStatus, nextTags);
      if (!updated) {
        setLocalServiceTags(previousTags);
      }
    };

    return (
      <Grid container size={12}>
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            borderColor: clientRelationship.accepted
              ? localEngagementStatus === "active"
                ? "success.light"
                : localEngagementStatus === "paused"
                  ? "warning.light"
                  : "divider"
              : "divider",
          }}
        >
          <CardHeader
            avatar={
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                status={isOnline ? "online" : "offline"}
              >
                <Avatar
                  alt={`${clientRelationship.client.firstName[0]}${clientRelationship.client.lastName[0]}`}
                  src={
                    clientRelationship.client.profilePicture
                      ? `${serverURL}/user/profilePicture/${clientRelationship.client.profilePicture}`
                      : null
                  }
                >
                  {clientRelationship.client.firstName[0]}
                  {clientRelationship.client.lastName[0]}
                </Avatar>
              </StyledBadge>
            }
            action={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                {!clientRelationship.accepted && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Done />}
                    onClick={() => handleAcceptRelationship(clientRelationship.client._id)}
                  >
                    Accept
                  </Button>
                )}
                <IconButton title="Remove" onClick={handleDeleteConfirmationOpen}>
                  <Delete />
                </IconButton>
              </Stack>
            }
            title={`${clientRelationship.client.firstName} ${clientRelationship.client.lastName}`}
            subheader={
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px", mt: 0.5 }}>
                <Chip
                  size="small"
                  variant="outlined"
                  label={clientRelationship.accepted ? "Connected" : "Pending"}
                />
                {clientRelationship.accepted && (
                  <Chip
                    size="small"
                    color={getEngagementStatusColor(localEngagementStatus)}
                    label={getEngagementStatusLabel(localEngagementStatus)}
                  />
                )}
                <Chip
                  size="small"
                  variant="outlined"
                  color={isOnline ? "success" : "default"}
                  label={isOnline ? "Online" : "Offline"}
                />
              </Stack>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              {clientRelationship.accepted ? (
                <>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                    <Button onClick={() => handleViewAsClient(clientRelationship.client)}>
                      View Account
                    </Button>
                    <Button onClick={() => handleOpenCalendar(clientRelationship.client)}>
                      Calendar
                    </Button>
                    <Button onClick={() => handleOpenGoals(clientRelationship.client)}>Goals</Button>
                    <Button component={Link} to={`/sessions?client=${clientRelationship.client._id}`}>
                      Training Sessions
                    </Button>
                    <Button component={Link} to={`/invoices?client=${clientRelationship.client._id}`}>
                      Invoices
                    </Button>
                    <Button component={Link} to={`/progress?client=${clientRelationship.client._id}`}>
                      Progress
                    </Button>
                    <Button onClick={() => null} disabled>
                      Programs
                    </Button>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="subtitle2">Coaching Status</Typography>
                      {savingProfile && <CircularProgress size={14} />}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                      {ENGAGEMENT_STATUS_OPTIONS.map((option) => (
                        <Chip
                          key={option.value}
                          clickable={!savingProfile}
                          color={
                            localEngagementStatus === option.value ? option.color : "default"
                          }
                          label={option.label}
                          onClick={() => handleEngagementStatusChange(option.value)}
                          variant={localEngagementStatus === option.value ? "filled" : "outlined"}
                        />
                      ))}
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Service Tags</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
                      {SERVICE_TAG_OPTIONS.map((option) => {
                        const selected = localServiceTags.includes(option.value);
                        return (
                          <Chip
                            key={option.value}
                            clickable={!savingProfile}
                            color={selected ? "primary" : "default"}
                            label={option.label}
                            onClick={() => handleToggleServiceTag(option.value)}
                            variant={selected ? "filled" : "outlined"}
                          />
                        );
                      })}
                    </Stack>
                    {localServiceTags.length > 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        {localServiceTags.map(getServiceTagLabel).join(", ")}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Optional tags like Online or Programming help you organize clients without
                        affecting access.
                      </Typography>
                    )}
                  </Stack>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Pending connection requests do not use coaching status until accepted.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
        <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
          <DialogTitle id="alert-dialog-title">Delete Confirmation</DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid container size={12}>
                <Typography variant="body1">
                  Are you sure you would like to remove this client connection?
                </Typography>
              </Grid>
              <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid>
                  <Button
                    color="secondaryButton"
                    variant="contained"
                    onClick={handleDeleteConfirmationClose}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      dispatch(removeRelationship(user._id, clientRelationship.client._id))
                    }
                  >
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    );
  };

  useEffect(() => {
    dispatch(requestClients());
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      socket.on("currentClientStatuses", (statuses) => {
        setClientStatuses(statuses);
      });

      socket.on("clientStatusChanged", ({ userId, status }) => {
        setClientStatuses((prevStatuses) => ({
          ...prevStatuses,
          [userId]: status,
        }));
      });

      socket.emit("requestClientStatuses");

      return () => {
        socket.off("currentClientStatuses");
        socket.off("clientStatusChanged");
      };
    }
  }, [socket]);

  return user.isTrainer ? (
    <>
      <Grid
        container
        size={12}
        sx={{
          justifyContent: "center",
          paddingBottom: "15px",
          alignSelf: "flex-start",
          flex: "initial",
        }}
      >
        <Typography variant="h4" sx={{ padding: "25px 0" }}>
          Training Clients
        </Typography>
        {statusMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            {statusMessage}
          </Typography>
        )}
        <TextField
          label="Search Clients"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          sx={{ mb: 2 }}
        />
        <Grid container size={12} justifyContent="center">
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyOnline}
                onChange={(event) => setShowOnlyOnline(event.target.checked)}
                name="showOnlyOnline"
                color="primary"
              />
            }
            label="Online"
          />
        </Grid>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px", mb: 2 }}>
          {filterOptions.map((option) => (
            <Chip
              key={option.value}
              clickable
              color={engagementFilter === option.value ? "primary" : "default"}
              label={`${option.label} (${filterCounts[option.value] || 0})`}
              onClick={() => setEngagementFilter(option.value)}
              variant={engagementFilter === option.value ? "filled" : "outlined"}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => setSortKey("lastName")} variant="outlined">
            Last Name
          </Button>
          <Button onClick={() => setSortKey("firstName")} variant="outlined">
            First Name
          </Button>
        </Stack>
      </Grid>

      <Grid
        container
        size={12}
        spacing={1}
        sx={{
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        {filteredClients.length > 0 ? (
          filteredClients.map((clientRelationship) => (
            <ClientCard
              key={clientRelationship._id}
              clientRelationship={clientRelationship}
              isOnline={clientStatuses[clientRelationship.client._id] === "online"}
            />
          ))
        ) : (
          <Grid container size={12} sx={{ justifyContent: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No clients match the current filters.
            </Typography>
          </Grid>
        )}
      </Grid>
      <Dialog
        open={openCalendar}
        onClose={handleCloseCalendar}
        PaperProps={{ sx: { minHeight: "80%", height: "80vh", overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 1, height: "100%", overflowY: "auto" }}>
          <Calendar view="trainer" client={selectedClient} embedded />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openGoals}
        onClose={handleCloseGoals}
        sx={{ "& .MuiDialog-paper": { padding: "5px", width: "100%", minHeight: "80%" } }}
      >
        <Goals view="trainer" client={selectedClient} />
      </Dialog>
    </>
  ) : (
    <Typography variant="body1">You are not a trainer. This page is unavailable.</Typography>
  );
}
