import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { AddCircle, Delete, Done, Message as MessageIcon, PendingActions } from "@mui/icons-material";
import { requestMyTrainers, removeRelationship, updateMetricsApproval, serverURL } from "../../Redux/actions";
import SearchTrainerDialog from "./SearchTrainerDialog";
import Messages from "../Messages";
import TrainerConnections from "./TrainerConnections";


export default function Trainers({ socket }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.user);
  const myTrainers = useSelector((state) => state.myTrainers);
  const [openSearch, setOpenSearch] = useState(false);
  const [creditByTrainer, setCreditByTrainer] = useState({});
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState("");

  const currentRelationshipIds = myTrainers.map((trainer) => trainer.trainer);

  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    dispatch(requestMyTrainers()).then(setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?._id || !myTrainers?.length) {
      setCreditByTrainer({});
      return;
    }
    let isActive = true;
    const loadCredits = async () => {
      setCreditsLoading(true);
      setCreditsError("");
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const acceptedTrainers = myTrainers.filter((trainer) => trainer.accepted);
      const results = await Promise.all(
        acceptedTrainers.map(async (trainer) => {
          try {
            const response = await fetch(`${serverURL}/billing/summary`, {
              method: "post",
              dataType: "json",
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: bearer,
              },
              body: JSON.stringify({
                trainerId: trainer.trainer,
                clientId: user._id,
              }),
            });
            const data = await response.json();
            if (data?.error) {
              throw new Error(data.error);
            }
            return { trainerId: trainer.trainer, summary: data };
          } catch (err) {
            return {
              trainerId: trainer.trainer,
              error: err.message || "Unable to load credits.",
            };
          }
        })
      );
      if (!isActive) return;
      const next = {};
      const errors = [];
      results.forEach(({ trainerId, summary, error }) => {
        if (summary) next[trainerId] = summary;
        if (error) errors.push(error);
      });
      setCreditByTrainer(next);
      setCreditsError(errors[0] || "");
      setCreditsLoading(false);
    };

    loadCredits();
    return () => {
      isActive = false;
    };
  }, [myTrainers, user?._id]);

  const RelationshipTrainerCard = (props) => {
    const { trainer } = props;
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [openMessageDrawer, setOpenMessageDrawer] = useState(false);
  
    const handleMessageDrawerOpen = () => setOpenMessageDrawer(true)
    const handleMessageDrawerClose = () => setOpenMessageDrawer(false)

    const handleDeleteConfirmationOpen = () => setDeleteConfirmationOpen(true);
    const handleDeleteConfirmationClose = () => setDeleteConfirmationOpen(false);

    const lastActivityLabel = formatDate(trainer.lastActivityAt);
    const permissionLabel = trainer.metricsApprovalRequired
      ? "Metrics approval required"
      : "Metrics auto-approve enabled";
    const creditSummary = creditByTrainer?.[trainer.trainer];

    return (
      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardHeader
            avatar={
              <Avatar 
              src={
                trainer.profilePicture && `${serverURL}/user/profilePicture/${trainer.profilePicture}`
              }>
                {trainer.firstName[0]}
                {trainer.lastName[0]}
              </Avatar>
            }
            action={
              <>
                <IconButton onClick={handleMessageDrawerOpen}>
                  <MessageIcon />
                </IconButton>
                <IconButton aria-label="status" disableRipple>
                  {trainer.accepted ? <Done /> : <PendingActions />}
                </IconButton>
                <IconButton aria-label="status" onClick={handleDeleteConfirmationOpen}>
                  <Delete />
                </IconButton>
              </>
            }
            title={`${trainer.firstName} ${trainer.lastName}`}
            subheader={
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {trainer.accepted ? "Accepted" : "Pending"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last activity: {lastActivityLabel}
                </Typography>
              </Stack>
            }
          />
          {trainer.accepted && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Trainer body metric entries
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!trainer.metricsApprovalRequired}
                      onChange={(e) =>
                        dispatch(updateMetricsApproval(trainer.trainer, !e.target.checked))
                      }
                    />
                  }
                  label={
                    trainer.metricsApprovalRequired
                      ? "Auto-Approve Disabled"
                      : "Auto-Approve Enabled"
                  }
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Permissions: {permissionLabel}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                <Chip
                  size="small"
                  label={
                    creditsLoading
                      ? "Credits: loading…"
                      : `Credits: ${creditSummary?.remainingSessions ?? 0}`
                  }
                  color={
                    creditSummary?.remainingSessions <= 0 && !creditsLoading
                      ? "warning"
                      : "success"
                  }
                  variant="outlined"
                />
                {creditsError && (
                  <Typography variant="caption" color="text.secondary">
                    {creditsError}
                  </Typography>
                )}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  component={Link}
                  to={`/trainer-store?trainer=${trainer.trainer}`}
                >
                  Purchase Sessions
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`/sessions?trainer=${trainer.trainer}`}
                >
                  Book Session
                </Button>
              </Stack>
            </Box>
          )}
        </Card>
        <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
          <DialogTitle id="alert-dialog-title">
            <Grid container>
              <Grid container size={12}>
                Delete Confirmation
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid container size={12}>
                <Typography variant="body1">
                  Are you sure you would like to remove this trainer?
                </Typography>
              </Grid>
              <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid >
                  <Button color="secondaryButton" variant="contained" onClick={handleDeleteConfirmationClose}>
                    Cancel
                  </Button>
                </Grid>
                <Grid >
                  <Button variant="contained" onClick={() => dispatch(removeRelationship(trainer.trainer, user._id))}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
        <Messages open={openMessageDrawer} handleClose={handleMessageDrawerClose} socket={socket} />
      </Grid>
    );
  };

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container size={12} sx={{ padding: "15px" }}>
        <Typography color="primary.contrastText" variant="h5" gutterBottom>
          Trainers
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container size={12}>
            <Typography variant="h6" color="primary.contrastText">
              My Trainers
            </Typography>
          </Grid>
          <Grid container size={12} sx={{ justifyContent: "center", paddingBottom: "15px" }}>
            {loading ? (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            ) : (
              myTrainers?.map((t) => <RelationshipTrainerCard key={t.trainer} trainer={t} />)
            )}
          </Grid>
          <Grid container sx={{ justifyContent: "center" }}>
            <Grid >
              <IconButton onClick={handleOpenSearch}>
                <AddCircle />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <TrainerConnections embedded socket={socket} />
      <SearchTrainerDialog
        open={openSearch}
        handleClose={handleCloseSearch}
        currentRelationships={currentRelationshipIds}
      />
    </Container>
  );
}
