import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { changePassword } from '../../Redux/actions';

export default function ChangePassword({ open, handlePasswordClose }) {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChange = (e, setter) => setter(e.target.value);

  const handleSubmitChange = () => {
    if(currentPassword !== '' && newPassword !== '' && newPassword === confirmNewPassword){
      dispatch(changePassword(currentPassword, newPassword)).then(()=> handlePasswordClose())
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handlePasswordClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Change password"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid item container xs={12}>
            <TextField
              type="password"
              value={currentPassword}
              onChange={(e) => handleChange(e, setCurrentPassword)}
              fullWidth
              label="Current Password"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item container xs={12}>
            <TextField
              type="password"
              value={newPassword}
              onChange={(e) => handleChange(e, setNewPassword)}
              fullWidth
              label="New Password"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item container xs={12}>
            <TextField
              type="password"
              value={confirmNewPassword}
              onChange={(e) => handleChange(e, setConfirmNewPassword)}
              fullWidth
              label="Confirm New Password"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePasswordClose}>Cancel</Button>
        <Button onClick={handleSubmitChange} autoFocus>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
