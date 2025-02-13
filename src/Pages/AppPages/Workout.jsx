import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Modal,
  Slide,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack, Close as CloseIcon, Settings } from "@mui/icons-material";
import SelectedDate from "../../Components/SelectedDate";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import { WorkoutOptionModalView } from "../../Components/WorkoutOptionModal";
import { requestTraining, updateTraining, getExerciseList, serverURL } from "../../Redux/actions";
import Loading from "../../Components/Loading";
import LoadingPage from "../../Components/LoadingPage";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const classes = {
  modalStyle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  },
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Workout(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const training = useSelector((state) => state.training);
  const [size = 900, setBorderHighlight] = useOutletContext();

  const isPersonalWorkout = useCallback(
    () => user._id.toString() === training?.user?._id?.toString(),
    [user._id, training?.user?._id]
  );

  const [localTraining, setLocalTraining] = useState([]);
  const [trainingCategory, setTrainingCategory] = useState([]);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [workoutCompleteStatus, setWorkoutCompleteStatus] = useState(training?.complete || false);
  const [loading, setLoading] = useState(true);
  const [workoutFeedback, setWorkoutFeedback] = useState(training?.feedback || "");
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedExercisesSetCount, setSelectedExercisesSetCount] = useState(4);
  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState("sm");

  const handleMaxWidthChange = (event) => {
    setMaxWidth(event.target.value);
  };

  const handleFullWidthChange = (event) => {
    setFullWidth(event.target.checked);
  };

  const handleSelectedExercisesSetCountChange = (e) =>
    setSelectedExercisesSetCount(Number(e.target.value));

  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps);
  };

  const handleTitleChange = (e) => {
    setTrainingTitle(e.target.value);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  const handleAddExerciseOpen = () => setAddExerciseOpen(true);
  const handleAddExerciseClose = () => setAddExerciseOpen(false);

  const categories = [
    "Abdominals",
    "Back",
    "Biceps",
    "Calves",
    "Chest",
    "Core",
    "Forearms",
    "Full Body",
    "Hamstrings",
    "Legs",
    "Quadriceps",
    "Shoulders",
    "Triceps",
  ];

  const newExercise = (index) => {
    handleAddExerciseOpen();
  };

  // Create a new exercise on the current set
  const confirmedNewExercise = (index, setCount) => {
    if (selectedExercises.length > 0) {
      const newTraining = localTraining.map((group, i) => {
        if (index === i) {
          selectedExercises.forEach((exercise) => {
            group.push({
              exercise: exercise,
              exerciseType: "Reps",
              goals: {
                sets: setCount,
                minReps: Array(setCount).fill(0),
                maxReps: Array(setCount).fill(0),
                exactReps: Array(setCount).fill(0),
                weight: Array(setCount).fill(0),
                percent: Array(setCount).fill(0),
                seconds: Array(setCount).fill(0),
              },
              achieved: {
                sets: 0,
                reps: Array(setCount).fill(0),
                weight: Array(setCount).fill(0),
                percent: Array(setCount).fill(0),
                seconds: Array(setCount).fill(0),
              },
            });
          });
        }
        return group;
      });
      dispatch(
        updateTraining(training._id, {
          ...training,
          category: [...trainingCategory],
          training: [...newTraining],
        })
      );
    }
    setSelectedExercises([]);
    setSelectedExercisesSetCount(4);
    handleAddExerciseClose();
  };

  // Create a new set on the current day
  const newSet = () => {
    setLocalTraining((prev) => {
      prev.push([]);
      return prev;
    });
    setToggleNewSet((prev) => !prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    if (localTraining.length > 1) {
      setLocalTraining((prev) => prev.filter((item, index) => index !== setIndex));
      setToggleRemoveSet((prev) => !prev);
    }
  };

  // Remove the current exercise
  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = localTraining.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = () => {
    dispatch(
      updateTraining(training._id, {
        ...training,
        title: trainingTitle,
        category: [...trainingCategory],
        training: localTraining,
        complete: workoutCompleteStatus,
      })
    );
  };

  useEffect(() => {
    dispatch(getExerciseList());
  }, [dispatch]);

  useEffect(() => {
    setLocalTraining([]);
    setLoading(true);

    dispatch(requestTraining(params._id)).then(() => {
      setLoading(false);
    });
  }, [params, dispatch, user._id]);

  useEffect(() => {
    setLocalTraining(training.training || []);
    setTrainingCategory(training.category && training.category.length > 0 ? training.category : []);
    setTrainingTitle(training.title || "");
    setWorkoutCompleteStatus(training?.complete || false);
    if (training?.user?._id) {
      setBorderHighlight(!isPersonalWorkout());
    }
  }, [isPersonalWorkout, setBorderHighlight, training]);

  return (
    <>
      {loading ? (
        <LoadingPage PropComponent={Loading} />
      ) : training._id ? (
        <>
          <WorkoutOptionModalView
            modalOpen={modalOpen}
            handleModalToggle={handleModalToggle}
            handleSetModalAction={handleSetModalAction}
            modalActionType={modalActionType}
            training={training}
            setLocalTraining={setLocalTraining}
          />
          {training._id ? (
            <>
              <Grid
                container
                sx={{
                  justifyContent: "flex-start",
                  minHeight: "100%",
                  paddingTop: "15px",
                }}
              >
                {!isPersonalWorkout() && (
                  <Grid
                    container
                    item
                    xs={12}
                    sx={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Avatar
                      src={
                        training?.user?.profilePicture &&
                        `${serverURL}/user/profilePicture/${training.user.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={`${training?.user.firstName[0]} ${training?.user.lastName[0]}`}
                    />
                    <Typography variant="h5">
                      {training?.user.firstName} {training?.user.lastName}
                    </Typography>
                  </Grid>
                )}
                <Grid container item xs={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                  {training.date ? (
                    <IconButton
                      onClick={() => {
                        const link =
                          dayjs.utc(training.date).format("YYYY-MM-DD") ===
                          dayjs(new Date()).format("YYYY-MM-DD")
                            ? "/"
                            : `/?date=${dayjs.utc(training.date).format("YYYYMMDD")}`;
                        // Navigate after saving
                        save();
                        navigate(isPersonalWorkout() ? link : "/clients");
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => {
                        save();
                        navigate("/queue");
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs={10} container sx={{ justifyContent: "center" }}>
                  <Typography variant="h5">
                    {training.date
                      ? dayjs.utc(training.date).format("MMMM Do, YYYY")
                      : "Queued Workout"}
                  </Typography>
                </Grid>
                <Grid item xs={1} container sx={{ justifyContent: "center", alignItems: "center" }}>
                  <Tooltip title="Workout Settings">
                    <IconButton variant="contained" onClick={handleModalToggle}>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Grid>

                <Grid container spacing={2} sx={{ paddingTop: "15px" }}>
                  <Grid item xs={12} container alignContent="center">
                    <TextField
                      label="Title"
                      placeholder="Workout Title"
                      value={trainingTitle}
                      onChange={handleTitleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} container sx={classes.TrainingCategoryInputContainer}>
                    <Grid item xs={12} container alignContent="center">
                      <Autocomplete
                        disableCloseOnSelect
                        value={trainingCategory}
                        fullWidth
                        multiple
                        id="tags-filled"
                        defaultValue={trainingCategory.map((category) => category)}
                        options={categories.map((option) => option)}
                        freeSolo
                        onChange={(e, getTagProps) => handleTrainingCategory(getTagProps)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Muscle Groups"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: <>{params.InputProps.endAdornment}</>,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ margin: "25px 0px" }} />
                </Grid>
                {training.training.length > 0 && (
                  <SwipeableSet
                    workoutUser={training.user}
                    newExercise={newExercise}
                    newSet={newSet}
                    removeSet={removeSet}
                    removeExercise={removeExercise}
                    localTraining={localTraining}
                    setLocalTraining={setLocalTraining}
                    save={save}
                    toggleNewSet={toggleNewSet}
                    toggleRemoveSet={toggleRemoveSet}
                    maxSteps={localTraining.length + 1}
                    selectedDate={training.date}
                    size={size}
                    workoutCompleteStatus={workoutCompleteStatus}
                    setWorkoutCompleteStatus={setWorkoutCompleteStatus}
                    workoutFeedback={workoutFeedback}
                    setWorkoutFeedback={setWorkoutFeedback}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                )}
              </Grid>
              <Grid
                container
                item
                xs={12}
                sx={{
                  alignContent: "flex-end",
                  "&.MuiGrid-root": { flexGrow: 1 },
                  paddingBottom: "5px",
                }}
              >
                <Button variant="contained" onClick={save} fullWidth>
                  Save
                </Button>
              </Grid>

              <Dialog
                open={addExerciseOpen}
                TransitionComponent={Transition}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
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
                      onClick={handleAddExerciseClose}
                      aria-label="close"
                    >
                      <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                      Add Exercises
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => confirmedNewExercise(activeStep, selectedExercisesSetCount)}
                    >
                      Confirm
                    </Button>
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
                    <Grid item container xs={12}>
                      <ExerciseListAutocomplete
                        exerciseList={exerciseList}
                        selectedExercises={selectedExercises}
                        setSelectedExercises={setSelectedExercises}
                      />
                    </Grid>
                    <Grid item container xs={12}>
                      <TextField
                        label="Sets"
                        select
                        SelectProps={{ native: true }}
                        fullWidth
                        value={selectedExercisesSetCount}
                        onChange={handleSelectedExercisesSetCountChange}
                      >
                        {[...Array(21)].map((x, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </TextField>
                      {/* {selectedExercises.map(exercise => <p>{exercise?.exerciseTitle}</p>)} */}
                    </Grid>
                  </Grid>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Grid
              container
              item
              xs={12}
              sx={{
                justifyContent: "center",
                alignContent: "center",
                flexGrow: 1,
              }}
            >
              <Button variant="contained" onClick={() => null}>
                Create Workout
              </Button>
            </Grid>
          )}
        </>
      ) : (
        <>Workout does not exist</>
      )}
    </>
  );
}

const ExerciseListAutocomplete = (props) => {
  const { exerciseList, selectedExercises, setSelectedExercises } = props;

  return (
    <Autocomplete
      multiple
      fullWidth
      value={selectedExercises}
      // Convert the source data into objects with `_id` and `label`.
      options={exerciseList
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option)}
      // compare the selected item with the list of options.
      isOptionEqualToValue={(option, value) => option._id === value._id}
      // Tells Autocomplete what text to display for each option.
      getOptionLabel={(option) => option.exerciseTitle}
      onChange={(e, newSelection) => {
        setSelectedExercises(newSelection);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option._id}
            variant="outlined"
            label={option.exerciseTitle}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Search" placeholder="Exercises" />}
    />
  );
};
