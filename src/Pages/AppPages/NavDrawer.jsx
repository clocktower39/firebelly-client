import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
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
  Assessment as ProgressIcon,
  ReceiptLong as SessionIcon,
  CalendarMonth as CalendarIcon,
  Assignment as GoalsIcon,
  Settings as AccountIcon,
  Groups as ClientsIcon,
  Groups as GroupsIcon,
  PersonAddAlt1 as SignUpIcon,
  Login as LoginIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from "@mui/icons-material";
import logo48 from "../../img/logo48.png";
import { serverURL, loginJWT, logoutUser } from "../../Redux/actions";
import Barcode from "react-barcode";

export default function NavDrawer() {
  const user = useSelector((state) => state.user);
  const goals = useSelector((state) => state.goals);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roleLabel = user.viewOnly
    ? "Guardian (view)"
    : user.isTrainer
    ? "Trainer"
    : user.accountType === "guardian"
    ? "Guardian"
    : "Athlete";

  // Count unseen achieved goals
  const unseenAchievements = goals?.filter(
    (goal) => goal.achievedDate && !goal.achievementSeen
  )?.length || 0;

  const pages = [
    {
      title: "Home",
      to: "/",
      icon: <HomeIcon />,
    },
    {
      title: "Scheduling",
      to: "/sessions",
      icon: <CalendarIcon />,
    },
    {
      title: "Workout Calendar",
      to: "/calendar",
      icon: <CalendarIcon />,
    },
    {
      title: "Goals",
      to: "/goals",
      icon: <GoalsIcon />,
      badge: unseenAchievements,
    },
    {
      title: "Progress",
      to: "/progress",
      icon: <ProgressIcon />,
    },
    {
      title: "Groups",
      to: "/groups",
      icon: <GroupsIcon />,
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
      title: "Programs",
      to: "/programs",
      icon: <GoalsIcon />,
    },
    {
      title: "Workout Templates",
      to: "/workout-templates",
      icon: <CalendarIcon />,
    },
    {
      title: "Session Counter",
      to: "/session-counter",
      icon: <SessionIcon />,
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

  const handleReturnToGuardian = () => {
    const guardianAccess = localStorage.getItem("JWT_GUARDIAN_AUTH_TOKEN");
    const guardianRefresh = localStorage.getItem("JWT_GUARDIAN_REFRESH_TOKEN");
    if (guardianAccess) {
      localStorage.setItem("JWT_AUTH_TOKEN", guardianAccess);
    }
    if (guardianRefresh) {
      localStorage.setItem("JWT_REFRESH_TOKEN", guardianRefresh);
    }
    localStorage.removeItem("JWT_VIEW_ONLY");
    localStorage.removeItem("JWT_GUARDIAN_AUTH_TOKEN");
    localStorage.removeItem("JWT_GUARDIAN_REFRESH_TOKEN");

    if (guardianAccess) {
      dispatch(loginJWT(guardianAccess));
      navigate("/");
    } else {
      dispatch(logoutUser());
      navigate("/login");
    }
  };

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
          {user.viewOnly && (
            <Box sx={{ px: 2, py: 1, backgroundColor: "rgba(234, 179, 8, 0.15)" }}>
              <Typography variant="caption" color="text.primary">
                Viewing child activity (read-only)
              </Typography>
              <Button size="small" onClick={handleReturnToGuardian} sx={{ mt: 1 }}>
                Return to Guardian
              </Button>
            </Box>
          )}
          <List>
            {pages.map((page, index) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton component={Link} to={page.to}>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.title} />
                  {page.badge > 0 && (
                    <Badge badgeContent={page.badge} color="error" sx={{ mr: 2 }} />
                  )}
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
                <Badge badgeContent={unseenAchievements} color="error">
                  <NavIcon />
                </Badge>
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
                    {roleLabel}
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
            height: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" textAlign="center">
            Gym Barcode
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container sx={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Box sx={{ transform: "scale(2)" }}>
              <Barcode value={user.gymBarcode} />
            </Box>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', alignItems: 'center', }}>
          <Button variant="contained" onClick={handleCloseGymBarCodeDialog} >
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
