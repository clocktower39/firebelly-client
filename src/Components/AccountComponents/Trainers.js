import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { AddCircle, Delete, Done, PendingActions } from "@mui/icons-material";
import { requestMyTrainers, removeTrainer } from "../../Redux/actions";
import SearchTrainerDialog from "./SearchTrainerDialog";

export default function Trainers() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const myTrainers = useSelector((state) => state.myTrainers);
  const [openSearch, setOpenSearch] = useState(false);

  const currentRelationshipIds = myTrainers.map((trainer) => trainer.trainerId);

  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);

  useEffect(() => {
    dispatch(requestMyTrainers()).then(setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const RelationshipTrainerCard = (props) => {
    const { trainer } = props;
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

    const handleDeleteConfirmationOpen = () => setDeleteConfirmationOpen(true);
    const handleDeleteConfirmationClose = () => setDeleteConfirmationOpen(false);

    return (
      <Grid container item xs={12}>
        <Card sx={{ width: "100%" }}>
          <CardHeader
            avatar={
              <Avatar aria-label="recipe">
                {trainer.firstName[0]}
                {trainer.lastName[0]}
              </Avatar>
            }
            action={
              <>
                <IconButton aria-label="status" disableRipple>
                  {trainer.accepted ? <Done /> : <PendingActions />}
                </IconButton>
                <IconButton aria-label="status" onClick={handleDeleteConfirmationOpen}>
                  <Delete />
                </IconButton>
              </>
            }
            title={`${trainer.firstName} ${trainer.lastName}`}
            subheader={trainer.accepted ? "Accepted" : "Pending"}
          />
        </Card>
        <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
          <DialogTitle id="alert-dialog-title">
            <Grid container>
              <Grid container item xs={12}>
                Delete Confirmation
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid item container xs={12}>
                <Typography variant="body1">
                  Are you sure you would like the permanently delete this goal?
                </Typography>
              </Grid>
              <Grid item container xs={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid item>
                  <Button color="secondaryButton" variant="contained" onClick={handleDeleteConfirmationClose}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={() => dispatch(removeTrainer(trainer.trainerId))}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    );
  };

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container item xs={12} sx={{ padding: "15px" }}>
        <Typography color="primary.contrastText" variant="h5" gutterBottom>
          Trainers
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container item xs={12} sx={{ justifyContent: "center", paddingBottom: "15px" }}>
            {loading ? (
              <Box sx={{ width: "100%" }}>
                <LinearProgress />
              </Box>
            ) : (
              myTrainers.length > 0 &&
              myTrainers.map((t) => <RelationshipTrainerCard key={t.trainerId} trainer={t} />)
            )}
          </Grid>
          <Grid container sx={{ justifyContent: "center" }}>
            <Grid item>
              <IconButton onClick={handleOpenSearch}>
                <AddCircle />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <SearchTrainerDialog
        open={openSearch}
        handleClose={handleCloseSearch}
        currentRelationships={currentRelationshipIds}
      />
    </Container>
  );
}
