{
  /* 

 - Make auth route for only Jonathan and I 

 - Make save button. 
   -  onClick sends fetch to update [disable fields and button], on success modify exerciseList state on page as well so search box updates with new saved edit

 - Expandable 'Occurrences' section
   - shows users with count and expandable dates view


*/
}
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverURL, updateMasterExerciseName } from "../../Redux/actions";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;

export default function Exercises() {
  const dispatch = useDispatch();
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editName, setEditName] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogLoading, setConfirmDialogLoading] = useState(false);

  const handleConfirmDialogOpen = () => {
    // open dialog and then confirm save before fetch
    if (selectedExercise !== "" && editName !== "") {
      setConfirmDialogOpen((prev) => true);
    }
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen((prev) => false);

  const handleSubmit = async () => {
    if (selectedExercise?.exercise && editName !== "") {
      setConfirmDialogLoading(true);
      const trainingIdList = selectedExercise.dates.map(date => date.trainingId);      

      try {
        await dispatch(updateMasterExerciseName(selectedExercise.exercise, editName, trainingIdList));

        // Update selectedExercise.exercise to editName
        // if new exercise title already exists in the list, spread the ...dates, merge the users, add to the count
        // if new exercise title does not exist, only rename the exercise
        setExerciseList((prev) => {
          const doesExerciseExist = prev.some((e) => e.exercise === editName);

          const updatedList = prev.map((e) => {
            if (!doesExerciseExist) {
              if (e === selectedExercise) {
                return { ...e, exercise: editName }; // Return a new object with updated exercise name
              }
            } else {
              if (e.exercise === editName) {
                return {
                  ...e,
                  dates: [...e.dates, ...selectedExercise.dates],
                  count: e.count + selectedExercise.count,
                  users: [...e.users, ...selectedExercise.users].filter(
                    (user, index, self) => index === self.findIndex((u) => u.id === user.id)
                  ),
                };
              }
            }
            return e;
          });

          // Remove the selectedExercise instance if the exercise already exists
          if (doesExerciseExist) {
            return updatedList.filter((e) => e !== selectedExercise);
          } else {
            return updatedList;
          }
        });
      } catch (error) {
        console.error("Error updating master exercise name:", error);
      } finally {
        setConfirmDialogLoading(false); // Ensure this runs after the dispatch completes
        setSelectedExercise(null);
        setEditName("");
        handleConfirmDialogClose();
      }
    }
  };

  useEffect(() => {
    fetch(`${serverURL}/exerciseList`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setExerciseList(data);
      });
  }, []);

  return (
    <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
      <Paper sx={{ padding: "5px 15px", borderRadius: "15px", minHeight: "100%" }}>
        <Autocomplete
          value={selectedExercise}
          options={exerciseList}
          getOptionLabel={(option) => option.exercise}
          fullWidth
          onChange={(event, newValue) => {
            setSelectedExercise(newValue);
            setEditName(newValue);
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Typography variant="body1">{option.exercise}</Typography>
              <Typography variant="caption" sx={{ marginLeft: "auto" }}>
                {option.count}
              </Typography>
              <AvatarGroup>
                {option.users
                  .sort((a, b) => {
                    // Prioritize "Jon" to always be first
                    if (a.firstName === "Jon") return -1;
                    if (b.firstName === "Jon") return 1;

                    // Prioritize "Matt" to be second
                    if (a.firstName === "Matt" && b.firstName !== "Jon") return -1;
                    if (b.firstName === "Matt" && a.firstName !== "Jon") return 1;

                    // Alphabetical sort for all others
                    return a.firstName.localeCompare(b.firstName);
                  })
                  .map((u) => (
                    <Avatar
                      key={u._id}
                      src={
                        u.profilePicture && `${serverURL}/user/profilePicture/${u.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={`${u.firstName} ${u.lastName}`}
                    />
                  ))}
              </AvatarGroup>
            </Box>
          )}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label="Select Exercise"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            );
          }}
        />
        {selectedExercise && (
          <>
            <Box sx={{ padding: "15px", border: "3px solid red" }}>
              <Typography variant="h4">String format conversion prep</Typography>
              <Autocomplete
                disableCloseOnSelect
                fullWidth
                freeSolo
                value={editName}
                defaultValue={editName}
                options={exerciseList.map((option) => option.exercise)}
                getOptionLabel={(option) => (typeof option === "string" ? option : option.exercise)}
                onChange={(e, getTagProps) => setEditName(getTagProps)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={index} variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    sx={{ margin: "15px 0" }}
                    {...params}
                    label="Update Exercise Title"
                    placeholder="Exercises"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleConfirmDialogOpen}
                        >
                          Save
                        </Button>
                      ),
                    }}
                  />
                )}
              />
              <AvatarGroup>
                {selectedExercise.users
                  .sort((a, b) => {
                    // Prioritize "Jon" to always be first
                    if (a.firstName === "Jon") return -1;
                    if (b.firstName === "Jon") return 1;

                    // Prioritize "Matt" to be second
                    if (a.firstName === "Matt" && b.firstName !== "Jon") return -1;
                    if (b.firstName === "Matt" && a.firstName !== "Jon") return 1;

                    // Alphabetical sort for all others
                    return a.firstName.localeCompare(b.firstName);
                  })
                  .map((u) => (
                    <Avatar
                      key={u._id}
                      src={
                        u.profilePicture && `${serverURL}/user/profilePicture/${u.profilePicture}`
                      }
                      sx={{ maxHeight: "35px", maxWidth: "35px", margin: "0 15px" }}
                      alt={`${u.firstName} ${u.lastName}`}
                    >
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </Avatar>
                  ))}
              </AvatarGroup>
              <Typography variant="h5">Exercise Details</Typography>
              <Typography>Name: {selectedExercise.exercise}</Typography>
              <Typography>Occurrences: {selectedExercise.count}</Typography>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Occurrences Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedExercise.dates.map((date, index) => (
                      <ListItem key={index} dense >
                        <ListItemText
                          primary={`Date: ${new Date(date.date).toLocaleDateString()}, Training Id: ${date.trainingId}, User: ${
                            date.user.firstName
                          } ${date.user.lastName}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
            {/* <ExerciseLibrarySection selectedExercise={selectedExercise.exercise} /> */}
          </>
        )}
      </Paper>
      {selectedExercise?.exercise && (
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
                  Are you sure you would like to rename the exercises? This can not be reversed.
                </Typography>
              </Grid>
              <Grid item container xs={12}>
                <Typography variant="body2" sx={{ color: "red" }}>
                  {selectedExercise?.exercise}
                </Typography>
              </Grid>
              <Grid item container xs={12}>
                <Typography variant="subtitle">to</Typography>
              </Grid>
              <Grid item container xs={12}>
                <Typography variant="body2" sx={{ color: "red" }}>
                  {editName}
                </Typography>
              </Grid>
              <Grid item container xs={12} spacing={2} sx={{ justifyContent: "center" }}>
                <Grid item>
                  <Button
                    color="secondaryButton"
                    variant="contained"
                    onClick={handleConfirmDialogClose}
                    disabled={confirmDialogLoading}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={confirmDialogLoading}
                  >
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}

const ExerciseLibrarySection = ({ selectedExercise, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState({
    exerciseTitle: "",
    muscleGroups: { primary: [], secondary: [] },
    equipment: [],
    instructions: "",
    tags: [],
    generalVariation: [],
    tempo: [],
    anatomicalHandPosition: [],
    footSetup: [],
    handSetup: [],
    movementPattern: [],
    bodyPosition: [],
    verified: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  const handleMuscleGroupChange = (field) => (event, newValue) => {
    setExercise({
      ...exercise,
      muscleGroups: {
        ...exercise.muscleGroups,
        [field]: newValue,
      },
    });
  };

  const handleArrayChange = (fieldName) => (event, value) => {
    setExercise({ ...exercise, [fieldName]: value });
  };

  const handleVerifiedChange = (event) => {
    setExercise({ ...exercise, verified: event.target.checked });
  };

  const handleSave = () => {
    onSave(exercise);
  };

  useEffect(() => {
    // search 'selectedExercise' string against the exercise library and determine if the entry exists yet
    // if exisits, interface allows editing
    // else create new entry, then loop back on POST response
    fetch(`${serverURL}/search_exercise`, {
      method: "post",
      dataType: "json",
      body: JSON.stringify({
        exerciseTitle: selectedExercise,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: bearer,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setExercise(data);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ padding: "15px", border: "3px solid green" }}>
      <Typography variant="h4" sx={{ margin: "0 0 15px 0" }}>
        Exercise Library
      </Typography>
      {loading
        ? "loading"
        : exercise && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exercise Title"
                  name="exerciseTitle"
                  value={exercise.exerciseTitle}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  name="instructions"
                  value={exercise.instructions}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={[]}
                  getOptionLabel={(option) => option.name} // assuming each muscle group has a 'name' property
                  value={exercise.muscleGroups.primary}
                  onChange={handleMuscleGroupChange("primary")}
                  freesolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Primary Muscle Groups"
                      placeholder="Select primary muscle groups"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={[]}
                  getOptionLabel={(option) => option.name}
                  value={exercise.muscleGroups.secondary}
                  onChange={handleMuscleGroupChange("secondary")}
                  freesolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Secondary Muscle Groups"
                      placeholder="Select secondary muscle groups"
                    />
                  )}
                />
              </Grid>
              {[
                "tags",
                "equipment",
                "generalVariation",
                "tempo",
                "anatomicalHandPosition",
                "footSetup",
                "handSetup",
                "movementPattern",
                "bodyPosition",
              ].map((field) => (
                <Grid item xs={12} key={field}>
                  <Autocomplete
                    multiple
                    options={[]} // You should replace this with your actual data sources
                    value={exercise[field]}
                    onChange={handleArrayChange(field)}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip key={index} label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label={field
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())} // Convert camelCase to Start Case
                        placeholder={`Add ${field}`}
                      />
                    )}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={exercise.verified} onChange={handleVerifiedChange} />}
                  label="Verified"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  {true ? "Update Exercise" : "Add Exercise"}
                </Button>
              </Grid>
            </Grid>
          )}
    </Box>
  );
};