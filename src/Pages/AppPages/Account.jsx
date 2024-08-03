import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export default function Account() {
  const user = useSelector((state) => state.user);
  const [openOutletList, setOpenOutletList] = useState(true);

  const handleOutletLists = () => setOpenOutletList((prev) => !prev);

  const OutletList = () => {
    return (
      <List>
        <ListItem button component={Link} to="/account">
          <ListItemText primary="My Account" sx={{ color: "white" }} />
        </ListItem>
        <ListItem button component={Link} to="/account/trainers">
          <ListItemText primary="Trainers" sx={{ color: "white" }} />
        </ListItem>
        <ListItem button component={Link} to="/account/theme">
          <ListItemText primary="Theme" sx={{ color: "white" }} />
        </ListItem>
        <ListItem button component={Link} to="/account/password">
          <ListItemText primary="Change Password" sx={{ color: "white" }} />
        </ListItem>
        <Divider />
        <ListItem button component={Link} to="/account/logout">
          <ListItemText primary="Logout" sx={{ color: "white" }} />
        </ListItem>
      </List>
    );
  };

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "25px", paddingBottom: "75px" }}>
        <Grid container>

          <Grid container item xs={12} sx={{ justifyContent: "space-between" }}>

            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Typography onClick={handleOutletLists} variant="h5" sx={{ color: "#fff" }}>
                Account Settings
              </Typography>
            </Box>

          </Grid>

          <Grid container item xs={12} sm={4} sx={{ display: openOutletList ? "flex" : "none" }}>
            <OutletList />
          </Grid>

          <Grid container item xs={12} sm={openOutletList ? 8 : 12}>
            <Outlet />
          </Grid>

        </Grid>
      </Container>
    </>
  );
}
