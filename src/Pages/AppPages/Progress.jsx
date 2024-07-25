import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Chip,
  Unstable_Grid2 as Grid,
  Modal,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  requestMyExerciseList,
  requestExerciseProgess,
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
  let totalMaxWeight = 0;
  let totalMaxReps = 0;
  let exerciseTitle = "";
  let exerciseIndex = 0;
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

  if (targetExerciseHistory) {
    exercise = targetExerciseHistory
      .filter((e, i) => i >= range[0] && i <= range[1])
      .map((e, i) => {
        const reps = e.achieved.reps;
        const weight = e.achieved.weight;

        const sortedReps = [...e.achieved.reps].sort((a, b) => a - b);
        const sortedWeight = [...e.achieved.weight].sort((a, b) => a - b);

        let minReps = parseInt(sortedReps[0]);
        let maxReps = parseInt(sortedReps[sortedReps.length - 1]);
        let minWeight = parseInt(sortedWeight[0]);
        let maxWeight = parseInt(sortedWeight[sortedWeight.length - 1]);

        if (totalMaxWeight < maxWeight) {
          totalMaxWeight = maxWeight;
        }
        if (totalMaxReps < maxReps) {
          totalMaxReps = maxReps;
        }
        if (exerciseTitle === "") {
          exerciseTitle = e.exercise;
        }

        let newE = {
          date: e.date.substr(0, 10),
          weightRange: [minWeight, maxWeight],
          repRange: [minReps, maxReps],
          weight,
          reps,
        };
        return newE;
      });
    exerciseIndex = exercise
      .slice()
      .sort((a, b) => a.reps.length < b.reps.length)[0];
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
        {payload?.[0]?.payload[unit.toLowerCase()]?.map((u, i) => (
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
        sx={{ textAlign: "center" }}
      >
        {exerciseTitle}
      </Typography>
      <Grid container item xs={12} sx={{ justifyContent: "center" }}>
        <Slider
          getAriaLabel={() => "Temperature range"}
          value={range}
          onChange={handleRangeChange}
          valueLabelDisplay="off"
          max={historyCount > 0 ? historyCount - 1 : 1}
          disableSwap
        />
      </Grid>
      <BarChart width={size * 0.85} height={size * 0.3} data={exercise}>
        {exerciseIndex?.weight?.map((w, i) => (
          <Bar
            key={`bar-weight-${exerciseIndex}-${i}`}
            dataKey={`weight[${i}]`}
            fill={theme().palette.secondary.main}
          />
        ))}
        <XAxis dataKey="date" />
        <YAxis
          domain={[0, totalMaxWeight]}
          label={{
            value: "Weight",
            angle: -90,
            position: "insideLeft",
            fill: theme().palette.secondary.main,
          }}
        />
        <Tooltip
          content={<RenderToolTip />}
          unit={"Weight"}
          fill={theme().palette.secondary.main}
          cursor={false}
        />
      </BarChart>

      <BarChart width={size * 0.85} height={size * 0.3} data={exercise}>
        {exerciseIndex?.reps?.map((w, i) => (
          <Bar
            key={`bar-reps-${exerciseIndex}-${i}`}
            dataKey={`reps[${i}]`}
            fill={theme().palette.error.main}
          />
        ))}
        <XAxis dataKey="date" />
        <YAxis
          domain={[0, totalMaxReps]}
          label={{
            value: "Reps",
            angle: -90,
            position: "insideLeft",
            fill: theme().palette.error.main,
          }}
        />
        <Tooltip
          content={<RenderToolTip />}
          unit={"Reps"}
          fill={theme().palette.error.main}
          cursor={false}
        />
      </BarChart>
    </>
  );
};

const ExerciseListAutocomplete = (props) => {
  const { exerciseList, exercise } = props;
  const [title, setTitle] = useState(exercise.exercise || "");
  useEffect(() => {
    exercise.set(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);
  return (
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
      onChange={(e, getTagProps) => setTitle(getTagProps)}
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
  const exerciseList = useSelector((state) => state.progress.exerciseList);
  const targetExerciseHistory = useSelector(
    (state) => state.progress.targetExerciseHistory
  );

  const loadExerciseProgress = (exercise) => {
    dispatch(requestExerciseProgess(exercise));
  };

  useEffect(() => {
    if (exerciseList.includes(searchValue)) {
      loadExerciseProgress(searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    if(exerciseList.length < 1){
      dispatch(requestMyExerciseList());
    }
    if (props.searchExercise) {
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
