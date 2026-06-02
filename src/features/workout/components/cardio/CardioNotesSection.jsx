import React from "react";
import { Collapse, Grid, Paper, Stack, TextField, Typography } from "@mui/material";

export default function CardioNotesSection({
  activeCardio,
  cardioSectionsOpen,
  handleCardioChange,
}) {
  return (
    <Grid size={12}>
      <Collapse in={cardioSectionsOpen.notes} unmountOnExit>
        <Paper variant="outlined" sx={{ padding: "16px" }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Notes</Typography>
            <TextField
              label="Notes"
              placeholder="How did it feel? Surface, weather, goal pacing..."
              value={activeCardio.notes}
              onChange={handleCardioChange("notes")}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </Paper>
      </Collapse>
    </Grid>
  );
}
