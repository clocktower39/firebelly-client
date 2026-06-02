import React from "react";
import { Grid, Paper, Stack } from "@mui/material";
import CardioBasicFields from "./CardioBasicFields";
import CardioConditionsSection from "./CardioConditionsSection";
import CardioMetricsSection from "./CardioMetricsSection";
import CardioNotesSection from "./CardioNotesSection";
import CardioRouteSection from "./CardioRouteSection";
import CardioSegmentsSection from "./CardioSegmentsSection";
import CardioSummaryPanel from "./CardioSummaryPanel";

export default function CardioDetailsEditor({
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
}) {
  return (
    <>
      <Grid size={12}>
        <Paper variant="outlined" sx={{ padding: "16px" }}>
          <Stack spacing={2.5}>
            <CardioSummaryPanel
              activeCardio={activeCardio}
              cardioComparisonItems={cardioComparisonItems}
              cardioEditorMode={cardioEditorMode}
              cardioSectionHasData={cardioSectionHasData}
              cardioSectionSummaries={cardioSectionSummaries}
              cardioSectionsOpen={cardioSectionsOpen}
              cardioStatus={cardioStatus}
              cardioStylePresets={cardioStylePresets}
              cardioViewMode={cardioViewMode}
              handleCardioEditorModeChange={handleCardioEditorModeChange}
              handleCardioViewModeChange={handleCardioViewModeChange}
              handleCopyPlanFieldToActual={handleCopyPlanFieldToActual}
              handleCopyPlanToActual={handleCopyPlanToActual}
              handleStylePreset={handleStylePreset}
              handleToggleClientPrompt={handleToggleClientPrompt}
              isTrainerEditingClient={isTrainerEditingClient}
              missingClientPromptKeys={missingClientPromptKeys}
              planClientPrompts={planClientPrompts}
              planCopyActions={planCopyActions}
              toggleCardioSection={toggleCardioSection}
            />
            <CardioBasicFields
              activeCardio={activeCardio}
              cardioAuto={cardioAuto}
              cardioDistanceUnitOptions={cardioDistanceUnitOptions}
              cardioStyleOptions={cardioStyleOptions}
              cardioViewMode={cardioViewMode}
              durationHasError={durationHasError}
              handleCardioActivityChange={handleCardioActivityChange}
              handleCardioChange={handleCardioChange}
              handleCardioDerivedChange={handleCardioDerivedChange}
              handleCardioDistanceUnitChange={handleCardioDistanceUnitChange}
              primaryCardioMetric={primaryCardioMetric}
              primaryCardioMetricAutoKey={primaryCardioMetricAutoKey}
              primaryCardioMetricField={primaryCardioMetricField}
              primaryCardioMetricHelperText={primaryCardioMetricHelperText}
              primaryCardioMetricLabel={primaryCardioMetricLabel}
              primaryCardioMetricPlaceholder={primaryCardioMetricPlaceholder}
              primaryMetricHasError={primaryMetricHasError}
            />
          </Stack>
        </Paper>
      </Grid>
      <CardioMetricsSection
        activeCardio={activeCardio}
        activeCardioConfig={activeCardioConfig}
        cardioAuto={cardioAuto}
        cardioSectionsOpen={cardioSectionsOpen}
        cardioViewMode={cardioViewMode}
        handleCardioChange={handleCardioChange}
        handleCardioDerivedChange={handleCardioDerivedChange}
        secondaryCardioMetric={secondaryCardioMetric}
        secondaryCardioMetricAutoKey={secondaryCardioMetricAutoKey}
        secondaryCardioMetricField={secondaryCardioMetricField}
        secondaryCardioMetricHelperText={secondaryCardioMetricHelperText}
        secondaryCardioMetricLabel={secondaryCardioMetricLabel}
        secondaryCardioMetricPlaceholder={secondaryCardioMetricPlaceholder}
        secondaryMetricHasError={secondaryMetricHasError}
      />
      <CardioRouteSection
        activeCardio={activeCardio}
        activeCardioConfig={activeCardioConfig}
        cardioRouteOptions={cardioRouteOptions}
        cardioSectionsOpen={cardioSectionsOpen}
        cardioSurfaceOptions={cardioSurfaceOptions}
        handleCardioChange={handleCardioChange}
        shoeMileageHelper={shoeMileageHelper}
      />
      <CardioConditionsSection
        activeCardio={activeCardio}
        cardioSectionsOpen={cardioSectionsOpen}
        handleCardioChange={handleCardioChange}
      />
      <CardioNotesSection
        activeCardio={activeCardio}
        cardioSectionsOpen={cardioSectionsOpen}
        handleCardioChange={handleCardioChange}
      />
      <CardioSegmentsSection
        activeCardio={activeCardio}
        cardioSectionsOpen={cardioSectionsOpen}
        handleAddCardioSegment={handleAddCardioSegment}
        handleCardioSegmentChange={handleCardioSegmentChange}
        handleRemoveCardioSegment={handleRemoveCardioSegment}
        paceUnitLabel={paceUnitLabel}
        primaryCardioMetric={primaryCardioMetric}
        speedUnitLabel={speedUnitLabel}
        splitMetricLabel={splitMetricLabel}
        splitMetricUnitLabel={splitMetricUnitLabel}
        splitMetricValue={splitMetricValue}
        splitSummary={splitSummary}
      />
    </>
  );
}
