import React from "react";
import WebsiteNavbar from "./WebsiteNavbar";
import { Container, List, ListItem, Paper, Typography } from "@mui/material";

export default function TrainingInfo() {
  return (
    <>
      <WebsiteNavbar />
      <Container>
        <Paper elevation="6" sx={{ margin: "15px 0", padding: "5px 25px" }}>
          <Typography variant="h2" sx={{ textAlign: "center" }} gutterBottom>
            Training
          </Typography>

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

          <Typography>Some program examples include:</Typography>
          <List sx={{ listStyleType: "disc", pl: 4 }}>
            <ListItem sx={{ display: "list-item" }}>Calisthenics</ListItem>
            <ListItem sx={{ display: "list-item" }}>Fat Loss</ListItem>
            <ListItem sx={{ display: "list-item" }}>Flexibility & Mobility</ListItem>
            <ListItem sx={{ display: "list-item" }}>General Functionality</ListItem>
            <ListItem sx={{ display: "list-item" }}>Muscle Mass</ListItem>
            <ListItem sx={{ display: "list-item" }}>Strength Gains Custom</ListItem>
          </List>
        </Paper>
      </Container>
    </>
  );
}
