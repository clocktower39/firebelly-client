import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { requestClients, changeRelationshipStatus } from '../Redux/actions';
import { Avatar, Button, Card, CardHeader, Container, Dialog, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Delete, Done, PendingActions, } from "@mui/icons-material";
import AuthNavbar from "./AuthNavbar";
import Training from "./ActivityTrackers/Training";

export default function Clients() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);

  const [openTraining, setOpenTraining] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');

  const handleOpenTraining = (client) => {
    setSelectedClient(client.clientId)
    setOpenTraining(true);
  }

  const handleCloseTraining = () => {
    setOpenTraining(false);
    setSelectedClient('')
  }

  const handleRelationshipStatus = (clientId, accepted) => {
    dispatch(changeRelationshipStatus(clientId, accepted));
  }

  const ClientCard = (props) => {
    const { client } = props;
    return (
      <Grid container item xs={12} >
        <Card sx={{ width: '100%' }} >
          <CardHeader
            avatar={
              <Avatar >
                {client.firstName[0]}{client.lastName[0]}
              </Avatar>
            }
            action={
              <>

                <IconButton title="Suspend" onClick={() => handleRelationshipStatus(client.clientId, !client.accepted)} >
                  {client.accepted ? <Done /> : <PendingActions />}
                </IconButton>
                <IconButton title="Remove"  >
                  <Delete />
                </IconButton>
              </>
            }
            title={`${client.firstName} ${client.lastName}`}
            subheader={client.accepted ? 'Accepted' : 'Pending'}
          />
          {client.accepted &&
            <>
              <Button onClick={() => handleOpenTraining(client)} >Training</Button>
              <Button disabled >Daily Tasks</Button>
              <Button disabled >Nutrition</Button>
              <Button disabled >Goals</Button>
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
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper
          sx={{
            padding: "5px 15px",
            borderRadius: "15px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            flex: "auto",
          }}
        >
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
            {clients.map((client) => <ClientCard key={client._id} client={client} />)}
          </Grid>
        </Paper>
        <Dialog open={openTraining} onClose={handleCloseTraining} sx={{ '& .MuiDialog-paper': { padding: '5px', width: "100%", minHeight: '80%' } }} ><Training view="trainer" clientId={selectedClient} /> </Dialog>
      </Container>
      <AuthNavbar />
    </>
  ) : (
    <Typography variant="body1">You are not a trainer. This page is unavailable.</Typography>
  );
}
