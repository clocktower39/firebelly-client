import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ContentCopy,
  Delete,
  DoubleArrow,
  Download,
  Settings,
  Queue as QueueIcon,
} from "@mui/icons-material";
import {
  updateWorkoutDateById,
  copyWorkoutById,
  deleteWorkoutById,
} from "../Redux/actions";
import SelectedDate from "./SelectedDate";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";

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
    const [newAccount, setNewAccount] = useState({
      label: `${training?.user?.lastName}, ${training?.user?.firstName}`,
      value: training?.user?._id,
    });
    const [actionError, setActionError] = useState(false);
    const [newTitle, setNewTitle] = useState(training.title || "");
  
    const isPersonalWorkout = useCallback(
      () => user._id.toString() === training?.user?._id?.toString(),
      [user._id, training?.user?._id]
    );
  
    const handleTitleChange = (e) => setNewTitle(e.target.value);
  
    const handleMove = () => {
      dispatch(updateWorkoutDateById(training, newDate, newTitle)).then((res) => {
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
      dispatch(
        copyWorkoutById(training._id, newDate, copyOption.value, newTitle, newAccount?.value)
      ).then(() => {
        setActionError(false);
        handleModalToggle();
        !isPersonalWorkout()
          ? navigate("/clients")
          : setSelectedDate
          ? setSelectedDate(dayjs.utc(newDate).format("YYYY-MM-DD"))
          : dayjs.utc(newDate).format("YYYY-MM-DD") === dayjs(new Date()).format("YYYY-MM-DD")
          ? navigate("/")
          : navigate(`/?date=${dayjs.utc(newDate).format("YYYYMMDD")}`);
      });
    };
  
    const handleDelete = () => {
      dispatch(deleteWorkoutById(training._id, isPersonalWorkout ? user._id : training?.user?._id)).then(() => {
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
            <Grid container spacing={1} sx={{ justifyContent: "center" }}>
              <TextField
                fullWidth
                label="Update Workout Title"
                value={newTitle}
                onChange={handleTitleChange}
              />
              <Button variant="contained" onClick={handleMove}>
                Move
              </Button>
            </Grid>
            {actionError && (
              <Grid container size={12} sx={{ justifyContent: "center" }}>
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
              <Grid container size={12} sx={{ justifyContent: "center" }}>
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
          label: `${client.client.lastName}, ${client.client.firstName}`,
          value: client.client._id,
        }));
  
        accountOptions.unshift({
          label: `${user.lastName}, ${user.firstName}`,
          value: user._id,
        });
  
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
              <Grid container size={12} sx={{ paddingBottom: "15px" }}>
                <Autocomplete
                  disablePortal
                  options={accountOptions.sort((a, b) => a.label > b.label)}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={(params) => <TextField {...params} label="Copy to account" />}
                  sx={{ width: "100%" }}
                  onChange={handleNewAccountChange}
                  value={newAccount}
                  defaultValue={newAccount}
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
              <Grid container size={12} sx={{ paddingBottom: "15px" }}>
                <Autocomplete
                  disablePortal
                  options={copyOptions}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={(params) => <TextField {...params} label="Type" />}
                  sx={{ width: "100%" }}
                  onChange={handleOptionChange}
                />
              </Grid>
  
              <Grid container size={12} sx={{ justifyContent: "center" }}>
                <Button variant="contained" onClick={handleCopy} disabled={!copyOption}>
                  Copy
                </Button>
              </Grid>
  
              {actionError && (
                <Grid container size={12} sx={{ justifyContent: "center" }}>
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
            <Grid container spacing={1} >
              <Grid container>
                <Grid container size={12} >
                  <Typography color="text.primary">
                    Are you sure you would like to delete the following training:
                  </Typography>
                </Grid>
                <Grid container size={12} justifyContent="center">
                  <Typography color="text.primary">{training?.title}</Typography>
                </Grid>
                <Grid container size={12} justifyContent="center">
                  <Typography color="text.primary">
                    {dayjs.utc(selectedDate).format("MMMM Do YYYY")}
                  </Typography>
                </Grid>
                <Grid container size={12} justifyContent="center">
                  <Typography color="text.primary">{training.category.join(", ")}</Typography>
                </Grid>
              </Grid>
              <Grid container size={12} justifyContent="center">
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
            <Grid container spacing={1} >
              <Grid container size={12} >
                <Typography color="text.primary">
                  Are you sure you would like to autofill this workout?
                </Typography>
                <Typography color="text.primary" variant="caption">
                  This will copy all goals to achieved, overwriting any previous achieved data
                  entered.
                </Typography>
              </Grid>
              <Grid container size={12} sx={{ justifyContent: "center" }}>
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
            <Grid container spacing={1} >
              <Grid container size={12} justifyContent="center" >
                <Typography color="text.primary">
                  Export training from {dayjs.utc(selectedDate).format("MMMM Do YYYY")}
                </Typography>
              </Grid>
              <Grid container size={12} sx={{ justifyContent: "center" }}>
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