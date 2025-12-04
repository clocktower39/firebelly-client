import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  List as NavIcon,
  Home as HomeIcon,
  GridView as DashboardIcon,
  Assessment as ProgressIcon,
  CalendarMonth as CalendarIcon,
  Assignment as GoalsIcon,
  Settings as AccountIcon,
  Groups as ClientsIcon,
  PersonAddAlt1 as SignUpIcon,
  Login as LoginIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from "@mui/icons-material";
import logo48 from "../../img/logo48.png";
import { serverURL } from "../../Redux/actions";
import Barcode from "react-barcode";

export default function NavDrawer() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const pages = [
    {
      title: "Home",
      to: "/",
      icon: <HomeIcon />,
    },
    {
      title: "Calendar",
      to: "/calendar",
      icon: <CalendarIcon />,
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
      title: "Clients",
      to: "/clients",
      icon: <ClientsIcon />,
    },
    {
      title: "Queue",
      to: "/queue",
      icon: <DashboardIcon />,
    },
    {
      title: "Exercises",
      to: "/exercises",
      icon: <GoalsIcon />,
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

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [openGymBarCodeDialog, setOpenGymBarCodeDialog] = useState(false);
  const handleOpenGymBarCodeDialog = () => setOpenGymBarCodeDialog(true);
  const handleCloseGymBarCodeDialog = () => setOpenGymBarCodeDialog(false);

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
            <Grid container size={6}>
              <IconButton onClick={toggleDrawer}>
                <NavIcon />
              </IconButton>
              <Button component={Link} to="/" sx={{ maxHeight: "40px" }}
                onClick={(e) => {
                  const isHome = window.location.pathname === "/";
                  const hasQuery = window.location.search.length > 0;

                  // Case 1: Already on "/", no query — reload
                  if (isHome && !hasQuery) {
                    e.preventDefault();
                    navigate(0); // force reload
                    return;
                  }

                  // Case 2: At "/?date=...", clear it
                  if (hasQuery) {
                    e.preventDefault();
                    navigate("/"); // go to clean "/"
                    navigate(0);
                    return;
                  }

                  // Otherwise allow normal navigation
                }}
              >
                <img src={logo48} alt="Firebelly Fitness Logo" style={{ maxHeight: "40px" }} />
              </Button>
            </Grid>
            <Grid container size={6} sx={{ justifyContent: "flex-end" }}>
              <IconButton onClick={handleMenu} sx={{ maxHeight: "40px", maxWidth: "40px" }}>
                <Avatar
                  src={
                    user.profilePicture && `${serverURL}/user/profilePicture/${user.profilePicture}`
                  }
                  sx={{ maxHeight: "40px", maxWidth: "40px" }}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "account-menu-button",
                }}
              >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                  <ListItemIcon>
                    <AccountIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Account Settings</Typography>
                </MenuItem>
                <MenuItem onClick={handleOpenGymBarCodeDialog}>
                  <ListItemIcon>
                    <QrCodeScannerIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Gym Barcode</Typography>
                </MenuItem>
                {/* Add more MenuItems here as needed */}
              </Menu>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Dialog
        open={openGymBarCodeDialog}
        onClose={handleCloseGymBarCodeDialog}
        PaperProps={{
          style: {
            width: "100vw",
            height: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h3" textAlign="center" >Gym Barcode</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container sx={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Box sx={{ transform: "scale(2)" }}>
              <Barcode value={user.gymBarcode} />
            </Box>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseGymBarCodeDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="left" open={open} onClose={toggleDrawer}>
        {list("left")}
      </Drawer>
    </>
  );
}
