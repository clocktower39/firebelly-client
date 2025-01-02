import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverURL, getExerciseList, updateExercise } from "../../Redux/actions";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

export default function Exercises() {
  const dispatch = useDispatch();
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    if (exerciseList.length < 1) {
      dispatch(getExerciseList());
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
      <Autocomplete
        disableCloseOnSelect
        fullWidth
        value={selectedExercise}
        options={exerciseList
          .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
          .map((option) => option)}
        // compare the selected item with the list of options
        isOptionEqualToValue={(option, value) => option._id === value._id}
        // Tells Autocomplete what text to display for each option
        getOptionLabel={(option) => option.exerciseTitle}
        onChange={(e, newSelection) => setSelectedExercise(newSelection)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Selected Exercise"
            placeholder="Exercises"
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
      />
      {selectedExercise && <ExerciseLibrarySection selectedExercise={selectedExercise} />}
    </Container>
  );
}

const ExerciseLibrarySection = ({ selectedExercise }) => {
  const dispatch = useDispatch();
  const [exercise, setExercise] = useState(selectedExercise);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  const handleMuscleGroupChange = (field, newValue) => {
    setExercise((prev) => ({
      ...prev,
      muscleGroups: {
        ...prev.muscleGroups,
        [field]: newValue,
      },
    }));
  };

  const handleArrayChange = (fieldName) => (event, value) => {
    setExercise({ ...exercise, [fieldName]: value });
  };

  const handleVerifiedChange = (event) => {
    setExercise({ ...exercise, verified: event.target.checked });
  };

  const handleSave = () => {
    dispatch(updateExercise(exercise));
  };

  useEffect(() => {
    setExercise(selectedExercise);
  }, [selectedExercise]);

  return (
    <Box sx={{ padding: "15px 0px" }}>
      <Typography variant="h5" textAlign="center" sx={{ margin: "0 0 15px 0" }}>
        Edit Exercise:
      </Typography>
      {exercise._id && (
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
              label="Description"
              name="description"
              value={exercise.description}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={[]}
              multiple
              disableCloseOnSelect
              value={exercise.muscleGroups.primary}
              onChange={(e, getTagProps) => handleMuscleGroupChange("primary", getTagProps)}
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
                  label="Primary Muscle Groups"
                  placeholder="Select primary muscle groups"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[]}
              freeSolo
              value={exercise.muscleGroups.secondary}
              onChange={(e, getTagProps) => handleMuscleGroupChange("secondary", getTagProps)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={index} label={option} {...getTagProps({ index })} />
                ))
              }
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
              {"Update Exercise"}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
