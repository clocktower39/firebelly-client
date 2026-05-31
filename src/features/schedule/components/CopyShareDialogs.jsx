import React from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

export default function CopyShareDialogs({
  openCopyDialog,
  setOpenCopyDialog,
  copySourceEvent,
  getEventDisplayName,
  formatRange,
  copyDate,
  setCopyDate,
  copyStartTime,
  setCopyStartTime,
  copyEndTime,
  setCopyEndTime,
  handleCopyEvent,
  openCopyDayDialog,
  setOpenCopyDayDialog,
  copyDaySourceDate,
  setCopyDaySourceDate,
  copyDayDate,
  setCopyDayDate,
  handleCopyDay,
  openCopyWeekDialog,
  setOpenCopyWeekDialog,
  weekStart,
  copyWeekDate,
  setCopyWeekDate,
  handleCopyWeek,
  openShareDialog,
  setOpenShareDialog,
  shareWeekStartDate,
  setShareWeekStartDate,
  shareHideDetails,
  setShareHideDetails,
  shareHidePrices,
  setShareHidePrices,
  weekClientOptions,
  shareShownKeys,
  setShareShownKeys,
  shareHighlightShown,
  setShareHighlightShown,
  shareHighlightColor,
  setShareHighlightColor,
  shareIncludeHeader,
  setShareIncludeHeader,
  shareStatus,
  shareInProgress,
  handleShareWeek,
}) {
  return (
    <>
      <Dialog
        open={openCopyDialog}
        onClose={() => setOpenCopyDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Event</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {copySourceEvent && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {getEventDisplayName(copySourceEvent)} • {copySourceEvent.eventType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Original: {formatRange(copySourceEvent)}
                </Typography>
              </>
            )}
            <TextField
              label="Date"
              type="date"
              value={copyDate}
              onChange={(event) => setCopyDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Start time"
              type="time"
              value={copyStartTime}
              onChange={(event) => setCopyStartTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End time"
              type="time"
              value={copyEndTime}
              onChange={(event) => setCopyEndTime(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyEvent}>
            Create copy
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyDayDialog}
        onClose={() => setOpenCopyDayDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Day</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Select the day to copy and the target date.
            </Typography>
            <TextField
              label="Source day"
              type="date"
              value={copyDaySourceDate}
              onChange={(event) => setCopyDaySourceDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Target date"
              type="date"
              value={copyDayDate}
              onChange={(event) => setCopyDayDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" color="text.secondary">
              Overlaps will be skipped automatically.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyDayDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCopyDay}
            disabled={!copyDayDate || !copyDaySourceDate}
          >
            Copy day
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCopyWeekDialog}
        onClose={() => setOpenCopyWeekDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Week</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Copy all events for the week of {weekStart.format("MMM D")} to a new week.
            </Typography>
            <TextField
              label="Target week start"
              type="date"
              value={copyWeekDate}
              onChange={(event) => setCopyWeekDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" color="text.secondary">
              Overlaps will be skipped automatically.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCopyWeekDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyWeek} disabled={!copyWeekDate}>
            Copy week
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Copy Week Image</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Create a shareable snapshot of this week's sessions.
            </Typography>
            <TextField
              label="Week starting"
              type="date"
              value={shareWeekStartDate}
              onChange={(event) => setShareWeekStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={shareHideDetails}
                  onChange={(event) => setShareHideDetails(event.target.checked)}
                />
              }
              label="Hide client details (recommended)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={shareHidePrices}
                  onChange={(event) => setShareHidePrices(event.target.checked)}
                />
              }
              label="Hide prices and totals"
            />
            {shareHideDetails && (
              <Autocomplete
                multiple
                options={weekClientOptions}
                getOptionLabel={(option) => option.label}
                value={weekClientOptions.filter((option) => shareShownKeys.includes(option.key))}
                onChange={(_, value) => {
                  setShareShownKeys(value.map((item) => item.key));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Show these clients"
                    placeholder="All clients hidden"
                  />
                )}
              />
            )}
            {shareHideDetails && shareShownKeys.length > 0 && (
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={shareHighlightShown}
                      onChange={(event) => setShareHighlightShown(event.target.checked)}
                    />
                  }
                  label="Highlight shown clients"
                />
                {shareHighlightShown && (
                  <TextField
                    label="Highlight color"
                    type="color"
                    value={shareHighlightColor}
                    onChange={(event) => setShareHighlightColor(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              </Stack>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={shareIncludeHeader}
                  onChange={(event) => setShareIncludeHeader(event.target.checked)}
                />
              }
              label="Include trainer name and week"
            />
            {shareStatus && (
              <Typography variant="caption" color="text.secondary">
                {shareStatus}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleShareWeek} disabled={shareInProgress}>
            {shareInProgress ? "Copying..." : "Copy image"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
