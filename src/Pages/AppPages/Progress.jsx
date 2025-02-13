import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Chip,
  Grid,
  Modal,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  requestMyExerciseList,
  requestExerciseProgress,
  getExerciseList,
} from "../../Redux/actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { theme } from "../../theme";

const modalStyle = () => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: `translate(-50%, -50%)`,
  maxWidth: "1220px",
  bgcolor: "background.ATCPaperBackground",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
});

const exerciseTypeFields = (exerciseType) => {
  switch (exerciseType) {
    case "Reps":
    case "Rep Range":
      return {
        repeating: [
          {
            goalAttribute: "weight",
            label: "Weight",
          },
          {
            goalAttribute: "reps",
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
            goalAttribute: "reps",
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

export const ModalBarChartHistory = (props) => {
  const { targetExerciseHistory, open, handleClose } = props;
  return (
    <Modal
      keepMounted
      open={open}
      onClose={handleClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box sx={modalStyle()}>
        <BarChartHistory targetExerciseHistory={targetExerciseHistory}/>
      </Box>
    </Modal>
  );
};

export const BarChartHistory = (props) => {
  const [size] = useOutletContext();
  const { targetExerciseHistory } = props;
  let totalMaxValues = {};
  let exerciseTitle = '';
  let exercise = [];
  let historyCount = targetExerciseHistory.length;
  let [range, setRange] = useState([
    historyCount > 5 ? historyCount - 6 : 0,
    historyCount,
  ]);

  const handleRangeChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < 1) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], historyCount - 1);
        setRange([clamped, clamped + 1]);
      } else {
        const clamped = Math.max(newValue[1], 1);
        setRange([clamped - 1, clamped]);
      }
    } else {
      setRange(newValue);
    }
  };

  useEffect(() => {
    setRange([historyCount > 5 ? historyCount - 6 : 0, historyCount]);
  }, [historyCount]);

  if (targetExerciseHistory && targetExerciseHistory.length > 0) {
    exercise = targetExerciseHistory
      .filter((e, i) => i >= range[0] && i <= range[1])
      .map((e, i) => {
        const exerciseFields = exerciseTypeFields(e.exerciseType);
        const data = { date: e.date.substr(0, 10) };

        exerciseFields.repeating.forEach((field) => {
          const fieldRange = `${field.goalAttribute}Range`;
          data[fieldRange] = e.achieved[field.goalAttribute] || [];

          if (!totalMaxValues[fieldRange]) {
            totalMaxValues[fieldRange] = 0;
          }
          const maxFieldValue = Math.max(...e.achieved[field.goalAttribute]);
          if (totalMaxValues[fieldRange] < maxFieldValue) {
            totalMaxValues[fieldRange] = maxFieldValue;
          }
        });

        if (exerciseTitle === '') {
          exerciseTitle = e.exercise.exerciseTitle;
        }

        return data;
      });

    // Determine which field to use for sorting
    const firstRepeatingField = exerciseTypeFields(
      targetExerciseHistory[0].exerciseType
    ).repeating[0].goalAttribute;

    let exerciseIndex = exercise
      .slice()
      .sort((a, b) => a[`${firstRepeatingField}Range`].length < b[`${firstRepeatingField}Range`].length)[0];
  }

  const RenderToolTip = ({ payload, unit, fill }) => {
    return (
      <Box
        sx={{
          padding: "7.5px",
          borderRadius: "15px",
          backgroundColor: "background.ChartToopTip",
          opacity: ".90",
        }}
      >
        <Typography textAlign="center" sx={{ color: "text.primary" }}>
          {payload && payload[0] && payload[0].payload.date}
        </Typography>
        <Typography textAlign="center" sx={{ color: fill }}>
          {unit}
        </Typography>
        {payload?.[0]?.payload[`${unit.toLowerCase()}Range`]?.map((u, i) => (
          <Typography
            key={`${u}-${i}`}
            textAlign="center"
            sx={{ color: "text.primary" }}
          >
            <strong>Set {i + 1}:</strong>{" "}
            <Typography variant="p" sx={{ color: fill }}>
              {u}
            </Typography>
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Typography
        variant="h4"
        color="primary.contrastText"
        sx={{ textAlign: 'center' }}
      >
        {exerciseTitle}
      </Typography>
      <Grid container item xs={12} sx={{ justifyContent: 'center' }}>
        <Slider
          getAriaLabel={() => 'Temperature range'}
          value={range}
          onChange={handleRangeChange}
          valueLabelDisplay="off"
          max={historyCount > 0 ? historyCount - 1 : 1}
          disableSwap
        />
      </Grid>
      {targetExerciseHistory.length > 0 &&
        exerciseTypeFields(targetExerciseHistory[0].exerciseType).repeating.map(
          (field, i) => (
            <BarChart
              key={`chart-${field.goalAttribute}`}
              width={size * 0.85}
              height={size * 0.3}
              data={exercise}
            >
              {exercise.length > 0 &&
                exercise[0][`${field.goalAttribute}Range`]?.map((_, index) => (
                  <Bar
                    key={`bar-${field.goalAttribute}-${index}`}
                    dataKey={`${field.goalAttribute}Range[${index}]`}
                    fill={i === 0 ? theme().palette.secondary.main : i === 1 ? theme().palette.error.main :  theme().palette.primary.main}
                  />
                ))}
              <XAxis dataKey="date" />
              <YAxis
                domain={[0, totalMaxValues[`${field.goalAttribute}Range`]]}
                label={{
                  value: field.label,
                  angle: -90,
                  position: 'insideLeft',
                  fill: i === 0 ? theme().palette.secondary.main : i === 1 ? theme().palette.error.main :  theme().palette.primary.main
                }}
              />
              <Tooltip
                content={<RenderToolTip label={field.label} />}
                unit={field.label}
                fill={i === 0 ? theme().palette.secondary.main : i === 1 ? theme().palette.error.main :  theme().palette.primary.main}
                cursor={false}
              />
            </BarChart>
          )
        )}
      {targetExerciseHistory.length > 0 &&
        exerciseTypeFields(targetExerciseHistory[0].exerciseType).nonRepeating.map(
          (field, i) => (
            <BarChart
              key={`chart-${field.goalAttribute}`}
              width={size * 0.85}
              height={size * 0.3}
              data={exercise}
            >
              <Bar
                key={`bar-${field.goalAttribute}-${i}`}
                dataKey={`${field.goalAttribute}`}
                fill={theme().palette.error.main}
              />
              <XAxis dataKey="date" />
              <YAxis
                domain={[0, totalMaxValues[`${field.goalAttribute}`]]}
                label={{
                  value: field.label,
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme().palette.error.main,
                }}
              />
              <Tooltip
                content={<RenderToolTip label={field.label} />}
                fill={theme().palette.error.main}
                cursor={false}
              />
            </BarChart>
          )
        )}
    </>
  );
};


const ExerciseListAutocomplete = (props) => {
  const { exerciseList, exercise } = props;
  const [title, setTitle] = useState(exercise?.exercise?.exerciseTitle || "");

  const matchWords = (option, inputValue) => {
    if(!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  useEffect(() => {
    exercise.set(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);
  return (
    <Autocomplete
      disableCloseOnSelect
      fullWidth
      freeSolo
      value={title}
      defaultValue={title}
      options={exerciseList
        .filter((a) => a.exerciseTitle !== "")
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option.exerciseTitle)}
      onChange={(e, getTagProps) => setTitle(getTagProps)}
      filterOptions={(options, { inputValue }) => 
        options.filter(option => matchWords(option, inputValue))
      }
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Search" placeholder="Exercises" />
      )}
    />
  );
};

export default function Progress(props) {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState(props.searchExercise || "");
  const user = useSelector((state) => state.user);
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const targetExerciseHistory = useSelector(
    (state) => state.progress.targetExerciseHistory
  );

  const loadExerciseProgress = (exercise) => {
    dispatch(requestExerciseProgress(exercise, user));
  };

  useEffect(() => {
    const matchedExercise = exerciseList.find(item => item.exerciseTitle === searchValue);
    if (matchedExercise) {
      const id = matchedExercise._id;
      console.log("Found _id:", id);
      loadExerciseProgress(matchedExercise);
    } else {
      console.log("No matching exercise found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    if(exerciseList.length < 1){
      dispatch(getExerciseList());
    }
    if (props.searchExercise && props.searchExercise !== "") {
      loadExerciseProgress(props.searchExercise);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid container sx={{ justifyContent: "center", marginTop: "25px" }}>
        <Grid xs={12} sm={8} container>
          <ExerciseListAutocomplete
            exercise={{ set: setSearchValue, exercise: searchValue }}
            exerciseList={exerciseList}
          />
        </Grid>
        <Grid container xs={12}>
          <Grid xs={12}>
              <BarChartHistory targetExerciseHistory={targetExerciseHistory || []} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
