import React from "react";
import { Link } from "react-router-dom";
import {
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
    {
      title: "Notes",
      to: "/notes",
    },
    {
      title: "Exercise Library",
      to: "/exerciselibrary",
    },
    {
      title: "Week View",
      to: "/week",
    },
    {
      title: "Progress",
      to: "/progress",
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
            <Typography variant="h4" sx={{ color: "white" }}>
              Dashboard
            </Typography>
          </Grid>
          {components.map((component) => (
            <Grid
              key={`component-${component.title}`}
              container
              item
              md={4}
              xs={6}
              sx={{ justifyContent: "center" }}
            >
              <div style={{ width: "100%" }}>
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
                        backgroundColor: '#D50000',
                      }}
                    />
                    <CardContent
                      className="card-content"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "5px 7.5px",
                        backgroundColor: '#232323',
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
                        component="a"
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
                        component="a"
                        sx={{
                          padding: "7.5px 0",
                          color: "white",
                          textDecoration: "none",
                        }}
                      ></Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>
      <AuthNavbar />
    </>
  );
}
