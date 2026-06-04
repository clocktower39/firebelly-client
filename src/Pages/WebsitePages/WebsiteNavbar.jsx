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
import { ArrowOutward, FitnessCenter, Home, Route, ViewQuilt } from "@mui/icons-material";
import useWindowWidth from "../../Hooks/WindowWidth";
import FireBellyLogo from "../../img/fireBellyLogo.jpg";

const APP_URL = "https://app.firebellyfitness.com";

const navItems = [
  { label: "Home", to: "/#", icon: Home },
  { label: "Features", to: "/#features", icon: FitnessCenter },
  { label: "How it works", to: "/#workflow", icon: Route },
  { label: "Preview", to: "/#preview", icon: ViewQuilt },
];

const classes = {
  Toolbar: {
    margin: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    minHeight: "64px",
    backgroundColor: "rgba(2, 6, 23, 0.92)",
    gap: 1,
  },
  NavLink: {
    textTransform: "none",
    color: "#e5e7eb",
    borderRadius: "8px",
    px: 1.5,
    minWidth: "44px",
    "&:hover": {
      backgroundColor: "rgba(249, 115, 22, 0.12)",
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
              borderRadius: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              "&:hover": { backgroundColor: "rgba(15, 23, 42, 0.95)" },
            }}
          >
            <Avatar src={FireBellyLogo} alt="Logo" sx={{ width: 56, height: 56 }} />
          </IconButton>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
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
            <Typography
              variant="caption"
              color="rgba(148,163,184,0.95)"
            >
              Workout software for coaches and athletes
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
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.label} sx={classes.NavLink} component={Link} to={item.to}>
                <Stack spacing={0.5} sx={{ justifyContent: "center", alignItems: "center" }}>
                  <Box sx={{ display: wide ? "block" : "none" }}>{item.label}</Box>
                  <Icon fontSize="small" />
                </Stack>
              </Button>
            );
          })}
        </Stack>

        <Box sx={classes.NavAccountContainer}>
          <Button
            href={`${APP_URL}/login`}
            sx={{
              ...classes.NavAccountOptions,
              color: "#f8fafc",
              mb: 0.5,
            }}
          >
            Login
          </Button>
          <Button
            href={APP_URL}
            endIcon={wide ? <ArrowOutward fontSize="small" /> : null}
            sx={{
              ...classes.NavAccountOptions,
              color: "#111827",
              backgroundColor: "#f97316",
              borderRadius: "8px",
              px: 1.5,
              "&:hover": { backgroundColor: "#fb923c" },
            }}
          >
            Launch
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
