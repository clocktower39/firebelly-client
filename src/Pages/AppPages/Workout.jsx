import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  ContentCopy,
  Delete,
  DoubleArrow,
  Download,
  Settings,
  Queue as QueueIcon,
} from "@mui/icons-material";
import SelectedDate from "../../Components/SelectedDate";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import {
  requestTraining,
  updateTraining,
  updateWorkoutDateById,
  copyWorkoutById,
  deleteWorkoutById,
  serverURL,
} from "../../Redux/actions";
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
      })
    );
  };

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
                        training.user.profilePicture &&
                        `${serverURL}/user/profilePicture/${training.user.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={`${training.user.firstName[0]} ${training.user.lastName[0]}`}
                    />
                    <Typography variant="h5">
                      {training.user.firstName} {training.user.lastName}
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
                        navigate(link);
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
                            label="Training Category"
                            placeholder="Categories"
                            sx={classes.textFieldRoot}
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
  const {
    actionType,
    selectedDate,
    handleModalToggle,
    training,
    setSelectedDate,
    setLocalTraining,
  } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const [newDate, setNewDate] = useState(dayjs(new Date()).format("YYYY-MM-DD"));
  const [copyOption, setCopyOption] = useState(null);
  const [copyToOtherAccount, setCopyToOtherAccount] = useState(false);
  const [newAccount, setNewAccount] = useState(null);
  const [actionError, setActionError] = useState(false);
  const [newTitle, setNewTitle] = useState(training?.title);

  const handleTitleChange = (e) => setNewTitle(e.target.value);

  const handleMove = () => {
    dispatch(updateWorkoutDateById(training, newDate)).then((res) => {
      if (res?.error !== undefined) {
        setActionError(res.error);
      } else {
        setActionError(false);
        handleModalToggle();
        setSelectedDate && setSelectedDate(dayjs.utc(newDate).format("YYYY-MM-DD"));
      }
    });
  };

  const handleMoveToQueue = () => {
    dispatch(updateWorkoutDateById(training, null)).then((res) => {
      if (res?.error !== undefined) {
        setActionError(res.error);
      } else {
        setActionError(false);
        handleModalToggle();
        setSelectedDate && setSelectedDate(dayjs.utc(newDate).format("YYYY-MM-DD"));
      }
    });
  };

  const handleCopy = () => {
    dispatch(copyWorkoutById(training._id, newDate, copyOption.value, newTitle, newAccount?.value)).then(() => {
      setActionError(false);
      handleModalToggle();
      setSelectedDate
        ? setSelectedDate(dayjs.utc(newDate).format("YYYY-MM-DD"))
        : dayjs.utc(newDate).format("YYYY-MM-DD") === dayjs(new Date()).format("YYYY-MM-DD")
        ? navigate("/")
        : navigate(`/?date=${dayjs.utc(newDate).format("YYYYMMDD")}`);
    });
  };

  const handleDelete = () => {
    dispatch(deleteWorkoutById(training._id)).then(() => {
      setActionError(false);
      handleModalToggle();
    });
  };

  const handleAutofillWorkout = () => {
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        set.map((exercise, eIndex) => {
          exercise.achieved.reps = [...exercise.goals.exactReps];
          exercise.achieved.weight = [...exercise.goals.weight];
          exercise.achieved.seconds = [...exercise.goals.seconds];
          if (exercise.exerciseType === "Reps with %") {
            exercise.achieved.weight = [...exercise.goals.percent].map(
              (goal) => (goal / 100) * Number(exercise.goals.oneRepMax)
            );
          }
          return exercise;
        });
        return set;
      });
    });
    handleModalToggle();
  };

  const handleExport = () => {
    // Convert the data to a JSON string
    const jsonString = JSON.stringify(training);
    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor tag and trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dayjs(training.date).format("DD-MMM-YYYY")}_${
      training.user
    }_workout_data.json`; // Name of the file to be downloaded
    document.body.appendChild(link);
    link.click();
    // Cleanup: remove the temporary link
    document.body.removeChild(link);
    // Release the blob URL
    URL.revokeObjectURL(url);
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
    case "queue":
      return (
        <>
          <Grid container sx={{ justifyContent: "center" }}>
            <Button variant="contained" onClick={handleMoveToQueue}>
              Move to Queue
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
      let accountOptions = clients.map((client) => ({
        label: `${client.client.firstName} ${client.client.lastName}`,
        value: client.client._id,
      }));

      const handleOptionChange = (e, getTagProps) => {
        setCopyOption(getTagProps);
      };

      const handleNewAccountChange = (e, getTagProps) => {
        setNewAccount(getTagProps);
      };

      return (
        <>
          <SelectedDate selectedDate={newDate} setSelectedDate={setNewDate} />

          {user.isTrainer && (
            <Grid container item xs={12} sx={{ paddingBottom: "15px" }}>
              <FormControlLabel label="Copy to Different Account" control={<Checkbox checked={copyToOtherAccount} onClick={() => setCopyToOtherAccount(prev => !prev)} />} />
              <Autocomplete
                disabled={!copyToOtherAccount}
                disablePortal
                options={accountOptions}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => <TextField {...params} label="Client List" />}
                sx={{ width: "100%" }}
                onChange={handleNewAccountChange}
              />
            </Grid>
          )}

          <TextField
            fullWidth
            label="Copied Workout Title"
            value={newTitle}
            onChange={handleTitleChange}
          />

          <Grid container sx={{ justifyContent: "center" }}>
            <Grid container item xs={12} sx={{ paddingBottom: "15px" }}>
              <Autocomplete
                disablePortal
                options={copyOptions}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                renderInput={(params) => <TextField {...params} label="Type" />}
                sx={{ width: "100%" }}
                onChange={handleOptionChange}
              />
            </Grid>

            <Grid container item xs={12} sx={{ justifyContent: "center" }}>
              <Button variant="contained" onClick={handleCopy} disabled={!copyOption}>
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
                {dayjs.utc(selectedDate).format("MMMM Do YYYY")}
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
    case "autofill_workout":
      return (
        <>
          <Grid container>
            <Grid container>
              <Typography color="text.primary">
                Are you sure you would like the autofill this workout?
              </Typography>
              <Typography color="text.primary" variant="caption">
                This will copy all goals to achieved, overwriting any previous achieved data
                entered.
              </Typography>
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Button variant="contained" onClick={handleAutofillWorkout}>
                Confrim
              </Button>
            </Grid>
          </Grid>
        </>
      );
    case "export":
      return (
        <>
          <Grid container>
            <Grid container>
              <Typography color="text.primary">
                Export training from {dayjs.utc(selectedDate).format("MMMM Do YYYY")}
              </Typography>
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Button variant="contained" onClick={handleExport}>
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

export function WorkoutOptionModalView(props) {
  const {
    modalOpen,
    handleModalToggle,
    handleSetModalAction,
    modalActionType,
    training,
    setSelectedDate,
    setLocalTraining,
  } = props;
  return (
    <Modal open={modalOpen} onClose={handleModalToggle}>
      <Box sx={classes.modalStyle}>
        <Typography variant="h5" textAlign="center" color="text.primary" gutterBottom>
          Workout Settings
        </Typography>
        <Grid container sx={{ justifyContent: "center" }}>
          {setLocalTraining && (
            <Tooltip title="Autofill Workout">
              <IconButton onClick={() => handleSetModalAction("autofill_workout")}>
                <CheckCircle />
              </IconButton>
            </Tooltip>
          )}
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
          <Tooltip title="Add Workout to Queue">
            <IconButton onClick={() => handleSetModalAction("queue")}>
              <QueueIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Workout">
            <IconButton onClick={() => handleSetModalAction("delete")}>
              <Delete />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Workout">
            <IconButton onClick={() => handleSetModalAction("export")}>
              <Download />
            </IconButton>
          </Tooltip>
        </Grid>
        <ModalAction
          actionType={modalActionType}
          selectedDate={training.date}
          handleModalToggle={handleModalToggle}
          training={training}
          setSelectedDate={setSelectedDate}
          setLocalTraining={setLocalTraining}
        />
      </Box>
    </Modal>
  );
}
