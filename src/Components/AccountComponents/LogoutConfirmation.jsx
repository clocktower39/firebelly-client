import React from "react";
import { useDispatch } from "react-redux";
import { Button, Container, Grid, Paper, Typography } from "@mui/material";
import { logoutUser } from "../../Redux/actions";

export default function LogoutConfirmation() {
  const dispatch = useDispatch();
  const handleLogout = () => dispatch(logoutUser());
  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>

          <Grid container size={12} spacing="2">
            <Grid container size={12}>
              <Typography variant="h5" gutterBottom sx={{ color: "primary.contrastText" }}>
                Logout
              </Typography>
            </Grid>
          </Grid>

          <Grid container size={12} >
            <Typography variant="body1" gutterBottom sx={{ color: "primary.contrastText", paddingBottom: "25px" }}>
              Are you sure you would like to logout?
            </Typography>
          </Grid>

          <Grid container size={12} justifyContent="center" >
            <Button variant="contained" onClick={handleLogout} autoFocus>
              Confirm
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
