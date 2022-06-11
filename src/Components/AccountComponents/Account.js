import React, { useState } from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import AuthNavbar from "../AuthNavbar";
import { logoutUser } from "../../Redux/actions";
import ChangePassword from './ChangePassword';

export default function Account() {
  const dispatch = useDispatch();
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

  return (
    <>
      <Container
        maxWidth="md"
        sx={{ height: "100%", paddingTop: "25px", paddingBottom: "75px" }}
      >
        <Grid container>
          <Grid container item xs={12} sx={{ justifyContent: 'space-between'}}>
            <Typography variant="h5" sx={{ color: "#fff" }}>
              Account Settings
            </Typography>
            
            <Button variant="contained" onClick={handleClick}><Settings/></Button>
          </Grid>
          <Grid container item xs={12} sm={4} alignContent="flex-start">
            <Box component={Grid} display={{ xs: "none", sm: "flex" }}>
              <List>
                <ListItem button component={Link} to="/account">
                  <ListItemText primary="My Account" sx={{ color: "white" }} />
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
