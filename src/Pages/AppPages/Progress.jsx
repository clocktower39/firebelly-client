import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
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
import { ArrowDownward, ArrowUpward, FilterList, Search, Star, StarBorder } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import {
  requestClients,
  requestExerciseProgress,
  requestExerciseProgressSummary,
  getExerciseList,
  requestMetrics,
  requestPendingMetrics,
  requestLatestMetric,
  createMetricEntry,
  reviewMetricEntry,
  updateMetricEntry,
  deleteMetricEntry,
} from "../../Redux/actions";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import queryString from "query-string";

const modalStyle = () => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: `translate(-50%, -50%)`,
  width: { xs: "calc(100vw - 24px)", sm: "min(94vw, 1220px)" },
  maxWidth: "1220px",
  maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100dvh - 48px)" },
  overflowY: "auto",
  overflowX: "hidden",
  WebkitOverflowScrolling: "touch",
  bgcolor: "background.ATCPaperBackground",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  borderRadius: { xs: 3, sm: 4 },
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.38)",
  outline: "none",
  p: { xs: 1.5, sm: 3 },
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    bgcolor: "rgba(148, 163, 184, 0.55)",
    borderRadius: 999,
  },
});

const CIRCUMFERENCE_FIELDS = [
  { key: "neck", label: "Neck" },
  { key: "shoulders", label: "Shoulders" },
  { key: "armsLeft", label: "Arms (L)" },
  { key: "armsRight", label: "Arms (R)" },
  { key: "forearmsLeft", label: "Forearms (L)" },
  { key: "forearmsRight", label: "Forearms (R)" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "glutes", label: "Glutes" },
  { key: "thighsLeft", label: "Thighs (L)" },
  { key: "thighsRight", label: "Thighs (R)" },
  { key: "calvesLeft", label: "Calves (L)" },
  { key: "calvesRight", label: "Calves (R)" },
];

const LEGACY_CIRCUMFERENCE_MAP = {
  armsLeft: "arms",
  armsRight: "arms",
  forearmsLeft: "forearms",
  forearmsRight: "forearms",
  thighsLeft: "thighs",
  thighsRight: "thighs",
  calvesLeft: "calves",
  calvesRight: "calves",
};

const getCircumferenceValue = (circumference, key) => {
  if (!circumference) return undefined;
  const value = circumference[key];
  if (value !== undefined && value !== null) return value;
  const legacyKey = LEGACY_CIRCUMFERENCE_MAP[key];
  if (!legacyKey) return undefined;
  return circumference[legacyKey];
};

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

const toReadableDateInput = (value) => {
  if (!value) return "";
  if (!(value instanceof Date)) {
    const datePart = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (datePart) return datePart;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const toStoredDateValue = (value) => toReadableDateInput(value);

const formatDateOnly = (value) => {
  if (!value) return "";
  const datePart = toReadableDateInput(value);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? "" : fallback.toLocaleDateString();
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
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

const EXERCISE_CHART_COLORS = ["#f97316", "#14b8a6", "#ef4444", "#8b5cf6"];
const BODY_CHART_COLORS = {
  weight: "#f97316",
  bodyFatPercent: "#e11d48",
  bmi: "#8b5cf6",
  restingHeartRate: "#06b6d4",
  neck: "#64748b",
  shoulders: "#0ea5e9",
  armsLeft: "#22c55e",
  armsRight: "#16a34a",
  forearmsLeft: "#84cc16",
  forearmsRight: "#65a30d",
  chest: "#f59e0b",
  waist: "#ef4444",
  glutes: "#a855f7",
  thighsLeft: "#ec4899",
  thighsRight: "#db2777",
  calvesLeft: "#6366f1",
  calvesRight: "#4f46e5",
};

const EMPTY_ARRAY = [];

const formatNumber = (value, digits = 1) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "—";
  return numericValue.toFixed(digits).replace(/\.0$/, "");
};

const formatChartDate = (value) => {
  if (!value) return "";
  const datePart = toReadableDateInput(value);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const getDateOnlyTimestamp = (value) => {
  const datePart = toReadableDateInput(value);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
};

const getNumericValues = (values = []) =>
  (Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

const getDelta = (firstValue, lastValue) => {
  const first = Number(firstValue);
  const last = Number(lastValue);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
  return last - first;
};

const getTrendLabel = (delta, suffix = "") => {
  if (delta === null) return "Not enough data";
  if (delta === 0) return `No change${suffix ? ` ${suffix}` : ""}`;
  return `${delta > 0 ? "+" : ""}${formatNumber(delta)}${suffix}`;
};

const FAVORITE_EXERCISES_STORAGE_KEY = "firebelly.progress.favoriteExercises";

const EXERCISE_SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "favorites", label: "Favorites First" },
  { value: "mostEntries", label: "Most Entries" },
  { value: "alphabetical", label: "A-Z" },
];

const readFavoriteExerciseIds = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITE_EXERCISES_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const saveFavoriteExerciseIds = (ids) => {
  localStorage.setItem(FAVORITE_EXERCISES_STORAGE_KEY, JSON.stringify(ids));
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

const buildExerciseSummary = (summary) => {
  const historyPreview = Array.isArray(summary?.historyPreview) ? summary.historyPreview : [];
  const sortedHistory = [...historyPreview]
    .filter((entry) => entry?.date)
    .sort((a, b) => (getDateOnlyTimestamp(a.date) || 0) - (getDateOnlyTimestamp(b.date) || 0));
  const firstHistoryEntry = sortedHistory[0];
  const fieldConfig = firstHistoryEntry ? exerciseTypeFields(firstHistoryEntry.exerciseType) : null;
  const repeatingFields =
    fieldConfig && !React.isValidElement(fieldConfig) ? fieldConfig.repeating || [] : [];

  const primaryField =
    repeatingFields.find((field) =>
      sortedHistory.some((entry) => getNumericValues(entry.achieved?.[field.goalAttribute]).length)
    ) || repeatingFields[0];

  const chartRows = primaryField
    ? sortedHistory
        .map((entry) => {
          const values = getNumericValues(entry.achieved?.[primaryField.goalAttribute]);
          if (!values.length) return null;
          return {
            date: formatChartDate(entry.date),
            fullDate: formatDateOnly(entry.date),
            value: Math.max(...values),
            timestamp: getDateOnlyTimestamp(entry.date),
          };
        })
        .filter(Boolean)
    : [];

  const latestRow = chartRows[chartRows.length - 1];
  const bestValue = chartRows.length
    ? Math.max(...chartRows.map((row) => row.value).filter((value) => Number.isFinite(value)))
    : null;

  return {
    id: summary.exercise?._id,
    title: summary.exercise?.exerciseTitle || "Exercise",
    exercise: summary.exercise,
    entryCount: summary.entryCount || 0,
    latestDate: summary.latestDate,
    latestDateValue: getDateOnlyTimestamp(summary.latestDate) || 0,
    latestDateLabel: summary.latestDate ? formatDateOnly(summary.latestDate) : "No entries yet",
    primaryMetricLabel: primaryField?.label || "Progress",
    latestValue: latestRow?.value ?? null,
    bestValue,
    chartRows,
  };
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
  const { targetExerciseHistory } = props;
  const historyCount = targetExerciseHistory.length;
  const defaultRange = useMemo(
    () => [
      historyCount > 6 ? historyCount - 6 : 0,
      historyCount > 0 ? historyCount - 1 : 0,
    ],
    [historyCount]
  );
  const [range, setRange] = useState(defaultRange);

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
    setRange(defaultRange);
  }, [defaultRange]);

  const exerciseTitle = targetExerciseHistory?.[0]?.exercise?.exerciseTitle || "Exercise Progress";
  const fieldConfig = useMemo(() => {
    if (!targetExerciseHistory?.length) return { repeating: [], nonRepeating: [] };
    const fields = exerciseTypeFields(targetExerciseHistory[0].exerciseType);
    if (!fields || React.isValidElement(fields)) return { repeating: [], nonRepeating: [] };
    return fields;
  }, [targetExerciseHistory]);

  const chartRows = useMemo(() => {
    if (!targetExerciseHistory?.length) return [];

    return targetExerciseHistory
      .filter((entry, index) => entry?.date && index >= range[0] && index <= range[1])
      .map((entry) => {
        const row = {
          date: formatChartDate(entry.date),
          fullDate: formatDateOnly(entry.date),
          timestamp: getDateOnlyTimestamp(entry.date),
        };

        fieldConfig.repeating.forEach((field) => {
          const values = getNumericValues(entry.achieved?.[field.goalAttribute]);
          const best = values.length ? Math.max(...values) : null;
          const total = values.reduce((sum, value) => sum + value, 0);
          row[`${field.goalAttribute}Sets`] = values;
          row[`${field.goalAttribute}Best`] = best;
          row[`${field.goalAttribute}Average`] = values.length ? total / values.length : null;
          row[`${field.goalAttribute}Total`] = values.length ? total : null;
          values.forEach((value, index) => {
            row[`${field.goalAttribute}Set${index + 1}`] = value;
          });
        });

        fieldConfig.nonRepeating.forEach((field) => {
          const value = Number(entry.achieved?.[field.goalAttribute]);
          row[field.goalAttribute] = Number.isFinite(value) ? value : null;
        });

        return row;
      })
      .filter((row) => Number.isFinite(row.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [fieldConfig, range, targetExerciseHistory]);

  const fieldStats = useMemo(() => {
    return fieldConfig.repeating.map((field) => {
      const key = `${field.goalAttribute}Best`;
      const values = chartRows
        .map((row) => row[key])
        .filter((value) => Number.isFinite(Number(value)));
      const first = values[0];
      const latest = values[values.length - 1];
      const best = values.length ? Math.max(...values) : null;
      const average = values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : null;
      return {
        ...field,
        latest,
        best,
        average,
        delta: getDelta(first, latest),
      };
    });
  }, [chartRows, fieldConfig.repeating]);

  const getMaxSetsForField = (field) =>
    Math.max(0, ...chartRows.map((row) => row[`${field.goalAttribute}Sets`]?.length ?? 0));

  const ExerciseTooltip = ({ active, payload, field, color }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    const values = row?.[`${field.goalAttribute}Sets`] || [];

    return (
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid rgba(148, 163, 184, 0.24)",
          boxShadow: "0 16px 38px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
          {row?.fullDate || row?.date}
        </Typography>
        <Typography variant="caption" sx={{ color }}>
          Best: {formatNumber(row?.[`${field.goalAttribute}Best`])}
        </Typography>
        {values.map((value, index) => (
          <Typography
            key={`${field.goalAttribute}-${index}`}
            variant="body2"
            sx={{ color: "text.primary" }}
          >
            Set {index + 1}: <Box component="span" sx={{ color }}>{formatNumber(value)}</Box>
          </Typography>
        ))}
      </Box>
    );
  };

  if (!historyCount) {
    return (
      <Paper
        sx={{
          width: "100%",
          p: 3,
          mt: 2,
          textAlign: "center",
          bgcolor: "background.ATCPaperBackground",
        }}
      >
        <Typography variant="h5" color="primary.contrastText">
          No exercise history yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete this exercise in a workout to start building progress charts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ width: "100%", mt: 2 }}>
      <Typography
        variant="h4"
        color="primary.contrastText"
        sx={{ textAlign: "center", fontWeight: 700 }}
      >
        {exerciseTitle}
      </Typography>

      {historyCount > 1 && (
        <Paper sx={{ p: 2, bgcolor: "background.ATCPaperBackground" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
              Date range
            </Typography>
            <Slider
              getAriaLabel={() => "Exercise history range"}
              value={range}
              onChange={handleRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={historyCount - 1}
              disableSwap
              sx={{ flex: 1 }}
            />
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2}>
        {fieldStats.map((stat) => (
          <Grid key={`stat-${stat.goalAttribute}`} size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{
                p: 2,
                height: "100%",
                bgcolor: "background.ATCPaperBackground",
                border: "1px solid rgba(148, 163, 184, 0.18)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h4" color="primary.contrastText">
                {formatNumber(stat.latest)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                <Chip size="small" label={`Best ${formatNumber(stat.best)}`} />
                <Chip size="small" label={`Avg ${formatNumber(stat.average)}`} />
                <Chip
                  size="small"
                  color={stat.delta >= 0 ? "success" : "warning"}
                  label={getTrendLabel(stat.delta)}
                />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {fieldConfig.repeating.map((field, fieldIndex) => {
        const color = EXERCISE_CHART_COLORS[fieldIndex % EXERCISE_CHART_COLORS.length];
        const maxSets = getMaxSetsForField(field);

        return (
          <Paper
            key={`chart-${field.goalAttribute}`}
            sx={{
              p: 2,
              bgcolor: "background.ATCPaperBackground",
              border: "1px solid rgba(148, 163, 184, 0.18)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h6" color="primary.contrastText">
                  {field.label} by Set
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bars show each set. The line tracks the best set from each entry.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: "100%", height: { xs: 280, sm: 360 }, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartRows} margin={{ top: 12, right: 18, left: -10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                  <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                  <YAxis tick={{ fill: "currentColor", fontSize: 12 }} />
                  <Tooltip content={<ExerciseTooltip field={field} color={color} />} />
                  <Legend />
                  {[...Array(maxSets)].map((_, index) => (
                    <Bar
                      key={`bar-${field.goalAttribute}-${index}`}
                      dataKey={`${field.goalAttribute}Set${index + 1}`}
                      name={`Set ${index + 1}`}
                      fill={color}
                      fillOpacity={Math.min(0.92, 0.28 + index * 0.12)}
                      radius={[6, 6, 0, 0]}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey={`${field.goalAttribute}Best`}
                    name="Best set"
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};


const ExerciseListAutocomplete = (props) => {
  const { exerciseList, exercise } = props;
  const selectedTitle =
    typeof exercise?.exercise === "string"
      ? exercise.exercise
      : exercise?.exercise?.exerciseTitle || "";
  const [title, setTitle] = useState(selectedTitle);

  const matchWords = (option, inputValue) => {
    if (!option) return false;
    const words = inputValue.toLowerCase().split(" ").filter(Boolean);
    return words.every((word) => option.toLowerCase().includes(word));
  };

  useEffect(() => {
    exercise.set(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    setTitle(selectedTitle);
  }, [selectedTitle]);

  return (
    <Autocomplete
      disableCloseOnSelect
      fullWidth
      freeSolo
      value={title}
      options={exerciseList
        .filter((a) => a.exerciseTitle !== "")
        .sort((a, b) => a.exerciseTitle.localeCompare(b.exerciseTitle))
        .map((option) => option.exerciseTitle)}
      onChange={(_, nextValue) => setTitle(nextValue || "")}
      onInputChange={(_, nextValue, reason) => {
        if (reason === "input") {
          setTitle(nextValue);
        }
      }}
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

const ExerciseSummaryCard = ({
  summary,
  selected,
  favorite,
  onSelect,
  onToggleFavorite,
}) => {
  const hasChart = summary.chartRows.length > 1;

  return (
    <Paper
      onClick={() => onSelect(summary)}
      sx={{
        p: 1.5,
        height: "100%",
        cursor: "pointer",
        bgcolor: selected ? "rgba(249, 115, 22, 0.12)" : "background.paper",
        border: selected
          ? "1px solid rgba(249, 115, 22, 0.65)"
          : "1px solid rgba(148, 163, 184, 0.18)",
        transition: "border-color 120ms ease, transform 120ms ease, background 120ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(249, 115, 22, 0.55)",
        },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              color="primary.contrastText"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.latestDateLabel}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(summary.id);
            }}
            color={favorite ? "warning" : "default"}
          >
            {favorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`${summary.entryCount} entries`} />
          {summary.latestValue !== null && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${summary.primaryMetricLabel}: ${formatNumber(summary.latestValue)}`}
            />
          )}
        </Stack>

        <Box sx={{ height: 72 }}>
          {hasChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.chartRows}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    return (
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          border: "1px solid rgba(148, 163, 184, 0.24)",
                          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.22)",
                        }}
                      >
                        <Typography variant="caption" color="text.primary">
                          {row.fullDate}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {summary.primaryMetricLabel}: {formatNumber(row.value)}
                        </Typography>
                      </Box>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Stack
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: "rgba(148, 163, 184, 0.08)",
              }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" color="text.secondary">
                {summary.entryCount ? "More entries needed for chart" : "No progress yet"}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

const ExerciseProgressDashboard = ({
  exerciseList,
  exerciseSummaries,
  selectedExerciseTitle,
  setSelectedExerciseTitle,
  onLoadExercise,
}) => {
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [exerciseSortKey, setExerciseSortKey] = useState("recent");
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState(readFavoriteExerciseIds);

  const summariesById = useMemo(() => {
    const map = new Map();
    exerciseSummaries.forEach((summary) => {
      if (summary?.exercise?._id) {
        map.set(String(summary.exercise._id), summary);
      }
    });
    return map;
  }, [exerciseSummaries]);

  const exerciseCards = useMemo(() => {
    const libraryCards = exerciseList
      .filter((exercise) => exercise?._id && exercise.exerciseTitle)
      .map((exercise) =>
        buildExerciseSummary(
          summariesById.get(String(exercise._id)) || {
            exercise,
            entryCount: 0,
            latestDate: null,
            historyPreview: [],
          }
        )
      );

    const libraryIds = new Set(libraryCards.map((summary) => String(summary.id)));
    const summaryOnlyCards = exerciseSummaries
      .filter((summary) => summary?.exercise?._id && !libraryIds.has(String(summary.exercise._id)))
      .map(buildExerciseSummary);

    return [...libraryCards, ...summaryOnlyCards];
  }, [exerciseList, exerciseSummaries, summariesById]);

  const filteredExerciseCards = useMemo(() => {
    const words = exerciseSearchTerm.toLowerCase().split(" ").filter(Boolean);
    const favorites = new Set(favoriteExerciseIds.map(String));
    const list = exerciseCards.filter((summary) =>
      words.every((word) => summary.title.toLowerCase().includes(word))
    );

    list.sort((a, b) => {
      if (exerciseSortKey === "favorites") {
        const favoriteDiff = Number(favorites.has(String(b.id))) - Number(favorites.has(String(a.id)));
        if (favoriteDiff) return favoriteDiff;
      }
      if (exerciseSortKey === "mostEntries") {
        const entryDiff = b.entryCount - a.entryCount;
        if (entryDiff) return entryDiff;
      }
      if (exerciseSortKey === "recent" || exerciseSortKey === "favorites") {
        const dateDiff = b.latestDateValue - a.latestDateValue;
        if (dateDiff) return dateDiff;
      }
      return a.title.localeCompare(b.title);
    });

    return list;
  }, [exerciseCards, exerciseSearchTerm, exerciseSortKey, favoriteExerciseIds]);

  const favoriteCards = useMemo(() => {
    const favorites = new Set(favoriteExerciseIds.map(String));
    return exerciseCards
      .filter((summary) => favorites.has(String(summary.id)))
      .sort((a, b) => b.latestDateValue - a.latestDateValue)
      .slice(0, 6);
  }, [exerciseCards, favoriteExerciseIds]);

  const handleSelectSummary = (summary) => {
    setSelectedExerciseTitle(summary.title);
    if (summary.exercise?._id) {
      onLoadExercise(summary.exercise);
    }
  };

  const toggleFavoriteExercise = (exerciseId) => {
    if (!exerciseId) return;
    setFavoriteExerciseIds((prev) => {
      const ids = new Set(prev.map(String));
      if (ids.has(String(exerciseId))) {
        ids.delete(String(exerciseId));
      } else {
        ids.add(String(exerciseId));
      }
      const nextIds = Array.from(ids);
      saveFavoriteExerciseIds(nextIds);
      return nextIds;
    });
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Paper sx={{ p: 2, bgcolor: "background.ATCPaperBackground" }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" color="primary.contrastText">
                Exercise Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse recent exercises, favorites, and full-history charts.
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 190 } }}>
              <InputLabel>Sort</InputLabel>
              <Select
                label="Sort"
                value={exerciseSortKey}
                onChange={(event) => setExerciseSortKey(event.target.value)}
              >
                {EXERCISE_SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ExerciseListAutocomplete
                exercise={{ set: setSelectedExerciseTitle, exercise: selectedExerciseTitle }}
                exerciseList={exerciseList}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Filter list"
                placeholder="Search exercises"
                value={exerciseSearchTerm}
                onChange={(event) => setExerciseSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: <Search fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {favoriteCards.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle1" color="primary.contrastText">
            Favorites
          </Typography>
          <Grid container spacing={1.5}>
            {favoriteCards.map((summary) => (
              <Grid key={`favorite-${summary.id}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                <ExerciseSummaryCard
                  summary={summary}
                  selected={summary.title === selectedExerciseTitle}
                  favorite
                  onSelect={handleSelectSummary}
                  onToggleFavorite={toggleFavoriteExercise}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      <Stack spacing={1}>
        <Typography variant="subtitle1" color="primary.contrastText">
          Exercises
        </Typography>
        <Grid container spacing={1.5}>
          {filteredExerciseCards.slice(0, 12).map((summary) => (
            <Grid key={summary.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ExerciseSummaryCard
                summary={summary}
                selected={summary.title === selectedExerciseTitle}
                favorite={favoriteExerciseIds.map(String).includes(String(summary.id))}
                onSelect={handleSelectSummary}
                onToggleFavorite={toggleFavoriteExercise}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
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
  const hasLoadedLatest = useMemo(
    () => Object.prototype.hasOwnProperty.call(metricsState.latestByUser, userId),
    [metricsState.latestByUser, userId]
  );
  const hasLoadedPending = useMemo(
    () =>
      isTrainerView ||
      Object.prototype.hasOwnProperty.call(metricsState.pendingByUser, userId),
    [isTrainerView, metricsState.pendingByUser, userId]
  );
  const hasHistory = useMemo(
    () => entries.length > 0 || pending.length > 0 || Boolean(latest),
    [entries.length, pending.length, latest]
  );

  const [recordedAt, setRecordedAt] = useState(() => toReadableDateInput(new Date()));
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
  const [selectedCircumferenceKeys, setSelectedCircumferenceKeys] = useState([
    "waist",
    "chest",
    "glutes",
  ]);

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
    if (isTrainerView) {
      setOnboardingOpen(false);
      return;
    }

    if (!hasLoadedEntries || !hasLoadedLatest || !hasLoadedPending) return;

    setOnboardingOpen(!hasHistory);
  }, [hasHistory, hasLoadedEntries, hasLoadedLatest, hasLoadedPending, isTrainerView]);

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
    setRecordedAt(toReadableDateInput(new Date()));
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
      recordedAt: toStoredDateValue(recordedAt),
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
      const value = getCircumferenceValue(entry.circumference, field.key);
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
      list = list.filter((entry) => toReadableDateInput(entry.recordedAt) >= metricsDateRange.from);
    }
    if (metricsDateRange.to) {
      list = list.filter((entry) => toReadableDateInput(entry.recordedAt) <= metricsDateRange.to);
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
          return ((getDateOnlyTimestamp(a.recordedAt) || 0) - (getDateOnlyTimestamp(b.recordedAt) || 0)) * direction;
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

  const metricChartRows = useMemo(() => {
    return [...entries]
      .filter((entry) => entry?.recordedAt)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
      .map((entry) => {
        const row = {
          id: entry._id,
          date: formatChartDate(entry.recordedAt),
          fullDate: formatDateOnly(entry.recordedAt),
          timestamp: getDateOnlyTimestamp(entry.recordedAt),
          weight:
            entry.weight === undefined || entry.weight === null
              ? null
              : Number(fromLbs(entry.weight, weightUnit)),
          bodyFatPercent:
            entry.bodyFatPercent === undefined || entry.bodyFatPercent === null
              ? null
              : Number(entry.bodyFatPercent),
          bmi: entry.bmi === undefined || entry.bmi === null ? null : Number(entry.bmi),
          restingHeartRate:
            entry.restingHeartRate === undefined || entry.restingHeartRate === null
              ? null
              : Number(entry.restingHeartRate),
        };

        CIRCUMFERENCE_FIELDS.forEach((field) => {
          const value = getCircumferenceValue(entry.circumference, field.key);
          const converted = fromInches(value, circumferenceUnit);
          row[field.key] = converted === "" ? null : Number(converted);
        });

        return row;
      })
      .filter((row) => Number.isFinite(row.timestamp));
  }, [circumferenceUnit, entries, weightUnit]);

  const metricSummaryCards = useMemo(() => {
    const configs = [
      { key: "weight", label: "Weight", suffix: ` ${weightUnit}`, color: BODY_CHART_COLORS.weight },
      { key: "bodyFatPercent", label: "Body Fat", suffix: "%", color: BODY_CHART_COLORS.bodyFatPercent },
      { key: "bmi", label: "BMI", suffix: "", color: BODY_CHART_COLORS.bmi },
      { key: "restingHeartRate", label: "Resting HR", suffix: " bpm", color: BODY_CHART_COLORS.restingHeartRate },
    ];

    return configs.map((config) => {
      const values = metricChartRows
        .map((row) => row[config.key])
        .filter((value) => Number.isFinite(Number(value)));
      const first = values[0];
      const latestValue = values[values.length - 1];
      const best =
        config.key === "restingHeartRate" || config.key === "bodyFatPercent"
          ? values.length
            ? Math.min(...values)
            : null
          : values.length
            ? Math.max(...values)
            : null;
      return {
        ...config,
        latest: latestValue,
        best,
        delta: getDelta(first, latestValue),
      };
    });
  }, [metricChartRows, weightUnit]);

  const circumferenceChartOptions = useMemo(
    () =>
      CIRCUMFERENCE_FIELDS.map((field) => ({
        ...field,
        color: BODY_CHART_COLORS[field.key] || "#64748b",
      })),
    []
  );

  const selectedCircumferenceFields = useMemo(
    () =>
      circumferenceChartOptions.filter((field) =>
        selectedCircumferenceKeys.includes(field.key)
      ),
    [circumferenceChartOptions, selectedCircumferenceKeys]
  );

  const BodyMetricTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    const visiblePayload = payload.filter((item) => item.value !== null && item.value !== undefined);

    return (
      <Box
        sx={{
          p: 1.25,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid rgba(148, 163, 184, 0.24)",
          boxShadow: "0 16px 38px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
          {row?.fullDate || row?.date}
        </Typography>
        {visiblePayload.map((item) => (
          <Typography key={item.dataKey} variant="body2" sx={{ color: item.color }}>
            {item.name}: {formatNumber(item.value)}
          </Typography>
        ))}
      </Box>
    );
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditRecordedAt(entry.recordedAt ? toReadableDateInput(entry.recordedAt) : "");
    const displayWeight = fromLbs(entry.weight, weightUnit);
    setEditWeight(displayWeight === "" ? "" : String(Number(displayWeight).toFixed(1)));
    setEditBodyFatPercent(entry.bodyFatPercent ?? "");
    setEditRestingHeartRate(entry.restingHeartRate ?? "");
    const displayCircumference = {};
    CIRCUMFERENCE_FIELDS.forEach((field) => {
      const value = getCircumferenceValue(entry.circumference, field.key);
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
      recordedAt: toStoredDateValue(editRecordedAt),
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
                type="date"
                fullWidth
                label="Recorded Date"
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
              {formatDateOnly(latestEntry.recordedAt)}
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

      {entries.length > 0 && (
        <Grid container size={12}>
          <Paper
            sx={{
              width: "100%",
              p: 2,
              bgcolor: "background.ATCPaperBackground",
              border: "1px solid rgba(148, 163, 184, 0.18)",
            }}
          >
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h6" color="primary.contrastText">
                    Metrics Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted entries plotted over time from oldest to newest.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${metricChartRows.length} entr${metricChartRows.length === 1 ? "y" : "ies"}`}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                />
              </Stack>

              <Grid container spacing={2}>
                {metricSummaryCards.map((card) => (
                  <Grid key={card.key} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      sx={{
                        p: 1.75,
                        height: "100%",
                        bgcolor: "background.paper",
                        border: `1px solid ${card.color}33`,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {card.label}
                      </Typography>
                      <Typography variant="h5" sx={{ color: card.color, fontWeight: 700 }}>
                        {formatNumber(card.latest)}
                        {card.latest !== undefined && card.latest !== null ? card.suffix : ""}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                        <Chip size="small" label={`Best ${formatNumber(card.best)}${card.best != null ? card.suffix : ""}`} />
                        <Chip
                          size="small"
                          color={card.delta === null ? "default" : card.delta <= 0 ? "success" : "warning"}
                          label={getTrendLabel(card.delta, card.suffix)}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {metricChartRows.length < 2 ? (
                <Paper sx={{ p: 2, bgcolor: "background.paper" }}>
                  <Typography variant="body2" color="text.secondary">
                    Add one more entry to unlock trend charts.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: "background.paper", height: "100%" }}>
                      <Typography variant="subtitle1" color="primary.contrastText">
                        Weight Trend
                      </Typography>
                      <Box sx={{ height: 280, mt: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={metricChartRows} margin={{ top: 12, right: 16, left: -10, bottom: 6 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                            <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                            <YAxis tick={{ fill: "currentColor", fontSize: 12 }} domain={["dataMin", "dataMax"]} />
                            <Tooltip content={<BodyMetricTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="weight"
                              name={`Weight (${weightUnit})`}
                              stroke={BODY_CHART_COLORS.weight}
                              fill={BODY_CHART_COLORS.weight}
                              fillOpacity={0.18}
                              strokeWidth={3}
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: "background.paper", height: "100%" }}>
                      <Typography variant="subtitle1" color="primary.contrastText">
                        Body Composition
                      </Typography>
                      <Box sx={{ height: 280, mt: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={metricChartRows} margin={{ top: 12, right: 16, left: -10, bottom: 6 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                            <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                            <YAxis tick={{ fill: "currentColor", fontSize: 12 }} domain={["dataMin", "dataMax"]} />
                            <Tooltip content={<BodyMetricTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="bodyFatPercent"
                              name="Body Fat %"
                              stroke={BODY_CHART_COLORS.bodyFatPercent}
                              strokeWidth={3}
                              dot={{ r: 3 }}
                              connectNulls
                            />
                            <Line
                              type="monotone"
                              dataKey="bmi"
                              name="BMI"
                              stroke={BODY_CHART_COLORS.bmi}
                              strokeWidth={3}
                              dot={{ r: 3 }}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: "background.paper", height: "100%" }}>
                      <Typography variant="subtitle1" color="primary.contrastText">
                        Resting Heart Rate
                      </Typography>
                      <Box sx={{ height: 260, mt: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={metricChartRows} margin={{ top: 12, right: 16, left: -10, bottom: 6 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                            <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                            <YAxis tick={{ fill: "currentColor", fontSize: 12 }} domain={["dataMin", "dataMax"]} />
                            <Tooltip content={<BodyMetricTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="restingHeartRate"
                              name="Resting HR"
                              stroke={BODY_CHART_COLORS.restingHeartRate}
                              fill={BODY_CHART_COLORS.restingHeartRate}
                              fillOpacity={0.16}
                              strokeWidth={3}
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: "background.paper", height: "100%" }}>
                      <Stack spacing={1.5}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography variant="subtitle1" color="primary.contrastText">
                              Circumference
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Select the measurements you want to compare.
                            </Typography>
                          </Box>
                          <Autocomplete
                            multiple
                            size="small"
                            options={circumferenceChartOptions}
                            value={selectedCircumferenceFields}
                            getOptionLabel={(option) => option.label}
                            onChange={(_, nextValue) =>
                              setSelectedCircumferenceKeys(nextValue.map((item) => item.key))
                            }
                            sx={{ minWidth: { xs: "100%", sm: 240 } }}
                            renderInput={(params) => (
                              <TextField {...params} label={`Measurements (${circumferenceUnit})`} />
                            )}
                          />
                        </Stack>
                        <Box sx={{ height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metricChartRows} margin={{ top: 12, right: 16, left: -10, bottom: 6 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                              <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 12 }} />
                              <YAxis tick={{ fill: "currentColor", fontSize: 12 }} domain={["dataMin", "dataMax"]} />
                              <Tooltip content={<BodyMetricTooltip />} />
                              <Legend />
                              {selectedCircumferenceFields.map((field) => (
                                <Line
                                  key={field.key}
                                  type="monotone"
                                  dataKey={field.key}
                                  name={`${field.label} (${circumferenceUnit})`}
                                  stroke={field.color}
                                  strokeWidth={2.5}
                                  dot={{ r: 3 }}
                                  connectNulls
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Stack>
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
                      <TableCell>{formatDateOnly(entry.recordedAt)}</TableCell>
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
                      <TableCell>{formatDateOnly(entry.recordedAt)}</TableCell>
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
                type="date"
                fullWidth
                label="Recorded Date"
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
  const progressState = useSelector((state) => state.progress);
  const exerciseList = progressState.exerciseList || EMPTY_ARRAY;

  const targetClient = client
    ? clients.find((relationship) => relationship?.client?._id === client)?.client
    : null;
  const targetUser = client ? targetClient : user;
  const isTrainerView = Boolean(client);
  const exerciseSummaries = progressState.exerciseSummariesByUser?.[targetUser?._id] || EMPTY_ARRAY;

  const matchedExercise = exerciseList.find((item) => item.exerciseTitle === searchValue);
  const targetExerciseHistory = matchedExercise?.history?.[targetUser?._id] || [];

  const loadExerciseProgress = (exercise) => {
    if (!targetUser?._id) return;
    dispatch(requestExerciseProgress(exercise, targetUser));
  };

  useEffect(() => {
    if (!targetUser?._id) return;
    if (!searchValue) return;
    const matchedExercise = exerciseList.find((item) => item.exerciseTitle === searchValue);
    if (matchedExercise) {
      loadExerciseProgress(matchedExercise);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseList, searchValue, targetUser?._id]);

  useEffect(() => {
    if (exerciseList.length < 1) {
      dispatch(getExerciseList());
    }
    if (props.searchExercise && props.searchExercise !== "") {
      const matchedSearchExercise = exerciseList.find(
        (item) => item.exerciseTitle === props.searchExercise || item._id === props.searchExercise?._id
      );
      if (matchedSearchExercise) {
        loadExerciseProgress(matchedSearchExercise);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseList]);

  useEffect(() => {
    if (!targetUser?._id) return;
    dispatch(requestExerciseProgressSummary(targetUser));
  }, [dispatch, targetUser?._id]);

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
            <Grid size={{ xs: 12, sm: 10 }} container>
              <ExerciseProgressDashboard
                exerciseList={exerciseList}
                exerciseSummaries={exerciseSummaries}
                selectedExerciseTitle={searchValue}
                setSelectedExerciseTitle={setSearchValue}
                onLoadExercise={loadExerciseProgress}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 10 }}>
              <Grid size={12}>
                <BarChartHistory
                  targetExerciseHistory={targetExerciseHistory || []}
                />
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
