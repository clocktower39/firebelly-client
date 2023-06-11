import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { Settings, List as ListIcon } from "@mui/icons-material";
import AuthNavbar from "./AuthNavbar";
import { logoutUser } from "../../Redux/actions";
import ChangePassword from '../../Components/AccountComponents/ChangePassword';

export default function Account() {
  const dispatch = useDispatch();
  const [openOutletList, setOpenOutletList] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [passwordModal, setPasswordModal] = useState(false);
  const handlePasswordOpen = () => setPasswordModal(true);
  const handlePasswordClose = () => setPasswordModal(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => dispatch(logoutUser());

  const handleOutletLists = () => setOpenOutletList(prev => !prev);

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
      </List>
    )
  }

  return (
    <>
      <Container
        maxWidth="md"
        sx={{ height: "100%", paddingTop: "25px", paddingBottom: "75px" }}
      >
        <Grid container>
          <Grid container item xs={12} sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', }}>
              <IconButton onClick={handleOutletLists} ><ListIcon /></IconButton>
              <Typography variant="h5" sx={{ color: "#fff" }}>
                Account Settings
              </Typography>
            </Box>

            <Button variant="contained" onClick={handleClick}><Settings /></Button>
          </Grid>
          <Grid container item xs={12} sm={4} sx={{ display: openOutletList ? 'flex' : 'none', }}>
            <OutletList />
          </Grid>
          <Grid container item xs={12} sm={openOutletList ? 8 : 12}>
            <Outlet />
          </Grid>
        </Grid>
      </Container>
      <AuthNavbar />
      <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
        <MenuItem onClick={handlePasswordOpen}>Change password</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      {passwordModal && open && (
        <ChangePassword open={open} handlePasswordClose={handlePasswordClose} />
      )}
    </>
  );
}
