import React from "react";
import { useSelector } from "react-redux";
import { Container, Grid, IconButton, Paper, Typography } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import AuthNavbar from "./AuthNavbar";

export default function Clients() {
  const user = useSelector((state) => state.user);

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
            <IconButton onClick={null}>
              <AddCircle />
            </IconButton>
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
            {/* {clients.map((client) => <ClientCard key={client._id} client={client} />)} */}
          </Grid>
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  ) : (
    <Typography variant="body1">You are not a trainer. This page is unavailable.</Typography>
  );
}
