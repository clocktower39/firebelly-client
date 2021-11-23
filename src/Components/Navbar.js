import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../Redux/actions";
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
import useWindowWidth from "../Hooks/WindowWidth"
import FireBellyLogo from "../img/fireBellyLogo.jpg";

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
  NavLink: {
    color: "#FEFFFF",
    padding: "20px",
    fontFamily: "Cabin",
    fontWeight: 500,
    fontSize: "12px",
    letterSpacing: "0.143em",
    textTransform: "uppercase",
    "& .MuiButton-root": {
      color: "#FEFFFF",
    },
  },
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

  const toggleList = () => setIsListOpen(!isListOpen);

  return (
    <AppBar position="sticky">
      <Toolbar className={classes.Toolbar}>
        <IconButton color="inherit" component={Link} to="/">
          <Avatar src={FireBellyLogo} alt="Logo" sx={{ width: "75px", height: "75px" }} />
        </IconButton>
        {wide ? (
          <Stack
            direction="row"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                variant="middle"
                sx={{ borderColor: "white", margin: "12.5px" }}
              />
            }
          >
            <Button className={classes.NavLink} component={Link} to="/">
              <Stack justifyContent="center" alignItems="center">
                <div>Home</div>
                <Home />
              </Stack>
            </Button>
            <Button className={classes.NavLink}>
              <Stack justifyContent="center" alignItems="center">
                <div>Fitness</div>
                <Assessment />
              </Stack>
            </Button>
            <Button className={classes.NavLink} component={Link} to="/nutrition">
              <Stack justifyContent="center" alignItems="center">
                <div>Nutrition</div>
                <Restaurant />
              </Stack>
            </Button>
            <Button className={classes.NavLink}>
              <Stack justifyContent="center" alignItems="center">
                <div>Workshops</div>
                <Workspaces />
              </Stack>
            </Button>
            <Button className={classes.NavLink}>
              <Stack justifyContent="center" alignItems="center">
                <div>Training</div>
                <FitnessCenter />
              </Stack>
            </Button>
          </Stack>
        ) : (
          <></>
        )}

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
                  <ListItem
                    button
                    component={Link}
                    to="/day"
                    onClick={toggleList}
                    className={classes.nested}
                  >
                    <ListItemText>Daily</ListItemText>
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/week"
                    onClick={toggleList}
                    className={classes.nested}
                  >
                    <ListItemText>Weekly</ListItemText>
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/month"
                    onClick={toggleList}
                    className={classes.nested}
                  >
                    <ListItemText>Monthly</ListItemText>
                  </ListItem>
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
