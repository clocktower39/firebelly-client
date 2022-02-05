import React from "react";
import Navbar from "./Navbar";
import { Container, Paper, Typography } from "@mui/material";

export default function TrainingInfo() {
  return (
    <>
      <Navbar />
      <Container>
        <Typography variant="h3" style={{ color: "white", textAlign: "center" }} gutterBottom>
          Training
        </Typography>
        <Paper elevation="6" style={{ padding: "5px 25px" }}>
          <Typography>
            There are online programs for anyone that wants just their program written for them, but
            doesn’t want any coaching.
          </Typography>
          <Typography>
            Programs for those that want the convenience of an online program, but also want it more
            customized; or may need help through some in-person or virtual coaching sessions.
          </Typography>
          <Typography>
            And of course, programs that are very customized with frequent communication!
          </Typography>
          <Typography>
          Some program examples include: 
	• Calisthenics
	• Fat Loss
	• Flexibility & Mobility
	• General Functionality
	• Muscle Mass
	• Strength Gains 
Custom
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
