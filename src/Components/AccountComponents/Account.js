import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AuthNavbar from '../AuthNavbar';

export default function Account() {
  return (
    <>
      <Container maxWidth="md" style={{ height: "100%", paddingTop: '25px', paddingBottom: '75px' }}>
        <Grid container>
          <Grid container item xs={12} sm={4} alignContent="flex-start">
            <Grid item xs={12}>
              <Typography variant="h5" style={{ color: "#fff" }}>
                Account Settings
              </Typography>
            </Grid>
            <List>
              <ListItem button component={Link} to='/account'>
                <ListItemText primary="My Account" style={{ color: 'white' }} />
              </ListItem>
              <ListItem button component={Link} to='/account/tasks'>
                <ListItemText primary="Default Tasks" style={{ color: 'white' }} />
              </ListItem>
              <ListItem button component={Link} to='/account/biometrics'>
                <ListItemText primary="Biometrics" style={{ color: 'white' }} />
              </ListItem>
            </List>

          </Grid>
          <Grid container item xs={12} sm={8}>
            <Outlet />
          </Grid>
        </Grid>
      </Container>
      <AuthNavbar />
    </>
  );
}
