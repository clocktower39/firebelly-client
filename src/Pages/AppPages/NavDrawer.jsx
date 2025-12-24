import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
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
  Toolbar,
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
    <Box
      sx={{
        width: 260,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.default",
      }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(148, 163, 184, 0.24)",
        }}
      >
        <Avatar
          src={logo48}
          alt="Firebelly Fitness Logo"
          sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Firebelly Fitness
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Training dashboard
          </Typography>
        </Box>
      </Box>
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
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "background.NavDrawer",
          backgroundColor: "background.NavDrawer",
          borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
          mb: 1,
        }}
      >
        <Container maxWidth="md">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                color="inherit"
                onClick={toggleDrawer}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "background.NavDrawer",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                }}
              >
                <NavIcon />
              </IconButton>
              <Button component={Link} to="/"
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
                sx={{
                  textTransform: "none",
                  px: 1,
                  minWidth: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: 'inherit',
                }}
              >
                <Avatar
                  src={logo48}
                  alt="Firebelly Fitness Logo"
                  sx={{ width: 32, height: 32 }}
                />
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                    Firebelly
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ letterSpacing: 0.4, textTransform: "uppercase" }}
                    color="text.secondary"
                  >
                    Fitness app
                  </Typography>
                </Box>
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {user._id && (
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" fontWeight={500}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.isTrainer ? "Trainer" : "Athlete"}
                  </Typography>
                </Box>
              )}
              <IconButton
                onClick={handleMenu}
                sx={{
                  maxHeight: "40px",
                  maxWidth: "40px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                }}
              >
                <Avatar
                  src={
                    user.profilePicture && `${serverURL}/user/profilePicture/${user.profilePicture}`
                  }
                  sx={{ maxHeight: "36px", maxWidth: "36px" }}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </IconButton>
            </Box>
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
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Account Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleOpenGymBarCodeDialog}>
                <ListItemIcon>
                  <QrCodeScannerIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Gym Barcode</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Dialog
        open={openGymBarCodeDialog}
        onClose={handleCloseGymBarCodeDialog}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 420,
            borderRadius: 4,
            backgroundColor: "background.paper",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" textAlign="center">
            Gym Barcode
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: "background.default",
              }}
            >
              <Barcode value={user.gymBarcode} height={80} />
            </Box>
          </Box>
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
