import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Delete,
  MoreHoriz,
  FactCheck,
  Info,
  RemoveCircle,
  MoreVertSharp,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { requestExerciseProgess, serverURL } from "../../Redux/actions";
import LogLoader from "./LogLoader";
import EditLoader from "./EditLoader";
import { ModalBarChartHistory } from "../../Pages/AppPages/Progress";

const classes = {
  media: {
    height: 0,
    paddingTop: "100%",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: "#F44336",
  },
  avatarComment: {
    height: "25px",
    width: "25px",
  },
};

export const NotesDialog = (props) => {
  const { user, notes = [], open, handleClose } = props;

  const CommentCard = ({ i, comment, firstComment = false }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <Grid
        key={comment._id || i}
        sx={
          comment.user.username === user.username
            ? {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: "10px 0px",
                borderRadius: "7.5px",
                backgroundColor: "rgb(21, 101, 192)",
                color: "white",
              }
            : {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                margin: "10px 0px",
                borderRadius: "7.5px",
                backgroundColor: "#23272A",
                color: "white",
              }
        }
        container
      >
        <Grid container item xs={2} sx={{ justifyContent: "center" }}>
          <Avatar
            sx={classes.avatarComment}
            alt={`${comment.user.firstName[0]}${comment.user.lastName[0]}`}
            src={
              comment.user.profilePicture
                ? `${serverURL}/user/profilePicture/${comment.user.profilePicture}`
                : null
            }
          />
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h6" display="inline">
            {comment.user.username}{" "}
          </Typography>
          <Typography
            variant="subtitle1"
            display="inline"
            sx={{
              fontSize: "16px",
              opacity: ".33",
            }}
          >
            {comment.timestamp == null
              ? null
              : `${new Date(comment.timestamp)
                  .toLocaleDateString()
                  .substr(
                    0,
                    new Date(comment.timestamp).toLocaleDateString().length - 5
                  )} ${new Date(comment.timestamp).toLocaleTimeString()}`}
          </Typography>
          <Typography variant="subtitle1" display="block">
            {comment.text}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          {comment.user.username === user.username ? (
            <IconButton onClick={() => null}>
              <Delete />
            </IconButton>
          ) : (
            <>
              <IconButton aria-haspopup="true" onClick={handleClick}>
                <MoreHoriz />
              </IconButton>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>👍🏽</MenuItem>
                <MenuItem onClick={handleClose}>🍞</MenuItem>
                <MenuItem onClick={handleClose}>👎🏽</MenuItem>
              </Menu>
            </>
          )}
        </Grid>
      </Grid>
    );
  };

  const CommentField = ({ user }) => {
    const [comment, setComment] = useState("");

    const handlePostComment = () => {
      if (comment !== "") {
        setComment("");
      }
    };
    return (
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <TextField
            label="Add a comment..."
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            InputProps={{
              endAdornment: (
                <Button variant="contained" onClick={handlePostComment}>
                  Submit
                </Button>
              ),
            }}
          />
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { width: "80%", height: "100%" } }}>
      <div
        style={{
          height: "calc(100% - 72px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {notes.length > 0 ? notes.map((note, i) => (
          <CommentCard key={note._id || i} i={i} comment={note} />
        )) : <Typography textAlign="center" variant="h5" >No comments</Typography>}
      </div>
      <div
        style={{
          backgroundColor: "#23272a",
          width: "100%",
        }}
      >
        <CommentField user={user} />
      </div>
    </Dialog>
  );
};

export default function Exercise(props) {
  const {
    exercise,
    setLocalTraining,
    exerciseIndex,
    setIndex,
    localTraining,
    removeExercise,
    setHeightToggle,
  } = props;
  const dispatch = useDispatch();

  const [title, setTitle] = useState(exercise.exercise || "");
  const [exerciseType, setExerciseType] = useState(exercise.exerciseType || "Reps");
  const [sets, setSets] = useState(exercise.goals.sets || 0);
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleModalToggle = () => setOpen((prev) => !prev);
  const handleModalExercise = () => {
    dispatch(requestExerciseProgess(title)).then(() => handleModalToggle());
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const exerciseOptionsOpen = Boolean(anchorEl);
  const handleExerciseOptionsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExerciseOptionsClose = () => {
    setAnchorEl(null);
  };

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const handleNotesDialogClose = () => setNotesDialogOpen(false);

  const user = useSelector((state) => state.user);
  const targetExerciseHistory = useSelector((state) => state.progress.targetExerciseHistory);
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const handleTypeChange = (e) => setExerciseType(e.target.value);

  const handleSetChange = (e) => setSets(Number(e.target.value));

  useEffect(() => {
    // Ensures each proptery array length matches the amount of sets
    const setPropertyCheck = (property) => {
      while (Number(property.length) !== Number(sets)) {
        Number(property.length) > Number(sets) ? property.pop() : property.push(0);
      }
    };

    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              exercise.exercise = title;
              exercise.exerciseType = exerciseType;
              exercise.goals = {
                ...exercise.goals,
                sets: sets,
              };
              setPropertyCheck(exercise.achieved.reps);
              setPropertyCheck(exercise.achieved.weight);
              setPropertyCheck(exercise.achieved.percent);
              setPropertyCheck(exercise.achieved.seconds);
              setPropertyCheck(exercise.goals.minReps);
              setPropertyCheck(exercise.goals.maxReps);
              setPropertyCheck(exercise.goals.exactReps);
              setPropertyCheck(exercise.goals.weight);
              setPropertyCheck(exercise.goals.percent);
              setPropertyCheck(exercise.goals.seconds);
            }
            return exercise;
          });
        }
        return set;
      });
    });
  }, [setLocalTraining, exerciseIndex, setIndex, sets, title, exerciseType]);

  const handleAutoFillExercise = () => {
    setLocalTraining((prev) => {
      return prev.map((set, sIndex) => {
        if (setIndex === sIndex) {
          set.map((exercise, eIndex) => {
            if (eIndex === exerciseIndex) {
              switch (exercise.exerciseType) {
                case "Reps":
                  exercise.achieved.reps = exercise.achieved.reps.map(
                    (rep, repIndex) => (rep = Number(rep) || exercise.goals.exactReps[repIndex])
                  );
                  exercise.achieved.weight = exercise.achieved.weight.map(
                    (weight, weightIndex) =>
                      (weight = Number(weight) || exercise.goals.weight[weightIndex])
                  );
                  break;
                case "Time":
                  exercise.achieved.seconds = exercise.achieved.seconds.map(
                    (second, secondIndex) =>
                      (second = Number(second) || exercise.goals.seconds[secondIndex])
                  );
                  break;
                case "Reps with %":
                  exercise.achieved.reps = exercise.achieved.reps.map(
                    (rep, repIndex) => (rep = Number(rep) || exercise.goals.exactReps[repIndex])
                  );
                  exercise.achieved.weight = exercise.achieved.weight.map(
                    (weight, weightIndex) =>
                      (weight =
                        Number(weight) ||
                        (Number(exercise.goals.percent[weightIndex]) / 100) *
                          exercise.goals.oneRepMax)
                  );
                  break;
                default:
                  break;
              }
            }
            return exercise;
          });
        }
        return set;
      });
    });
  };

  const EditFields = () => {
    switch (exerciseType) {
      case "Rep Range":
        return {
          repeating: [
            {
              goalAttribute: "weight",
              label: "Weight",
            },
            {
              goalAttribute: "minReps",
              label: "Min Reps",
            },
            {
              goalAttribute: "maxReps",
              label: "Max Reps",
            },
          ],
          nonRepeating: [],
        };
      case "Reps":
        return {
          repeating: [
            {
              goalAttribute: "weight",
              label: "Weight",
            },
            {
              goalAttribute: "exactReps",
              label: "Reps",
            },
          ],
          nonRepeating: [],
        };
      case "Reps with %":
        return {
          repeating: [
            {
              goalAttribute: "percent",
              label: "Percent",
            },
            {
              goalAttribute: "exactReps",
              label: "Reps",
            },
          ],
          nonRepeating: [
            {
              goalAttribute: "maxWeight",
              label: "One Rep Max",
            },
          ],
        };
      case "Time":
        return {
          repeating: [
            {
              goalAttribute: "seconds",
              label: "Seconds",
            },
          ],
          nonRepeating: [],
        };
      default:
        return <Typography color="text.primary">Type Error</Typography>;
    }
  };

  const LoggedFields = () => {
    switch (exerciseType) {
      case "Rep Range":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Reps":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Reps with %":
        return [
          {
            achievedAttribute: "weight",
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            achievedAttribute: "reps",
            goalAttribute: "exactReps",
            label: "Reps",
          },
        ];
      case "Time":
        return [
          {
            achievedAttribute: "seconds",
            goalAttribute: "seconds",
            label: "Seconds",
          },
        ];
      default:
        return <Typography color="text.primary">Type Error</Typography>;
    }
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({
    confirmFuction: null,
    index: null,
  });

  const handleConfirmDialogOpen = (removeExercise, setIndex, exerciseIndex) => {
    setConfirmDialogData({
      confirmFunction: removeExercise,
      setIndex,
      exerciseIndex,
    });
    setConfirmDialogOpen((prev) => true);
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen((prev) => false);

  const handleDeleteConfirmationSubmit = () => {
    confirmDialogData.confirmFunction(confirmDialogData.setIndex, confirmDialogData.exerciseIndex);
    handleConfirmDialogClose();
  };

  useEffect(() => {
    setHeightToggle((prev) => !prev);
  }, [editMode, setHeightToggle]);

  return (
    <Grid container spacing={2} sx={{ marginBottom: "25px", justifyContent: "center" }}>
      {editMode ? (
        <>
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={12}>
              <Autocomplete
                id="tags-filled"
                disableCloseOnSelect
                fullWidth
                freeSolo
                value={title}
                defaultValue={title}
                options={exerciseList
                  .filter((a) => a !== "")
                  .sort((a, b) => a > b)
                  .map((option) => option)}
                onChange={(e, getTagProps) => setTitle(getTagProps.replace(/\s+/g, " ").trim())}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exercise Title"
                    placeholder="Exercises"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          <Tooltip title="View Progress Chart">
                            <IconButton variant="contained" onClick={handleModalExercise}>
                              <Info />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Log Exercise">
                            <IconButton variant="contained" onClick={handleEditToggle}>
                              <FactCheck />
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Type"
                select
                SelectProps={{ native: true }}
                fullWidth
                value={exerciseType}
                onChange={handleTypeChange}
              >
                <option value="Rep Range">Rep Range</option>
                <option value="Reps">Reps</option>
                <option value="Reps with %">Reps with %</option>
                <option value="Time">Time</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sets"
                select
                SelectProps={{ native: true }}
                fullWidth
                value={sets}
                onChange={handleSetChange}
              >
                {[...Array(21)].map((x, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </TextField>
            </Grid>
            <EditLoader
              fields={EditFields()}
              exercise={exercise}
              sets={sets}
              setIndex={setIndex}
              exerciseIndex={exerciseIndex}
              localTraining={localTraining}
              setLocalTraining={setLocalTraining}
            />
          </Grid>
          <Grid container item xs={12} sx={{ alignContent: "center" }}>
            <Grid container item xs={12} sx={{ justifyContent: "center", alignContent: "center" }}>
              <Grid item>
                <Tooltip title="Remove exercise">
                  <IconButton
                    onClick={() => handleConfirmDialogOpen(removeExercise, setIndex, exerciseIndex)}
                  >
                    <RemoveCircle />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
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
                      Are you sure you would like to remove the exercise?
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
        </>
      ) : (
        <>
          <Grid container item xs={12} spacing={2}>
            <Grid
              container
              item
              xs={2}
              sx={{ justifyContent: "flex-end", alignContent: "center" }}
            ></Grid>
            <Grid
              container
              item
              xs={8}
              sx={{ justifyContent: "flex-start", alignContent: "center" }}
            >
              <Typography color="text.primary" variant="h6">
                {title || "Enter an exercise"}
              </Typography>
            </Grid>
            <Grid
              container
              item
              xs={2}
              sx={{ justifyContent: "flex-start", alignContent: "center" }}
            >
              <Tooltip title="Exercise Options">
                <IconButton onClick={handleExerciseOptionsClick} ref={anchorEl}>
                  <MoreVertSharp />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Menu open={exerciseOptionsOpen} onClose={handleExerciseOptionsClose} anchorEl={anchorEl}>
            <MenuItem
              onClick={() => {
                handleAutoFillExercise();
                handleExerciseOptionsClose();
              }}
            >
              Autocomplete Exercise
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleModalExercise();
                handleExerciseOptionsClose();
              }}
            >
              View Progress Chart
            </MenuItem>
            <MenuItem
              onClick={() =>
                setEditMode((prev) => {
                  handleExerciseOptionsClose();
                  return !prev;
                })
              }
            >
              Edit Exercise
            </MenuItem>
            <MenuItem
              onClick={() => {
                setNotesDialogOpen(true);
                handleExerciseOptionsClose();
              }}
            >
              Notes
            </MenuItem>
          </Menu>
          <LogLoader
            fields={LoggedFields()}
            exercise={exercise}
            sets={sets}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            localTraining={localTraining}
            setLocalTraining={setLocalTraining}
          />
        </>
      )}

      {notesDialogOpen && (
        <NotesDialog
          open={notesDialogOpen}
          user={user}
          notes={exercise.notes}
          handleClose={handleNotesDialogClose}
        />
      )}
      {open && (
        <ModalBarChartHistory
          targetExerciseHistory={targetExerciseHistory}
          open={open}
          handleClose={handleClose}
        />
      )}
    </Grid>
  );
}
