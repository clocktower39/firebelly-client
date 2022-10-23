import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import AuthNavbar from './AuthNavbar';

export default function Dashboard() {
  const user = useSelector(state => state.user);

  const components = [
    {
      title: "Daily Tasks",
      to: "/tasks",
    },
    {
      title: "Training",
      to: "/training",
    },
    {
      title: "Nutrition",
      to: "/nutrition",
    },
    // {
    //   title: "Exercise Library",
    //   to: "/exerciselibrary",
    // },
    {
      title: "Goals",
      to: "/goals",
    },
    {
      title: "Progress",
      to: "/progress",
    },
    {
      title: "Clients",
      to: "/clients",
    },
    {
      title: "Account Settings",
      to: "/account",
    },
  ];

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: '75px', }}>
        <Grid container spacing={2}>
          <Grid container item xs={12} sx={{ justifyContent: "center" }}>
            <Typography variant="h4" color="common.white">
              Dashboard
            </Typography>
          </Grid>
          {components.filter(c => {
            if(!user.isTrainer){
              if(c.title === 'Clients'){
                return false;
              }
            }

            return true;
          }).map((component) => (
            <Grid
              key={`component-${component.title}`}
              container
              item
              md={4}
              xs={6}
              sx={{ justifyContent: "center" }}
            >
              <Box sx={{ width: "100%" }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardActionArea
                    component={Link}
                    to={component.to}
                    sx={{
                      "&:hover .card-content": {
                        transform: "translateY(0%)",
                      },
                    }}
                  >
                    <CardMedia
                      sx={{
                        height: 0,
                        paddingTop: "56.25%", // 16:9 == '56.25%',
                        backgroundColor: 'primary.main',
                      }}
                    />
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "5px 7.5px",
                        backgroundColor: 'background.DashboardCard',
                        bottom: "-20%",
                        height: "100%",
                        minWidth: "calc(100% - 15px)",
                        position: "absolute",
                        transition: "all 1s",
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h5"
                        sx={{
                          width: "100%",
                          color: "white",
                          textDecoration: "none",
                          textAlign: "center",
                        }}
                      >
                        {component.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{
                          padding: "7.5px 0",
                          color: "white",
                          textDecoration: "none",
                        }}
                      ></Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      <AuthNavbar />
    </>
  );
}
