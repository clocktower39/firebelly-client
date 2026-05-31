import React from "react";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

export default function ScheduleControlsCard({
  user,
  clients,
  myTrainers,
  isClientView,
  isTrainerView,
  bookingAsClient,
  setBookingAsClient,
  selectedTrainerId,
  setSelectedTrainerId,
  setSelectedMyTrainerId,
  selectedClientIds,
  setSelectedClientIds,
  setHasClientSelection,
  setSessionTypesStatus,
  setOpenSessionTypesDialog,
}) {
  return (
    <Grid container size={12}>
      <Card sx={{ width: "100%" }}>
        <CardContent>
          <Stack spacing={2}>
            {user.isTrainer && (
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  Session mode
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={bookingAsClient ? "client" : "trainer"}
                  onChange={(_, value) => {
                    if (!value) return;
                    setBookingAsClient(value === "client");
                  }}
                  size="small"
                >
                  <ToggleButton value="trainer">Manage sessions</ToggleButton>
                  <ToggleButton value="client">Book with trainer</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSessionTypesStatus("");
                    setOpenSessionTypesDialog(true);
                  }}
                >
                  Manage session types
                </Button>
              </Stack>
            )}

            {isClientView && (
              <FormControl fullWidth>
                <InputLabel>Trainer</InputLabel>
                <Select
                  label="Trainer"
                  value={selectedTrainerId}
                  onChange={(event) => {
                    setSelectedTrainerId(event.target.value);
                    if (user.isTrainer) {
                      setSelectedMyTrainerId(event.target.value);
                    }
                  }}
                >
                  {myTrainers
                    .filter((trainer) => trainer.accepted)
                    .map((trainer) => (
                      <MenuItem key={trainer.trainer} value={trainer.trainer}>
                        {trainer.firstName} {trainer.lastName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {isTrainerView && (
              <Autocomplete
                multiple
                options={clients.filter((clientRel) => clientRel.accepted)}
                getOptionLabel={(option) => `${option.client.firstName} ${option.client.lastName}`}
                value={clients.filter((clientRel) =>
                  selectedClientIds.includes(clientRel.client._id)
                )}
                onChange={(_, value) => {
                  setSelectedClientIds(value.map((item) => item.client._id));
                  setHasClientSelection(true);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Clients" placeholder="All clients" />
                )}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}

