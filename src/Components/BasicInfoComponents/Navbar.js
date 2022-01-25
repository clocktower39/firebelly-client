import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../Redux/actions";
import { Link } from "react-router-dom";
import {
  AppBar,
  Avatar,
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
import { makeStyles } from "@mui/styles";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import useWindowWidth from "../../Hooks/WindowWidth";
import FireBellyLogo from "../../img/fireBellyLogo.jpg";

const useStyles = makeStyles((theme) => ({
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
    paddingLeft: theme.spacing(4),
  },
}));

export default function Navbar() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const wide = useWindowWidth(775);
  const user = useSelector((state) => state.user);
  const [isListOpen, setIsListOpen] = useState(false);

  const toggleList = () => setIsListOpen((prev) => !prev);

  return (
    <AppBar position="sticky">
      <Toolbar className={classes.Toolbar}>
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
            className={classes.NavLink}
            component={Link}
            to="/"
            sx={{ minWidth: "32px", padding: "0px 8px", color: "white" }}
          >
            <Stack justifyContent="center" alignItems="center">
              <div style={{ display: wide ? "block" : "none", color: "#fff" }}>Home</div>
              <Home sx={{ color: "#FFF" }} />
            </Stack>
          </Button>
          <Button
            className={classes.NavLink}
            component={Link}
            to="/basicinfo/fitness"
            sx={{ minWidth: "32px", padding: "0px 8px", color: "white" }}
          >
            <Stack justifyContent="center" alignItems="center">
              <div style={{ display: wide ? "block" : "none", color: "#fff" }}>Fitness</div>
              <Assessment sx={{ color: "#D56100" }} />
            </Stack>
          </Button>
          <Button
            className={classes.NavLink}
            component={Link}
            to="/basicinfo/nutrition"
            sx={{ minWidth: "32px", padding: "0px 8px", color: "white" }}
          >
            <Stack justifyContent="center" alignItems="center">
              <div style={{ display: wide ? "block" : "none", color: "#fff" }}>Nutrition</div>
              <Restaurant sx={{ color: "#00AA00" }} />
            </Stack>
          </Button>
          <Button
            className={classes.NavLink}
            component={Link}
            to="/basicinfo/workshops"
            sx={{ minWidth: "32px", padding: "0px 8px", color: "white" }}
          >
            <Stack justifyContent="center" alignItems="center">
              <div style={{ display: wide ? "block" : "none", color: "#fff" }}>Workshops</div>
              <Workspaces sx={{ color: "#008080" }} />
            </Stack>
          </Button>
          <Button
            className={classes.NavLink}
            component={Link}
            to="/basicinfo/training"
            sx={{ minWidth: "32px", padding: "0px 8px", color: "white" }}
          >
            <Stack justifyContent="center" alignItems="center">
              <div style={{ display: wide ? "block" : "none", color: "#fff" }}>Training</div>
              <FitnessCenter sx={{ color: "#d50000" }} />
            </Stack>
          </Button>
        </Stack>

        <div className={classes.NavAccountContainer}>
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
                style={{ position: "absolute" }}
              >
                <List component="div" disablePadding style={{ backgroundColor: "black" }}>
                  <ListItem
                    button
                    component={Link}
                    to="/dashboard"
                    onClick={toggleList}
                    className={classes.nested}
                  >
                    <ListItemText>Dashboard</ListItemText>
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/account"
                    onClick={toggleList}
                    className={classes.nested}
                  >
                    <ListItemText>Account</ListItemText>
                  </ListItem>
                  {user.isTrainer && (
                    <ListItem
                      button
                      component={Link}
                      to="/clients"
                      onClick={toggleList}
                      className={classes.nested}
                    >
                      <ListItemText>Clients</ListItemText>
                    </ListItem>
                  )}

                  <ListItem
                    button
                    onClick={() => dispatch(logoutUser())}
                    className={classes.nested}
                  >
                    <ListItemText>Logout</ListItemText>
                  </ListItem>
                </List>
              </Collapse>
            </List>
          ) : (
            <>
              <Button
                className={classes.NavAccountOptions}
                style={{ color: "#ee2726" }}
                component={Link}
                to="/login"
              >
                Login
              </Button>
              <Button
                className={classes.NavAccountOptions}
                style={{ color: "#ffffff" }}
                component={Link}
                to="/signup"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
