import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginJWT } from "../../Redux/actions";
import { Box, Container, Grid, Typography } from "@mui/material";
import { Assessment, FitnessCenter, Restaurant, Workspaces } from "@mui/icons-material";
import Navbar from "./Navbar";
import useWindowWidth from "../../Hooks/WindowWidth"
import DeadliftImg from "../../img/deadlift.jpg";

export default function Home() {
  const dispatch = useDispatch();
  const wide = useWindowWidth(775);

  const handleLoginAttempt = async (e) => {
    dispatch(loginJWT(localStorage.getItem("JWT_AUTH_TOKEN")));
  };

  useEffect(() => {
    if (localStorage.getItem("JWT_AUTH_TOKEN") !== null) {
      handleLoginAttempt();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Navbar />
      <div>
        <Box sx={{ backgroundColor: "black", width: "100%" }}>
          <Container maxWidth={"lg"} disableGutters >
            <img alt="Deadlift" src={DeadliftImg} style={wide ? { width: "100%", height: "auto" } : { width: '100%', height: '55vh', objectFit: 'cover', }} />
          </Container>
        </Box>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} sx={{ color: "#D56100" }}>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Assessment sx={{ fontSize: "125px" }} /> </Grid>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Typography variant="h4" >Fitness</Typography></Grid>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ color: "#00AA00" }}>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Restaurant sx={{ fontSize: "125px" }} /> </Grid>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Typography variant="h4" >Nutrition</Typography></Grid>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ color: "#008080" }}>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Workspaces sx={{ fontSize: "125px" }} /> </Grid>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Typography variant="h4" >Workshops</Typography></Grid>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ color: "#d50000" }}>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><FitnessCenter sx={{ fontSize: "125px" }} /> </Grid>
              <Grid item xs={12} container sx={{ justifyContent: "center" }}><Typography variant="h4" >Training</Typography></Grid>
            </Grid>
          </Grid>
        </Container>
      </div>
    </>
  );
}
