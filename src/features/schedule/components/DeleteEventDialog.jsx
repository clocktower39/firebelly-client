import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

export default function DeleteEventDialog({ open, onClose, deleteEvent, onDelete, dayjs }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Event</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography>
            This will permanently delete the event. This cannot be undone.
          </Typography>
          {deleteEvent && (
            <Typography variant="body2" color="text.secondary">
              {dayjs(deleteEvent.startDateTime).format("ddd, MMM D h:mm A")} -{" "}
              {dayjs(deleteEvent.endDateTime).format("h:mm A")}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => onDelete(deleteEvent?._id)}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

