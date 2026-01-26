import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  AddCircle,
  Delete,
} from "@mui/icons-material";
import {
  getGoals,
  updateGoal,
  addGoalComment,
  removeGoalComment,
  addNewGoal,
  deleteGoal,
  requestExerciseLibrary,
  markAchievementSeen,
  requestLatestMetric,
  serverURL,
} from "../../Redux/actions";

const GOAL_CATEGORIES = ["General", "Strength", "Cardio", "Skill", "Weight"];
const DISTANCE_UNITS = ["Miles", "Kilometers", "Meters", "Yards"];
const DISTANCE_UNIT_TO_METERS = {
  Miles: 1609.344,
  Kilometers: 1000,
  Meters: 1,
  Yards: 0.9144,
};

const convertDistanceValue = (value, fromUnit, toUnit) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;
  const fromFactor = DISTANCE_UNIT_TO_METERS[fromUnit];
  const toFactor = DISTANCE_UNIT_TO_METERS[toUnit];
  if (!fromFactor || !toFactor) return value;
  const converted = (numericValue * fromFactor) / toFactor;
  return Number.isFinite(converted) ? String(converted) : value;
};

const formatRaceTime = (value) => {
  const digitsOnly = String(value).replace(/\D/g, "");
  if (!digitsOnly) return "";
  const padded = digitsOnly.slice(-6).padStart(6, "0");
  const hours = padded.slice(0, 2);
  const minutes = Math.min(Number(padded.slice(2, 4)), 59).toString().padStart(2, "0");
  const seconds = Math.min(Number(padded.slice(4, 6)), 59).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getCategoryColor = (category) => {
  switch (category) {
    case "Strength":
      return "error";
    case "Cardio":
      return "info";
    case "Skill":
      return "secondary";
    case "Weight":
      return "success";
    default:
      return "default";
  }
};

const GoalCard = ({ goal, onOpen }) => {
  const isStrengthGoal = goal.category === "Strength" && goal.exercise;
  const hasUnseenAchievement = goal.achievedDate && !goal.achievementSeen;
  
  return (
    <Grid
      container
      size={{ xs: 12, sm: 6, md: 4, }}
      sx={{ justifyContent: "center" }}
    >
      <Box sx={{ width: "100%" }}>
        <Badge
          badgeContent="Achieved!"
          color="success"
          invisible={!hasUnseenAchievement}
          sx={{ width: "100%", "& .MuiBadge-badge": { fontSize: "0.7rem" } }}
        >
          <Card
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              '& .MuiPaper-root': {
                backgroundColor: 'white',
              },
              ...(hasUnseenAchievement && {
                border: "2px solid",
                borderColor: "success.main",
              }),
            }}
          >
            <CardActionArea onClick={() => onOpen(goal)}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {goal.category && (
                      <Chip
                        label={goal.category}
                        size="small"
                        color={getCategoryColor(goal.category)}
                      />
                    )}
                    {goal.achievedDate && (
                      <Chip
                        label="Achieved"
                        size="small"
                        color="success"
                        variant={hasUnseenAchievement ? "filled" : "outlined"}
                      />
                    )}
                    <Typography variant="h5" component="div">
                      {goal.title}
                    </Typography>
                  </Stack>
                  {isStrengthGoal ? (
                    <Typography variant="body2" color="text.secondary">
                      Target: {goal.targetWeight} lbs × {goal.targetReps} reps
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {goal.description}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Badge>
      </Box>
    </Grid>
  );
};

const GoalDetails = ({ goal, open, onClose, dispatch, user, exerciseLibrary, latestMetric }) => {
  const [title, setTitle] = useState(goal.title || '');
  const [description, setDescription] = useState(goal.description || '');
  const [category, setCategory] = useState(goal.category || '');
  const [selectedExercise, setSelectedExercise] = useState(goal.exercise || null);
  const [targetWeight, setTargetWeight] = useState(goal.targetWeight || '');
  const [targetReps, setTargetReps] = useState(goal.targetReps || '');
  const [distanceUnit, setDistanceUnit] = useState(goal.distanceUnit || 'Miles');
  const [distanceValue, setDistanceValue] = useState(goal.distanceValue || '');
  const [goalTime, setGoalTime] = useState(goal.goalTime || '');
  const [goalWeight, setGoalWeight] = useState(goal.goalWeight || '');
  const [currentMax, setCurrentMax] = useState(null);
  const [targetDate, setTargetDate] = useState(goal.targetDate || '');
  const [achievedDate, setAchievedDate] = useState(goal.achievedDate || '');
  const [newComment, setNewComment] = useState('');
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

  const isStrengthGoal = category === "Strength";
  const isCardioGoal = category === "Cardio";
  const isWeightGoal = category === "Weight";

  const handleChange = (e, setter) => setter(e.target.value);
  const handleDistanceUnitChange = (nextUnit) => {
    if (distanceValue !== '') {
      setDistanceValue(convertDistanceValue(distanceValue, distanceUnit, nextUnit));
    }
    setDistanceUnit(nextUnit);
  };
  const handleGoalTimeChange = (e) => setGoalTime(formatRaceTime(e.target.value));

  const fetchCurrentMax = useCallback(async () => {
    if (!selectedExercise?._id || !targetReps) {
      setCurrentMax(null);
      return;
    }
    try {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const response = await fetch(`${serverURL}/goals/exerciseMaxAtReps`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
        body: JSON.stringify({
          exerciseId: selectedExercise._id,
          targetReps: Number(targetReps),
        }),
      });
      const data = await response.json();
      setCurrentMax(data.maxWeight || 0);
    } catch (err) {
      console.error("Error fetching current max:", err);
    }
  }, [selectedExercise?._id, targetReps]);

  useEffect(() => {
    if (isStrengthGoal) {
      fetchCurrentMax();
    }
  }, [isStrengthGoal, fetchCurrentMax]);

  const saveGoal = () => {
    const goalData = {
      _id: goal._id,
      title: isStrengthGoal && selectedExercise ? selectedExercise.exerciseTitle : title,
      description,
      category,
      targetDate,
    };
    if (isStrengthGoal) {
      goalData.exercise = selectedExercise?._id;
      goalData.targetWeight = Number(targetWeight);
      goalData.targetReps = Number(targetReps);
      // achievedDate is auto-calculated for strength goals
      goalData.distanceUnit = null;
      goalData.distanceValue = null;
      goalData.goalTime = null;
      goalData.goalWeight = null;
    } else if (isCardioGoal) {
      goalData.distanceUnit = distanceUnit;
      goalData.distanceValue = distanceValue === '' ? null : Number(distanceValue);
      goalData.goalTime = goalTime || null;
      goalData.goalWeight = null;
      goalData.achievedDate = achievedDate;
    } else if (isWeightGoal) {
      goalData.distanceUnit = null;
      goalData.distanceValue = null;
      goalData.goalTime = null;
      goalData.goalWeight = goalWeight === '' ? null : Number(goalWeight);
      goalData.achievedDate = achievedDate;
    } else {
      goalData.distanceUnit = null;
      goalData.distanceValue = null;
      goalData.goalTime = null;
      goalData.goalWeight = null;
      goalData.achievedDate = achievedDate;
    }
    dispatch(updateGoal(goalData));
  };

  const resetEdit = () => {
    setTitle(goal.title || '');
    setDescription(goal.description || '');
    setCategory(goal.category || '');
    setSelectedExercise(goal.exercise || null);
    setTargetWeight(goal.targetWeight || '');
    setTargetReps(goal.targetReps || '');
    setDistanceUnit(goal.distanceUnit || 'Miles');
    setDistanceValue(goal.distanceValue || '');
    setGoalTime(goal.goalTime || '');
    setGoalWeight(goal.goalWeight || '');
    setTargetDate(goal.targetDate || '');
    setAchievedDate(goal.achievedDate || '');
  };

  const handleCommentSubmit = () => {
    if (newComment !== '') {
      dispatch(addGoalComment(goal._id, newComment))
        .then(() => setNewComment(''));
    }
  };

  const handleOpenDeleteConfirmation = () => setOpenDeleteConfirmation(true);
  const handleCloseDeleteConfirmation = () => setOpenDeleteConfirmation(false);

  const DeleteConfirmation = ({ goalId, open, onClose }) => {
    const submitDelete = () => dispatch(deleteGoal(goalId));
    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            width: "80%",
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
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
                Are you sure you would like to permanently delete this goal?
              </Typography>
            </Grid>
            <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid>
                <Button color='secondaryButton' variant="contained" onClick={onClose}>
                  Cancel
                </Button>
              </Grid>
              <Grid>
                <Button variant="contained" onClick={submitDelete}>
                  Confirm
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  const goalId = goal?._id;

  useEffect(() => {
    if (!goalId) return;
    setTitle(goal.title || '');
    setDescription(goal.description || '');
    setCategory(goal.category || '');
    setSelectedExercise(goal.exercise || null);
    setTargetWeight(goal.targetWeight || '');
    setTargetReps(goal.targetReps || '');
    setDistanceUnit(goal.distanceUnit || 'Miles');
    setDistanceValue(goal.distanceValue || '');
    setGoalTime(goal.goalTime || '');
    setGoalWeight(goal.goalWeight || '');
    setTargetDate(goal.targetDate || '');
    setAchievedDate(goal.achievedDate || '');
  }, [goalId]);

  // Mark achievement as seen when opening a goal with unseen achievement
  useEffect(() => {
    if (open && goal?.achievedDate && !goal?.achievementSeen) {
      dispatch(markAchievementSeen(goal._id));
    }
  }, [open, goal?._id, goal?.achievedDate, goal?.achievementSeen, dispatch]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        '& .MuiDialog-paper': {
          height: '100%',
          width: "100%",
        }
      }}
    >
      <DialogTitle id="alert-dialog-title">
        <Grid container>
          <Grid container size={6}>
            Goal Details
          </Grid>
          <Grid container size={6} justifyContent="flex-end">
            <Tooltip title="Delete">
              <IconButton variant="contained" onClick={handleOpenDeleteConfirmation}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid container size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {isStrengthGoal ? (
            <>
              <Grid container size={{ xs: 12, sm: 8 }}>
                <Autocomplete
                  fullWidth
                  options={exerciseLibrary || []}
                  getOptionLabel={(option) => option?.exerciseTitle || ''}
                  value={selectedExercise}
                  onChange={(e, newValue) => setSelectedExercise(newValue)}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  renderInput={(params) => (
                    <TextField {...params} label="Exercise" InputLabelProps={{ shrink: true }} />
                  )}
                />
              </Grid>
              <Grid container size={{ xs: 6, sm: 3 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Target Weight (lbs)"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid container size={{ xs: 6, sm: 3 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Target Reps"
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid container size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Current Max"
                  value={currentMax !== null ? `${currentMax} lbs` : 'Select exercise and reps'}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid container size={{ xs: 12, sm: 8 }}>
                <TextField
                  type="text"
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => handleChange(e, setTitle)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {isCardioGoal && (
                <>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Distance Unit</InputLabel>
                      <Select
                        value={distanceUnit}
                        label="Distance Unit"
                      onChange={(e) => handleDistanceUnitChange(e.target.value)}
                      >
                        {DISTANCE_UNITS.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Distance"
                      value={distanceValue}
                      onChange={(e) => setDistanceValue(e.target.value)}
                      inputProps={{ step: "0.01" }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="text"
                      fullWidth
                      label="Goal Time"
                      value={goalTime}
                      onChange={handleGoalTimeChange}
                      placeholder="HH:MM:SS"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9:]*" }}
                      helperText="Format: HH:MM:SS (minutes/seconds 00-59)"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
              {isWeightGoal && (
                <>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="text"
                      fullWidth
                      label="Current Weight (lbs)"
                      value={latestMetric?.weight ?? ""}
                      InputProps={{ readOnly: true }}
                      helperText={latestMetric?.weight ? "Pulled from Body Metrics" : "No metrics yet"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Goal Weight (lbs)"
                      value={goalWeight}
                      onChange={(e) => setGoalWeight(e.target.value)}
                      inputProps={{ step: "0.1" }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
              {isWeightGoal && (
                <>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="text"
                      fullWidth
                      label="Current Weight (lbs)"
                      value={latestMetric?.weight ?? ""}
                      InputProps={{ readOnly: true }}
                      helperText={latestMetric?.weight ? "Pulled from Body Metrics" : "No metrics yet"}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Goal Weight (lbs)"
                      value={goalWeight}
                      onChange={(e) => setGoalWeight(e.target.value)}
                      inputProps={{ step: "0.1" }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          <Grid container size={{ xs: 12, sm: isStrengthGoal ? 12 : 6 }}>
            <TextField
              type="date"
              fullWidth
              label="Target Date"
              value={targetDate.substr(0, 10)}
              onChange={(e) => handleChange(e, setTargetDate)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {isStrengthGoal ? (
            goal.achievedDate && (
              <Grid container size={12}>
                <TextField
                  fullWidth
                  label="Achieved Date"
                  value={new Date(goal.achievedDate).toLocaleDateString()}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  disabled
                  helperText="Automatically set when goal is achieved in a workout"
                />
              </Grid>
            )
          ) : (
            <Grid container size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                fullWidth
                label="Achieved Date"
                value={achievedDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setAchievedDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
          <Grid container size={12}>
            <TextField
              type="text"
              fullWidth
              multiline
              label="Description"
              value={description}
              onChange={(e) => handleChange(e, setDescription)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
            <Grid>
              <Button color='secondaryButton' variant="contained" onClick={resetEdit}>
                Reset
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" onClick={saveGoal}>
                Save
              </Button>
            </Grid>
          </Grid>

          <DialogTitle id="alert-dialog-title">
            Comments
          </DialogTitle>
          <Grid container spacing={1} size={12} sx={{ padding: "10px 0px", justifyContent: 'center', }}>
            {goal.comments && goal.comments.length > 0
              ? goal.comments.map(comment => (
                <Grid key={comment._id} container size={12} sx={{ padding: "12px 0px" }}>
                  <Grid container size={2} sx={{ justifyContent: 'center', alignItems: 'center', }}>
                    <Avatar src={comment?.user?.profilePicture ? `${serverURL}/user/profilePicture/${comment.user.profilePicture}` : null} />
                  </Grid>
                  <Grid container size={10}>
                    <Grid container size={12}>
                      <Typography variant="body1">
                        {comment?.user?.firstName} {comment?.user?.lastName}
                      </Typography>
                      <Typography variant="caption" component="p" sx={{ padding: '2.5px 5px', }}>
                        {comment.createdDate.substr(0, 10)}
                      </Typography>
                      {comment?.user?._id === user?._id && (
                        <Tooltip title="Delete comment">
                          <IconButton
                            size="small"
                            onClick={() => dispatch(removeGoalComment(goal._id, comment._id))}
                          >
                            <Delete fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Grid>
                    <Grid size={11}>
                      <Typography variant="body2">{comment.comment}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))
              : <Typography variant="body1">No comments</Typography>}
          </Grid>
          <Grid container size={12} sx={{ flexGrow: 1, alignContent: 'flex-end', flex: 'initial', }}>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              label="Note"
              InputProps={{
                endAdornment: <Button variant="contained" sx={{}} onClick={handleCommentSubmit}>Submit</Button>
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DeleteConfirmation open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} goalId={goal._id} />
    </Dialog>
  );
};

const AddNewGoal = ({ open, onClose, dispatch, exerciseLibrary, latestMetric }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [targetWeight, setTargetWeight] = useState('');
  const [targetReps, setTargetReps] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('Miles');
  const [distanceValue, setDistanceValue] = useState('');
  const [goalTime, setGoalTime] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [currentMax, setCurrentMax] = useState(null);
  const [targetDate, setTargetDate] = useState('');

  const isStrengthGoal = category === "Strength";
  const isCardioGoal = category === "Cardio";
  const isWeightGoal = category === "Weight";

  const handleChange = (e, setter) => setter(e.target.value);
  const handleDistanceUnitChange = (nextUnit) => {
    if (distanceValue !== '') {
      setDistanceValue(convertDistanceValue(distanceValue, distanceUnit, nextUnit));
    }
    setDistanceUnit(nextUnit);
  };
  const handleGoalTimeChange = (e) => setGoalTime(formatRaceTime(e.target.value));

  const fetchCurrentMax = useCallback(async () => {
    if (!selectedExercise?._id || !targetReps) {
      setCurrentMax(null);
      return;
    }
    try {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const response = await fetch(`${serverURL}/goals/exerciseMaxAtReps`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
        body: JSON.stringify({
          exerciseId: selectedExercise._id,
          targetReps: Number(targetReps),
        }),
      });
      const data = await response.json();
      setCurrentMax(data.maxWeight || 0);
    } catch (err) {
      console.error("Error fetching current max:", err);
    }
  }, [selectedExercise?._id, targetReps]);

  useEffect(() => {
    if (isStrengthGoal) {
      fetchCurrentMax();
    }
  }, [isStrengthGoal, fetchCurrentMax]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    setSelectedExercise(null);
    setTargetWeight('');
    setTargetReps('');
    setDistanceUnit('Miles');
    setDistanceValue('');
    setGoalTime('');
    setGoalWeight('');
    setCurrentMax(null);
    setTargetDate('');
  };

  const submitNewGoal = () => {
    const goalData = {
      title: isStrengthGoal && selectedExercise ? selectedExercise.exerciseTitle : title,
      description,
      category,
      targetDate,
    };
    if (isStrengthGoal) {
      goalData.exercise = selectedExercise?._id;
      goalData.targetWeight = Number(targetWeight);
      goalData.targetReps = Number(targetReps);
    } else if (isCardioGoal) {
      goalData.distanceUnit = distanceUnit;
      goalData.distanceValue = distanceValue === '' ? null : Number(distanceValue);
      goalData.goalTime = goalTime || null;
    } else if (isWeightGoal) {
      goalData.goalWeight = goalWeight === '' ? null : Number(goalWeight);
    }
    dispatch(addNewGoal(goalData))
      .then(() => {
        resetForm();
        onClose();
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        '& .MuiDialog-paper': {
          height: '100%',
          width: "100%",
        }
      }}
    >
      <DialogTitle id="alert-dialog-title">
        New Goal
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid container size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {isStrengthGoal ? (
            <>
              <Grid container size={{ xs: 12, sm: 8 }}>
                <Autocomplete
                  fullWidth
                  options={exerciseLibrary || []}
                  getOptionLabel={(option) => option?.exerciseTitle || ''}
                  value={selectedExercise}
                  onChange={(e, newValue) => setSelectedExercise(newValue)}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  renderInput={(params) => (
                    <TextField {...params} label="Exercise" InputLabelProps={{ shrink: true }} />
                  )}
                />
              </Grid>
              <Grid container size={{ xs: 6, sm: 3 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Target Weight (lbs)"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid container size={{ xs: 6, sm: 3 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Target Reps"
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid container size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Current Max"
                  value={currentMax !== null ? `${currentMax} lbs` : 'Select exercise and reps'}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid container size={{ xs: 12, sm: 8 }}>
                <TextField
                  type="text"
                  fullWidth
                  label="Title"
                  value={title}
                  onChange={(e) => handleChange(e, setTitle)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {isCardioGoal && (
                <>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Distance Unit</InputLabel>
                      <Select
                        value={distanceUnit}
                        label="Distance Unit"
                      onChange={(e) => handleDistanceUnitChange(e.target.value)}
                      >
                        {DISTANCE_UNITS.map((unit) => (
                          <MenuItem key={unit} value={unit}>
                            {unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Distance"
                      value={distanceValue}
                      onChange={(e) => setDistanceValue(e.target.value)}
                      inputProps={{ step: "0.01" }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid container size={{ xs: 12, sm: 4 }}>
                    <TextField
                      type="text"
                      fullWidth
                      label="Goal Time"
                      value={goalTime}
                      onChange={handleGoalTimeChange}
                      placeholder="HH:MM:SS"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9:]*" }}
                      helperText="Format: HH:MM:SS (minutes/seconds 00-59)"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          <Grid container size={12}>
            <TextField
              type="date"
              fullWidth
              label="Target Date"
              value={targetDate.substr(0, 10)}
              onChange={(e) => handleChange(e, setTargetDate)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              type="text"
              fullWidth
              multiline
              label="Description"
              value={description}
              onChange={(e) => handleChange(e, setDescription)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
            <Grid>
              <Button color='secondaryButton' variant="contained" onClick={resetForm}>
                Reset
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" onClick={submitNewGoal}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default function Goals({ view = "client", client, }) {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goals);
  const user = useSelector((state) => state.user);
  const exerciseLibrary = useSelector((state) => state.exerciseLibrary);
  const latestMetric = useSelector(
    (state) => state.metrics.latestByUser[(client?._id || user._id)]
  );

  const [selectedGoal, setSelectedGoal] = useState({});
  const [openGoalDetails, setOpenGoalDetails] = useState(false);
  const [openAddNewGoal, setOpenAddNewGoal] = useState(false);

  const handleOpenGoalDetails = (goal) => {
    setSelectedGoal(goal);
    setOpenGoalDetails(true);
  };
  const handleCloseGoalDetails = () => setOpenGoalDetails(false);

  const handleOpenAddNewGoal = () => setOpenAddNewGoal(true);
  const handleCloseAddNewGoal = () => setOpenAddNewGoal(false);

  useEffect(() => {
    setSelectedGoal(prev => {
      return prev ? goals.filter(goal => goal._id === prev._id)[0] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  useEffect(() => {
    dispatch(getGoals({ requestedBy: view, client: client?._id }));
    dispatch(requestExerciseLibrary());
    dispatch(requestLatestMetric({ userId: view === "trainer" ? client?._id : undefined }));
  }, [dispatch, view, client?._id]);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", minHeight: "100%", }}>

          <Grid container size={12} sx={{ justifyContent: 'center', paddingBottom: "15px", alignSelf: 'flex-start', flex: 'initial', }}>
            <Typography variant="h4">
              Goals
            </Typography>
            <Tooltip title="New Goal">
              <IconButton onClick={handleOpenAddNewGoal}><AddCircle /></IconButton>
            </ Tooltip>
          </Grid>

          <Grid container size={12} spacing={1} sx={{ alignSelf: 'flex-start', alignContent: 'flex-start', overflowY: 'scroll', scrollbarWidth: 'none', flex: 'auto', }}>
            {goals && goals.map((goal) => (
              <GoalCard key={goal._id} goal={goal} onOpen={handleOpenGoalDetails} />
            ))}
          </Grid>

        </Paper>
      </Container>

      {selectedGoal && (
        <GoalDetails
          goal={selectedGoal}
          open={openGoalDetails}
          onClose={handleCloseGoalDetails}
          dispatch={dispatch}
          user={user}
          exerciseLibrary={exerciseLibrary}
          latestMetric={latestMetric}
        />
      )}
      <AddNewGoal
        open={openAddNewGoal}
        onClose={handleCloseAddNewGoal}
        dispatch={dispatch}
        exerciseLibrary={exerciseLibrary}
        latestMetric={latestMetric}
      />
    </>
  );
}
