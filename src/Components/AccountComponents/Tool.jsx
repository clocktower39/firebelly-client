import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestMyExerciseList, upateExerciseName } from "../../Redux/actions";
import {
  Autocomplete,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function AccountSettings() {
  const dispatch = useDispatch();
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogLoading, setConfirmDialogLoading] = useState(false);
  const [mainTitle, setMainTitle] = useState("");
  const [duplicateTitle, setDuplicateTitle] = useState("");

  const handleConfirmDialogOpen = () => {
    if (mainTitle !== "" && duplicateTitle !== "") {
      setConfirmDialogOpen((prev) => true);
    }
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen((prev) => false);

  const handleSubmit = () => {
    if (exerciseList.includes(duplicateTitle) && duplicateTitle !== "") {
      setConfirmDialogLoading(true);
      dispatch(upateExerciseName(duplicateTitle, mainTitle)).then(() => {
        setMainTitle("");
        setDuplicateTitle("");
        handleConfirmDialogClose();
        setConfirmDialogLoading(false);
      });
    }
  };

  useEffect(() => {
    dispatch(requestMyExerciseList());
  }, [dispatch]);

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container item xs={12} sx={{ padding: "15px" }}>
        <Typography color="primary.contrastText" variant="h5" gutterBottom>
          Merge Exercise Title Tool
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container item xs={12} sx={{ }}>
            <Typography color="primary.contrastText" variant="caption" sx={{ padding: '5px', fontWeight: '600', fontSize: '8px',}}>Body Position (Elevated, Hanging, Inverted, Kneeling, Lying, Prone, Seated, Standing, Stationary, Walking, etc.)</Typography>
            <Typography color="primary.contrastText" variant="caption" sx={{ padding: '5px', fontWeight: '600', fontSize: '8px',}}>Equipment Used (Barbell, Dumbbell, Cable, etc.)</Typography>
            <Typography color="primary.contrastText" variant="caption" sx={{ padding: '5px', fontWeight: '600', fontSize: '8px',}}>Extremity Position (Overhand-Grip, Neutral-Grip, Narrow-Stance, etc.)</Typography>
            <Typography color="primary.contrastText" variant="caption" sx={{ padding: '5px', fontWeight: '600', fontSize: '8px',}}>Movement Pattern (Alternating, Unilateral)</Typography>
            <Typography color="primary.contrastText" variant="caption" sx={{ padding: '5px', fontWeight: '600', fontSize: '8px',}}>Base Exercise Name (Squat, Chest Press, Deadlift, etc.)</Typography>
          </Grid>

          <Grid container item xs={12} sx={{ justifyContent: "center" }}>
            <Typography color="primary.contrastText" variant="body1">
              Be exetremly careful. <br />
              If you make a mistake each entry must be manually fixed.
            </Typography>
          </Grid>
          <Grid container item xs={12} sx={{ justifyContent: "center" }}>
            <Autocomplete
              id="tags-filled"
              disableCloseOnSelect
              fullWidth
              freeSolo
              value={mainTitle}
              defaultValue={mainTitle}
              options={exerciseList
                .filter((a) => a !== "")
                .sort((a, b) => a > b)
                .map((option) => option)}
              onChange={(e, getTagProps) => setMainTitle(getTagProps.replace(/\s+/g, " ").trim())}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Main Exercise Title"
                  placeholder="Exercises"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
          </Grid>
          <Grid container item xs={12} sx={{ justifyContent: "center" }}>
            <Autocomplete
              id="tags-filled"
              disableCloseOnSelect
              fullWidth
              value={duplicateTitle}
              defaultValue={duplicateTitle}
              options={exerciseList
                .filter((a) => a !== "")
                .sort((a, b) => a > b)
                .map((option) => option)}
              onChange={(e, getTagProps) => setDuplicateTitle(getTagProps)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Duplicate Exercise Title"
                  placeholder="Exercises"
                  InputProps={{
                    ...params.InputProps,
                  }}
                />
              )}
            />
          </Grid>
          <Grid container item xs={12} sx={{ justifyContent: "center" }} spacing={1}>
            <Grid item>
              <Button variant="contained" onClick={handleConfirmDialogOpen}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>
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
                Are you sure you would like to rename the exercises? This can not be reversed.
              </Typography>
            </Grid>
            <Grid item container xs={12} spacing={2} sx={{ justifyContent: "center" }}>
              <Grid item>
                <Button
                  color="secondaryButton"
                  variant="contained"
                  onClick={handleConfirmDialogClose}
                  disabled={confirmDialogLoading}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={handleSubmit} disabled={confirmDialogLoading}>
                  Confirm
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
