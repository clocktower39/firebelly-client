import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  Grid,
  IconButton,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  List as NavIcon,
  Home as HomeIcon,
  GridView as DashboardIcon,
  Assessment as ProgressIcon,
  History as HistoryIcon,
  Assignment as GoalsIcon,
  Settings as AccountIcon,
  Groups as ClientsIcon,
  Restaurant as NutritionIcon,
  Task as TasksIcon,
  PersonAddAlt1 as SignUpIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import logo48 from "../../img/logo48.png";
import { serverURL } from "../../Redux/actions";

export default function NavDrawer() {
  const user = useSelector((state) => state.user);

  const pages = [
    {
      title: "Home",
      to: "/",
      icon: <HomeIcon />,
    },
    {
      title: "History",
      to: "/history",
      icon: <HistoryIcon />,
    },
    {
      title: "Goals",
      to: "/goals",
      icon: <GoalsIcon />,
    },
    {
      title: "Progress",
      to: "/progress",
      icon: <ProgressIcon />,
    },
    {
      title: "Account Settings",
      to: "/account",
      icon: <AccountIcon />,
    },
  ];

  const trainerPages = [
    {
      title: "Dashboard",
      to: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Clients",
      to: "/clients",
      icon: <ClientsIcon />,
    },
    {
      title: "Daily Tasks",
      to: "/tasks",
      icon: <TasksIcon />,
    },
    {
      title: "Nutrition",
      to: "/nutrition",
      icon: <NutritionIcon />,
    },
  ];

  const noAuthPages = [
    {
      title: "Login",
      to: "/login",
      icon: <LoginIcon />,
    },
    {
      title: "Sign up",
      to: "/signup",
      icon: <SignUpIcon />,
    },
  ];

  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen((prev) => !prev);

  const list = (anchor) => (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer} onKeyDown={toggleDrawer}>
      {user._id ? (
        <>
          <List>
            {pages.map((page, index) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton component={Link} to={page.to}>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {user.isTrainer && (
            <>
              <Divider />
              <List>
                {trainerPages.map((page, index) => (
                  <ListItem key={page.title} disablePadding>
                    <ListItemButton component={Link} to={page.to}>
                      <ListItemIcon>{page.icon}</ListItemIcon>
                      <ListItemText primary={page.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </>
      ) : (
        <>
          <List>
            {noAuthPages.map((page, index) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton component={Link} to={page.to}>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#232323",
          marginBottom: "5px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="md">
          <Grid container>
            <Grid container item xs={6}>
              <IconButton onClick={toggleDrawer}>
                <NavIcon />
              </IconButton>
              <Button component={Link} to="/" sx={{ maxHeight: "40px" }}>
                <img src={logo48} alt="Firebelly Fitness Logo" style={{ maxHeight: "40px" }} />
              </Button>
            </Grid>
            <Grid container item xs={6} sx={{ justifyContent: "flex-end" }}>
              <IconButton
                component={Link}
                to="/account"
                sx={{ maxHeight: "40px", maxWidth: "40px" }}
              >
                <Avatar
                  src={
                    user.profilePicture && `${serverURL}/user/profilePicture/${user.profilePicture}`
                  }
                  sx={{ maxHeight: "40px", maxWidth: "40px" }}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </IconButton>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        {list("left")}
      </Drawer>
    </>
  );
}
