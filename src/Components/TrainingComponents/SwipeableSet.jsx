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
  Radio,
  RadioGroup,
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
import { ExerciseListAutocomplete, Transition } from "../../Pages/AppPages/Workout";

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

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const handleFeedbackDialogOpen = () => setFeedbackDialogOpen(true);
  const handleFeedbackDialogClose = () => setFeedbackDialogOpen(false);
  const [feedbackSelectedExercises, setFeedbackSelectedExercises] = useState([]); 

  useEffect(() => {
    const update = () => {
      ref.current.updateHeight();
    };

    // Initial update
    update();

    // Add resize event listener
    window.addEventListener("resize", update);

    // Cleanup resize listener on unmount
    return () => {
      window.removeEventListener("resize", update);
    };
  }, [localTraining, feedbackSelectedExercises, heightToggle]);

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
              <Grid container size={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
                  <Typography variant="body1">Feedback:</Typography>
                </Grid>
                <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                  <IconButton onClick={handleFeedbackDialogOpen} disabled >
                    <AddCircle />
                  </IconButton>
                  Choose Exercises
                </Grid>
                <Grid container size={12} sx={{ padding: "0px 25px" }}>
                  {feedbackSelectedExercises.map((exercise) => {
                    return <FeedbackExerciseInput exercise={exercise} />;
                  })}
                </Grid>
                <Grid container size={12} sx={{ padding: "30px 0" }}>
                  <TextField
                    label="Overall Feedback (Disabled, working out final details)"
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
          exerciseList={allExercises}
          feedbackSelectedExercises={feedbackSelectedExercises}
          setFeedbackSelectedExercises={setFeedbackSelectedExercises}
        />
      )}
    </Box>
  );
}

const FeedbackExerciseInput = ({ exercise }) => {
  const [feedbackDifficulty, setFeedbackDifficulty] = useState("");

  const handleFeedbackDifficultyChange = (event) => {
    setFeedbackDifficulty(event.target.value);
  };

  return (
    <Grid container size={12} key={exercise._id}>
      <Grid container size={12}>
        <Typography>{exercise.exerciseTitle}:</Typography>
      </Grid>
      <Grid container size={12} sx={{ padding: "0px 15px" }}>
        <Typography sx={{ mb: 1 }}>Rate Difficulty:</Typography>
        <RadioGroup
          row
          value={feedbackDifficulty}
          onChange={handleFeedbackDifficultyChange}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: { xs: "nowrap", sm: "nowrap" },
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <FormControlLabel
            value="tooEasy"
            control={
              <Radio
                checked={feedbackDifficulty === "tooEasy"}
                sx={{
                  "&.Mui-checked": {
                    color: "secondary.main",
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: feedbackDifficulty === "tooEasy" ? "secondary.main" : "text.primary",
                }}
              >
                Too Easy
              </Typography>
            }
          />
          <FormControlLabel
            value="perfect"
            control={
              <Radio
                checked={feedbackDifficulty === "perfect"}
                sx={{
                  "&.Mui-checked": {
                    color: "primary.main",
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: feedbackDifficulty === "perfect" ? "primary.main" : "text.primary",
                }}
              >
                Perfect
              </Typography>
            }
          />
          <FormControlLabel
            value="tooHard"
            control={
              <Radio
                checked={feedbackDifficulty === "tooHard"}
                sx={{
                  "&.Mui-checked": {
                    color: "#d32f2f",
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: feedbackDifficulty === "tooHard" ? "#d32f2f" : "text.primary", // custom red
                }}
              >
                Too Hard
              </Typography>
            }
          />
        </RadioGroup>
      </Grid>
      <Grid container size={12} sx={{ padding: "0px 15px" }}>
        <TextField label="Comments" fullWidth multiline minRows={3} />
      </Grid>
    </Grid>
  );
};

const FeedbackDialog = ({
  feedbackDialogOpen,
  handleFeedbackDialogClose,
  exerciseList,
  feedbackSelectedExercises,
  setFeedbackSelectedExercises,
}) => {
  const [selectedExercises, setSelectedExercises] = useState(feedbackSelectedExercises);

  const allSelected = selectedExercises.length === exerciseList.length;
  const someSelected = selectedExercises.length > 0 && !allSelected;

  const handleToggle = (exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((ex) => ex._id === exercise._id);
      return isSelected ? prev.filter((ex) => ex._id !== exercise._id) : [...prev, exercise];
    });
  };

  const handleToggleAll = () => {
    setSelectedExercises(allSelected ? [] : [...exerciseList]);
  };

  const handleConfirm = () => {
    setFeedbackSelectedExercises(selectedExercises);
    handleFeedbackDialogClose();
  };

  return (
    <Dialog
      open={feedbackDialogOpen}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { height: "80%" } }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleFeedbackDialogClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Select Exercises
          </Typography>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Toolbar>
      </AppBar>

      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleAll}
              />
            }
            label="Select All"
            sx={{ userSelect: "none" }}
          />
          <Divider sx={{ my: 1 }} />
          {exerciseList
            .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
            .map((exercise) => (
              <FormControlLabel
                key={exercise._id}
                control={
                  <Checkbox
                    checked={selectedExercises.some((ex) => ex._id === exercise._id)}
                    onChange={() => handleToggle(exercise)}
                  />
                }
                label={exercise.exerciseTitle}
                sx={{ userSelect: "none" }}
              />
            ))}
        </FormGroup>
      </DialogContent>
    </Dialog>
  );
};

export default SwipeableSet;
