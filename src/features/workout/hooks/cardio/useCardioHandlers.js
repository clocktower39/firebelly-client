import { useCallback, useEffect } from "react";
import {
  CARDIO_CLIENT_PROMPT_LOOKUP,
  DEFAULT_CARDIO_SEGMENT,
  buildCardioAuto,
  computeDerivedCardio,
  convertDistanceValue,
  getCardioAutoOpenSections,
  hasCardioValue,
  normalizeCardio,
  normalizeCardioFields,
  sanitizeCardioForActivity,
  seedActualCardioFromPlan,
} from "../../utils/workoutUtils";

export default function useCardioHandlers({
  activeCardio,
  cardioAuto,
  cardioDetails,
  cardioEditorMode,
  cardioViewMode,
  isCardio,
  planClientPrompts,
  setCardioAuto,
  setCardioDetails,
  setCardioEditorMode,
  setCardioNotice,
  setCardioSectionsOpen,
  setCardioViewMode,
}) {
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
    handleAddCardioSegment,
    handleCardioActivityChange,
    handleCardioChange,
    handleCardioDerivedChange,
    handleCardioDistanceUnitChange,
    handleCardioEditorModeChange,
    handleCardioNoticeClose,
    handleCardioSegmentChange,
    handleCardioViewModeChange,
    handleCopyPlanFieldToActual,
    handleCopyPlanToActual,
    handleRemoveCardioSegment,
    handleStylePreset,
    handleToggleClientPrompt,
    hydrateCardio,
    toggleCardioSection,
  };
}
