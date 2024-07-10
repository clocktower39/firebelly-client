import React from "react";
import WebsiteNavbar from "./WebsiteNavbar";
import Footer from "../../Components/Footer";
import { Container, List, ListItem, Paper, Typography } from "@mui/material";

export default function Workshops() {
  return (
    <>
      <WebsiteNavbar />
      <Container>
        <Paper sx={{ margin: "15px 0", padding: "5px 25px" }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Workshops
          </Typography>
          <Typography>
            Workshops are used to educate proper form & movement mechanics for certain exercises and
            skills. This will be very useful for those that may not want one-on-one training, but
            are having problems with a particular lift.
          </Typography>
          <Typography>These will include many movements such as:</Typography>
          <List sx={{ listStyleType: "disc", pl: 4 }}>
            <ListItem sx={{ display: "list-item" }}>
              Common Exercises (Squats, Deadlifts, Bench Press, & Overhead Press)
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>Olympic lifts (Snatch, Clean & Jerk)</ListItem>
            <ListItem sx={{ display: "list-item" }}>
              Calisthenics (Handstands, Human Flagpoles, Levers, Muscle-ups, Planches)
            </ListItem>
            <ListItem sx={{ display: "list-item" }}>Stretching</ListItem>
          </List>
        </Paper>
      </Container>
      <div style={{ height: "20px" }} />
      <Footer />
    </>
  );
}
