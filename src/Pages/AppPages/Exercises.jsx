import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  serverURL,
  getExerciseList,
  updateExercise,
  createExercise,
  mergeExercises,
} from "../../Redux/actions";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

export default function Exercises() {
  const dispatch = useDispatch();
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const user = useSelector((state) => state.user);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [selectedExercise, setSelectedExercise] = useState(null);

  const matchWords = (option, inputValue) => {
    if (!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }


  useEffect(() => {
    if (exerciseList.length < 1) {
      dispatch(getExerciseList());
    }
  }, []);

  const isExerciseAdmin = ["612198502f4d5273b466b4e4", "613d0935341e9f055c320d81"].includes(
    user?._id
  );

  return (
    <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Edit" {...a11yProps(0)} />
          <Tab label="Add" {...a11yProps(1)} disabled={!isExerciseAdmin} />
          <Tab label="Merge" {...a11yProps(2)} disabled={!isExerciseAdmin} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <Autocomplete
          disableCloseOnSelect
          fullWidth
          value={selectedExercise}
          options={exerciseList
            .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
            .map((option) => option)}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          getOptionLabel={(option) => option.exerciseTitle}
          onChange={(e, newSelection) => setSelectedExercise(newSelection)}
          filterOptions={(options, { inputValue }) =>
            options.filter(option => matchWords(option.exerciseTitle, inputValue))
          }
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
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {isExerciseAdmin ? (
          <ExerciseAddSection />
        ) : (
          <Typography variant="body2">Only the business owner can add exercises.</Typography>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {isExerciseAdmin ? (
          <ExerciseMergeSection />
        ) : (
          <Typography variant="body2">Only the business owner can merge exercises.</Typography>
        )}
      </CustomTabPanel>
    </Container>
  );
}

const muscleGroupOptions = [
  "Abdominals",
  "Back",
  "Biceps",
  "Calves",
  "Chest",
  "Forearms",
  "Glutes",
  "Hamstrings",
  "Neck",
  "Quadriceps",
  "Shoulders",
  "Triceps",
];

const exercisePropertyOptions = [
  {
    fieldName: "equipment",
    options: [
      "Ab Wheel",
      "Band",
      "Barbell",
      "Baseblocks",
      "Battle Rope",
      "Bodyweight",
      "Bosu-Ball",
      "Box",
      "Cable",
      "Chain Belt",
      "Dumbbell",
      "Endless Rope",
      "EZ-Bar",
      "Kettlebell",
      "Landmine",
      "Loop-Band",
      "Machine",
      "P-Bar",
      "Plate Loaded Machine",
      "Pull-up Bar",
      "Rings",
      "Safety Squat Bar",
      "Slam Ball",
      "Smith Machine",
      "Stability Ball",
      "Swiss Bar",
      "Trap Bar",
      "TRX",
    ],
  },
  {
    fieldName: "attachments",
    options: [
      "Velcro Straps",
      "EZ-Bar",
      "MAG",
      "Rope",
      "Straight-Bar",
      "Triangle",
      "Uni-Grip",
    ],
  },
  {
    fieldName: "anatomicalHandPosition",
    options: ["Neutral-Grip", "Overhand-Grip", "Underhand-Grip"],
  },
  {
    fieldName: "handSetup",
    options: ["Narrow-Grip", "Wide-Grip"],
  },
  {
    fieldName: "footsetup",
    options: ["B-Stance", "Narrow-Stance", "Wide-Stance"],
  },
  {
    fieldName: "bodyPosition",
    options: [
      "Decline",
      "Elevated",
      "Hanging",
      "Incline",
      "Inverted",
      "Kneeling",
      "Lying",
      "Preacher",
      "Prone",
      "Renegade",
      "Seated",
      "Standing",
      "Walking",
    ],
  },
  {
    fieldName: "movementPattern",
    options: ["Alternating", "Uni-Lateral"],
  },
  {
    fieldName: "generalVariation",
    options: [
      "Behind-the-Head",
      "Crossover",
      "High-to-Low",
      "Low-to-High",
      "Overhead",
      "Twisting",
    ],
  },
];

const createEmptyExercise = () => ({
  exerciseTitle: "",
  description: "",
  muscleGroups: { primary: [], secondary: [] },
  equipment: [],
  tags: [],
  generalVariation: [],
  attachments: [],
  anatomicalHandPosition: [],
  footsetup: [],
  handSetup: [],
  movementPattern: [],
  bodyPosition: [],
  verified: false,
});

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
          <Grid size={12}>
            <TextField
              fullWidth
              label="Exercise Title"
              name="exerciseTitle"
              value={exercise.exerciseTitle}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid size={12}>
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
          <Grid size={12}>
            <Autocomplete
              options={[
                ...muscleGroupOptions,
              ]}
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
          <Grid size={12}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={[
                ...muscleGroupOptions,
              ]}
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
          {exercisePropertyOptions.map((field) => (
            <Grid size={12} key={field.fieldName}>
              <Autocomplete
                multiple
                options={field.options} // You should replace this with your actual data sources
                value={exercise[field.fieldName]}
                onChange={handleArrayChange(field.fieldName)}
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
                    label={field.fieldName
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())} // Convert camelCase to Start Case
                    placeholder={`Add ${field.fieldName}`}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid size={12}>
            <FormControlLabel
              control={<Switch checked={exercise.verified} onChange={handleVerifiedChange} />}
              label="Verified"
            />
          </Grid>
          <Grid size={12}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {"Update Exercise"}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

const ExerciseAddSection = () => {
  const dispatch = useDispatch();
  const [exercise, setExercise] = useState(createEmptyExercise());
  const [status, setStatus] = useState(null);

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

  const handleCreate = async () => {
    const trimmedTitle = exercise.exerciseTitle.trim();
    if (!trimmedTitle) {
      setStatus({ type: "error", message: "Exercise title is required." });
      return;
    }

    const result = await dispatch(
      createExercise({
        ...exercise,
        exerciseTitle: trimmedTitle,
      })
    );

    if (result?.error) {
      setStatus({ type: "error", message: result.error });
      return;
    }

    setExercise(createEmptyExercise());
    setStatus({ type: "success", message: "Exercise created." });
  };

  return (
    <Box sx={{ padding: "15px 0px" }}>
      <Typography variant="h5" textAlign="center" sx={{ margin: "0 0 15px 0" }}>
        Add Exercise:
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Exercise Title"
            name="exerciseTitle"
            value={exercise.exerciseTitle}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid size={12}>
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
        <Grid size={12}>
          <Autocomplete
            options={[...muscleGroupOptions]}
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
        <Grid size={12}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={[...muscleGroupOptions]}
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
        {exercisePropertyOptions.map((field) => (
          <Grid size={12} key={field.fieldName}>
            <Autocomplete
              multiple
              options={field.options}
              value={exercise[field.fieldName]}
              onChange={handleArrayChange(field.fieldName)}
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
                  label={field.fieldName
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  placeholder={`Add ${field.fieldName}`}
                />
              )}
            />
          </Grid>
        ))}
        <Grid size={12}>
          <FormControlLabel
            control={<Switch checked={exercise.verified} onChange={handleVerifiedChange} />}
            label="Verified"
          />
        </Grid>
        {status && (
          <Grid size={12}>
            <Typography
              sx={{ color: status.type === "error" ? "error.main" : "success.main" }}
            >
              {status.message}
            </Typography>
          </Grid>
        )}
        <Grid size={12}>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            {"Create Exercise"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const ExerciseMergeSection = () => {
  const dispatch = useDispatch();
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const [sourceExercise, setSourceExercise] = useState(null);
  const [targetExercise, setTargetExercise] = useState(null);
  const [deleteSource, setDeleteSource] = useState(true);
  const [status, setStatus] = useState(null);

  const handleMerge = async () => {
    if (!sourceExercise || !targetExercise) {
      setStatus({ type: "error", message: "Select both exercises to merge." });
      return;
    }
    if (sourceExercise._id === targetExercise._id) {
      setStatus({ type: "error", message: "Source and target cannot be the same exercise." });
      return;
    }

    const result = await dispatch(
      mergeExercises({
        sourceExerciseId: sourceExercise._id,
        targetExerciseId: targetExercise._id,
        deleteSource,
      })
    );

    if (result?.error) {
      setStatus({ type: "error", message: result.error });
      return;
    }

    setSourceExercise(null);
    setTargetExercise(null);
    setStatus({ type: "success", message: "Exercises merged." });
  };

  return (
    <Box sx={{ padding: "15px 0px" }}>
      <Typography variant="h5" textAlign="center" sx={{ margin: "0 0 15px 0" }}>
        Merge Exercises:
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Autocomplete
            fullWidth
            value={sourceExercise}
            options={exerciseList
              .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
              .map((option) => option)}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            getOptionLabel={(option) => option.exerciseTitle}
            onChange={(e, newSelection) => setSourceExercise(newSelection)}
            renderInput={(params) => (
              <TextField {...params} label="Merge From (to remove)" placeholder="Exercise" />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Autocomplete
            fullWidth
            value={targetExercise}
            options={exerciseList
              .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
              .map((option) => option)}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            getOptionLabel={(option) => option.exerciseTitle}
            onChange={(e, newSelection) => setTargetExercise(newSelection)}
            renderInput={(params) => (
              <TextField {...params} label="Merge Into (to keep)" placeholder="Exercise" />
            )}
          />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={
              <Switch checked={deleteSource} onChange={(e) => setDeleteSource(e.target.checked)} />
            }
            label="Remove source exercise from library"
          />
        </Grid>
        {status && (
          <Grid size={12}>
            <Typography
              sx={{ color: status.type === "error" ? "error.main" : "success.main" }}
            >
              {status.message}
            </Typography>
          </Grid>
        )}
        <Grid size={12}>
          <Button variant="contained" color="primary" onClick={handleMerge}>
            {"Merge Exercises"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
