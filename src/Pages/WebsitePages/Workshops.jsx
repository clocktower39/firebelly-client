import React from "react";
import WebsiteNavbar from "./WebsiteNavbar";
import Footer from "../../Components/Footer";
import { Container, List, ListItem, Paper, Typography } from "@mui/material";

export default function Workshops() {
  return (
    <>
      <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontFamily: "Montserrat" }}>
        Workshops
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro" }}>
        Workshops are used to educate proper form & movement mechanics for certain exercises and
        skills. This will be very useful for those that may not want one-on-one training, but are
        having problems with a particular lift.
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro" }}>
        These will include many movements such as:
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4, fontFamily: "Source Sans Pro" }}>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          Common Exercises (Squats, Deadlifts, Bench Press, & Overhead Press)
        </ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          Olympic lifts (Snatch, Clean & Jerk)
        </ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          Calisthenics (Handstands, Human Flagpoles, Levers, Muscle-ups, Planches)
        </ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>Stretching</ListItem>
      </List>
    </>
  );
}
