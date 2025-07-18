import React, { useEffect, useState, useRef, Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormGroup,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MobileStepper,
  Slide,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AddCircle,
  RemoveCircle,
  Close as CloseIcon,
} from "@mui/icons-material";
import SwipeableViews from "react-swipeable-views";
import Exercise from "./Exercise";
import { ExerciseListAutocomplete, Transition, } from "../../Pages/AppPages/Workout";

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
    activeStep,
    setActiveStep,
  } = props;

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

  const handleWorkoutCompleteCheckbox = () => setWorkoutCompleteStatus((prev) => !prev);

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const handleFeedbackDialogOpen = () => setFeedbackDialogOpen(true);
  const handleFeedbackDialogClose = () => setFeedbackDialogOpen(false);

  const handleFeedbackKeyDown = (e) => {
    // Check if any of Enter, Shift+Enter, Backspace, or Delete is pressed to resize
    if (
      (e.key === "Enter" && !e.shiftKey) || // Regular Enter
      (e.key === "Enter" && e.shiftKey) || // Shift + Enter
      e.key === "Backspace" || // Backspace
      e.key === "Delete" // Delete
    ) {
      setHeightToggle((prev) => !prev);
    }
  };

  const handleFeedbackChange = (e) => {
    setWorkoutFeedback(e.target.value);
  };

  const allExercises = useMemo(() => {
    return localTraining.flatMap((group) => group.map((ex) => ex.exercise));
  }, [localTraining]);

  useEffect(() => {
    ref.current.updateHeight();
  }, [localTraining, heightToggle]);

  useEffect(() => {
    if (activeStep >= maxSteps - 1) {
      handleStepChange(maxSteps - 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleRemoveSet]);

  useEffect(() => {
    // maxSteps -2
    //  -1 for index correlation
    //  -1 for workout complete page
    handleStepChange(maxSteps - 2);
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
            <Grid size={12}>
              <Grid container size={12}>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
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
              <Grid container size={12}>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
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
        <Box sx={{ padding: "25px 0" }}>
          <Grid size={12}>
            <Grid container size={12}>
              <Grid container size={12} sx={{ justifyContent: "center" }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={workoutCompleteStatus}
                        onClick={handleWorkoutCompleteCheckbox}
                      />
                    }
                    label="Workout Complete"
                  />
                </FormGroup>
              </Grid>
              <Grid container size={12} sx={{ justifyContent: "center" }}>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
                  <Typography variant="body1">Feedback:</Typography>
                </Grid>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
                  <Button disabled onClick={handleFeedbackDialogOpen}>Add Exercise</Button>
                </Grid>
                <TextField
                  label="Overall Feedback"
                  value={workoutFeedback}
                  fullWidth
                  multiline
                  minRows={5}
                  onKeyDown={handleFeedbackKeyDown}
                  onChange={handleFeedbackChange}
                  disabled
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SwipeableViews>

      {confirmDialogOpen && (
        <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
          <DialogTitle>
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
                  Are you sure you would like to remove the circuit?
                </Typography>
              </Grid>
              <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid>
                  <Button
                    color="secondaryButton"
                    variant="contained"
                    onClick={handleConfirmDialogClose}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="contained" onClick={handleDeleteConfirmationSubmit}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}

      {feedbackDialogOpen && (
        <FeedbackDialog
          feedbackDialogOpen={feedbackDialogOpen}
          handleFeedbackDialogClose={handleFeedbackDialogClose}
          user={workoutUser}
          exerciseList={allExercises}
        />
      )}
    </Box>
  );
}

const FeedbackDialog = ({
  feedbackDialogOpen,
  handleFeedbackDialogClose,
  exerciseList,
  confirmedFeedbackExerciseList,
  user,
}) => {
  const [selectedExercises, setSelectedExercises] = useState([]);

  return (
    <Dialog
      open={feedbackDialogOpen}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          height: "80%",
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleFeedbackDialogClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Select Exercises
          </Typography>
          <Button
            variant="contained"
            // onClick={() => confirmedFeedbackExerciseList(selectedExercises, setSelectedExercises, selectedExercisesSetCount, setSelectedExercisesSetCount)}
          >
            Confirm
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <ExerciseListAutocomplete
          exerciseList={exerciseList}
          selectedExercises={selectedExercises}
          setSelectedExercises={setSelectedExercises}
          disableCloseOnSelect={true}
        />
        <Grid container size={12}>
          {selectedExercises.length > 0 && (
            <List sx={{ bgcolor: "background.paper", width: "100%" }}>
              {selectedExercises.map((exercise, exerciseIndex, exercises) => {
                const reduxExercise = exerciseList.find((ex) => ex._id === exercise._id);
                const history = reduxExercise?.history?.[user._id];

                return (
                  <Fragment key={`${exercise.exerciseTitle}-${exerciseIndex}`}>
                    <ListItem>
                      <ListItemText
                        secondary={
                          history &&
                          history
                            .slice(history.length - 3, history.length)
                            .map((historyItem, historyItemIndex) => (
                              <Typography
                                variant="subtitle1"
                                key={`${historyItem._id}-${historyItemIndex}`}
                              >
                                <strong>{dayjs(historyItem.date).format("MM/DD/YYYY")}:</strong>{" "}
                                {historyItem.achieved.weight.join(", ")}
                              </Typography>
                            ))
                        }
                      >
                        {exercise?.exerciseTitle}
                      </ListItemText>
                    </ListItem>
                    {exerciseIndex !== exercises.length - 1 && <Divider component="li" />}
                  </Fragment>
                );
              })}
            </List>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default SwipeableSet;
