import React, { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
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
  bulkMoveCopyWorkouts,
  getTrainingRangeEnd,
  deleteWorkoutById,
  requestWorkoutsByRange,
  undoBulkMoveCopy,
} from "../Redux/actions";
import SelectedDate from "./SelectedDate";
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
    maxHeight: "85vh",
    overflowY: "auto",
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

    if (!training?._id) {
      return (
        <Grid container sx={{ justifyContent: "center", padding: "10px" }}>
          <Typography variant="caption" color="text.secondary">
            Loading workout options...
          </Typography>
        </Grid>
      );
    }
  
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const clients = useSelector((state) => state.clients);
    const lastBulkOperation = useSelector((state) => state.lastBulkOperation);
    const [newDate, setNewDate] = useState(dayjs(new Date()).format("YYYY-MM-DD"));
    const [moveMode, setMoveMode] = useState("single");
    const [rangeStart, setRangeStart] = useState(
      dayjs.utc(training?.date || new Date()).format("YYYY-MM-DD")
    );
    const [rangeEnd, setRangeEnd] = useState("");
    const [rangeEndManual, setRangeEndManual] = useState(false);
    const [rangeTargetDate, setRangeTargetDate] = useState(
      dayjs.utc(training?.date || new Date()).format("YYYY-MM-DD")
    );
    const [targetQueue, setTargetQueue] = useState(false);
    const [includeCompleted, setIncludeCompleted] = useState(false);
    const [previewWorkouts, setPreviewWorkouts] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [copyOption, setCopyOption] = useState(null);
    const [newAccount, setNewAccount] = useState({
      label: `${training?.user?.lastName}, ${training?.user?.firstName}`,
      value: training?.user?._id,
    });
    const [actionError, setActionError] = useState(false);
    const [newTitle, setNewTitle] = useState(training?.title || "");
  
    const isPersonalWorkout = useCallback(
      () => user._id.toString() === training?.user?._id?.toString(),
      [user._id, training?.user?._id]
    );
    const previewDeltaDays = targetQueue
      ? 0
      : dayjs.utc(rangeTargetDate).diff(dayjs.utc(rangeStart), "day");
    const canUndoBulk =
      lastBulkOperation &&
      training?.user?._id &&
      String(lastBulkOperation.userId) === String(training.user._id);
  
    const handleTitleChange = (e) => setNewTitle(e.target.value);
    const handleMoveModeChange = (e) => setMoveMode(e.target.value);
    const handleRangeStartChange = (e) => {
      setRangeStart(e.target.value);
      setRangeEndManual(false);
    };
    const handleRangeEndChange = (e) => {
      setRangeEnd(e.target.value);
      setRangeEndManual(true);
    };
    const handleRangeTargetChange = (e) => setRangeTargetDate(e.target.value);
    const handleTargetQueueChange = (e) => setTargetQueue(e.target.checked);
    const handleIncludeCompletedChange = (e) => setIncludeCompleted(e.target.checked);
  
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

    const handleMoveRange = () => {
      dispatch(
        bulkMoveCopyWorkouts({
          action: "move",
          rangeStart,
          rangeEnd,
          targetStartDate: rangeTargetDate,
          userId: training?.user?._id,
          targetQueue,
          filters: {
            includeCompleted,
          },
        })
      ).then((res) => {
        if (res?.error !== undefined) {
          setActionError(res.error);
        } else if (!res?.workouts?.length) {
          setActionError("No workouts matched the range and filters.");
        } else {
          setActionError(false);
          handleModalToggle();
          setSelectedDate && setSelectedDate(dayjs.utc(rangeTargetDate).format("YYYY-MM-DD"));
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

    const handleCopyRange = () => {
      dispatch(
        bulkMoveCopyWorkouts({
          action: "copy",
          rangeStart,
          rangeEnd,
          targetStartDate: rangeTargetDate,
          option: copyOption?.value,
          userId: training?.user?._id,
          newAccount: newAccount?.value,
          targetQueue,
          filters: {
            includeCompleted,
          },
        })
      ).then((res) => {
        if (res?.error !== undefined) {
          setActionError(res.error);
        } else if (!res?.workouts?.length) {
          setActionError("No workouts matched the range and filters.");
        } else {
          setActionError(false);
          handleModalToggle();
          const firstCopiedDate = res?.workouts?.length
            ? dayjs
                .utc(
                  res.workouts
                    .map((workout) => workout.date)
                    .filter(Boolean)
                    .sort((a, b) => new Date(a) - new Date(b))[0]
                )
                .format("YYYY-MM-DD")
            : dayjs.utc(rangeTargetDate).format("YYYY-MM-DD");

          !isPersonalWorkout()
            ? navigate("/clients")
            : setSelectedDate
            ? setSelectedDate(firstCopiedDate)
            : firstCopiedDate === dayjs(new Date()).format("YYYY-MM-DD")
            ? navigate("/")
            : navigate(`/?date=${dayjs.utc(firstCopiedDate).format("YYYYMMDD")}`);
        }
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
    }, [newDate, moveMode, rangeStart, rangeEnd, rangeTargetDate]);

    useEffect(() => {
      setNewTitle(training?.title || "");
    }, [training?._id, training?.title]);

    useEffect(() => {
      if (!training?.date) return;
      const dateString = dayjs.utc(training.date).format("YYYY-MM-DD");
      setRangeStart(dateString);
      setRangeTargetDate(dateString);
      setRangeEnd("");
      setRangeEndManual(false);
    }, [training?._id]);

    useEffect(() => {
      setMoveMode("single");
      setTargetQueue(false);
      setIncludeCompleted(false);
      setPreviewWorkouts([]);
      setPreviewLoading(false);
    }, [actionType]);

    useEffect(() => {
      if (moveMode !== "range" || !rangeStart || rangeEndManual) return;

      dispatch(getTrainingRangeEnd(rangeStart, training?.user?._id)).then((data) => {
        if (data?.error) {
          setActionError(data.error);
          return;
        }
        const maxDate = data?.maxDate
          ? dayjs.utc(data.maxDate).format("YYYY-MM-DD")
          : rangeStart;
        setRangeEnd(maxDate);
      });
    }, [dispatch, moveMode, rangeStart, rangeEndManual, training?.user?._id]);

    useEffect(() => {
      if (moveMode !== "range" || !rangeStart || !rangeEnd) return;
      setPreviewLoading(true);
      dispatch(
        requestWorkoutsByRange(rangeStart, rangeEnd, training?.user?._id, {
          includeCompleted,
        })
      ).then((data) => {
        if (data?.error) {
          setActionError(data.error);
          setPreviewWorkouts([]);
          setPreviewLoading(false);
          return;
        }
        const workouts = data?.workouts || [];
        setPreviewWorkouts(workouts);
        setPreviewLoading(false);
      });
    }, [
      dispatch,
      moveMode,
      rangeStart,
      rangeEnd,
      training?.user?._id,
      includeCompleted,
    ]);
  
    switch (actionType) {
      case "move":
        return (
          <>
            <TextField
              fullWidth
              select
              label="Mode"
              value={moveMode}
              onChange={handleMoveModeChange}
              sx={{ marginBottom: "10px" }}
            >
              <MenuItem value="single">Single training</MenuItem>
              <MenuItem value="range">Date range</MenuItem>
            </TextField>

            {moveMode === "single" ? (
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
              </>
            ) : (
              <>
                <Grid container spacing={1} sx={{ justifyContent: "center", marginBottom: "10px" }}>
                  <TextField
                    fullWidth
                    label="Range Start"
                    type="date"
                    value={rangeStart}
                    onChange={handleRangeStartChange}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Range End"
                    type="date"
                    value={rangeEnd}
                    onChange={handleRangeEndChange}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Move start to"
                    type="date"
                    value={rangeTargetDate}
                    onChange={handleRangeTargetChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={targetQueue}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={targetQueue} onChange={handleTargetQueueChange} />}
                    label="Move to queue (no dates)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox checked={includeCompleted} onChange={handleIncludeCompletedChange} />
                    }
                    label="Include completed"
                  />
                  <Grid container size={12} sx={{ justifyContent: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {targetQueue
                        ? "Moves all workouts in the range to the queue."
                        : `Moves all workouts in the range by ${dayjs
                            .utc(rangeTargetDate)
                            .diff(dayjs.utc(rangeStart), "day")} day(s).`}{" "}
                      Range end auto-fills to the latest workout on/after the start date.
                    </Typography>
                  </Grid>
                  <Grid container size={12} sx={{ justifyContent: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {previewLoading
                        ? "Loading preview..."
                        : `Preview: ${previewWorkouts.length} workout(s)`}
                    </Typography>
                  </Grid>
                  {!previewLoading && previewWorkouts.length > 0 && (
                    <Box sx={{ maxHeight: 140, overflowY: "auto", width: "100%" }}>
                      {previewWorkouts
                        .slice()
                        .sort((a, b) => dayjs.utc(a.date).valueOf() - dayjs.utc(b.date).valueOf())
                        .slice(0, 8)
                        .map((workout) => (
                          <Typography variant="caption" key={workout._id} display="block">
                            {dayjs.utc(workout.date).format("MMM D")} →{" "}
                            {targetQueue
                              ? "Queue"
                              : dayjs.utc(workout.date).add(previewDeltaDays, "day").format("MMM D")}{" "}
                            - {workout.title || "Untitled"}
                          </Typography>
                        ))}
                      {previewWorkouts.length > 8 && (
                        <Typography variant="caption" display="block">
                          +{previewWorkouts.length - 8} more
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid container sx={{ justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleMoveRange}
                    disabled={!rangeStart || !rangeEnd || (!targetQueue && !rangeTargetDate)}
                  >
                    Move Range
                  </Button>
                </Grid>
                {canUndoBulk && (
                  <Grid container sx={{ justifyContent: "center", marginTop: "10px" }}>
                    <Button variant="outlined" onClick={() => dispatch(undoBulkMoveCopy(lastBulkOperation))}>
                      Undo last bulk action
                    </Button>
                  </Grid>
                )}
              </>
            )}
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
            <TextField
              fullWidth
              select
              label="Mode"
              value={moveMode}
              onChange={handleMoveModeChange}
              sx={{ marginBottom: "10px" }}
            >
              <MenuItem value="single">Single training</MenuItem>
              <MenuItem value="range">Date range</MenuItem>
            </TextField>

            {moveMode === "single" && (
              <SelectedDate selectedDate={newDate} setSelectedDate={setNewDate} />
            )}

            {moveMode === "range" && (
              <Grid container spacing={1} sx={{ justifyContent: "center", marginBottom: "10px" }}>
                <TextField
                  fullWidth
                  label="Range Start"
                  type="date"
                  value={rangeStart}
                  onChange={handleRangeStartChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Range End"
                  type="date"
                  value={rangeEnd}
                  onChange={handleRangeEndChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Copy start to"
                  type="date"
                  value={rangeTargetDate}
                  onChange={handleRangeTargetChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={targetQueue}
                />
                <FormControlLabel
                  control={<Checkbox checked={targetQueue} onChange={handleTargetQueueChange} />}
                  label="Copy to queue (no dates)"
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={includeCompleted} onChange={handleIncludeCompletedChange} />
                  }
                  label="Include completed"
                />
                <Grid container size={12} sx={{ justifyContent: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                    {targetQueue
                      ? "Copies all workouts in the range to the queue."
                      : `Copies all workouts in the range by ${dayjs
                          .utc(rangeTargetDate)
                          .diff(dayjs.utc(rangeStart), "day")} day(s).`}{" "}
                    Range end auto-fills to the latest workout on/after the start date.
                    </Typography>
                  </Grid>
                <Grid container size={12} sx={{ justifyContent: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    {previewLoading
                      ? "Loading preview..."
                      : `Preview: ${previewWorkouts.length} workout(s)`}
                  </Typography>
                </Grid>
                {!previewLoading && previewWorkouts.length > 0 && (
                  <Box sx={{ maxHeight: 140, overflowY: "auto", width: "100%" }}>
                    {previewWorkouts
                      .slice()
                      .sort((a, b) => dayjs.utc(a.date).valueOf() - dayjs.utc(b.date).valueOf())
                      .slice(0, 8)
                      .map((workout) => (
                        <Typography variant="caption" key={workout._id} display="block">
                          {dayjs.utc(workout.date).format("MMM D")} →{" "}
                          {targetQueue
                            ? "Queue"
                            : dayjs.utc(workout.date).add(previewDeltaDays, "day").format("MMM D")}{" "}
                          - {workout.title || "Untitled"}
                        </Typography>
                      ))}
                    {previewWorkouts.length > 8 && (
                      <Typography variant="caption" display="block">
                        +{previewWorkouts.length - 8} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>
            )}

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

            {moveMode === "single" && (
              <TextField
                fullWidth
                label="Copied Workout Title"
                value={newTitle}
                onChange={handleTitleChange}
              />
            )}

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
                {moveMode === "single" ? (
                  <Button variant="contained" onClick={handleCopy} disabled={!copyOption}>
                    Copy
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleCopyRange}
                    disabled={
                      !copyOption ||
                      !rangeStart ||
                      !rangeEnd ||
                      (!targetQueue && !rangeTargetDate)
                    }
                  >
                    Copy Range
                  </Button>
                )}
              </Grid>
              {moveMode === "range" && canUndoBulk && (
                <Grid container size={12} sx={{ justifyContent: "center", marginTop: "10px" }}>
                  <Button variant="outlined" onClick={() => dispatch(undoBulkMoveCopy(lastBulkOperation))}>
                    Undo last bulk action
                  </Button>
                </Grid>
              )}

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
