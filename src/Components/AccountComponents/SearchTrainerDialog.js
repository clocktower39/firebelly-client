import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";

export default function SearchTrainerDialog({ open, handleClose }) {
  const [searchTrainers, setSearchTrainers] = useState("");

  const handleChange = (e, setter) => setter(e.target.value);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Search Trainers"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid item container xs={12}>
            <TextField
              type="text"
              value={searchTrainers}
              onChange={(e) => handleChange(e, setSearchTrainers)}
              fullWidth
              label="Search"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item container xs={12}>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
