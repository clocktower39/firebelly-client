import React from "react";
import { HashLink as Link } from "react-router-hash-link";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { FitnessCenter, Home, Restaurant, Workspaces } from "@mui/icons-material";
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
    paddingLeft: "theme.spacing(4)",
  },
  NavLogoText: {
    fontFamily: "Rockwell",
    fontSize: "14px",
  },
};

export default function WebsiteNavbar() {
  const wide = useWindowWidth(775);

  return (
    <AppBar position="sticky">
      <Toolbar sx={classes.Toolbar}>
        <IconButton
          color="inherit"
          component={Link}
          to="/"
          sx={{ position: "relative", zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <Avatar src={FireBellyLogo} alt="Logo" sx={{ width: "75px", height: "75px" }} />
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                zIndex: 2,
                textAlign: "center",
                color: "white",
                "&:hover": { cursor: "default" },
                userSelect: "none",
                marginRight: '75px',
              }}
            >
              Firebelly Fitness
            </Typography>
          </Box>
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
          <Button sx={classes.NavLink} component={Link} to="/#">
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Home</Box>
              <Home sx={{ color: "#FFF" }} />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#nutrition">
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Nutrition</Box>
              <Restaurant sx={{ color: "#00AA00" }} />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#workshops">
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Workshops</Box>
              <Workspaces sx={{ color: "#008080" }} />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#training">
            <Stack justifyContent="center" alignItems="center">
              <Box sx={{ display: wide ? "block" : "none", color: "#fff" }}>Training</Box>
              <FitnessCenter sx={{ color: "#d50000" }} />
            </Stack>
          </Button>
        </Stack>

        <Box sx={classes.NavAccountContainer}>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
