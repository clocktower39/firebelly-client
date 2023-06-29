import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate, Link, } from "react-router-dom";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ContentCopy,
  Delete,
  DoubleArrow,
  Download,
  Settings,
} from "@mui/icons-material";
import SelectedDate from "../../Components/SelectedDate";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import {
  requestTraining,
  updateTraining,
  updateWorkoutDateById,
  copyWorkoutById,
  deleteWorkoutById,
} from "../../Redux/actions";
import Loading from "../../Components/Loading";
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
  textFieldRoot: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      // default paddingRight was 39px since clear icon was positioned absolute
      paddingRight: "9px",

      // Search icon
      "& button": {
        order: 3, // order 3 means the search icon will appear after the clear icon which has an order of 2
      },

      // Clear icon
      "& .MuiAutocomplete-endAdornment": {
        position: "relative", // default was absolute. we make it relative so that it is now within the flow of the other two elements
        order: 2,
      },
    },
  },
};

export default function Workout() {
  const dispatch = useDispatch();
  const params = useParams();
  const training = useSelector((state) => state.training);
  const [size] = useOutletContext() || [900];

  const [localTraining, setLocalTraining] = useState([]);
  const [trainingCategory, setTrainingCategory] = useState([]);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [loading, setLoading] = useState(true);

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

  const categories = [
    "Biceps",
    "Triceps",
    "Chest",
    "Back",
    "Shoulders",
    "Legs",
    "Abs",
  ];
  // Create a new exercise on the current set
  const newExercise = (index) => {
    const newTraining = localTraining.map((group, i) => {
      if (index === i) {
        group.push({
          exercise: "",
          exerciseType: "Reps",
          goals: {
            sets: 4,
            minReps: [0, 0, 0, 0],
            maxReps: [0, 0, 0, 0],
            exactReps: [0, 0, 0, 0],
            weight: [0, 0, 0, 0],
            percent: [0, 0, 0, 0],
            seconds: [0, 0, 0, 0],
          },
          achieved: {
            sets: 0,
            reps: [0, 0, 0, 0],
            weight: [0, 0, 0, 0],
            percent: [0, 0, 0, 0],
            seconds: [0, 0, 0, 0],
          },
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
  };

  // Create a new set on the current day
  const newSet = () => {
    setLocalTraining((prev) => {
      prev.push([
        {
          exercise: "",
          exerciseType: "Reps",
          goals: {
            sets: 4,
            minReps: [0, 0, 0, 0],
            maxReps: [0, 0, 0, 0],
            exactReps: [0, 0, 0, 0],
            weight: [0, 0, 0, 0],
            percent: [0, 0, 0, 0],
            seconds: [0, 0, 0, 0],
          },
          achieved: {
            sets: 0,
            reps: [0, 0, 0, 0],
            weight: [0, 0, 0, 0],
            percent: [0, 0, 0, 0],
            seconds: [0, 0, 0, 0],
          },
        },
      ]);
      return prev;
    });
    setToggleNewSet((prev) => !prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    if (localTraining.length > 1) {
      setLocalTraining((prev) =>
        prev.filter((item, index) => index !== setIndex)
      );
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
      })
    );
  };

  useEffect(() => {
    setLocalTraining([]);
    setLoading(true);
    dispatch(requestTraining(params._id)).then(() => {
      setLoading(false);
    });
  }, [params, dispatch]);

  useEffect(() => {
    setLocalTraining(training.training || []);
    setTrainingCategory(
      training.category && training.category.length > 0 ? training.category : []
    );
    setTrainingTitle(training.title || "");
  }, [training]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : training._id ? (
        <>
          <Modal open={modalOpen} onClose={handleModalToggle}>
            <Box sx={classes.modalStyle}>
              <Typography
                variant="h5"
                textAlign="center"
                color="text.primary"
                gutterBottom
              >
                Workout Settings
              </Typography>
              <Grid container sx={{ justifyContent: "center" }}>
                <Tooltip title="Move Workout">
                  <IconButton onClick={() => handleSetModalAction("move")}>
                    <DoubleArrow />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy Workout">
                  <IconButton onClick={() => handleSetModalAction("copy")}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Import Workout">
                  <IconButton disabled>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Workout">
                  <IconButton onClick={() => handleSetModalAction("delete")}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Grid>
              <ModalAction
                actionType={modalActionType}
                selectedDate={training.date}
                handleModalToggle={handleModalToggle}
              />
            </Box>
          </Modal>
          {training._id ? (
            <>
              <Grid
                container
                spacing={2}
                sx={{
                  justifyContent: "flex-start",
                  minHeight: "100%",
                  paddingTop: "15px",
                }}
              >
                <Grid
                  container
                  item
                  xs={1}
                  sx={{ justifyContent: "center", alignItems: "center" }}
                >
                  <IconButton
                    component={Link}
                    to={
                      dayjs.utc(training.date).format("YYYY-MM-DD") ===
                      dayjs(new Date()).format("YYYY-MM-DD")
                        ? "/"
                        : `/?date=${dayjs
                            .utc(training.date)
                            .format("YYYYMMDD")}`
                    }
                  >
                    <ArrowBack />
                  </IconButton>
                </Grid>
                <Grid
                  item
                  xs={11}
                  container
                  sx={{ justifyContent: "center", marginLeft: "-35px" }}
                >
                  <Typography variant="h5">
                    {dayjs.utc(training.date).format("MMMM Do, YYYY")}
                  </Typography>
                </Grid>
                <Grid item xs={12} container alignContent="center">
                  <TextField
                    label="Title"
                    placeholder="Workout Title"
                    value={trainingTitle}
                    onChange={handleTitleChange}
                    fullWidth
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  container
                  sx={classes.TrainingCategoryInputContainer}
                >
                  <Grid item xs={12} container alignContent="center">
                    <Autocomplete
                      disableCloseOnSelect
                      value={trainingCategory}
                      fullWidth
                      multiple
                      id="tags-filled"
                      defaultValue={trainingCategory.map(
                        (category) => category
                      )}
                      options={categories.map((option) => option)}
                      freeSolo
                      onChange={(e, getTagProps) =>
                        handleTrainingCategory(getTagProps)
                      }
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Training Category"
                          placeholder="Categories"
                          sx={classes.textFieldRoot}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                <Tooltip title="Workout Settings">
                                  <IconButton
                                    variant="contained"
                                    onClick={handleModalToggle}
                                  >
                                    <Settings />
                                  </IconButton>
                                </Tooltip>
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ margin: "25px 0px" }} />
                </Grid>
                {training.training.length > 0 && (
                  <SwipeableSet
                    newExercise={newExercise}
                    newSet={newSet}
                    removeSet={removeSet}
                    removeExercise={removeExercise}
                    localTraining={localTraining}
                    setLocalTraining={setLocalTraining}
                    save={save}
                    toggleNewSet={toggleNewSet}
                    toggleRemoveSet={toggleRemoveSet}
                    maxSteps={localTraining.length}
                    selectedDate={training.date}
                    size={size}
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

export function ModalAction(props) {
  const { actionType, selectedDate, handleModalToggle } = props;
  const dispatch = useDispatch();
  const training = useSelector((state) => state.training);
  const navigate = useNavigate();
  const [newDate, setNewDate] = useState(
    dayjs(new Date()).format("YYYY-MM-DD")
  );
  const [copyOption, setCopyOption] = useState(null);
  const [actionError, setActionError] = useState(false);

  const handleMove = () => {
    dispatch(updateWorkoutDateById(training, newDate)).then((res) => {
      if (res?.error !== undefined) {
        setActionError(res.error);
      } else {
        setActionError(false);
        handleModalToggle();
      }
    });
  };

  const handleCopy = () => {
    dispatch(copyWorkoutById(training._id, newDate, copyOption.value)).then(() => {
      dayjs.utc(newDate).format("YYYY-MM-DD") ===
      dayjs(new Date()).format("YYYY-MM-DD")
        ? navigate("/")
        : navigate(`/?date=${dayjs
            .utc(newDate)
            .format("YYYYMMDD")}`)
    });
  };

  const handleDelete = () => {
    dispatch(deleteWorkoutById(training._id)).then(() => {
      dayjs.utc(training.date).format("YYYY-MM-DD") ===
      dayjs(new Date()).format("YYYY-MM-DD")
        ? navigate("/")
        : navigate(`/?date=${dayjs
            .utc(training.date)
            .format("YYYYMMDD")}`)
    });
  };

  useEffect(() => {
    setActionError(false);
  }, [newDate]);

  switch (actionType) {
    case "move":
      return (
        <>
          <SelectedDate selectedDate={newDate} setSelectedDate={setNewDate} />
          <Grid container sx={{ justifyContent: "center" }}>
            <Button variant="contained" onClick={handleMove}>
              Move
            </Button>
          </Grid>
          {actionError && (
            <Grid container item xs={12} sx={{ justifyContent: "center" }}>
              <Typography variant="caption" sx={{ color: "red" }}>
                {actionError}
              </Typography>
            </Grid>
          )}
        </>
      );
    case "copy":
      let copyOptions = [
        { label: "Exact Copy", value: "exact" },
        { label: "Copy achieved as the new goal", value: "achievedToNewGoal" },
        { label: "Copy goal only", value: "copyGoalOnly" },
      ];

      const handleOptionChange = (e, getTagProps) => {
        setCopyOption(getTagProps);
      };
      return (
        <>
          <SelectedDate selectedDate={newDate} setSelectedDate={setNewDate} />

          <Grid container sx={{ justifyContent: "center" }}>
            <Grid container item xs={12} sx={{ paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={copyOptions}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                renderInput={(params) => <TextField {...params} label="Type" />}
                sx={{ width: "100%" }}
                onChange={handleOptionChange}
              />
            </Grid>

            <Grid container item xs={12} sx={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={handleCopy}
                disabled={!copyOption}
              >
                Copy
              </Button>
            </Grid>

            {actionError && (
              <Grid container item xs={12} sx={{ justifyContent: "center" }}>
                <Typography variant="caption" sx={{ color: "red" }}>
                  {actionError}
                </Typography>
              </Grid>
            )}
          </Grid>
        </>
      );
    case "delete":
      return (
        <>
          <Grid container>
            <Grid container>
              <Typography color="text.primary">
                Are you sure you would like the delete the training from{" "}
                {selectedDate}
              </Typography>
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Button variant="contained" onClick={handleDelete}>
                Confrim
              </Button>
            </Grid>
          </Grid>
        </>
      );
    default:
      return <></>;
  }
}
