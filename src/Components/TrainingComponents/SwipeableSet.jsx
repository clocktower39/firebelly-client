import React, { useEffect, useState, useRef, Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import { serverURL } from "../../Redux/actions";
import {
  AppBar,
  Avatar,
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
  MobileStepper,
  Paper,
  Radio,
  RadioGroup,
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
import dayjs from "dayjs";

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

  const allExercises = useMemo(() => {
    return localTraining.flatMap((group) => group.map((ex) => ex));
  }, [localTraining]);

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const handleFeedbackDialogOpen = () => setFeedbackDialogOpen(true);
  const handleFeedbackDialogClose = () => setFeedbackDialogOpen(false);
  const [feedbackSelectedExercises, setFeedbackSelectedExercises] = useState([...allExercises]);

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
    handleStepChange(2);
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
                <Grid container size={12} sx={{ padding: "30px 0" }}>
                  <FeedbackWorkoutInput workoutFeedback={workoutFeedback} setWorkoutFeedback={setWorkoutFeedback} />
                  {/* <TextField
                    label="Overall Feedback"
                    value={workoutFeedback}
                    fullWidth
                    multiline
                    minRows={5}
                    onKeyDown={handleFeedbackKeyDown}
                    onChange={handleFeedbackChange}
                  /> */}
                </Grid>
                {/* <Grid container size={12} sx={{ justifyContent: "center", alignItems: "center" }}>
                  <IconButton onClick={handleFeedbackDialogOpen} >
                    <AddCircle />
                  </IconButton>
                  Choose Exercises
                </Grid> */}
                {/* <Grid container size={12} sx={{ padding: "0px 25px" }}>
                  {feedbackSelectedExercises.map((exercise) => {
                    return <FeedbackExerciseInput exercise={exercise} />;
                  })}
                </Grid> */}
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
const FeedbackWorkoutInput = ({ workoutFeedback, setWorkoutFeedback, }) => {
  const user = useSelector((state) => state.user);
  const [feedbackDifficulty, setFeedbackDifficulty] = useState(Number(workoutFeedback.difficulty) || 1);

  const handleFeedbackDifficultyChange = (event) => {
    const newValue = Number(event.target.value);
    setFeedbackDifficulty(newValue);
    setWorkoutFeedback((prev) => ({
      ...prev,
      difficulty: newValue,
    }));
  };

  const [commentText, setCommentText] = useState("");

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

  const handleMessageSubmit = () => {
    if (!commentText.trim()) return;
    const newComment = {
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, profilePicture: user.profilePicture },
      text: commentText.trim(),
      timestamp: new Date(),
    };
    setWorkoutFeedback((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setCommentText("");
  };


  return (
    <Grid container size={12} component={Paper} spacing={1} sx={{ backgroundColor: '#282828', padding: '15px 7.5px', }}>
      <Grid container size={12}>
        <Typography>Overall Workout Feedback:</Typography>
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
            value={0}
            control={
              <Radio
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
                  color: feedbackDifficulty === 0 ? "secondary.main" : "text.primary",
                }}
              >
                Too Easy
              </Typography>
            }
          />
          <FormControlLabel
            value={1}
            control={
              <Radio
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
                  color: feedbackDifficulty === 1 ? "primary.main" : "text.primary",
                }}
              >
                Perfect
              </Typography>
            }
          />
          <FormControlLabel
            value={2}
            control={
              <Radio
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
                  color: feedbackDifficulty === 2 ? "#d32f2f" : "text.primary", // custom red
                }}
              >
                Too Hard
              </Typography>
            }
          />
        </RadioGroup>
      </Grid>
      {workoutFeedback.comments.map(comment => {
        return (
          <Grid container size={12} sx={{ padding: '7.5px 0', }}>
            <Grid container size={2} sx={{ justifyContent: 'center', }}>
              <Avatar src={comment.user.profilePicture ? `${serverURL}/user/profilePicture/${comment.user.profilePicture}` : null} />
            </Grid>
            <Grid container size={8} spacing={0} >
              <Grid container size={12} spacing={1}>
                <Typography variant="body2" display="inline">
                  {comment.user.firstName}{" "}{comment.user.lastName}
                </Typography>
                <Typography
                  variant="subtitle2"
                  display="inline"
                  sx={{
                    opacity: ".33",
                  }}
                >
                  {dayjs(comment.timestamp).format("MM/DD/YYYY h:mm:ss A")}
                </Typography>
              </Grid>
              <Grid container size={12}>
                <Typography variant="body1" display="block">
                  {comment.text}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )
      })}
      <Grid container size={12} sx={{ padding: "0px 15px" }}>
        <TextField
          label="Add comment..."
          value={commentText}
          onKeyDown={handleFeedbackKeyDown}
          onChange={(e) => setCommentText(e.target.value)}
          fullWidth
          multiline
          slotProps={{
            input: {
              endAdornment: (
                <Button variant="contained" onClick={handleMessageSubmit}>
                  Submit
                </Button>
              ),
            },
          }}
        />

      </Grid>
    </Grid>
  );
};

const FeedbackExerciseInput = ({ exercise }) => {
  const [feedbackDifficulty, setFeedbackDifficulty] = useState(exercise.feedback.difficulty);

  const handleFeedbackDifficultyChange = (event) => {
    setFeedbackDifficulty(Number(event.target.value));
  };

  return (
    <Grid container size={12} key={exercise._id} component={Paper} spacing={1} sx={{ backgroundColor: '#282828', padding: '15px 7.5px', }}>
      <Grid container size={12}>
        <Typography>{exercise.exercise.exerciseTitle}:</Typography>
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
            value={0}
            control={
              <Radio
                checked={feedbackDifficulty === 0}
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
                  color: feedbackDifficulty === 0 ? "secondary.main" : "text.primary",
                }}
              >
                Too Easy
              </Typography>
            }
          />
          <FormControlLabel
            value={1}
            control={
              <Radio
                checked={feedbackDifficulty === 1}
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
                  color: feedbackDifficulty === 1 ? "primary.main" : "text.primary",
                }}
              >
                Perfect
              </Typography>
            }
          />
          <FormControlLabel
            value={2}
            control={
              <Radio
                checked={feedbackDifficulty === 2}
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
                  color: feedbackDifficulty === 2 ? "#d32f2f" : "text.primary", // custom red
                }}
              >
                Too Hard
              </Typography>
            }
          />
        </RadioGroup>
      </Grid>
      {exercise.feedback.comments.map(comment => {
        return (
          <Grid container sx={{ padding: '25px 0', }}>
            <Grid container size={2} sx={{ justifyContent: 'center', }}>
              <Avatar src={comment.user.profilePicture ? `${serverURL}/user/profilePicture/${comment.user.profilePicture}` : null} />
            </Grid>
            <Grid container size={8}>
              <Typography variant="body2" display="inline">
                {comment.user.firstName}{" "}{comment.user.lastName}
              </Typography>
              <Typography
                variant="subtitle2"
                display="inline"
                sx={{
                  opacity: ".33",
                }}
              >
                {dayjs(comment.timestamp).format("MM/DD/YYYY h:mm:ss A")}
              </Typography>
              <Typography variant="body1" display="block">
                {comment.text}
              </Typography>
            </Grid>
          </Grid>
        )
      })}
      <Grid container size={12} sx={{ padding: "0px 15px" }}>
        <TextField label="Add comment..." fullWidth multiline
          slotProps={{
            input: {
              endAdornment: (
                <Button variant="contained" color="primary" onClick={(e) => handleMessageSubmit(e)}>
                  Submit
                </Button>
              ),
            }
          }} />
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
            .map((exercise) => (
              <FormControlLabel
                key={exercise.exercise._id}
                control={
                  <Checkbox
                    checked={selectedExercises.some((ex) => ex.exercise._id === exercise.exercise._id)}
                    onChange={() => handleToggle(exercise)}
                  />
                }
                label={exercise.exercise.exerciseTitle}
                sx={{ userSelect: "none" }}
              />
            ))}
        </FormGroup>
      </DialogContent>
    </Dialog>
  );
};

export default SwipeableSet;
