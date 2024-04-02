import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginJWT } from "../../Redux/actions";
import { Box, Container, Grid, List, ListItem, Typography } from "@mui/material";
import WebsiteNavbar from "./WebsiteNavbar";
import useWindowWidth from "../../Hooks/WindowWidth";
import DeadliftImg from "../../img/deadlift.jpg";
import BryceFlagpole from "../../img/bryce_flagpole.jpg";

const classes = {
  MainImgBox: {
    backgroundColor: "black",
    width: "100%",
  },
  WideMainImg: { width: "100%", height: "auto" },
  NonWideMainImg: { width: "100%", height: "55vh", objectFit: "cover" },
  AboutSite: { padding: "25px 15px" },
};

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
      <WebsiteNavbar />
      <Box sx={classes.MainImgBox}>
        <Container maxWidth={"lg"} disableGutters>
          <img
            alt="Deadlift"
            src={DeadliftImg}
            style={wide ? classes.WideMainImg : classes.NonWideMainImg}
          />
        </Container>
      </Box>
      <Grid>
        <Container maxWidth="sm" sx={classes.AboutSite}>
          <Grid>
            <Typography variant="h4" textAlign="center" >
              About Firebelly Fitness
            </Typography>
          </Grid>
          <Grid>
            <Typography>
              Our goal is to help as many people as possible improve their lifestyle by giving them
              the information, coaching, and tools needed to improve functionality for any
              experience they encounter.
            </Typography>
          </Grid>
          <Grid>
            <Typography>On this website, you will find:</Typography>
            <List sx={{ listStyleType: "disc", pl: 4 }}>
              <ListItem sx={{ display: "list-item" }}>
                Consolidated information about Fitness & Nutrition, it will contain some of the most
                important basic information that you need to understand to be successful. (Please
                read it, it's free, we just want everyone to have the most accurate information
                possible)
              </ListItem>
              <ListItem sx={{ display: "list-item" }}>
                Workshops for specific exercises or skills with step by step instructions for proper
                form and advancements
              </ListItem>
              <ListItem sx={{ display: "list-item" }}>Training Program Options</ListItem>
              <ListItem sx={{ display: "list-item" }}>
                Fitness Application with our free programs, online programs, and custom programs
              </ListItem>
            </List>
          </Grid>
        </Container>
        <Container maxWidth="false" sx={{ backgroundColor: "black" }}>
          <Container
            maxWidth="md"
            sx={{
              backgroundColor: "black",
              color: "white",
              padding: "25px 0px",
            }}
          >
            <Grid container>
              <Grid container item xs={12} md={6}>
                <Grid>
                  <Typography variant="h4" textAlign="center" >
                    About Me
                  </Typography>
                </Grid>
                <Grid>
                  <Typography>
                    I have always had a passion for understanding, never able to accept "that’s just
                    the way it is" as an answer. This curiosity has shaped me in many ways that I am
                    grateful for, mostly, the determination to find the truth through trial. The
                    most when learning about Kinesiology or Nutrition, is that I can apply the
                    information to myself and see the results before my very eyes.
                  </Typography>
                </Grid>
                <Grid>
                  <Typography>
                    I live a very active lifestyle, and like to practice what I preach!
                  </Typography>
                </Grid>
                <Grid>
                  <Typography>My hobbies include:</Typography>
                  <List sx={{ listStyleType: "disc", pl: 4 }}>
                    <ListItem sx={{ display: "list-item" }}>
                      Calisthenics (Handstands, Flagpoles, Lever, Planche, etc)
                    </ListItem>
                    <ListItem sx={{ display: "list-item" }}>Hiking</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Jiu Jitsu</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Strength Training</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Stunting</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Tumbling</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Longboarding</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Videogames</ListItem>
                  </List>
                </Grid>
              </Grid>
              <Grid
                container
                item
                xs={12}
                md={6}
                sx={{ justifyContent: "center", alignItems: "center" }}
              >
                <img
                  alt="flagpole calisthenics"
                  src={BryceFlagpole}
                  style={{ width: "70%", height: "auto", maxWidth: "300px", borderRadius: "5px" }}
                />
              </Grid>
            </Grid>
          </Container>
        </Container>
      </Grid>
    </>
  );
}
