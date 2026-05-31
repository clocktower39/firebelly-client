import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

export default function SessionTypeDialogs({
  openSessionTypesDialog,
  setOpenSessionTypesDialog,
  sessionTypesStatus,
  sessionTypes,
  formatPrice,
  handleEditSessionType,
  handleDeleteSessionType,
  resetSessionTypeForm,
  setOpenSessionTypeFormDialog,
  openSessionTypeFormDialog,
  editingSessionTypeId,
  sessionTypeForm,
  setSessionTypeForm,
  handleSaveSessionType,
}) {
  return (
    <>
      <Dialog
        open={openSessionTypesDialog}
        onClose={() => setOpenSessionTypesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Types</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {sessionTypesStatus && (
              <Typography variant="caption" color="error">
                {sessionTypesStatus}
              </Typography>
            )}
            {sessionTypes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No session types yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {sessionTypes.map((type) => (
                  <Card key={type._id} variant="outlined">
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{type.name}</Typography>
                          {type.active === false && <Chip size="small" label="Inactive" />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {type.defaultPrice === null || type.defaultPrice === undefined
                            ? "Price not set"
                            : formatPrice(type.defaultPrice || 0, type.currency || "USD")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Duration: {type.durationMinutes || 60} min • Credits:{" "}
                          {type.creditsRequired || 1}
                        </Typography>
                        {type.defaultPayout != null && (
                          <Typography variant="caption" color="text.secondary">
                            Payout:{" "}
                            {formatPrice(type.defaultPayout || 0, type.payoutCurrency || "USD")}
                          </Typography>
                        )}
                        {type.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {type.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditSessionType(type)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => handleDeleteSessionType(type._id)}
                        disabled={type.isDefault}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
            <Divider />
            <Button
              variant="contained"
              onClick={() => {
                resetSessionTypeForm();
                setOpenSessionTypeFormDialog(true);
              }}
            >
              New session type
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionTypesDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSessionTypeFormDialog}
        onClose={() => setOpenSessionTypeFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingSessionTypeId ? "Edit session type" : "New session type"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={sessionTypeForm.name}
              onChange={(event) =>
                setSessionTypeForm((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={sessionTypeForm.isDefault}
              fullWidth
            />
            <TextField
              label="Description"
              value={sessionTypeForm.description}
              onChange={(event) =>
                setSessionTypeForm((prev) => ({ ...prev, description: event.target.value }))
              }
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={sessionTypeForm.durationMinutes}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({
                    ...prev,
                    durationMinutes: event.target.value,
                  }))
                }
                inputProps={{ min: 1, step: "1" }}
                disabled={sessionTypeForm.isDefault}
                fullWidth
              />
              <TextField
                label="Credits Required"
                type="number"
                value={sessionTypeForm.creditsRequired}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({
                    ...prev,
                    creditsRequired: event.target.value,
                  }))
                }
                inputProps={{ min: 0, step: "0.5" }}
                disabled={sessionTypeForm.isDefault}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Default price"
                type="number"
                value={sessionTypeForm.defaultPrice}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({ ...prev, defaultPrice: event.target.value }))
                }
                inputProps={{ min: 0, step: "0.01" }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  label="Currency"
                  value={sessionTypeForm.currency}
                  onChange={(event) =>
                    setSessionTypeForm((prev) => ({ ...prev, currency: event.target.value }))
                  }
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="JPY">YEN</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Default payout"
                type="number"
                value={sessionTypeForm.defaultPayout}
                onChange={(event) =>
                  setSessionTypeForm((prev) => ({ ...prev, defaultPayout: event.target.value }))
                }
                inputProps={{ min: 0, step: "0.01" }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Payout currency</InputLabel>
                <Select
                  label="Payout currency"
                  value={sessionTypeForm.payoutCurrency}
                  onChange={(event) =>
                    setSessionTypeForm((prev) => ({
                      ...prev,
                      payoutCurrency: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="JPY">YEN</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={sessionTypeForm.active}
                  onChange={(event) =>
                    setSessionTypeForm((prev) => ({ ...prev, active: event.target.checked }))
                  }
                />
              }
              label={sessionTypeForm.active ? "Active" : "Inactive"}
            />
            {sessionTypesStatus && (
              <Typography variant="caption" color="error">
                {sessionTypesStatus}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetSessionTypeForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSessionType}
            disabled={!sessionTypeForm.name.trim()}
          >
            {editingSessionTypeId ? "Save changes" : "Add session type"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
