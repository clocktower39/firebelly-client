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
          <Grid item container xs={12} justifyContent="center" spacing="2">
            <Grid container item xs={12} >
              <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
                Logout
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom sx={{ color: "#fff", paddingBottom: '25px', }}>
                Are you sure you would like to logout?
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleLogout} autoFocus>
                Confirm
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
