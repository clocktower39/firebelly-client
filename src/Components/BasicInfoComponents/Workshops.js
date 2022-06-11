import React from "react";
import Navbar from "./Navbar";
import { Container, Paper, Typography } from "@mui/material";

export default function Workshops() {
  return (
    <>
      <Navbar />
      <Container>
        <Typography variant="h3" sx={{ color: "white", textAlign: "center" }} gutterBottom>
          Workshops
        </Typography>
        <Paper elevation="6" sx={{ padding: "5px 25px" }}>
          <Typography>
            Workshops are used to educate proper form & movement mechanics for certain exercises and
            skills. This will be very useful for those that may not want one-on-one training, but
            are having problems with a particular lift.
          </Typography>
          <Typography>
          These will include many  movements such as:

• Common Exercises (Squats, Deadlifts, Bench Press, & Overhead Press)

• Olympic lifts (Snatch, Clean & Jerk)

• Calisthenics (Handstands, Human Flagpoles, Levers, Muscle-ups, Planches)

Stretching
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
