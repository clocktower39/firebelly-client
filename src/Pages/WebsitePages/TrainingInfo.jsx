import React from "react";
import WebsiteNavbar from "./WebsiteNavbar";
import { Container, Grid, List, ListItem, Paper, Typography } from "@mui/material";
import Footer from "../../Components/Footer";

export default function TrainingInfo() {
  return (
    <Grid id="training" sx={{ padding: '100px 0', }} >
      <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontFamily: "Montserrat" }}>
        Training
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro" }}>
        There are online programs for anyone that wants just their program written for them, but
        doesn’t want any coaching.
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro" }}>
        Programs for those that want the convenience of an online program, but also want it more
        customized; or may need help through some in-person or virtual coaching sessions.
      </Typography>
      <Typography sx={{ fontFamily: "Source Sans Pro" }}>
        And of course, programs that are very customized with frequent communication!
      </Typography>

      <Typography sx={{ fontFamily: "Source Sans Pro" }}>Some program examples include:</Typography>
      <List sx={{ listStyleType: "disc", pl: 4, fontFamily: "Source Sans Pro" }}>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>Calisthenics</ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>Fat Loss</ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          Flexibility & Mobility
        </ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          General Functionality
        </ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>Muscle Mass</ListItem>
        <ListItem sx={{ display: "list-item", fontFamily: "inherit" }}>
          Strength Gains Custom
        </ListItem>
      </List>
    </Grid>
  );
}
