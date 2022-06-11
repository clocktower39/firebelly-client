import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions";
import { Link } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Stack,
  Toolbar,
} from "@mui/material";
import { Assessment, FitnessCenter, Home, Restaurant, Workspaces } from "@mui/icons-material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import useWindowWidth from "../../Hooks/WindowWidth";
import FireBellyLogo from "../../img/fireBellyLogo.jpg";

const classes = {
  Toolbar: {
    margin: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#000000",
    flexWrap: "nowrap",
    minHeight: "58px",
    maxHeight: "139px",
  },
  NavLink: {},
  NavAccountContainer: {
    display: "flex",
    flexDirection: "column",
    minWidth: "32px",
    padding: "0px 8px",
    color: "white",
  },
  NavAccountOptions: {
    color: "#FEFFFF",
    fontFamily: "Cabin",
    fontWeight: 500,
    fontSize: "12px",
    letterSpacing: "0.143em",
    textTransform: "uppercase",
  },
  nested: {
    paddingLeft: 'theme.spacing(4)',
  },
};

export default function Navbar() {
  const dispatch = useDispatch();
  const wide = useWindowWidth(775);
  const user = useSelector((state) => state.user);
  const [isListOpen, setIsListOpen] = useState(false);

  const toggleList = () => setIsListOpen((prev) => !prev);

  return (
    <AppBar position="sticky">
      <Toolbar sx={classes.Toolbar}>
        <IconButton color="inherit" component={Link} to="/">
          <Avatar src={FireBellyLogo} alt="Logo" sx={{ width: "75px", height: "75px" }} />
        </IconButton>
        <Stack
          direction="row"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              variant="middle"
              sx={{ borderColor: "#fff", margin: wide ? "12.5px" : "4px" }}
            />
          }
        >
          <Button
            sx={classes.NavLink}
            component={Link}
            to="/"
          >
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Home</Box>
              <Home sx={{ color: "#FFF" }} />
            </Stack>
          </Button>
          <Button
            sx={classes.NavLink}
            component={Link}
            to="/basicinfo/fitness"
          >
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Fitness</Box>
              <Assessment sx={{ color: "#D56100" }} />
            </Stack>
          </Button>
          <Button
            sx={classes.NavLink}
            component={Link}
            to="/basicinfo/nutrition"
          >
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Nutrition</Box>
              <Restaurant sx={{ color: "#00AA00" }} />
            </Stack>
          </Button>
          <Button
            sx={classes.NavLink}
            component={Link}
            to="/basicinfo/workshops"
          >
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Workshops</Box>
              <Workspaces sx={{ color: "#008080" }} />
            </Stack>
          </Button>
          <Button
            sx={classes.NavLink}
            component={Link}
            to="/basicinfo/training"
          >
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Training</Box>
              <FitnessCenter sx={{ color: "#d50000" }} />
            </Stack>
          </Button>
        </Stack>

        <Box sx={classes.NavAccountContainer}>
          {user.email ? (
            <List component="nav" aria-labelledby="nested-list-subheader">
              <ListItem button onClick={toggleList}>
                <ListItemText>
                  {user.firstName} {user.lastName}
                </ListItemText>
                {isListOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse
                in={isListOpen}
                timeout="auto"
                unmountOnExit
                sx={{ position: "absolute" }}
              >
                <List component="div" disablePadding sx={{ backgroundColor: "black" }}>
                  <ListItem
                    button
                    component={Link}
                    to="/dashboard"
                    onClick={toggleList}
                    sx={classes.nested}
                  >
                    <ListItemText>Dashboard</ListItemText>
                  </ListItem>

                  <ListItem
                    button
                    onClick={() => dispatch(logoutUser())}
                    sx={classes.nested}
                  >
                    <ListItemText>Logout</ListItemText>
                  </ListItem>
                </List>
              </Collapse>
            </List>
          ) : (
            <>
              <Button
                sx={{ ...classes.NavAccountOptions, color: "#ee2726" }}
                href="https://app.firebellyfitness.com/login"
              >
                Login
              </Button>
              <Button
                sx={{ ...classes.NavAccountOptions, color: "#ffffff" }}
                href="https://app.firebellyfitness.com/signup"
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
