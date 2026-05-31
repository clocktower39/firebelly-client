import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  CARDIO_CLIENT_PROMPT_LOOKUP,
  DEFAULT_CARDIO_SECTION_STATE,
  DEFAULT_CARDIO_SEGMENT,
  buildCardioAuto,
  computeDerivedCardio,
  computeSplitSummary,
  convertDistanceToMiles,
  convertDistanceValue,
  formatTemperatureLabel,
  getCardioActivityConfig,
  getCardioAutoOpenSections,
  getCardioDistanceUnitOptions,
  getCardioPromptMissing,
  getCardioRouteOptions,
  getCardioStyleOptions,
  getCardioStylePresets,
  getDerivedMetricHelperText,
  getPaceUnitLabel,
  getPrimaryCardioMetric,
  getSecondaryCardioMetric,
  getSpeedUnitLabel,
  hasCardioValue,
  isPositiveNumericValue,
  isValidDurationValue,
  isValidPaceValue,
  joinSummaryParts,
  normalizeCardio,
  normalizeCardioFields,
  normalizeShoeName,
  sanitizeCardioForActivity,
  seedActualCardioFromPlan,
  shortenHrZoneLabel,
  truncateText,
} from "../utils/workoutUtils";

export default function useWorkoutCardio({ isCardio, training, user }) {
  const [cardioDetails, setCardioDetails] = useState(() => normalizeCardio(training?.cardio));
  const [cardioAuto, setCardioAuto] = useState(() => buildCardioAuto(normalizeCardio(training?.cardio)));
  const [cardioViewMode, setCardioViewMode] = useState("plan");
  const [cardioSectionsOpen, setCardioSectionsOpen] = useState(DEFAULT_CARDIO_SECTION_STATE);
  const [cardioEditorMode, setCardioEditorMode] = useState(user?.isTrainer ? "full" : "quick");
  const [cardioNotice, setCardioNotice] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const activeCardio = cardioDetails?.[cardioViewMode] || normalizeCardioFields({});
  const plannedCardio = cardioDetails?.plan || normalizeCardioFields({});
  const actualCardio = cardioDetails?.actual || normalizeCardioFields({});
  const isTrainerEditingClient =
    !!user?.isTrainer && !!training?.user?._id && String(user._id) !== String(training.user._id);
  const activeCardioConfig = useMemo(
    () => getCardioActivityConfig(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioDistanceUnitOptions = useMemo(
    () => getCardioDistanceUnitOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioStyleOptions = useMemo(
    () => getCardioStyleOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioRouteOptions = useMemo(
    () => getCardioRouteOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioSurfaceOptions = useMemo(
    () => getCardioSurfaceOptions(activeCardio.activity),
    [activeCardio.activity]
  );
  const cardioStylePresets = useMemo(
    () => getCardioStylePresets(activeCardio.activity),
    [activeCardio.activity]
  );
  const paceUnitLabel = getPaceUnitLabel(activeCardio.activity, activeCardio.distanceUnit);
  const speedUnitLabel = getSpeedUnitLabel(activeCardio.distanceUnit);
  const primaryCardioMetric = getPrimaryCardioMetric(activeCardio.activity);
  const secondaryCardioMetric = getSecondaryCardioMetric(activeCardio.activity);
  const primaryCardioMetricField = primaryCardioMetric === "speed" ? "avgSpeed" : "avgPace";
  const secondaryCardioMetricField =
    secondaryCardioMetric === "speed" ? "avgSpeed" : secondaryCardioMetric === "pace" ? "avgPace" : "";
  const primaryCardioMetricAutoKey = primaryCardioMetric === "speed" ? "speed" : "pace";
  const secondaryCardioMetricAutoKey =
    secondaryCardioMetric === "speed" ? "speed" : secondaryCardioMetric === "pace" ? "pace" : "";
  const primaryCardioMetricLabel =
    primaryCardioMetric === "speed" ? `Avg speed (${speedUnitLabel})` : `Avg pace (${paceUnitLabel})`;
  const secondaryCardioMetricLabel =
    secondaryCardioMetric === "speed"
      ? `Avg speed (${speedUnitLabel})`
      : secondaryCardioMetric === "pace"
        ? `Avg pace (${paceUnitLabel})`
        : "";
  const primaryCardioMetricPlaceholder =
    primaryCardioMetric === "speed" ? "0.0" : `mm:ss ${paceUnitLabel}`;
  const secondaryCardioMetricPlaceholder =
    secondaryCardioMetric === "speed"
      ? "0.0"
      : secondaryCardioMetric === "pace"
        ? `mm:ss ${paceUnitLabel}`
        : "";
  const primaryCardioMetricHelperText = getDerivedMetricHelperText(
    primaryCardioMetric,
    paceUnitLabel,
    speedUnitLabel
  );
  const secondaryCardioMetricHelperText = secondaryCardioMetric
    ? getDerivedMetricHelperText(secondaryCardioMetric, paceUnitLabel, speedUnitLabel)
    : "";
  const splitSummary = useMemo(
    () => computeSplitSummary(activeCardio.segments || [], activeCardio),
    [activeCardio]
  );
  const splitMetricLabel = primaryCardioMetric === "speed" ? "Avg split speed" : "Avg split pace";
  const splitMetricValue = primaryCardioMetric === "speed" ? splitSummary.avgSpeed : splitSummary.avgPace;
  const splitMetricUnitLabel = primaryCardioMetric === "speed" ? speedUnitLabel : paceUnitLabel;
  const durationHasError = hasCardioValue(activeCardio.duration) && !isValidDurationValue(activeCardio.duration);
  const primaryMetricHasError =
    hasCardioValue(activeCardio[primaryCardioMetricField]) &&
    !(primaryCardioMetric === "speed"
      ? isPositiveNumericValue(activeCardio[primaryCardioMetricField])
      : isValidPaceValue(activeCardio[primaryCardioMetricField]));
  const secondaryMetricHasError =
    secondaryCardioMetric &&
    hasCardioValue(activeCardio[secondaryCardioMetricField]) &&
    !(secondaryCardioMetric === "speed"
      ? isPositiveNumericValue(activeCardio[secondaryCardioMetricField])
      : isValidPaceValue(activeCardio[secondaryCardioMetricField]));
  const basicCardioMissingFields = [
    !hasCardioValue(activeCardio.style) ? "session type" : "",
    !hasCardioValue(activeCardio.distance) ? "distance" : "",
    !hasCardioValue(activeCardio.duration) ? "duration" : "",
  ].filter(Boolean);
  const planClientPrompts = plannedCardio.clientPrompts || [];
  const missingClientPromptKeys = useMemo(
    () => (cardioViewMode === "actual" ? getCardioPromptMissing(actualCardio, planClientPrompts) : []),
    [actualCardio, cardioViewMode, planClientPrompts]
  );
  const cardioStatus = useMemo(() => {
    if (basicCardioMissingFields.length > 0) {
      return {
        severity: "info",
        message: `Add ${basicCardioMissingFields.join(", ")} to finish the core workout details.`,
      };
    }

    if (durationHasError || primaryMetricHasError || secondaryMetricHasError) {
      return {
        severity: "warning",
        message: "Fix the highlighted cardio fields before you save.",
      };
    }

    if (missingClientPromptKeys.length > 0) {
      const labels = missingClientPromptKeys.map((key) => CARDIO_CLIENT_PROMPT_LOOKUP[key]?.label || key);
      return {
        severity: "info",
        message: `Trainer requested: ${labels.join(", ")}.`,
      };
    }

    return {
      severity: "success",
      message: "Cardio details look ready to save.",
    };
  }, [
    basicCardioMissingFields,
    durationHasError,
    primaryMetricHasError,
    secondaryMetricHasError,
    missingClientPromptKeys,
  ]);
  const workoutsForMileage = useSelector((state) => {
    const accountId = training?.user?._id || user._id;
    return state.workouts?.[accountId]?.workouts || [];
  });
  const shoeMileage = useMemo(() => {
    const shoeName = normalizeShoeName(activeCardio.shoes);
    if (!shoeName) return null;
    let totalMiles = 0;
    let matchingWorkouts = 0;

    workoutsForMileage.forEach((workout) => {
      const cardio = normalizeCardio(workout?.cardio);
      const workoutTypeValue = workout?.workoutType || (cardio?.plan || cardio?.actual ? "Cardio" : "");
      if (workoutTypeValue !== "Cardio") return;
      const mode = cardio?.actual?.distance ? "actual" : "plan";
      const entry = cardio?.[mode] || {};
      if (normalizeShoeName(entry.shoes) !== shoeName) return;
      const distance = Number(entry.distance);
      if (!distance) return;
      const unit = entry.distanceUnit || "mi";
      const miles = convertDistanceToMiles(distance, unit);
      totalMiles += miles;
      matchingWorkouts += 1;
    });

    const displayValue =
      activeCardio.distanceUnit === "km" ? (totalMiles * 1.60934).toFixed(2) : totalMiles.toFixed(2);

    return {
      value: displayValue,
      unit: activeCardio.distanceUnit,
      workouts: matchingWorkouts,
    };
  }, [activeCardio.distanceUnit, activeCardio.shoes, workoutsForMileage]);
  const shoeMileageHelper = useMemo(() => {
    if (!activeCardio.shoes) return "";
    if (!shoeMileage) return "Mileage updates as workouts load.";
    const workoutLabel = shoeMileage.workouts === 1 ? "workout" : "workouts";
    return `Loaded mileage: ${shoeMileage.value} ${shoeMileage.unit} (${shoeMileage.workouts} ${workoutLabel} loaded)`;
  }, [activeCardio.shoes, shoeMileage]);
  const cardioSectionHasData = useMemo(
    () => ({
      metrics: [
        secondaryCardioMetric === "pace" ? activeCardio.avgPace : "",
        secondaryCardioMetric === "speed" ? activeCardio.avgSpeed : "",
        activeCardio.rpe,
        activeCardio.hrZone,
        activeCardio.avgHeartRate,
        activeCardio.cadence,
        activeCardio.strideLength,
      ].some((value) => value !== "" && value !== null && value !== undefined),
      route: [
        activeCardio.routeType,
        activeCardio.surface,
        activeCardio.shoes,
        activeCardio.elevationGain,
        activeCardio.routeLink,
      ].some((value) => value !== "" && value !== null && value !== undefined),
      conditions: [activeCardio.weather, activeCardio.temperature].some(
        (value) => value !== "" && value !== null && value !== undefined
      ),
      notes: [activeCardio.notes].some(
        (value) => value !== "" && value !== null && value !== undefined
      ),
      segments: (activeCardio.segments || []).length > 0,
    }),
    [activeCardio, secondaryCardioMetric]
  );
  const cardioSectionSummaries = useMemo(() => {
    const metricsSummary = joinSummaryParts(
      [
        activeCardio.rpe ? `RPE ${activeCardio.rpe}` : "",
        activeCardio.hrZone ? shortenHrZoneLabel(activeCardio.hrZone) : "",
        secondaryCardioMetric === "pace" && activeCardio.avgPace ? `Pace ${activeCardio.avgPace}` : "",
        secondaryCardioMetric === "speed" && activeCardio.avgSpeed ? `Speed ${activeCardio.avgSpeed}` : "",
        activeCardio.avgHeartRate ? `${activeCardio.avgHeartRate} bpm` : "",
        activeCardioConfig.showCadence && activeCardio.cadence
          ? `Cad ${activeCardio.cadence} ${activeCardio.activity === "Bike" ? "rpm" : "spm"}`
          : "",
      ],
      2
    );
    const routeSummary = joinSummaryParts(
      [
        activeCardio.routeType,
        activeCardio.surface,
        activeCardio.shoes ? truncateText(activeCardio.shoes, 18) : "",
        activeCardio.elevationGain ? `Gain ${activeCardio.elevationGain}` : "",
        activeCardio.routeLink ? "Link" : "",
      ],
      2
    );
    const conditionsSummary = joinSummaryParts(
      [
        activeCardio.weather,
        formatTemperatureLabel(activeCardio.temperature, activeCardio.temperatureUnit),
      ],
      2
    );
    const notePreview = truncateText(activeCardio.notes, 34);
    const segmentCount = activeCardio.segments?.length || 0;
    const segmentsSummary =
      segmentCount > 0
        ? joinSummaryParts(
            [
              `${segmentCount} ${segmentCount === 1 ? "split" : "splits"}`,
              splitSummary.totalDistance ? `${splitSummary.totalDistance} ${activeCardio.distanceUnit}` : "",
              !splitSummary.totalDistance && splitSummary.totalDuration ? splitSummary.totalDuration : "",
              splitMetricValue ? `${splitMetricValue} ${splitMetricUnitLabel}` : "",
            ],
            2
          )
        : "";

    return {
      metrics: metricsSummary,
      route: routeSummary,
      conditions: conditionsSummary,
      notes: notePreview,
      segments: segmentsSummary,
    };
  }, [
    activeCardio,
    activeCardioConfig,
    paceUnitLabel,
    secondaryCardioMetric,
    speedUnitLabel,
    splitMetricUnitLabel,
    splitMetricValue,
    splitSummary,
  ]);
  const cardioComparisonItems = useMemo(() => {
    const formatDistanceEntry = (entry) =>
      hasCardioValue(entry?.distance) ? `${entry.distance} ${entry.distanceUnit || activeCardio.distanceUnit}` : "—";
    const formatMetricEntry = (entry, metricKey, metricType) => {
      if (!hasCardioValue(entry?.[metricKey])) return "—";
      return metricType === "speed" ? `${entry[metricKey]} ${speedUnitLabel}` : `${entry[metricKey]} ${paceUnitLabel}`;
    };

    return [
      {
        key: "session",
        label: "Type",
        plan: plannedCardio.style || "—",
        actual: actualCardio.style || "—",
      },
      {
        key: "distance",
        label: "Distance",
        plan: formatDistanceEntry(plannedCardio),
        actual: formatDistanceEntry(actualCardio),
      },
      {
        key: "duration",
        label: "Duration",
        plan: plannedCardio.duration || "—",
        actual: actualCardio.duration || "—",
      },
      {
        key: "metric",
        label: primaryCardioMetric === "speed" ? "Speed" : "Pace",
        plan: formatMetricEntry(plannedCardio, primaryCardioMetricField, primaryCardioMetric),
        actual: formatMetricEntry(actualCardio, primaryCardioMetricField, primaryCardioMetric),
      },
    ].filter((item) => item.plan !== "—" || item.actual !== "—");
  }, [
    activeCardio.distanceUnit,
    actualCardio,
    paceUnitLabel,
    plannedCardio,
    primaryCardioMetric,
    primaryCardioMetricField,
    speedUnitLabel,
  ]);
  const planCopyActions = useMemo(() => {
    if (cardioViewMode !== "actual") return [];

    const actions = [];
    const pushAction = (action) => {
      if (actions.find((item) => item.key === action.key)) return;
      actions.push(action);
    };

    if (hasCardioValue(plannedCardio.style) && plannedCardio.style !== actualCardio.style) {
      pushAction({
        key: "style",
        label: `Use ${plannedCardio.style}`,
        patch: { style: plannedCardio.style },
        notice: "Copied planned session type.",
      });
    }

    if (
      hasCardioValue(plannedCardio.distance) &&
      (plannedCardio.distance !== actualCardio.distance || plannedCardio.distanceUnit !== actualCardio.distanceUnit)
    ) {
      pushAction({
        key: "distance",
        label: `Use ${plannedCardio.distance} ${plannedCardio.distanceUnit}`,
        patch: {
          distance: plannedCardio.distance,
          distanceUnit: plannedCardio.distanceUnit,
        },
        notice: "Copied planned distance.",
      });
    }

    if (hasCardioValue(plannedCardio.duration) && plannedCardio.duration !== actualCardio.duration) {
      pushAction({
        key: "duration",
        label: `Use ${plannedCardio.duration}`,
        patch: { duration: plannedCardio.duration },
        notice: "Copied planned duration.",
      });
    }

    if (
      hasCardioValue(plannedCardio[primaryCardioMetricField]) &&
      plannedCardio[primaryCardioMetricField] !== actualCardio[primaryCardioMetricField]
    ) {
      pushAction({
        key: primaryCardioMetricField,
        label: `Use ${plannedCardio[primaryCardioMetricField]}`,
        patch: { [primaryCardioMetricField]: plannedCardio[primaryCardioMetricField] },
        notice: `Copied planned ${primaryCardioMetric === "speed" ? "speed" : "pace"}.`,
      });
    }

    if (hasCardioValue(plannedCardio.rpe) && plannedCardio.rpe !== actualCardio.rpe) {
      pushAction({
        key: "rpe",
        label: `Use RPE ${plannedCardio.rpe}`,
        patch: { rpe: plannedCardio.rpe },
        notice: "Copied planned RPE.",
      });
    }

    if (hasCardioValue(plannedCardio.weather) && plannedCardio.weather !== actualCardio.weather) {
      pushAction({
        key: "weather",
        label: `Use ${plannedCardio.weather}`,
        patch: {
          weather: plannedCardio.weather,
          temperature: plannedCardio.temperature,
          temperatureUnit: plannedCardio.temperatureUnit,
        },
        notice: "Copied planned weather.",
      });
    }

    if (hasCardioValue(plannedCardio.notes) && plannedCardio.notes !== actualCardio.notes) {
      pushAction({
        key: "notes",
        label: "Use notes",
        patch: { notes: plannedCardio.notes },
        notice: "Copied planned notes.",
      });
    }

    if (Array.isArray(plannedCardio.segments) && plannedCardio.segments.length > 0) {
      const planSegments = JSON.stringify(plannedCardio.segments);
      const actualSegments = JSON.stringify(actualCardio.segments || []);
      if (planSegments !== actualSegments) {
        pushAction({
          key: "segments",
          label: "Use splits",
          patch: {
            segments: plannedCardio.segments.map((segment) => ({ ...segment })),
          },
          notice: "Copied planned splits.",
        });
      }
    }

    return actions.slice(0, 6);
  }, [
    actualCardio,
    cardioViewMode,
    plannedCardio,
    primaryCardioMetric,
    primaryCardioMetricField,
  ]);

  useEffect(() => {
    if (!isCardio) return;

    const derived = computeDerivedCardio(activeCardio);

    setCardioDetails((prev) => {
      const mode = cardioViewMode;
      const modeData = prev[mode] || normalizeCardioFields({});
      const nextData = { ...modeData };
      let changed = false;
      const autoFlags = cardioAuto?.[mode] || {};

      if (autoFlags.pace) {
        const nextPace = derived.pace || "";
        if (nextData.avgPace !== nextPace) {
          nextData.avgPace = nextPace;
          changed = true;
        }
      }

      if (autoFlags.speed) {
        const nextSpeed = derived.speed || "";
        if (nextData.avgSpeed !== nextSpeed) {
          nextData.avgSpeed = nextSpeed;
          changed = true;
        }
      }

      if (!changed) return prev;
      return { ...prev, [mode]: nextData };
    });
  }, [
    isCardio,
    cardioViewMode,
    cardioAuto,
    activeCardio.distance,
    activeCardio.duration,
    activeCardio.distanceUnit,
  ]);

  const hydrateCardio = useCallback((cardio, isTrainer) => {
    const normalizedCardio = normalizeCardio(cardio);
    const nextEditorMode = isTrainer ? "full" : "quick";

    setCardioDetails(normalizedCardio);
    setCardioAuto(buildCardioAuto(normalizedCardio));
    setCardioViewMode("plan");
    setCardioEditorMode(nextEditorMode);
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: normalizedCardio.plan,
        promptKeys: normalizedCardio.plan?.clientPrompts || [],
        editorMode: nextEditorMode,
      })
    );
  }, []);

  const handleCardioNoticeClose = () => {
    setCardioNotice((prev) => ({ ...prev, open: false }));
  };

  const handleCardioEditorModeChange = (event, nextMode) => {
    if (!nextMode) return;
    setCardioEditorMode(nextMode);
    const promptKeys = cardioViewMode === "actual" ? planClientPrompts : activeCardio.clientPrompts || [];
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: activeCardio,
        promptKeys,
        editorMode: nextMode,
      })
    );
  };

  const handleCardioViewModeChange = (event, nextValue) => {
    if (!nextValue) return;
    const nextCardio =
      nextValue === "actual"
        ? seedActualCardioFromPlan(cardioDetails?.plan, cardioDetails?.actual)
        : cardioDetails?.[nextValue] || normalizeCardioFields({});
    const promptKeys = nextValue === "actual" ? planClientPrompts : nextCardio.clientPrompts || [];

    if (nextValue === "actual") {
      setCardioDetails((prev) => ({
        ...prev,
        actual: seedActualCardioFromPlan(prev?.plan, prev?.actual),
      }));
    }

    setCardioViewMode(nextValue);
    setCardioSectionsOpen(
      getCardioAutoOpenSections({
        cardioFields: nextCardio,
        promptKeys,
        editorMode: cardioEditorMode,
      })
    );
  };

  const handleCardioChange = (field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field]: value,
      },
    }));
  };

  const handleCardioDistanceUnitChange = (event) => {
    const nextUnit = event.target.value;
    const currentUnit = activeCardio.distanceUnit;

    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        distanceUnit: nextUnit,
        distance: convertDistanceValue(prev[cardioViewMode]?.distance, currentUnit, nextUnit),
        segments: (prev[cardioViewMode]?.segments || []).map((segment) => ({
          ...segment,
          distance: convertDistanceValue(segment?.distance, currentUnit, nextUnit),
        })),
      },
    }));
  };

  const handleCardioActivityChange = (event) => {
    const nextActivity = event.target.value;
    const nextModeData = sanitizeCardioForActivity(activeCardio, nextActivity);
    const clearedFields = [];

    [
      ["style", "session type"],
      ["avgPace", "pace"],
      ["avgSpeed", "speed"],
      ["routeType", "route"],
      ["surface", "surface"],
      ["shoes", "shoes"],
      ["cadence", "cadence"],
      ["strideLength", "stride"],
      ["elevationGain", "elevation gain"],
    ].forEach(([field, label]) => {
      if (hasCardioValue(activeCardio?.[field]) && !hasCardioValue(nextModeData?.[field])) {
        clearedFields.push(label);
      }
    });

    setCardioDetails((prev) => {
      return {
        ...prev,
        [cardioViewMode]: nextModeData,
      };
    });
    setCardioAuto((prev) => ({
      ...prev,
      [cardioViewMode]: {
        pace: !nextModeData.avgPace,
        speed: !nextModeData.avgSpeed,
      },
    }));

    if (clearedFields.length > 0) {
      const preview =
        clearedFields.length > 3
          ? `${clearedFields.slice(0, 3).join(", ")}, and more`
          : clearedFields.join(", ");
      setCardioNotice({
        open: true,
        severity: "info",
        message: `Switched to ${nextActivity}. Cleared ${preview}.`,
      });
    }
  };

  const handleStylePreset = (style) => {
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        style,
      },
    }));
  };

  const handleCardioDerivedChange = (field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field]: value,
      },
    }));
    setCardioAuto((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        [field === "avgPace" ? "pace" : "speed"]: value === "",
      },
    }));
  };

  const handleToggleClientPrompt = (promptKey) => {
    const section = CARDIO_CLIENT_PROMPT_LOOKUP[promptKey]?.section;
    setCardioDetails((prev) => {
      const plan = prev.plan || normalizeCardioFields({});
      const nextPrompts = plan.clientPrompts?.includes(promptKey)
        ? plan.clientPrompts.filter((key) => key !== promptKey)
        : [...(plan.clientPrompts || []), promptKey];

      return {
        ...prev,
        plan: {
          ...plan,
          clientPrompts: nextPrompts,
        },
      };
    });
    if (section) {
      setCardioSectionsOpen((prev) => ({
        ...prev,
        [section]: true,
      }));
    }
  };

  const toggleCardioSection = (section) => {
    setCardioSectionsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddCardioSegment = () => {
    setCardioSectionsOpen((prev) => ({
      ...prev,
      segments: true,
    }));
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        segments: [...(prev[cardioViewMode]?.segments || []), { ...DEFAULT_CARDIO_SEGMENT }],
      },
    }));
  };

  const handleRemoveCardioSegment = (index) => {
    setCardioDetails((prev) => ({
      ...prev,
      [cardioViewMode]: {
        ...prev[cardioViewMode],
        segments: (prev[cardioViewMode]?.segments || []).filter((_, idx) => idx !== index),
      },
    }));
  };

  const handleCardioSegmentChange = (index, field) => (event) => {
    const value = event.target.value;
    setCardioDetails((prev) => {
      const segments = [...(prev[cardioViewMode]?.segments || [])];
      segments[index] = { ...segments[index], [field]: value };
      return {
        ...prev,
        [cardioViewMode]: {
          ...prev[cardioViewMode],
          segments,
        },
      };
    });
  };

  const handleCopyPlanFieldToActual = (action) => {
    setCardioDetails((prev) => ({
      ...prev,
      actual: {
        ...prev.actual,
        ...action.patch,
      },
    }));

    setCardioAuto((prev) => ({
      ...prev,
      actual: {
        ...prev.actual,
        ...(Object.prototype.hasOwnProperty.call(action.patch, "avgPace") ? { pace: false } : {}),
        ...(Object.prototype.hasOwnProperty.call(action.patch, "avgSpeed") ? { speed: false } : {}),
      },
    }));

    setCardioNotice({
      open: true,
      severity: "success",
      message: action.notice,
    });
  };

  const handleCopyPlanToActual = () => {
    setCardioDetails((prev) => {
      const nextActual = normalizeCardioFields(prev.plan);
      return {
        ...prev,
        actual: nextActual,
      };
    });
    setCardioAuto((prev) => ({
      ...prev,
      actual: {
        pace: false,
        speed: false,
      },
    }));
    setCardioNotice({
      open: true,
      severity: "success",
      message: "Copied the full plan into results.",
    });
  };

  return {
    cardioDetails,
    cardioNotice,
    editorProps: {
      activeCardio,
      activeCardioConfig,
      cardioAuto,
      cardioComparisonItems,
      cardioDistanceUnitOptions,
      cardioEditorMode,
      cardioRouteOptions,
      cardioSectionHasData,
      cardioSectionSummaries,
      cardioSectionsOpen,
      cardioStatus,
      cardioStyleOptions,
      cardioStylePresets,
      cardioSurfaceOptions,
      cardioViewMode,
      durationHasError,
      handleAddCardioSegment,
      handleCardioActivityChange,
      handleCardioChange,
      handleCardioDerivedChange,
      handleCardioDistanceUnitChange,
      handleCardioEditorModeChange,
      handleCardioSegmentChange,
      handleCardioViewModeChange,
      handleCopyPlanFieldToActual,
      handleCopyPlanToActual,
      handleRemoveCardioSegment,
      handleStylePreset,
      handleToggleClientPrompt,
      isTrainerEditingClient,
      missingClientPromptKeys,
      paceUnitLabel,
      planClientPrompts,
      planCopyActions,
      primaryCardioMetric,
      primaryCardioMetricAutoKey,
      primaryCardioMetricField,
      primaryCardioMetricHelperText,
      primaryCardioMetricLabel,
      primaryCardioMetricPlaceholder,
      primaryMetricHasError,
      secondaryCardioMetric,
      secondaryCardioMetricAutoKey,
      secondaryCardioMetricField,
      secondaryCardioMetricHelperText,
      secondaryCardioMetricLabel,
      secondaryCardioMetricPlaceholder,
      secondaryMetricHasError,
      shoeMileageHelper,
      speedUnitLabel,
      splitMetricLabel,
      splitMetricUnitLabel,
      splitMetricValue,
      splitSummary,
      toggleCardioSection,
    },
    handleCardioNoticeClose,
    hydrateCardio,
  };
}
