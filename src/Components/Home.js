import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginJWT } from "../Redux/actions";
import { Container, Grid, Typography } from "@mui/material";
import { Assessment, FitnessCenter, Restaurant, Workspaces } from "@mui/icons-material";
import DeadliftImg from "../img/deadlift.jpg";

export default function Home() {
  const dispatch = useDispatch();

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
    <div>
      <div style={{ backgroundColor: "black", width: "100%" }}>
        <Container maxWidth={"lg"}>
          <img alt="Deadlift" src={DeadliftImg} style={{ width: "100%", height: "auto" }} />
        </Container>
      </div>
      <Container maxWidth="xl">
        <Grid container style={{ justifyContent: "center" }}>
          <Grid item xs={6} >
            <Assessment sx={{ fontSize: "150px"}}/> 
             <Typography variant="h4" >Fitness</Typography>
          </Grid>
          <Grid item xs={6} >
            <Restaurant sx={{ fontSize: "150px"}}/> 
             <Typography variant="h4" >Nutrition</Typography>
          </Grid>
          <Grid item xs={6} >
            <Workspaces sx={{ fontSize: "150px"}}/> 
             <Typography variant="h4" >Workshops</Typography>
          </Grid>
          <Grid item xs={6} >
            <FitnessCenter sx={{ fontSize: "150px"}}/> 
             <Typography variant="h4" >Training</Typography>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
