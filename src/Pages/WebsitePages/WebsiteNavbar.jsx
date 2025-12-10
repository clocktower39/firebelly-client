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
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    minHeight: "64px",
  },
  NavLink: {
    textTransform: "none",
    color: "#e5e7eb",
    borderRadius: 9999,
    px: 1.5,
    "&:hover": {
      backgroundColor: "rgba(15, 23, 42, 0.6)",
    },
  },
  NavAccountContainer: {
    display: "flex",
    flexDirection: "column",
    minWidth: "32px",
    padding: "0px 8px",
    color: "white",
  },
  NavAccountOptions: {
    fontFamily: "Montserrat, system-ui, sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
};

export default function WebsiteNavbar() {
  const wide = useWindowWidth(775);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #020617, #0f172a, #1e293b)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.4)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Toolbar sx={classes.Toolbar}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            component={Link}
            to="/#"
            sx={{
              position: "relative",
              borderRadius: 2,
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              "&:hover": { backgroundColor: "rgba(30, 64, 175, 0.9)" },
            }}
          >
            <Avatar src={FireBellyLogo} alt="Logo" sx={{ width: 56, height: 56 }} />
          </IconButton>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: "Montserrat, system-ui, sans-serif",
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              Firebelly Fitness
            </Typography>
            <Typography variant="caption" color="rgba(148,163,184,0.95)">
              Coaching, training, and tools that fit your life
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          divider={
            <Divider
              orientation="vertical"
              flexItem
              variant="middle"
              sx={{ borderColor: "rgba(148, 163, 184, 0.5)", mx: wide ? 2 : 0.5 }}
            />
          }
          spacing={wide ? 1 : 0}
          sx={{ alignItems: "center" }}
        >
          <Button sx={classes.NavLink} component={Link} to="/#">
            <Stack justifyContent="center" alignItems="center" spacing={0.5}>
              <Box sx={{ display: wide ? "block" : "none" }}>Home</Box>
              <Home fontSize="small" />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#nutrition">
            <Stack justifyContent="center" alignItems="center" spacing={0.5}>
              <Box sx={{ display: wide ? "block" : "none" }}>Nutrition</Box>
              <Restaurant fontSize="small" />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#workshops">
            <Stack justifyContent="center" alignItems="center" spacing={0.5}>
              <Box sx={{ display: wide ? "block" : "none" }}>Workshops</Box>
              <Workspaces fontSize="small" />
            </Stack>
          </Button>
          <Button sx={classes.NavLink} component={Link} to="/#training">
            <Stack justifyContent="center" alignItems="center" spacing={0.5}>
              <Box sx={{ display: wide ? "block" : "none" }}>Training</Box>
              <FitnessCenter fontSize="small" />
            </Stack>
          </Button>
        </Stack>

        <Box sx={classes.NavAccountContainer}>
          <Button
            href="https://app.firebellyfitness.com/login"
            sx={{
              ...classes.NavAccountOptions,
              color: "#f97316",
              mb: 0.5,
            }}
          >
            Login
          </Button>
          <Button
            href="https://app.firebellyfitness.com/signup"
            sx={{
              ...classes.NavAccountOptions,
              color: "#ffffff",
            }}
          >
            Sign up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
