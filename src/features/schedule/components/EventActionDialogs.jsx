import React from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function EventActionDialogs({
  openSelectionDialog,
  handleClearSelection,
  selectionRange,
  selectionRangeAdjusted,
  selectionStartTime,
  setSelectionStartTime,
  selectionEndTime,
  setSelectionEndTime,
  clients,
  quickBookClientId,
  setQuickBookClientId,
  quickBookWorkoutId,
  setQuickBookWorkoutId,
  quickBookWorkouts,
  quickBookQueuedWorkouts,
  quickBookSessionTypeId,
  setQuickBookSessionTypeId,
  sessionTypes,
  handleQuickBookClient,
  handleQuickBookCreateWorkout,
  quickBookCustomName,
  setQuickBookCustomName,
  quickBookCustomEmail,
  setQuickBookCustomEmail,
  quickBookCustomPhone,
  setQuickBookCustomPhone,
  handleQuickBookCustom,
  handleCreateSlotsFromSelection,
  openAvailabilityDialog,
  setOpenAvailabilityDialog,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  availabilityType,
  setAvailabilityType,
  availabilityRecurrence,
  setAvailabilityRecurrence,
  handleCreateAvailability,
  openRequestDialog,
  setOpenRequestDialog,
  activeRequestEvent,
  formatRange,
  bookingType,
  setBookingType,
  bookingStartOptions,
  selectedBookingSlot,
  setSelectedBookingSlot,
  bookingEndOptions,
  selectedBookingEndSlot,
  setSelectedBookingEndSlot,
  handleRequestBooking,
  openAttachDialog,
  setOpenAttachDialog,
  attachEvent,
  selectedWorkoutId,
  setSelectedWorkoutId,
  attachWorkouts,
  attachQueuedWorkouts,
  handleCreateWorkout,
  handleAttachWorkout,
  openEditDialog,
  setOpenEditDialog,
  editClientProfile,
  editClientAvatar,
  editClientName,
  editEvent,
  attachedEditWorkout,
  editDate,
  setEditDate,
  editStartTime,
  setEditStartTime,
  editEndTime,
  setEditEndTime,
  isTrainerView,
  editClientId,
  setEditClientId,
  editCustomName,
  setEditCustomName,
  editCustomEmail,
  setEditCustomEmail,
  editCustomPhone,
  setEditCustomPhone,
  editPriceAmount,
  setEditPriceAmount,
  currencyAffix,
  editPriceCurrency,
  setEditPriceCurrency,
  editPayoutAmount,
  setEditPayoutAmount,
  editPayoutCurrency,
  setEditPayoutCurrency,
  editPublicLabel,
  setEditPublicLabel,
  editSessionTypeId,
  setEditSessionTypeId,
  applyDefaultPriceForType,
  applyDefaultPayoutForType,
  editStatus,
  setEditStatus,
  editWorkoutClientId,
  workoutsByAccount,
  workoutQueue,
  editWorkoutId,
  setEditWorkoutId,
  handleCreateWorkoutForEdit,
  openCopyForEvent,
  handleReopenEvent,
  openDeleteConfirm,
  handleSaveEdit,
  openEventActionDialog,
  setOpenEventActionDialog,
  eventActionTarget,
  getEventDisplayName,
  getSessionTypeLabel,
  openTrainerBookForEvent,
  openEditForEvent,
  handleCancelEvent,
  openTrainerBookDialog,
  setOpenTrainerBookDialog,
  trainerBookingStartOptions,
  trainerBookSlot,
  setTrainerBookSlot,
  trainerBookingEndOptions,
  trainerBookEndSlot,
  setTrainerBookEndSlot,
  trainerBookClientId,
  setTrainerBookClientId,
  trainerBookSessionTypeId,
  setTrainerBookSessionTypeId,
  trainerBookCustomName,
  setTrainerBookCustomName,
  trainerBookCustomEmail,
  setTrainerBookCustomEmail,
  trainerBookCustomPhone,
  setTrainerBookCustomPhone,
  handleTrainerBookSlot,
}) {
  return (
    <>
      <Dialog open={openSelectionDialog} onClose={handleClearSelection} maxWidth="md" fullWidth>
        <DialogTitle>Selected Time Range</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectionRange && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                {selectionRangeAdjusted
                  ? `${selectionRangeAdjusted.start.format("ddd, MMM D h:mm A")} - ${selectionRangeAdjusted.end.format("h:mm A")}`
                  : ""}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Start time"
                  type="time"
                  value={selectionStartTime}
                  onChange={(event) => setSelectionStartTime(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  label="End time"
                  type="time"
                  value={selectionEndTime}
                  onChange={(event) => setSelectionEndTime(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Book a client</Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Client</InputLabel>
                    <Select
                      label="Client"
                      value={quickBookClientId}
                      onChange={(event) => setQuickBookClientId(event.target.value)}
                    >
                      {clients
                        .filter((clientRel) => clientRel.accepted)
                        .map((clientRel) => (
                          <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                            {clientRel.client.firstName} {clientRel.client.lastName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth disabled={!quickBookClientId}>
                    <InputLabel>Workout (optional)</InputLabel>
                    <Select
                      label="Workout (optional)"
                      value={quickBookWorkoutId}
                      onChange={(event) => setQuickBookWorkoutId(event.target.value)}
                    >
                      <MenuItem value="">No workout</MenuItem>
                      {quickBookWorkouts.map((workout) => (
                        <MenuItem key={workout._id} value={workout._id}>
                          {workout.title || "Untitled"} - {dayjs.utc(workout.date).format("MMM D")}
                        </MenuItem>
                      ))}
                      {quickBookQueuedWorkouts.map((workout) => (
                        <MenuItem key={workout._id} value={workout._id}>
                          {workout.title || "Untitled"} - Queued
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <FormControl fullWidth>
                  <InputLabel>Session type</InputLabel>
                  <Select
                    label="Session type"
                    value={quickBookSessionTypeId}
                    onChange={(event) => setQuickBookSessionTypeId(event.target.value)}
                  >
                    <MenuItem value="">No session type</MenuItem>
                    {sessionTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleQuickBookClient}
                    disabled={!quickBookClientId}
                  >
                    Book client
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleQuickBookCreateWorkout}
                    disabled={!quickBookClientId}
                  >
                    Create workout & book
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Book custom client</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Name"
                    value={quickBookCustomName}
                    onChange={(event) => setQuickBookCustomName(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={quickBookCustomEmail}
                    onChange={(event) => setQuickBookCustomEmail(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Phone"
                    value={quickBookCustomPhone}
                    onChange={(event) => setQuickBookCustomPhone(event.target.value)}
                    fullWidth
                  />
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleQuickBookCustom}
                  disabled={!quickBookCustomName.trim()}
                >
                  Book custom client
                </Button>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Or open this slot</Typography>
                <Button
                  variant="outlined"
                  onClick={handleCreateSlotsFromSelection}
                  disabled={
                    !selectionRangeAdjusted ||
                    selectionRangeAdjusted.end.valueOf() <= selectionRangeAdjusted.start.valueOf()
                  }
                >
                  Create open slot
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearSelection}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAvailabilityDialog}
        onClose={() => setOpenAvailabilityDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Open Availability</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Start time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <ToggleButtonGroup
              exclusive
              value={availabilityType}
              onChange={(event, value) => value && setAvailabilityType(value)}
              size="small"
            >
              <ToggleButton value="MANUAL">One-off</ToggleButton>
              <ToggleButton value="NORMAL">Normal sessions</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              exclusive
              value={availabilityRecurrence}
              onChange={(event, value) => value && setAvailabilityRecurrence(value)}
              size="small"
            >
              <ToggleButton value="none">No recurrence</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
            </ToggleButtonGroup>
            {availabilityType === "NORMAL" && availabilityRecurrence !== "weekly" && (
              <Typography variant="caption" color="text.secondary">
                Normal session entries should be recurring.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAvailabilityDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAvailability}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Request Appointment</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {activeRequestEvent && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle1">{formatRange(activeRequestEvent)}</Typography>
              <ToggleButtonGroup
                exclusive
                value={bookingType}
                onChange={(event, value) => value && setBookingType(value)}
                size="small"
              >
                <ToggleButton value="one-time">One-time</ToggleButton>
                <ToggleButton
                  value="recurring"
                  disabled={
                    activeRequestEvent.availabilitySource !== "NORMAL" ||
                    !activeRequestEvent.recurrenceRule
                  }
                >
                  Recurring
                </ToggleButton>
              </ToggleButtonGroup>
              {activeRequestEvent.availabilitySource === "MANUAL" && (
                <Typography variant="caption" color="text.secondary">
                  Manual slots cannot be booked as recurring.
                </Typography>
              )}
              {activeRequestEvent.eventType === "AVAILABILITY" && (
                <>
                  {bookingStartOptions.length > 0 ? (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <FormControl fullWidth>
                        <InputLabel>Start time</InputLabel>
                        <Select
                          label="Start time"
                          value={selectedBookingSlot}
                          onChange={(event) => setSelectedBookingSlot(event.target.value)}
                        >
                          {bookingStartOptions.map((slot) => (
                            <MenuItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>End time</InputLabel>
                        <Select
                          label="End time"
                          value={selectedBookingEndSlot}
                          onChange={(event) => setSelectedBookingEndSlot(event.target.value)}
                        >
                          {bookingEndOptions.map((slot) => (
                            <MenuItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      This availability range does not include any bookable times.
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequestBooking}
            disabled={
              activeRequestEvent?.eventType === "AVAILABILITY" &&
              (bookingStartOptions.length === 0 || !selectedBookingSlot || !selectedBookingEndSlot)
            }
          >
            Send request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAttachDialog}
        onClose={() => setOpenAttachDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Attach Workout</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Workouts listed here include any dated workouts in this month and queued workouts.
            </Typography>
            {attachEvent?.eventType === "AVAILABILITY" && (
              <Typography color="text.secondary">
                Attaching a workout to an open slot will create a booked appointment for that
                workout's client.
              </Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>Workout</InputLabel>
              <Select
                label="Workout"
                value={selectedWorkoutId}
                onChange={(event) => setSelectedWorkoutId(event.target.value)}
              >
                {attachWorkouts.map((workout) => (
                  <MenuItem key={workout._id} value={workout._id}>
                    {workout.title || "Untitled"} - {dayjs.utc(workout.date).format("MMM D")}
                  </MenuItem>
                ))}
                {attachQueuedWorkouts.map((workout) => (
                  <MenuItem key={workout._id} value={workout._id}>
                    {workout.title || "Untitled"} - Queued
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={handleCreateWorkout}>
              Create New Workout
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttachDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAttachWorkout} disabled={!selectedWorkoutId}>
            Attach
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {editClientProfile && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Athlete</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Avatar src={editClientAvatar} sx={{ width: 32, height: 32 }}>
                    {editClientName ? editClientName[0] : "A"}
                  </Avatar>
                  <Typography variant="body2">{editClientName || "Assigned athlete"}</Typography>
                </Stack>
              </Stack>
            )}
            {editEvent?.workoutId && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Attached workout</Typography>
                <Typography variant="body2">
                  {attachedEditWorkout?.title || "Workout attached"}
                </Typography>
                {attachedEditWorkout?.date && (
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(attachedEditWorkout.date).format("MMM D, YYYY")}
                  </Typography>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  to={`/workout/${editEvent.workoutId}?event=${editEvent._id}`}
                >
                  Open workout
                </Button>
              </Stack>
            )}
            <TextField
              label="Date"
              type="date"
              value={editDate}
              onChange={(event) => setEditDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Start time"
              type="time"
              value={editStartTime}
              onChange={(event) => setEditStartTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End time"
              type="time"
              value={editEndTime}
              onChange={(event) => setEditEndTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {isTrainerView && editEvent?.eventType === "AVAILABILITY" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Assign client</InputLabel>
                  <Select
                    label="Assign client"
                    value={editClientId}
                    onChange={(event) => {
                      setEditClientId(event.target.value);
                      if (event.target.value) {
                        setEditCustomName("");
                        setEditCustomEmail("");
                        setEditCustomPhone("");
                      }
                    }}
                  >
                    <MenuItem value="">Keep open</MenuItem>
                    {clients
                      .filter((clientRel) => clientRel.accepted)
                      .map((clientRel) => (
                        <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                          {clientRel.client.firstName} {clientRel.client.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {editClientId && (
                  <Typography variant="caption" color="text.secondary">
                    Assigning a client will book this session immediately.
                  </Typography>
                )}
              </>
            )}
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Custom booking</Typography>
                <TextField
                  label="Name"
                  value={editCustomName}
                  onChange={(event) => {
                    setEditCustomName(event.target.value);
                    if (event.target.value) {
                      setEditClientId("");
                    }
                  }}
                  disabled={Boolean(editClientId)}
                />
                <TextField
                  label="Email"
                  value={editCustomEmail}
                  onChange={(event) => setEditCustomEmail(event.target.value)}
                  disabled={Boolean(editClientId)}
                />
                <TextField
                  label="Phone"
                  value={editCustomPhone}
                  onChange={(event) => setEditCustomPhone(event.target.value)}
                  disabled={Boolean(editClientId)}
                />
                {editCustomName && (
                  <Typography variant="caption" color="text.secondary">
                    Custom bookings are trainer-only and won't create an account.
                  </Typography>
                )}
              </Stack>
            )}
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Price</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={editPriceAmount}
                    onChange={(event) => setEditPriceAmount(event.target.value)}
                    slotProps={{
                      htmlInput: { min: 0, step: "0.01" },
                      input:
                        currencyAffix.position === "start"
                          ? {
                              startAdornment: (
                                <Box sx={{ mr: 1, color: "text.secondary" }}>
                                  {currencyAffix.label}
                                </Box>
                              ),
                            }
                          : {
                              endAdornment: (
                                <Box sx={{ ml: 1, color: "text.secondary" }}>
                                  {currencyAffix.label}
                                </Box>
                              ),
                            },
                    }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={editPriceCurrency}
                      onChange={(event) => setEditPriceCurrency(event.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="JPY">YEN</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            )}
            {isTrainerView && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Trainer payout</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={editPayoutAmount}
                    onChange={(event) => setEditPayoutAmount(event.target.value)}
                    slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={editPayoutCurrency}
                      onChange={(event) => setEditPayoutCurrency(event.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="JPY">YEN</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            )}
            {isTrainerView && editEvent?.eventType !== "AVAILABILITY" && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Public label</Typography>
                <TextField
                  label="Public label"
                  value={editPublicLabel}
                  onChange={(event) => setEditPublicLabel(event.target.value)}
                  placeholder="Booked / Unavailable / Reserved / Custom"
                />
                <Typography variant="caption" color="text.secondary">
                  Shows on public sessions and share images when client details are hidden.
                </Typography>
              </Stack>
            )}
            {isTrainerView &&
              (editEvent?.eventType !== "AVAILABILITY" || editClientId || editCustomName) && (
                <FormControl fullWidth>
                  <InputLabel>Session type</InputLabel>
                  <Select
                    label="Session type"
                    value={editSessionTypeId}
                    onChange={(event) => {
                      const nextTypeId = event.target.value;
                      const prevTypeId = editSessionTypeId;
                      setEditSessionTypeId(nextTypeId);
                      applyDefaultPriceForType(
                        nextTypeId,
                        prevTypeId,
                        editPriceAmount,
                        setEditPriceAmount,
                        setEditPriceCurrency
                      );
                      applyDefaultPayoutForType(
                        nextTypeId,
                        prevTypeId,
                        editPayoutAmount,
                        setEditPayoutAmount,
                        setEditPayoutCurrency
                      );
                    }}
                  >
                    <MenuItem value="">No session type</MenuItem>
                    {sessionTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                disabled={editEvent?.eventType === "AVAILABILITY" && Boolean(editClientId)}
              >
                {(editEvent?.eventType === "AVAILABILITY"
                  ? ["OPEN", "CANCELLED"]
                  : ["REQUESTED", "BOOKED", "COMPLETED", "CANCELLED"]
                ).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isTrainerView && editWorkoutClientId && (
              <Stack spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>Workout</InputLabel>
                  <Select
                    label="Workout"
                    value={editWorkoutId}
                    onChange={(event) => setEditWorkoutId(event.target.value)}
                  >
                    <MenuItem value="">No workout</MenuItem>
                    {(workoutsByAccount?.[editWorkoutClientId]?.workouts || []).map((workout) => (
                      <MenuItem key={workout._id} value={workout._id}>
                        {workout.title || "Untitled"} - {dayjs.utc(workout.date).format("MMM D")}
                      </MenuItem>
                    ))}
                    {(workoutQueue?.[editWorkoutClientId] || []).map((workout) => (
                      <MenuItem key={workout._id} value={workout._id}>
                        {workout.title || "Untitled"} - Queued
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" variant="outlined" onClick={handleCreateWorkoutForEdit}>
                  Create workout for this session
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          {isTrainerView && editEvent && (
            <Button variant="outlined" onClick={() => openCopyForEvent(editEvent)}>
              Copy
            </Button>
          )}
          {isTrainerView && editEvent && editEvent.eventType !== "AVAILABILITY" && (
            <Button
              variant="outlined"
              onClick={async () => {
                await handleReopenEvent(editEvent);
                setOpenEditDialog(false);
              }}
            >
              Reopen slot
            </Button>
          )}
          {isTrainerView && editEvent && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setOpenEditDialog(false);
                openDeleteConfirm(editEvent);
              }}
            >
              Delete
            </Button>
          )}
          <Button variant="contained" onClick={handleSaveEdit}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEventActionDialog}
        onClose={() => setOpenEventActionDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Session Actions</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {eventActionTarget && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">
                  {eventActionTarget.eventType === "AVAILABILITY" ? "Open slot" : "Booked session"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatRange(eventActionTarget)}
                </Typography>
                {eventActionTarget.eventType !== "AVAILABILITY" && (
                  <Typography variant="caption" color="text.secondary">
                    {getEventDisplayName(eventActionTarget)}
                  </Typography>
                )}
                {isTrainerView && getSessionTypeLabel(eventActionTarget) && (
                  <Typography variant="caption" color="text.secondary">
                    Session type: {getSessionTypeLabel(eventActionTarget)}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1}>
                {eventActionTarget.eventType === "AVAILABILITY" &&
                  eventActionTarget.status === "OPEN" && (
                    <Button
                      variant="contained"
                      onClick={() => openTrainerBookForEvent(eventActionTarget)}
                    >
                      Book
                    </Button>
                  )}
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenEventActionDialog(false);
                    openEditForEvent(eventActionTarget);
                  }}
                >
                  Edit details
                </Button>
                {eventActionTarget.status !== "CANCELLED" && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenEventActionDialog(false);
                      openCopyForEvent(eventActionTarget);
                    }}
                  >
                    Copy
                  </Button>
                )}
                {eventActionTarget.status === "OPEN" && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setOpenEventActionDialog(false);
                      handleCancelEvent(eventActionTarget._id);
                    }}
                  >
                    Close slot
                  </Button>
                )}
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setOpenEventActionDialog(false);
                    openDeleteConfirm(eventActionTarget);
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventActionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTrainerBookDialog}
        onClose={() => setOpenTrainerBookDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Book Session</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {eventActionTarget && (
              <Typography variant="body2" color="text.secondary">
                {formatRange(eventActionTarget)}
              </Typography>
            )}
            {trainerBookingStartOptions.length > 0 ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>Start time</InputLabel>
                  <Select
                    label="Start time"
                    value={trainerBookSlot}
                    onChange={(event) => setTrainerBookSlot(event.target.value)}
                  >
                    {trainerBookingStartOptions.map((slot) => (
                      <MenuItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>End time</InputLabel>
                  <Select
                    label="End time"
                    value={trainerBookEndSlot}
                    onChange={(event) => setTrainerBookEndSlot(event.target.value)}
                  >
                    {trainerBookingEndOptions.map((slot) => (
                      <MenuItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                This availability range does not include any bookable times.
              </Typography>
            )}
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                label="Client"
                value={trainerBookClientId}
                onChange={(event) => {
                  setTrainerBookClientId(event.target.value);
                  if (event.target.value) {
                    setTrainerBookCustomName("");
                    setTrainerBookCustomEmail("");
                    setTrainerBookCustomPhone("");
                  }
                }}
              >
                <MenuItem value="">Custom booking</MenuItem>
                {clients
                  .filter((clientRel) => clientRel.accepted)
                  .map((clientRel) => (
                    <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                      {clientRel.client.firstName} {clientRel.client.lastName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Session type</InputLabel>
              <Select
                label="Session type"
                value={trainerBookSessionTypeId}
                onChange={(event) => setTrainerBookSessionTypeId(event.target.value)}
              >
                <MenuItem value="">No session type</MenuItem>
                {sessionTypes.map((type) => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!trainerBookClientId && (
              <Stack spacing={1}>
                <TextField
                  label="Name"
                  value={trainerBookCustomName}
                  onChange={(event) => setTrainerBookCustomName(event.target.value)}
                />
                <TextField
                  label="Email"
                  value={trainerBookCustomEmail}
                  onChange={(event) => setTrainerBookCustomEmail(event.target.value)}
                />
                <TextField
                  label="Phone"
                  value={trainerBookCustomPhone}
                  onChange={(event) => setTrainerBookCustomPhone(event.target.value)}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTrainerBookDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTrainerBookSlot}
            disabled={
              trainerBookingStartOptions.length === 0 ||
              !trainerBookSlot ||
              !trainerBookEndSlot ||
              (!trainerBookClientId && !trainerBookCustomName.trim())
            }
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
