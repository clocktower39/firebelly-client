import React from "react";
import { Add } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CARDIO_CLIENT_PROMPT_LOOKUP,
  CARDIO_CLIENT_PROMPT_OPTIONS,
  CARDIO_OPTIONAL_SECTIONS,
} from "../../utils/workoutUtils";

export default function CardioSummaryPanel({
  activeCardio,
  cardioComparisonItems,
  cardioEditorMode,
  cardioSectionHasData,
  cardioSectionSummaries,
  cardioSectionsOpen,
  cardioStatus,
  cardioStylePresets,
  cardioViewMode,
  handleCardioEditorModeChange,
  handleCardioViewModeChange,
  handleCopyPlanFieldToActual,
  handleCopyPlanToActual,
  handleStylePreset,
  handleToggleClientPrompt,
  isTrainerEditingClient,
  missingClientPromptKeys,
  planClientPrompts,
  planCopyActions,
  toggleCardioSection,
}) {
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6">Cardio Details</Typography>
          <Typography variant="body2" color="text.secondary">
            Start with the basics. Open the plus buttons for the extras.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ToggleButtonGroup
            value={cardioViewMode}
            exclusive
            size="small"
            onChange={handleCardioViewModeChange}
          >
            <ToggleButton value="plan">Plan</ToggleButton>
            <ToggleButton value="actual">Results</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={cardioEditorMode}
            exclusive
            size="small"
            onChange={handleCardioEditorModeChange}
          >
            <ToggleButton value="quick">Quick Log</ToggleButton>
            <ToggleButton value="full">Full Details</ToggleButton>
          </ToggleButtonGroup>
          {cardioViewMode === "actual" && (
            <Button variant="outlined" size="small" onClick={handleCopyPlanToActual}>
              Copy plan
            </Button>
          )}
        </Stack>
      </Stack>
      <Alert severity={cardioStatus.severity} variant="outlined">
        {cardioStatus.message}
      </Alert>
      {cardioComparisonItems.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
          {cardioComparisonItems.map((item) => (
            <Chip
              key={`compare-${item.key}`}
              size="small"
              variant="outlined"
              label={`${item.label}: ${item.plan} -> ${item.actual}`}
            />
          ))}
        </Stack>
      )}
      {cardioViewMode === "actual" && planClientPrompts.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Trainer requested:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            {planClientPrompts.map((key) => {
              const option = CARDIO_CLIENT_PROMPT_LOOKUP[key];
              if (!option) return null;
              const isMissing = missingClientPromptKeys.includes(key);

              return (
                <Chip
                  key={`requested-${key}`}
                  size="small"
                  clickable
                  color={isMissing ? "warning" : "success"}
                  variant={isMissing ? "filled" : "outlined"}
                  label={option.label}
                  onClick={() => toggleCardioSection(option.section)}
                />
              );
            })}
          </Stack>
        </Stack>
      )}
      {cardioViewMode === "actual" && planCopyActions.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Use planned details:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            {planCopyActions.map((action) => (
              <Chip
                key={`copy-${action.key}`}
                size="small"
                clickable
                variant="outlined"
                label={action.label}
                onClick={() => handleCopyPlanFieldToActual(action)}
              />
            ))}
          </Stack>
        </Stack>
      )}
      {cardioStylePresets.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Quick presets
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            {cardioStylePresets.map((style) => (
              <Chip
                key={`preset-${style}`}
                label={style}
                size="small"
                clickable
                color={activeCardio.style === style ? "primary" : "default"}
                variant={activeCardio.style === style ? "filled" : "outlined"}
                onClick={() => handleStylePreset(style)}
              />
            ))}
          </Stack>
        </Stack>
      )}
      {isTrainerEditingClient && cardioViewMode === "plan" && (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Ask the client to complete
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
            {CARDIO_CLIENT_PROMPT_OPTIONS.map((option) => (
              <Chip
                key={`prompt-${option.key}`}
                label={option.label}
                size="small"
                clickable
                color={planClientPrompts.includes(option.key) ? "primary" : "default"}
                variant={planClientPrompts.includes(option.key) ? "filled" : "outlined"}
                onClick={() => handleToggleClientPrompt(option.key)}
              />
            ))}
          </Stack>
        </Stack>
      )}
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
        {CARDIO_OPTIONAL_SECTIONS.map((section) => (
          <Button
            key={section.key}
            variant={cardioSectionsOpen[section.key] ? "contained" : "outlined"}
            color={
              cardioSectionsOpen[section.key] || cardioSectionHasData[section.key]
                ? "primary"
                : "inherit"
            }
            size="small"
            onClick={() => toggleCardioSection(section.key)}
            startIcon={
              <Add
                sx={{
                  transform: cardioSectionsOpen[section.key] ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            }
          >
            {section.label}
          </Button>
        ))}
      </Stack>
      {CARDIO_OPTIONAL_SECTIONS.some(
        (section) => cardioSectionHasData[section.key] && !cardioSectionsOpen[section.key]
      ) && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: "8px" }}>
          {CARDIO_OPTIONAL_SECTIONS.filter(
            (section) =>
              cardioSectionHasData[section.key] &&
              !cardioSectionsOpen[section.key] &&
              cardioSectionSummaries[section.key]
          ).map((section) => (
            <Chip
              key={`${section.key}-summary`}
              label={`${section.summaryLabel}: ${cardioSectionSummaries[section.key]}`}
              variant="outlined"
              size="small"
              clickable
              onClick={() => toggleCardioSection(section.key)}
              sx={{
                maxWidth: "100%",
                "& .MuiChip-label": {
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          ))}
        </Stack>
      )}
    </>
  );
}
