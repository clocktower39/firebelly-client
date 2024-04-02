import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { requestClients, changeRelationshipStatus, serverURL } from '../../Redux/actions';
import { Avatar, Button, Card, CardHeader, Dialog, Grid, IconButton, Typography } from "@mui/material";
import { Delete, Done, PendingActions, } from "@mui/icons-material";
import History from "./History";
import Goals from "./Goals";

export default function Clients() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);

  const [openHistory, setOpenHistory] = useState(false);
  const [openGoals, setOpenGoals] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');

  const handleOpenHistory = (client) => {
    setSelectedClient(client._id)
    setOpenHistory(true);
  }

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedClient('')
  }

  const handleOpenGoals = (client) => {
    setSelectedClient(client._id)
    setOpenGoals(true);
  }

  const handleCloseGoals = () => {
    setOpenGoals(false);
    setSelectedClient('')
  }

  const handleRelationshipStatus = (clientId, accepted) => {
    dispatch(changeRelationshipStatus(clientId, accepted));
  }

  const ClientCard = (props) => {
    const { clientRelationship } = props;
    return (
      <Grid container item xs={12} >
        <Card sx={{ width: '100%' }} >
          <CardHeader
            avatar={
              <Avatar
              alt={`${clientRelationship.client.firstName[0]}${clientRelationship.client.lastName[0]}`}
              src={
                clientRelationship.client.profilePicture
                  ? `${serverURL}/user/profilePicture/${clientRelationship.client.profilePicture}`
                  : null
              }>
                {clientRelationship.client.firstName[0]}{clientRelationship.client.lastName[0]}
              </Avatar>
            }
            action={
              <>

                <IconButton title="Suspend" onClick={() => handleRelationshipStatus(clientRelationship.client._id, !clientRelationship.accepted)} >
                  {clientRelationship.accepted ? <Done /> : <PendingActions />}
                </IconButton>
                <IconButton title="Remove"  >
                  <Delete />
                </IconButton>
              </>
            }
            title={`${clientRelationship.client.firstName} ${clientRelationship.client.lastName}`}
            subheader={clientRelationship.accepted ? 'Accepted' : 'Pending'}
          />
          {clientRelationship.accepted &&
            <>
              <Button onClick={() => handleOpenHistory(clientRelationship.client)} >Calander</Button>
              <Button onClick={() => handleOpenGoals(clientRelationship.client)} >Goals</Button>
              <Button disabled >Daily Tasks</Button>
              <Button disabled >Nutrition</Button>
            </>
          }
        </Card>
      </Grid>
    );
  }

  useEffect(() => {
    dispatch(requestClients());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <Typography variant="h4">Training Clients</Typography>
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
        {clients.map((clientRelationship) => <ClientCard key={clientRelationship._id} clientRelationship={clientRelationship} />)}
      </Grid>
      <Dialog open={openHistory} onClose={handleCloseHistory} sx={{ '& .MuiDialog-paper': { padding: '5px', width: "100%", minHeight: '80%' } }} ><History view="trainer" clientId={selectedClient} /> </Dialog>
      <Dialog open={openGoals} onClose={handleCloseGoals} sx={{ '& .MuiDialog-paper': { padding: '5px', width: "100%", minHeight: '80%' } }} ><Goals view="trainer" clientId={selectedClient} /> </Dialog>
    </>
  ) : (
    <Typography variant="body1">You are not a trainer. This page is unavailable.</Typography>
  );
}
