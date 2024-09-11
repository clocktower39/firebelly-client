import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Typography,
  IconButton,
  MobileStepper,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AddCircle,
  RemoveCircle,
} from "@mui/icons-material";
import SwipeableViews from "react-swipeable-views";
import Exercise from "./Exercise";

function SwipeableSet(props) {
  const {
    workoutUser,
    localTraining,
    newSet,
    removeSet,
    removeExercise,
    setLocalTraining,
    newExercise,
    toggleNewSet,
    toggleRemoveSet,
    maxSteps,
    selectedDate,
    size,
    workoutCompleteStatus,
    setWorkoutCompleteStatus,
    workoutFeedback,
    setWorkoutFeedback,
  } = props;
  const [activeStep, setActiveStep] = useState(0);
  const [heightToggle, setHeightToggle] = useState(true);
  const ref = useRef(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({
    confirmFuction: null,
    index: null,
  });

  const handleConfirmDialogOpen = (removeSet, index) => {
    setConfirmDialogData({
      confirmFunction: removeSet,
      index,
    });
    setConfirmDialogOpen((prev) => true);
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen((prev) => false);

  const handleDeleteConfirmationSubmit = () => {
    confirmDialogData.confirmFunction(confirmDialogData.index);
    handleConfirmDialogClose();
  };

  const handleWorkoutCompleteCheckbox = () => setWorkoutCompleteStatus(prev => !prev);

  const handleFeedbackKeyDown = (e) => {
    // Check if any of Enter, Shift+Enter, Backspace, or Delete is pressed to resize
    if (
      (e.key === 'Enter' && !e.shiftKey) || // Regular Enter
      (e.key === 'Enter' && e.shiftKey) ||  // Shift + Enter
      e.key === 'Backspace' ||              // Backspace
      e.key === 'Delete'                    // Delete
    ) {
      setHeightToggle((prev) => !prev);
    }
  }   

  const handleFeedbackChange = (e) => {
    setWorkoutFeedback(e.target.value);
  }

  useEffect(() => {
    ref.current.updateHeight();
  }, [localTraining, heightToggle]);

  useEffect(() => {
    if (activeStep >= maxSteps - 1) {
      handleStepChange(maxSteps - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleRemoveSet]);

  useEffect(() => {
    handleStepChange(maxSteps - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleNewSet]);

  useEffect(() => {
    handleStepChange(0);
  }, [selectedDate]);

  return (
    <Box sx={{ maxWidth: "100%", minHeight: "100%", flexGrow: 1 }}>
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            Next
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
      <SwipeableViews
        axis="x"
        index={activeStep}
        onChangeIndex={handleStepChange}
        animateHeight
        ref={ref}
      >
        {localTraining.map((group, index) => (
          <div key={`training-indexes-${index}/${localTraining.length}`}>
            <Grid item xs={12}>
              <Grid container item xs={12}>
                <Grid item container xs={12} sx={{ justifyContent: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Tooltip title="Remove circuit">
                      <IconButton onClick={() => handleConfirmDialogOpen(removeSet, index)}>
                        <RemoveCircle />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="h5">Circuit {index + 1}</Typography>
                    <Tooltip title="Add a new circuit">
                      <IconButton onClick={newSet}>
                        <AddCircle />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
              {group.length > 0 &&
                group.map((exercise, exerciseIndex) => (
                  <Exercise
                    key={`exercise-${exercise._id}-${exerciseIndex}`}
                    workoutUser={workoutUser}
                    exercise={exercise}
                    setIndex={index}
                    exerciseIndex={exerciseIndex}
                    removeExercise={removeExercise}
                    localTraining={localTraining}
                    setLocalTraining={setLocalTraining}
                    setHeightToggle={setHeightToggle}
                    size={size}
                  />
                ))}
              <Grid container item xs={12}>
                <Grid container item xs={12} sx={{ justifyContent: "center" }}>
                  <Tooltip title="Add a new exercise to the current set">
                    <IconButton onClick={() => newExercise(index)}>
                      <AddCircle />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </div>
        ))}
        <Box sx={{ padding: '25px 0'}}>
          <Grid item xs={12}>
            <Grid container item xs={12}>
              <Grid item container xs={12} sx={{ justifyContent: "center" }}>
                <FormGroup>
                  <FormControlLabel control={<Checkbox checked={workoutCompleteStatus} onClick={handleWorkoutCompleteCheckbox} />} label="Workout Complete" />
                </FormGroup>
              </Grid>
              <Grid item container xs={12} sx={{ justifyContent: "center" }}>
                <Grid item container xs={12} sx={{ justifyContent: "center",}}>
                  <TextField label="Feedback" value={workoutFeedback} fullWidth multiline minRows={5} onKeyDown={handleFeedbackKeyDown} onChange={handleFeedbackChange}/>
                </Grid>
                {/* {localTraining.map((group, index) => (
                  <Grid container item xs={12}>
                    {group.length > 0 &&
                      group.map((exercise, exerciseIndex) => (
                        <>
                          <Grid
                            container
                            item
                            xs={8}
                            sx={{ justifyContent: "flex-start", alignContent: "center" }}
                          >
                            <Typography color="text.primary" variant="h6">
                              {exercise.exercise}
                            </Typography>
                          </Grid>
                        </>
                      ))}
                  </Grid>
                ))} */}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SwipeableViews>

      {confirmDialogOpen && (
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
                  Are you sure you would like to remove the circuit?
                </Typography>
              </Grid>
              <Grid item container xs={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid item>
                  <Button
                    color="secondaryButton"
                    variant="contained"
                    onClick={handleConfirmDialogClose}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={handleDeleteConfirmationSubmit}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default SwipeableSet;
