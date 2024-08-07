import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  requestClients,
  changeRelationshipStatus,
  removeRelationship,
  serverURL,
} from "../../Redux/actions";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Done, PendingActions } from "@mui/icons-material";
import History from "./History";
import Goals from "./Goals";

export default function Clients() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [openHistory, setOpenHistory] = useState(false);
  const [openGoals, setOpenGoals] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");

  const handleOpenHistory = (client) => {
    setSelectedClient(client);
    setOpenHistory(true);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
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
    const { clientRelationship } = props;
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const handleDeleteConfirmationOpen = () => setDeleteConfirmationOpen(true);
    const handleDeleteConfirmationClose = () => setDeleteConfirmationOpen(false);

    return (
      <Grid container item xs={12}>
        <Card sx={{ width: "100%" }}>
          <CardHeader
            avatar={
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
              <Button onClick={() => handleOpenHistory(clientRelationship.client)}>Calander</Button>
              <Button onClick={() => handleOpenGoals(clientRelationship.client)}>Goals</Button>
              <Button disabled>Daily Tasks</Button>
              <Button disabled>Nutrition</Button>
            </>
          )}
        </Card>
        <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
          <DialogTitle id="alert-dialog-title">
            <Grid container>
              <Grid container item xs={12}>
                Delete Confirmation
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid item container xs={12}>
                <Typography variant="body1">
                  Are you sure you would like to remove this trainer?
                </Typography>
              </Grid>
              <Grid item container xs={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid item>
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
                    onClick={() => dispatch(removeRelationship(user._id, clientRelationship.client._id))}
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
  }, [dispatch]); // Only run once when the component mounts

  useEffect(() => {
    const filtered = clients.filter((client) =>
      `${client.client.firstName} ${client.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered.sort((a, b) => {
      const nameA = a.client['firstName'].toLowerCase();
      const nameB = b.client['firstName'].toLowerCase();
      return nameA.localeCompare(nameB);
    }));
  }, [searchTerm, clients]);

  return user.isTrainer ? (
    <>
      <Grid
        container
        item
        xs={12}
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
        <Button onClick={() => handleSort("lastName")} variant="outlined">
          Last Name
        </Button>
        <Button onClick={() => handleSort("firstName")} variant="outlined">
          First Name
        </Button>
      </Grid>

      <Grid
        container
        item
        xs={12}
        spacing={1}
        sx={{
          alignSelf: "flex-start",
          alignContent: "flex-start",
          overflowY: "scroll",
          scrollbarWidth: "none",
          flex: "auto",
        }}
      >
        {filteredClients.map((clientRelationship) => (
          <ClientCard key={clientRelationship._id} clientRelationship={clientRelationship} />
        ))}
      </Grid>
      <Dialog
        open={openHistory}
        onClose={handleCloseHistory}
        sx={{ "& .MuiDialog-paper": { padding: "5px", width: "100%", minHeight: "80%" } }}
      >
        <History view="trainer" client={selectedClient} />{" "}
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
