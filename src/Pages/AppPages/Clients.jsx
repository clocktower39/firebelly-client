import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  requestClients,
  changeRelationshipStatus,
  removeRelationship,
  serverURL,
} from "../../Redux/actions";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Done, PendingActions } from "@mui/icons-material";
import Calendar from "./Calendar";
import Goals from "./Goals";
import { styled } from "@mui/material/styles";

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

export default function Clients({ socket }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const [clientStatuses, setClientStatuses] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openGoals, setOpenGoals] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);

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

  const handleRelationshipStatus = (clientId, accepted) => {
    dispatch(changeRelationshipStatus(clientId, accepted));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (key) => {
    const sortedClients = [...filteredClients].sort((a, b) => {
      const nameA = a.client[key].toLowerCase();
      const nameB = b.client[key].toLowerCase();
      return nameA.localeCompare(nameB);
    });
    setFilteredClients(sortedClients);
  };

  const ClientCard = (props) => {
    const { clientRelationship, isOnline } = props;
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const handleDeleteConfirmationOpen = () => setDeleteConfirmationOpen(true);
    const handleDeleteConfirmationClose = () => setDeleteConfirmationOpen(false);

    return (
      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
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
              <>
                <IconButton
                  title="Suspend"
                  onClick={() =>
                    handleRelationshipStatus(
                      clientRelationship.client._id,
                      !clientRelationship.accepted
                    )
                  }
                >
                  {clientRelationship.accepted ? <Done /> : <PendingActions />}
                </IconButton>
                <IconButton title="Remove" onClick={handleDeleteConfirmationOpen}>
                  <Delete />
                </IconButton>
              </>
            }
            title={`${clientRelationship.client.firstName} ${clientRelationship.client.lastName}`}
            subheader={clientRelationship.accepted ? "Accepted" : "Pending"}
          />
          {clientRelationship.accepted && (
            <>
              <Button component={Link} to={`/?client=${clientRelationship.client._id}`} >Client Home</Button>
              <Button onClick={() => handleOpenCalendar(clientRelationship.client)}>
                Calendar
              </Button>
              <Button onClick={() => handleOpenGoals(clientRelationship.client)}>Goals</Button>
              <Button component={Link} to={`/sessions?client=${clientRelationship.client._id}`}>
                Training Sessions
              </Button>
              <Button onClick={() => null} disabled >Invoices</Button>
              <Button component={Link} to={`/progress?client=${clientRelationship.client._id}`}>
                Progress
              </Button>
              <Button onClick={() => null} disabled >Programs</Button>
              <Button onClick={() => null} disabled >Alerts</Button>
            </>
          )}
        </Card>
        <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
          <DialogTitle id="alert-dialog-title">
            <Grid container>
              <Grid container size={12}>
                Delete Confirmation
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid container size={12}>
                <Typography variant="body1">
                  Are you sure you would like to remove this trainer?
                </Typography>
              </Grid>
              <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid >
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
      // Listen for current client statuses
      socket.on("currentClientStatuses", (statuses) => {
        setClientStatuses(statuses);
      });

      // Listen for individual client status changes
      socket.on("clientStatusChanged", ({ userId, status }) => {
        setClientStatuses((prevStatuses) => ({
          ...prevStatuses,
          [userId]: status,
        }));
      });

      // Request current online statuses from the server
      socket.emit("requestClientStatuses");

      // Clean up socket listeners on unmount
      return () => {
        socket.off("currentClientStatuses");
        socket.off("clientStatusChanged");
      };
    }
  }, [socket]);

  useEffect(() => {
    let filtered = clients.filter((client) =>
      `${client.client.firstName} ${client.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (showOnlyOnline) {
      filtered = filtered.filter((client) => clientStatuses[client.client._id] === "online");
    }

    setFilteredClients(
      filtered.sort((a, b) => {
        const nameA = a.client["firstName"].toLowerCase();
        const nameB = b.client["firstName"].toLowerCase();
        return nameA.localeCompare(nameB);
      })
    );
  }, [searchTerm, clients, clientStatuses, showOnlyOnline]);

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
        <TextField
          label="Search Clients"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
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
        <Button onClick={() => handleSort("lastName")} variant="outlined">
          Last Name
        </Button>
        <Button onClick={() => handleSort("firstName")} variant="outlined">
          First Name
        </Button>
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
        {filteredClients.map((clientRelationship) => (
          <ClientCard
            key={clientRelationship._id}
            clientRelationship={clientRelationship}
            isOnline={clientStatuses[clientRelationship.client._id] === "online"}
          />
        ))}
      </Grid>
      <Dialog
        open={openCalendar}
        onClose={handleCloseCalendar}
        sx={{ "& .MuiDialog-paper": { padding: "5px", width: "100%", minHeight: "80%" } }}
      >
        <Calendar view="trainer" client={selectedClient} />{" "}
      </Dialog>
      <Dialog
        open={openGoals}
        onClose={handleCloseGoals}
        sx={{ "& .MuiDialog-paper": { padding: "5px", width: "100%", minHeight: "80%" } }}
      >
        <Goals view="trainer" client={selectedClient} />{" "}
      </Dialog>
    </>
  ) : (
    <Typography variant="body1">You are not a trainer. This page is unavailable.</Typography>
  );
}
