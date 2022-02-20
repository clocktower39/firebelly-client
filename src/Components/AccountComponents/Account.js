import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import AuthNavbar from "../AuthNavbar";
import { logoutUser } from "../../Redux/actions";

export default function Account() {
  const dispatch = useDispatch();
  return (
    <>
      <Container
        maxWidth="md"
        style={{ height: "100%", paddingTop: "25px", paddingBottom: "75px" }}
      >
        <Grid container>
          <Grid container item xs={12} sx={{ justifyContent: 'space-between'}}>
            <Typography variant="h5" style={{ color: "#fff" }}>
              Account Settings
            </Typography>
            <Button variant="contained" onClick={() => dispatch(logoutUser())}>Logout</Button>
          </Grid>
          <Grid container item xs={12} sm={4} alignContent="flex-start">
            <Box component={Grid} display={{ xs: "none", sm: "flex" }}>
              <List>
                <ListItem button component={Link} to="/account">
                  <ListItemText primary="My Account" style={{ color: "white" }} />
                </ListItem>
              </List>
            </Box>
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
