import { useState } from "react";
import {
  DEFAULT_CARDIO_SECTION_STATE,
  buildCardioAuto,
  normalizeCardio,
  normalizeCardioFields,
} from "../../utils/workoutUtils";
import useCardioDerivedMetrics from "./useCardioDerivedMetrics";
import useCardioHandlers from "./useCardioHandlers";
import useCardioPlanCopyActions from "./useCardioPlanCopyActions";
import useCardioSections from "./useCardioSections";
import useCardioShoeMileage from "./useCardioShoeMileage";

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

  const derivedMetrics = useCardioDerivedMetrics({
    activeCardio,
    actualCardio,
    cardioViewMode,
    plannedCardio,
  });

  const { shoeMileageHelper } = useCardioShoeMileage({
    activeCardio,
    training,
    user,
  });

  const {
    cardioSectionHasData,
    cardioSectionSummaries,
  } = useCardioSections({
    activeCardio,
    activeCardioConfig: derivedMetrics.activeCardioConfig,
    secondaryCardioMetric: derivedMetrics.secondaryCardioMetric,
    splitMetricUnitLabel: derivedMetrics.splitMetricUnitLabel,
    splitMetricValue: derivedMetrics.splitMetricValue,
    splitSummary: derivedMetrics.splitSummary,
  });

  const planCopyActions = useCardioPlanCopyActions({
    actualCardio,
    cardioViewMode,
    plannedCardio,
    primaryCardioMetric: derivedMetrics.primaryCardioMetric,
    primaryCardioMetricField: derivedMetrics.primaryCardioMetricField,
  });

  const handlers = useCardioHandlers({
    activeCardio,
    cardioAuto,
    cardioDetails,
    cardioEditorMode,
    cardioViewMode,
    isCardio,
    planClientPrompts: derivedMetrics.planClientPrompts,
    setCardioAuto,
    setCardioDetails,
    setCardioEditorMode,
    setCardioNotice,
    setCardioSectionsOpen,
    setCardioViewMode,
  });

  return {
    cardioDetails,
    cardioNotice,
    editorProps: {
      activeCardio,
      activeCardioConfig: derivedMetrics.activeCardioConfig,
      cardioAuto,
      cardioComparisonItems: derivedMetrics.cardioComparisonItems,
      cardioDistanceUnitOptions: derivedMetrics.cardioDistanceUnitOptions,
      cardioEditorMode,
      cardioRouteOptions: derivedMetrics.cardioRouteOptions,
      cardioSectionHasData,
      cardioSectionSummaries,
      cardioSectionsOpen,
      cardioStatus: derivedMetrics.cardioStatus,
      cardioStyleOptions: derivedMetrics.cardioStyleOptions,
      cardioStylePresets: derivedMetrics.cardioStylePresets,
      cardioSurfaceOptions: derivedMetrics.cardioSurfaceOptions,
      cardioViewMode,
      durationHasError: derivedMetrics.durationHasError,
      handleAddCardioSegment: handlers.handleAddCardioSegment,
      handleCardioActivityChange: handlers.handleCardioActivityChange,
      handleCardioChange: handlers.handleCardioChange,
      handleCardioDerivedChange: handlers.handleCardioDerivedChange,
      handleCardioDistanceUnitChange: handlers.handleCardioDistanceUnitChange,
      handleCardioEditorModeChange: handlers.handleCardioEditorModeChange,
      handleCardioSegmentChange: handlers.handleCardioSegmentChange,
      handleCardioViewModeChange: handlers.handleCardioViewModeChange,
      handleCopyPlanFieldToActual: handlers.handleCopyPlanFieldToActual,
      handleCopyPlanToActual: handlers.handleCopyPlanToActual,
      handleRemoveCardioSegment: handlers.handleRemoveCardioSegment,
      handleStylePreset: handlers.handleStylePreset,
      handleToggleClientPrompt: handlers.handleToggleClientPrompt,
      isTrainerEditingClient,
      missingClientPromptKeys: derivedMetrics.missingClientPromptKeys,
      paceUnitLabel: derivedMetrics.paceUnitLabel,
      planClientPrompts: derivedMetrics.planClientPrompts,
      planCopyActions,
      primaryCardioMetric: derivedMetrics.primaryCardioMetric,
      primaryCardioMetricAutoKey: derivedMetrics.primaryCardioMetricAutoKey,
      primaryCardioMetricField: derivedMetrics.primaryCardioMetricField,
      primaryCardioMetricHelperText: derivedMetrics.primaryCardioMetricHelperText,
      primaryCardioMetricLabel: derivedMetrics.primaryCardioMetricLabel,
      primaryCardioMetricPlaceholder: derivedMetrics.primaryCardioMetricPlaceholder,
      primaryMetricHasError: derivedMetrics.primaryMetricHasError,
      secondaryCardioMetric: derivedMetrics.secondaryCardioMetric,
      secondaryCardioMetricAutoKey: derivedMetrics.secondaryCardioMetricAutoKey,
      secondaryCardioMetricField: derivedMetrics.secondaryCardioMetricField,
      secondaryCardioMetricHelperText: derivedMetrics.secondaryCardioMetricHelperText,
      secondaryCardioMetricLabel: derivedMetrics.secondaryCardioMetricLabel,
      secondaryCardioMetricPlaceholder: derivedMetrics.secondaryCardioMetricPlaceholder,
      secondaryMetricHasError: derivedMetrics.secondaryMetricHasError,
      shoeMileageHelper,
      speedUnitLabel: derivedMetrics.speedUnitLabel,
      splitMetricLabel: derivedMetrics.splitMetricLabel,
      splitMetricUnitLabel: derivedMetrics.splitMetricUnitLabel,
      splitMetricValue: derivedMetrics.splitMetricValue,
      splitSummary: derivedMetrics.splitSummary,
      toggleCardioSection: handlers.toggleCardioSection,
    },
    handleCardioNoticeClose: handlers.handleCardioNoticeClose,
    hydrateCardio: handlers.hydrateCardio,
  };
}
