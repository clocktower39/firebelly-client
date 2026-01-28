import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Chip,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDownward, ArrowUpward, FilterList } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import {
  requestClients,
  requestExerciseProgress,
  getExerciseList,
  requestMetrics,
  requestPendingMetrics,
  requestLatestMetric,
  createMetricEntry,
  reviewMetricEntry,
  updateMetricEntry,
  deleteMetricEntry,
} from "../../Redux/actions";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { theme } from "../../theme";
import queryString from "query-string";

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

const CIRCUMFERENCE_FIELDS = [
  { key: "neck", label: "Neck" },
  { key: "shoulders", label: "Shoulders" },
  { key: "arms", label: "Arms" },
  { key: "forearms", label: "Forearms" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "glutes", label: "Glutes" },
  { key: "thighs", label: "Thighs" },
  { key: "calves", label: "Calves" },
];

const parseHeightToInches = (heightValue) => {
  if (!heightValue) return null;
  const heightStr = String(heightValue).trim();
  const ftInMatch = heightStr.match(/(\d+)\s*'\s*(\d+)?/);
  if (ftInMatch) {
    const feet = Number(ftInMatch[1] || 0);
    const inches = Number(ftInMatch[2] || 0);
    const totalInches = feet * 12 + inches;
    return Number.isFinite(totalInches) && totalInches > 0 ? totalInches : null;
  }
  const numericHeight = Number(heightStr.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numericHeight) || numericHeight <= 0) return null;
  if (numericHeight > 100) {
    return numericHeight / 2.54;
  }
  return numericHeight;
};

const calculateBmi = (weightLbs, heightInches) => {
  if (!Number.isFinite(weightLbs) || !Number.isFinite(heightInches) || heightInches <= 0) {
    return "";
  }
  const bmi = (weightLbs / (heightInches * heightInches)) * 703;
  return Number.isFinite(bmi) ? (Math.round(bmi * 10) / 10).toFixed(1) : "";
};

const pad2 = (value) => String(value).padStart(2, "0");

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toUtcISOString = (value) => {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

const formatRecordedAt = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const WEIGHT_UNITS = [
  { value: "lbs", label: "lbs" },
  { value: "kg", label: "kg" },
];

const CIRCUMFERENCE_UNITS = [
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
];

const toLbs = (value, unit) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return unit === "kg" ? numericValue * 2.20462 : numericValue;
};

const fromLbs = (value, unit) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  return unit === "kg" ? numericValue / 2.20462 : numericValue;
};

const toInches = (value, unit) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return unit === "cm" ? numericValue / 2.54 : numericValue;
};

const fromInches = (value, unit) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  return unit === "cm" ? numericValue * 2.54 : numericValue;
};

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
  const { workoutUser, exerciseList, targetExerciseProgress, open, handleClose } = props;

  const targetExercise = exerciseList.find((ex) => ex._id === targetExerciseProgress._id)
  const targetExerciseHistory = targetExercise?.history?.[workoutUser._id] || [];

  return (
    <Modal
      keepMounted
      open={open}
      onClose={handleClose}
    >
      <Box sx={modalStyle()}>
        <BarChartHistory targetExerciseHistory={targetExerciseHistory} />
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

  const getMaxSetsForField = (fieldRange) =>
    Math.max(0, ...exercise.map((row) => (row[fieldRange]?.length ?? 0)));

  return (
    <>
      <Typography
        variant="h4"
        color="primary.contrastText"
        sx={{ textAlign: 'center' }}
      >
        {exerciseTitle}
      </Typography>
      <Grid container size={12} sx={{ justifyContent: 'center' }}>
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
        exerciseTypeFields(targetExerciseHistory[0].exerciseType).repeating.map((field, i) => {
          const fieldRange = `${field.goalAttribute}Range`;
          const maxSets = getMaxSetsForField(fieldRange);

          return (
            <BarChart
              key={`chart-${field.goalAttribute}`}
              width={size * 0.85}
              height={size * 0.3}
              data={exercise}
            >
              {[...Array(maxSets)].map((_, index) => (
                <Bar
                  key={`bar-${field.goalAttribute}-${index}`}
                  dataKey={`${fieldRange}[${index}]`}
                  fill={
                    i === 0
                      ? theme().palette.secondary.main
                      : i === 1
                        ? theme().palette.error.main
                        : theme().palette.primary.main
                  }
                />
              ))}

              <XAxis dataKey="date" />
              <YAxis
                domain={[0, totalMaxValues[fieldRange] ?? 0]}
                label={{
                  value: field.label,
                  angle: -90,
                  position: "insideLeft",
                  fill:
                    i === 0
                      ? theme().palette.secondary.main
                      : i === 1
                        ? theme().palette.error.main
                        : theme().palette.primary.main,
                }}
              />
              <Tooltip
                content={<RenderToolTip label={field.label} />}
                unit={field.label}
                fill={
                  i === 0
                    ? theme().palette.secondary.main
                    : i === 1
                      ? theme().palette.error.main
                      : theme().palette.primary.main
                }
                cursor={false}
              />
            </BarChart>
          );
        })}
    </>
  );
};


const ExerciseListAutocomplete = (props) => {
  const { exerciseList, exercise } = props;
  const [title, setTitle] = useState(exercise?.exercise?.exerciseTitle || "");

  const matchWords = (option, inputValue) => {
    if (!option) return false;
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

const BodyMetrics = ({ targetUser, isTrainerView }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const metricsState = useSelector((state) => state.metrics);
  const userId = targetUser?._id;
  const entries = metricsState.entriesByUser[userId] || [];
  const pending = metricsState.pendingByUser[userId] || [];
  const latest = metricsState.latestByUser[userId] || null;
  const hasLoadedEntries = useMemo(
    () => Object.prototype.hasOwnProperty.call(metricsState.entriesByUser, userId),
    [metricsState.entriesByUser, userId]
  );

  const [recordedAt, setRecordedAt] = useState(() => toLocalDateTimeInput(new Date()));
  const [weight, setWeight] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [restingHeartRate, setRestingHeartRate] = useState("");
  const [circumference, setCircumference] = useState({});
  const [weightUnit, setWeightUnit] = useState("lbs");
  const [circumferenceUnit, setCircumferenceUnit] = useState("in");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editRecordedAt, setEditRecordedAt] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editBodyFatPercent, setEditBodyFatPercent] = useState("");
  const [editRestingHeartRate, setEditRestingHeartRate] = useState("");
  const [editCircumference, setEditCircumference] = useState({});
  const [metricsSortKey, setMetricsSortKey] = useState("recordedAt");
  const [metricsSortDirection, setMetricsSortDirection] = useState("desc");
  const [metricsFilterAnchor, setMetricsFilterAnchor] = useState(null);
  const [metricsFilterKey, setMetricsFilterKey] = useState("");
  const [metricsFilterLabel, setMetricsFilterLabel] = useState("");
  const [metricsDateRange, setMetricsDateRange] = useState({ from: "", to: "" });
  const [metricsRangeFilters, setMetricsRangeFilters] = useState({});

  const heightInches = useMemo(() => parseHeightToInches(targetUser?.height), [targetUser?.height]);
  const bmiPreview = useMemo(
    () => calculateBmi(toLbs(weight, weightUnit), heightInches),
    [weight, weightUnit, heightInches]
  );

  useEffect(() => {
    if (!userId) return;
    const requestUserId = isTrainerView ? userId : undefined;
    dispatch(requestMetrics({ userId: requestUserId }));
    dispatch(requestLatestMetric({ userId: requestUserId }));
    if (!isTrainerView) {
      dispatch(requestPendingMetrics());
    }
  }, [dispatch, userId, isTrainerView]);

  useEffect(() => {
    if (entries.length > 0) {
      setOnboardingOpen(false);
      return;
    }
    if (!isTrainerView && hasLoadedEntries && entries.length === 0) {
      setOnboardingOpen(true);
    }
  }, [entries.length, hasLoadedEntries, isTrainerView]);

  const handleCircumferenceChange = (key, value) => {
    setCircumference((prev) => ({ ...prev, [key]: value }));
  };

  const handleWeightUnitChange = (nextUnit) => {
    if (weight !== "") {
      const weightInLbs = toLbs(weight, weightUnit);
      const converted = fromLbs(weightInLbs, nextUnit);
      setWeight(converted === "" ? "" : String(converted));
    }
    setWeightUnit(nextUnit);
  };

  const handleCircumferenceUnitChange = (nextUnit) => {
    if (Object.keys(circumference).length > 0) {
      const updated = {};
      CIRCUMFERENCE_FIELDS.forEach((field) => {
        const value = circumference[field.key];
        if (value === "" || value === undefined) return;
        const inches = toInches(value, circumferenceUnit);
        const converted = fromInches(inches, nextUnit);
        updated[field.key] = converted === "" ? "" : String(converted);
      });
      setCircumference((prev) => ({ ...prev, ...updated }));
    }
    setCircumferenceUnit(nextUnit);
  };

  const resetForm = () => {
    setRecordedAt(toLocalDateTimeInput(new Date()));
    setWeight("");
    setBodyFatPercent("");
    setRestingHeartRate("");
    setCircumference({});
    setWeightUnit("lbs");
    setCircumferenceUnit("in");
  };

  const handleSubmit = () => {
    if (!userId) return;
    const payload = {
      userId: isTrainerView ? userId : undefined,
      recordedAt: toUtcISOString(recordedAt),
      weight: weight === "" ? undefined : toLbs(weight, weightUnit),
      bodyFatPercent: bodyFatPercent === "" ? undefined : Number(bodyFatPercent),
      restingHeartRate: restingHeartRate === "" ? undefined : Number(restingHeartRate),
    };

    const cleanedCircumference = Object.fromEntries(
      Object.entries(circumference).filter(([, value]) => value !== "" && value !== undefined)
    );
    if (Object.keys(cleanedCircumference).length > 0) {
      const convertedCircumference = Object.fromEntries(
        Object.entries(cleanedCircumference).map(([key, value]) => [
          key,
          toInches(value, circumferenceUnit),
        ])
      );
      payload.circumference = convertedCircumference;
    }

    dispatch(createMetricEntry(payload)).then(() => {
      const requestUserId = isTrainerView ? userId : undefined;
      dispatch(requestMetrics({ userId: requestUserId }));
      dispatch(requestLatestMetric({ userId: requestUserId }));
      if (!isTrainerView) {
        dispatch(requestPendingMetrics());
      }
      resetForm();
      setOnboardingOpen(false);
    });
  };

  const latestEntry = latest || entries[0] || null;
  const formatCircumference = (entry) => {
    if (!entry?.circumference) return "";
    const parts = CIRCUMFERENCE_FIELDS.map((field) => {
      const value = entry.circumference?.[field.key];
      const formatted = fromInches(value, circumferenceUnit);
      return formatted !== "" ? `${field.label}: ${Number(formatted).toFixed(1)}` : null;
    }).filter(Boolean);
    return parts.join(" • ");
  };

  const metricBounds = useMemo(() => {
    const values = {
      weight: [],
      bodyFatPercent: [],
      bmi: [],
      restingHeartRate: [],
    };
    entries.forEach((entry) => {
      if (entry.weight !== undefined && entry.weight !== null) {
        const display = fromLbs(entry.weight, weightUnit);
        const numeric = Number(display);
        if (Number.isFinite(numeric)) values.weight.push(numeric);
      }
      if (entry.bodyFatPercent != null && Number.isFinite(Number(entry.bodyFatPercent))) {
        values.bodyFatPercent.push(Number(entry.bodyFatPercent));
      }
      if (entry.bmi != null && Number.isFinite(Number(entry.bmi))) {
        values.bmi.push(Number(entry.bmi));
      }
      if (entry.restingHeartRate != null && Number.isFinite(Number(entry.restingHeartRate))) {
        values.restingHeartRate.push(Number(entry.restingHeartRate));
      }
    });
    const build = (list) => {
      if (!list.length) return null;
      return [Math.min(...list), Math.max(...list)];
    };
    return {
      weight: build(values.weight),
      bodyFatPercent: build(values.bodyFatPercent),
      bmi: build(values.bmi),
      restingHeartRate: build(values.restingHeartRate),
    };
  }, [entries, weightUnit]);

  useEffect(() => {
    setMetricsRangeFilters((prev) => {
      const next = { ...prev };
      Object.entries(metricBounds).forEach(([key, bounds]) => {
        if (!bounds) return;
        if (!next[key]) next[key] = bounds;
      });
      return next;
    });
  }, [metricBounds]);

  const getMetricValue = useCallback(
    (entry, key) => {
      switch (key) {
        case "weight": {
          if (entry.weight == null) return null;
          const display = fromLbs(entry.weight, weightUnit);
          const numeric = Number(display);
          return Number.isFinite(numeric) ? numeric : null;
        }
        case "bodyFatPercent":
          return entry.bodyFatPercent == null ? null : Number(entry.bodyFatPercent);
        case "bmi":
          return entry.bmi == null ? null : Number(entry.bmi);
        case "restingHeartRate":
          return entry.restingHeartRate == null ? null : Number(entry.restingHeartRate);
        default:
          return null;
      }
    },
    [weightUnit]
  );

  const openMetricsFilter = (event, key, label) => {
    setMetricsFilterAnchor(event.currentTarget);
    setMetricsFilterKey(key);
    setMetricsFilterLabel(label);
  };

  const closeMetricsFilter = () => {
    setMetricsFilterAnchor(null);
    setMetricsFilterKey("");
    setMetricsFilterLabel("");
  };

  const toggleMetricsSort = (key) => {
    setMetricsSortDirection((prev) =>
      metricsSortKey === key ? (prev === "asc" ? "desc" : "asc") : "asc"
    );
    setMetricsSortKey(key);
  };

  const filteredEntries = useMemo(() => {
    let list = [...entries];
    if (metricsDateRange.from) {
      const from = new Date(metricsDateRange.from);
      list = list.filter((entry) => new Date(entry.recordedAt) >= from);
    }
    if (metricsDateRange.to) {
      const to = new Date(metricsDateRange.to);
      to.setHours(23, 59, 59, 999);
      list = list.filter((entry) => new Date(entry.recordedAt) <= to);
    }
    ["weight", "bodyFatPercent", "bmi", "restingHeartRate"].forEach((key) => {
      const range = metricsRangeFilters[key];
      if (!range) return;
      list = list.filter((entry) => {
        const value = getMetricValue(entry, key);
        if (value == null || !Number.isFinite(value)) return false;
        return value >= range[0] && value <= range[1];
      });
    });
    const direction = metricsSortDirection === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (metricsSortKey) {
        case "recordedAt":
          return (new Date(a.recordedAt) - new Date(b.recordedAt)) * direction;
        case "weight": {
          const av = getMetricValue(a, "weight") ?? -Infinity;
          const bv = getMetricValue(b, "weight") ?? -Infinity;
          return (av - bv) * direction;
        }
        case "bodyFatPercent": {
          const av = getMetricValue(a, "bodyFatPercent") ?? -Infinity;
          const bv = getMetricValue(b, "bodyFatPercent") ?? -Infinity;
          return (av - bv) * direction;
        }
        case "bmi": {
          const av = getMetricValue(a, "bmi") ?? -Infinity;
          const bv = getMetricValue(b, "bmi") ?? -Infinity;
          return (av - bv) * direction;
        }
        case "restingHeartRate": {
          const av = getMetricValue(a, "restingHeartRate") ?? -Infinity;
          const bv = getMetricValue(b, "restingHeartRate") ?? -Infinity;
          return (av - bv) * direction;
        }
        case "circumference": {
          const av = formatCircumference(a) ? 1 : 0;
          const bv = formatCircumference(b) ? 1 : 0;
          return (av - bv) * direction;
        }
        default:
          return 0;
      }
    });
    return list;
  }, [
    entries,
    formatCircumference,
    getMetricValue,
    metricsDateRange,
    metricsRangeFilters,
    metricsSortDirection,
    metricsSortKey,
  ]);

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditRecordedAt(entry.recordedAt ? toLocalDateTimeInput(entry.recordedAt) : "");
    const displayWeight = fromLbs(entry.weight, weightUnit);
    setEditWeight(displayWeight === "" ? "" : String(Number(displayWeight).toFixed(1)));
    setEditBodyFatPercent(entry.bodyFatPercent ?? "");
    setEditRestingHeartRate(entry.restingHeartRate ?? "");
    const displayCircumference = {};
    CIRCUMFERENCE_FIELDS.forEach((field) => {
      const value = entry.circumference?.[field.key];
      const converted = fromInches(value, circumferenceUnit);
      if (converted !== "") {
        displayCircumference[field.key] = Number(converted).toFixed(1);
      }
    });
    setEditCircumference(displayCircumference);
    setEditOpen(true);
  };

  const handleEditWeightUnitChange = (nextUnit) => {
    if (editWeight !== "") {
      const weightInLbs = toLbs(editWeight, weightUnit);
      const converted = fromLbs(weightInLbs, nextUnit);
      setEditWeight(converted === "" ? "" : String(Number(converted).toFixed(1)));
    }
    setWeightUnit(nextUnit);
  };

  const handleEditCircumferenceUnitChange = (nextUnit) => {
    if (Object.keys(editCircumference).length > 0) {
      const updated = {};
      CIRCUMFERENCE_FIELDS.forEach((field) => {
        const value = editCircumference[field.key];
        if (value === "" || value === undefined) return;
        const inches = toInches(value, circumferenceUnit);
        const converted = fromInches(inches, nextUnit);
        updated[field.key] = converted === "" ? "" : String(Number(converted).toFixed(1));
      });
      setEditCircumference((prev) => ({ ...prev, ...updated }));
    }
    setCircumferenceUnit(nextUnit);
  };

  const handleEditSubmit = () => {
    if (!editingEntry) return;
    const payload = {
      entryId: editingEntry._id,
      recordedAt: toUtcISOString(editRecordedAt),
      weight: editWeight === "" ? undefined : toLbs(editWeight, weightUnit),
      bodyFatPercent: editBodyFatPercent === "" ? undefined : Number(editBodyFatPercent),
      restingHeartRate: editRestingHeartRate === "" ? undefined : Number(editRestingHeartRate),
    };

    const cleanedCircumference = Object.fromEntries(
      Object.entries(editCircumference).filter(([, value]) => value !== "" && value !== undefined)
    );
    if (Object.keys(cleanedCircumference).length > 0) {
      const convertedCircumference = Object.fromEntries(
        Object.entries(cleanedCircumference).map(([key, value]) => [
          key,
          toInches(value, circumferenceUnit),
        ])
      );
      payload.circumference = convertedCircumference;
    }

    dispatch(updateMetricEntry(payload)).then(() => {
      const requestUserId = isTrainerView ? userId : undefined;
      dispatch(requestMetrics({ userId: requestUserId }));
      dispatch(requestLatestMetric({ userId: requestUserId }));
      setEditOpen(false);
      setEditingEntry(null);
    });
  };

  const handleDeleteEntry = () => {
    if (!editingEntry) return;
    dispatch(deleteMetricEntry(editingEntry._id, userId)).then(() => {
      const requestUserId = isTrainerView ? userId : undefined;
      dispatch(requestMetrics({ userId: requestUserId }));
      dispatch(requestLatestMetric({ userId: requestUserId }));
      setDeleteConfirmOpen(false);
      setEditOpen(false);
      setEditingEntry(null);
    });
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: "15px" }}>
      <Grid container size={12}>
        <Typography variant="h5">Body Metrics</Typography>
      </Grid>

      {isTrainerView && (
        <Grid container size={12}>
          <Typography variant="body2" color="text.secondary">
            Entries you submit require client approval before they appear in progress.
          </Typography>
        </Grid>
      )}

      <Grid container size={12}>
        <Paper sx={{ width: "100%", padding: "16px" }}>
          <Grid container spacing={2}>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="datetime-local"
                fullWidth
                label="Recorded At"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 3 }}>
              <TextField
                type="number"
                fullWidth
                label="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputProps={{ step: "0.1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={weightUnit}
                  label="Unit"
                  onChange={(e) => handleWeightUnitChange(e.target.value)}
                >
                  {WEIGHT_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Body Fat %"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                inputProps={{ step: "0.1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Resting HR (bpm)"
                value={restingHeartRate}
                onChange={(e) => setRestingHeartRate(e.target.value)}
                inputProps={{ step: "1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="text"
                fullWidth
                label="BMI (auto)"
                value={bmiPreview}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid container size={12}>
              <Divider sx={{ width: "100%", margin: "10px 0" }} />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6 }} alignItems="center">
              <Typography variant="subtitle1">Circumference ({circumferenceUnit})</Typography>
            </Grid>
            <Grid container size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={circumferenceUnit}
                  label="Unit"
                  onChange={(e) => handleCircumferenceUnitChange(e.target.value)}
                >
                  {CIRCUMFERENCE_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {CIRCUMFERENCE_FIELDS.map((field) => (
              <Grid key={field.key} container size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={field.label}
                  value={circumference[field.key] || ""}
                  onChange={(e) => handleCircumferenceChange(field.key, e.target.value)}
                  inputProps={{ step: "0.1" }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}
            <Grid container size={12} sx={{ justifyContent: "flex-end", marginTop: "8px" }}>
              <Stack direction="row" spacing={2}>
                <Button color="secondaryButton" variant="contained" onClick={resetForm}>
                  Clear
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                  Save Entry
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {latestEntry && (
        <Grid container size={12}>
          <Paper sx={{ width: "100%", padding: "16px" }}>
            <Typography variant="subtitle1">Latest Metrics</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRecordedAt(latestEntry.recordedAt)}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ marginTop: "8px" }}>
              <Typography variant="body1">
                Weight:{" "}
                {latestEntry.weight !== undefined
                  ? `${Number(fromLbs(latestEntry.weight, weightUnit)).toFixed(1)} ${weightUnit}`
                  : "—"}
              </Typography>
              <Typography variant="body1">Body Fat: {latestEntry.bodyFatPercent ?? "—"}%</Typography>
              <Typography variant="body1">BMI: {latestEntry.bmi ?? "—"}</Typography>
              <Typography variant="body1">RHR: {latestEntry.restingHeartRate ?? "—"} bpm</Typography>
            </Stack>
            {formatCircumference(latestEntry) && (
              <Typography variant="body2" sx={{ marginTop: "6px" }}>
                {formatCircumference(latestEntry)}
              </Typography>
            )}
          </Paper>
        </Grid>
      )}

      {!isTrainerView && pending.length > 0 && (
        <Grid container size={12}>
          <Paper sx={{ width: "100%", padding: "16px" }}>
            <Typography variant="subtitle1">Pending Trainer Entries</Typography>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Recorded</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Body Fat</TableCell>
                    <TableCell>BMI</TableCell>
                    <TableCell>RHR</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pending.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{formatRecordedAt(entry.recordedAt)}</TableCell>
                      <TableCell>
                        {entry.weight !== undefined
                          ? `${Number(fromLbs(entry.weight, weightUnit)).toFixed(1)} ${weightUnit}`
                          : "—"}
                      </TableCell>
                      <TableCell>{entry.bodyFatPercent ?? "—"}</TableCell>
                      <TableCell>{entry.bmi ?? "—"}</TableCell>
                      <TableCell>{entry.restingHeartRate ?? "—"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              dispatch(reviewMetricEntry(entry._id, true)).then(() => {
                                dispatch(requestMetrics());
                                dispatch(requestLatestMetric());
                                dispatch(requestPendingMetrics());
                              })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              dispatch(reviewMetricEntry(entry._id, false)).then(() => {
                                dispatch(requestMetrics());
                                dispatch(requestLatestMetric());
                                dispatch(requestPendingMetrics());
                              })
                            }
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      )}

      <Grid container size={12}>
        <Paper sx={{ width: "100%", padding: "16px" }}>
          <Typography variant="subtitle1">History</Typography>
          {entries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No entries yet.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">Recorded</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("recordedAt")}>
                          {metricsSortKey === "recordedAt" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) => openMetricsFilter(event, "recordedAt", "Recorded")}
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">Weight</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("weight")}>
                          {metricsSortKey === "weight" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) => openMetricsFilter(event, "weight", "Weight")}
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">Body Fat</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("bodyFatPercent")}>
                          {metricsSortKey === "bodyFatPercent" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) => openMetricsFilter(event, "bodyFatPercent", "Body Fat")}
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">BMI</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("bmi")}>
                          {metricsSortKey === "bmi" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) => openMetricsFilter(event, "bmi", "BMI")}
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">RHR</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("restingHeartRate")}>
                          {metricsSortKey === "restingHeartRate" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            openMetricsFilter(event, "restingHeartRate", "Resting Heart Rate")
                          }
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption">Circumference</Typography>
                        <IconButton size="small" onClick={() => toggleMetricsSort("circumference")}>
                          {metricsSortKey === "circumference" && metricsSortDirection === "desc" ? (
                            <ArrowDownward fontSize="inherit" />
                          ) : (
                            <ArrowUpward fontSize="inherit" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            openMetricsFilter(event, "circumference", "Circumference")
                          }
                        >
                          <FilterList fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.slice(0, 10).map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{formatRecordedAt(entry.recordedAt)}</TableCell>
                      <TableCell>
                        {entry.weight !== undefined
                          ? `${Number(fromLbs(entry.weight, weightUnit)).toFixed(1)} ${weightUnit}`
                          : "—"}
                      </TableCell>
                      <TableCell>{entry.bodyFatPercent ?? "—"}</TableCell>
                      <TableCell>{entry.bmi ?? "—"}</TableCell>
                      <TableCell>{entry.restingHeartRate ?? "—"}</TableCell>
                      <TableCell>{formatCircumference(entry) || "—"}</TableCell>
                      <TableCell>
                        {String(entry.createdBy) === String(user._id) && (
                          <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => openEditEntry(entry)}>
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                openEditEntry(entry);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>

      <Modal open={onboardingOpen} onClose={() => setOnboardingOpen(false)}>
        <Box sx={modalStyle()}>
          <Typography variant="h5" sx={{ marginBottom: "8px" }}>
            Add Your First Metrics
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: "16px" }}>
            Track weight, body fat, resting heart rate, and measurements over time.
          </Typography>
          <Button variant="contained" onClick={() => setOnboardingOpen(false)}>
            Start Tracking
          </Button>
        </Box>
      </Modal>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Metrics Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: "4px" }}>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="datetime-local"
                fullWidth
                label="Recorded At"
                value={editRecordedAt}
                onChange={(e) => setEditRecordedAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 3 }}>
              <TextField
                type="number"
                fullWidth
                label="Weight"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                inputProps={{ step: "0.1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={weightUnit}
                  label="Unit"
                  onChange={(e) => handleEditWeightUnitChange(e.target.value)}
                >
                  {WEIGHT_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Body Fat %"
                value={editBodyFatPercent}
                onChange={(e) => setEditBodyFatPercent(e.target.value)}
                inputProps={{ step: "0.1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                fullWidth
                label="Resting HR (bpm)"
                value={editRestingHeartRate}
                onChange={(e) => setEditRestingHeartRate(e.target.value)}
                inputProps={{ step: "1" }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 4 }}>
              <TextField
                type="text"
                fullWidth
                label="BMI (auto)"
                value={calculateBmi(toLbs(editWeight, weightUnit), heightInches)}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid container size={12}>
              <Divider sx={{ width: "100%", margin: "10px 0" }} />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6 }} alignItems="center">
              <Typography variant="subtitle1">Circumference ({circumferenceUnit})</Typography>
            </Grid>
            <Grid container size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={circumferenceUnit}
                  label="Unit"
                  onChange={(e) => handleEditCircumferenceUnitChange(e.target.value)}
                >
                  {CIRCUMFERENCE_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {CIRCUMFERENCE_FIELDS.map((field) => (
              <Grid key={field.key} container size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={field.label}
                  value={editCircumference[field.key] || ""}
                  onChange={(e) =>
                    setEditCircumference((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  inputProps={{ step: "0.1" }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}
            <Grid container size={12} sx={{ justifyContent: "flex-end", marginTop: "8px" }}>
              <Stack direction="row" spacing={2}>
                <Button color="secondaryButton" variant="contained" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button color="error" variant="outlined" onClick={() => setDeleteConfirmOpen(true)}>
                  Delete
                </Button>
                <Button variant="contained" onClick={handleEditSubmit}>
                  Save Changes
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Menu
        anchorEl={metricsFilterAnchor}
        open={Boolean(metricsFilterAnchor)}
        onClose={closeMetricsFilter}
        PaperProps={{ sx: { minWidth: 260, p: 2 } }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2">{metricsFilterLabel || "Filter"}</Typography>
          {metricsFilterKey === "recordedAt" && (
            <Stack spacing={1}>
              <TextField
                label="From"
                type="date"
                value={metricsDateRange.from}
                onChange={(event) =>
                  setMetricsDateRange((prev) => ({ ...prev, from: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To"
                type="date"
                value={metricsDateRange.to}
                onChange={(event) =>
                  setMetricsDateRange((prev) => ({ ...prev, to: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
              <Button size="small" onClick={() => setMetricsDateRange({ from: "", to: "" })}>
                Clear
              </Button>
            </Stack>
          )}
          {["weight", "bodyFatPercent", "bmi", "restingHeartRate"].includes(metricsFilterKey) && (
            <Stack spacing={1}>
              <Slider
                value={metricsRangeFilters[metricsFilterKey] || [0, 0]}
                min={(metricBounds[metricsFilterKey] || [0, 0])[0]}
                max={(metricBounds[metricsFilterKey] || [0, 0])[1]}
                onChange={(_, value) =>
                  setMetricsRangeFilters((prev) => ({
                    ...prev,
                    [metricsFilterKey]: value,
                  }))
                }
                valueLabelDisplay="auto"
                disabled={!metricBounds[metricsFilterKey]}
              />
              <Button
                size="small"
                onClick={() =>
                  setMetricsRangeFilters((prev) => ({
                    ...prev,
                    [metricsFilterKey]: metricBounds[metricsFilterKey] || prev[metricsFilterKey],
                  }))
                }
              >
                Reset range
              </Button>
            </Stack>
          )}
        </Stack>
      </Menu>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Metrics Entry</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this metrics entry? This cannot be undone.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ marginTop: "16px", justifyContent: "flex-end" }}>
            <Button color="secondaryButton" variant="contained" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="error" variant="contained" onClick={handleDeleteEntry}>
              Delete
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default function Progress(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { client, tab } = queryString.parse(location.search);
  const [searchValue, setSearchValue] = useState(props.searchExercise || "");
  const [activeTab, setActiveTab] = useState(tab === "metrics" ? 1 : 0);
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const exerciseList = useSelector((state) => state.progress.exerciseList);

  const targetClient = client
    ? clients.find((relationship) => relationship?.client?._id === client)?.client
    : null;
  const targetUser = client ? targetClient : user;
  const isTrainerView = Boolean(client);

  const matchedExercise = exerciseList.find((item) => item.exerciseTitle === searchValue);
  const targetExerciseHistory = matchedExercise?.history?.[targetUser?._id] || [];

  const loadExerciseProgress = (exercise) => {
    if (!targetUser?._id) return;
    dispatch(requestExerciseProgress(exercise, targetUser));
  };

  useEffect(() => {
    if (!targetUser?._id) return;
    const matchedExercise = exerciseList.find((item) => item.exerciseTitle === searchValue);
    if (matchedExercise) {
      loadExerciseProgress(matchedExercise);
    } else {
      console.log("No matching exercise found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, targetUser?._id]);

  useEffect(() => {
    if (exerciseList.length < 1) {
      dispatch(getExerciseList());
    }
    if (props.searchExercise && props.searchExercise !== "") {
      loadExerciseProgress(props.searchExercise);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (client && clients.length === 0) {
      dispatch(requestClients());
    }
  }, [client, clients.length, dispatch]);

  useEffect(() => {
    if (tab === "metrics") {
      setActiveTab(1);
    } else if (tab === "exercise") {
      setActiveTab(0);
    }
  }, [tab]);

  if (client && !targetUser) {
    return (
      <Grid container sx={{ justifyContent: "center", marginTop: "25px" }}>
        <Typography variant="body1">Loading client metrics...</Typography>
      </Grid>
    );
  }

  return (
    <>
      <Grid container sx={{ justifyContent: "center", marginTop: "25px" }}>
        <Grid size={{ xs: 12, sm: 10 }} container>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{ marginBottom: "15px" }}
          >
            <Tab label="Exercise Progress" />
            <Tab label="Body Metrics" />
          </Tabs>
        </Grid>

        {activeTab === 0 && (
          <>
            <Grid size={{ xs: 12, sm: 8 }} container>
              <ExerciseListAutocomplete
                exercise={{ set: setSearchValue, exercise: searchValue }}
                exerciseList={exerciseList}
              />
            </Grid>
            <Grid container size={12}>
              <Grid size={12}>
                <BarChartHistory targetExerciseHistory={targetExerciseHistory || []} />
              </Grid>
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <Grid container size={{ xs: 12, sm: 10 }}>
            <BodyMetrics targetUser={targetUser} isTrainerView={isTrainerView} />
          </Grid>
        )}
      </Grid>
    </>
  );
}
