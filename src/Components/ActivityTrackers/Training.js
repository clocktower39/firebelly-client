import React, { useState, useEffect,  } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { ContentCopy, Delete, DoubleArrow, Download, Settings } from "@mui/icons-material";
import { createTraining, requestTraining, updateTraining, updateWorkoutDate, copyWorkoutDate, deleteWorkoutDate, } from "../../Redux/actions";
import SwipeableSet from "./TrainingSections/SwipeableSet";
import SelectedDate from "./SelectedDate";
import Loading from "../Loading";

export function ModalAction(props) {
  const { actionType, selectedDate, handleModalToggle } = props;
  const dispatch = useDispatch();
  const [newDate, setNewDate] = useState(null);
  
  const handleMove = () => {
    dispatch(updateWorkoutDate(selectedDate, newDate)).then(()=> handleModalToggle());
  }

  const handleCopy = () => {
    dispatch(copyWorkoutDate(selectedDate, newDate)).then(()=> handleModalToggle());
  }

  const handleDelete = () => {
    dispatch(deleteWorkoutDate(selectedDate)).then(()=> handleModalToggle());
  }

  switch (actionType) {
    case 'move':
      return (
        <>
          <SelectedDate setParentSelectedDate={setNewDate} />
          <Grid container sx={{ justifyContent: 'center', }}><Button variant="contained" onClick={handleMove} >Move</Button></Grid>
        </>);
    case 'copy':
      return (
        <>
          <SelectedDate setParentSelectedDate={setNewDate} />
          <Grid container sx={{ justifyContent: 'center', }}><Button variant="contained" onClick={handleCopy} >Copy</Button></Grid>
        </>);
    case 'delete':
      return (
        <>
        <Grid container>
          <Grid container><Typography color='text.primary' >Are you sure you would like the delete the training from {selectedDate}</Typography></Grid>
          <Grid container sx={{ justifyContent: 'center', }}>
            <Button variant="contained" onClick={handleDelete} >Confrim</Button>
          </Grid>
        </Grid>
        </>);
    default:
      return (<></>);
  }
}

export default function Training(props) {
  const { view='client', clientId, } = props;
  const dispatch = useDispatch();
  const [ size ] = useOutletContext() || [900];
  const training = useSelector((state) => state.training);

  const [selectedDate, setSelectedDate] = useState(null);

  const [trainingCategory, setTrainingCategory] = useState([]);

  const [localTraining, setLocalTraining] = useState([]);

  const [loading, setLoading] = useState(true);

  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen(prev => !prev);
    setModalActionType('');
  }

  const [modalActionType, setModalActionType] = useState('');
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  const categories = ["Biceps", "Triceps", "Chest", "Back", "Shoulders", "Legs"];

  let allTraining = [];

  let trainingAchieved = 0;
  let trainingGoal = 1;

  if (training) {
    if (training.training.length > 0 && allTraining.length > 0) {
      trainingAchieved = allTraining.reduce((a, b) => ({
        achieved: a.achieved + b.achieved,
      })).achieved;
      trainingGoal = allTraining.reduce((a, b) => ({
        goal: a.goal + b.goal,
      })).goal;
    }
  }

  // Create a new exercise on the current set
  const newExercise = (index) => {
    const newTraining = localTraining.map((group, i) => {
      if (index === i) {
        group.push({
          exercise: "",
          exerciseType: "Reps",
          goals: {
            sets: 1,
            minReps: [0],
            maxReps: [0],
            exactReps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
          },
          achieved: {
            sets: 0,
            reps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
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
            sets: 1,
            minReps: [0],
            maxReps: [0],
            exactReps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
          },
          achieved: {
            sets: 0,
            reps: [0],
            weight: [0],
            percent: [0],
            seconds: [0],
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
        category: [...trainingCategory],
        training: localTraining,
      })
    );
  };

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps);
  };

  useEffect(() => {
    setTrainingCategory(training.category && training.category.length > 0 ? training.category : []);
    setLocalTraining(training.training || []);
  }, [training]);

  useEffect(() => {
    if(selectedDate !== null){
      setLoading(true);
      dispatch(requestTraining(selectedDate, view, clientId ))
      .then(()=>{
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const classes = {
    modalStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
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
    }
  };
  
  return (
    <>
        <Modal open={modalOpen} onClose={handleModalToggle} >
          <Box sx={classes.modalStyle}>
            <Typography variant="h5" textAlign="center" color="text.primary" gutterBottom >Workout Settings</Typography>
            <Grid container sx={{ justifyContent: 'center', }}>
              <IconButton title="Move Workout" onClick={() => handleSetModalAction('move')} ><DoubleArrow /></IconButton>
              <IconButton title="Copy Workout" onClick={() => handleSetModalAction('copy')} ><ContentCopy /></IconButton>
              <IconButton title="Import Workout" disabled ><Download /></IconButton>
              <IconButton title="Delete Workout" onClick={() => handleSetModalAction('delete')} ><Delete /></IconButton>
            </Grid>
            <ModalAction actionType={modalActionType} selectedDate={selectedDate} handleModalToggle={handleModalToggle}/>
          </Box>
        </Modal>
          <SelectedDate setParentSelectedDate={setSelectedDate} input />
          <Grid container sx={{ alignItems: "center", paddingBottom: "15px" }}>
            <Grid item xs={3}>
              <Typography sx={classes.heading}>Training</Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(trainingAchieved / trainingGoal) * 100}
              />
            </Grid>
          </Grid>
          {loading ? <Loading /> : training._id ? (
            <>
              <Grid container sx={{ justifyContent: "flex-start", minHeight: "100%" }}>
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
                            endAdornment: (
                              <>
                                <IconButton variant="contained" title="Workout Settings" onClick={handleModalToggle}>
                                  <Settings />
                                </IconButton>
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
                    selectedDate={selectedDate}
                    size={size}
                  />
                )}
              </Grid>
              <Grid
                container
                item
                xs={12}
                sx={{ alignContent: "flex-end", flexGrow: 1, paddingBottom: "5px" }}
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
              sx={{ justifyContent: "center", alignContent: "center", flexGrow: 1 }}
            >
              <Button variant="contained" onClick={() => dispatch(createTraining(selectedDate))}>
                Create Workout
              </Button>
            </Grid>
          )}
    </>
  );
}
