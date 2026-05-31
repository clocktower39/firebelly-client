import React from "react";
import { Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function SchedulePageHeader({
  isTrainerView,
  clientParam,
  selectedClientLabel,
  onClearClientFilter,
  onOpenAvailability,
  billingLoading,
  billingSummary,
  selectedTypeEntry,
  selectedTypeName,
}) {
  return (
    <Grid container size={12}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Typography variant="h4">Scheduling</Typography>
        {isTrainerView && (
          <Button variant="contained" onClick={onOpenAvailability}>
            Open Slot
          </Button>
        )}
      </Stack>
      {isTrainerView && clientParam && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Button component={Link} to="/clients" size="small" variant="outlined">
            Back to Clients
          </Button>
          <Chip
            label={
              selectedClientLabel
                ? `Client: ${selectedClientLabel.client.firstName} ${selectedClientLabel.client.lastName}`
                : "Client filter"
            }
            onDelete={onClearClientFilter}
            size="small"
            color="primary"
          />
          <Typography variant="body2" color="text.secondary">
            Viewing:{" "}
            {selectedClientLabel
              ? `${selectedClientLabel.client.firstName} ${selectedClientLabel.client.lastName}`
              : "Client sessions"}
          </Typography>
        </Stack>
      )}
      {billingLoading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Loading billing summary...
        </Typography>
      )}
      {billingSummary && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Chip
            size="small"
            label={`Remaining: ${billingSummary.remainingSessions}`}
            color={billingSummary.remainingSessions <= 0 ? "warning" : "success"}
          />
          {billingSummary.dueForPayment && (
            <Chip size="small" label="Payment Due" color="warning" />
          )}
          {selectedTypeEntry && (
            <Chip
              size="small"
              label={`${selectedTypeName} Remaining: ${selectedTypeEntry.remainingSessions}`}
              color={selectedTypeEntry.remainingSessions <= 0 ? "warning" : "success"}
            />
          )}
        </Stack>
      )}
    </Grid>
  );
}

