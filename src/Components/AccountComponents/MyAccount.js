import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { editUser } from "../../Redux/actions";

export default function MyAccount() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth);
  const [height, setHeight] = useState(user.height);
  const [sex, setSex] = useState(user.sex);

  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber);
    setHeight(user.height);
    setSex(user.sex);
  };

  const saveChanges = () => {
    dispatch(
      editUser({
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber,
      })
    );
  };

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Grid container item xs={12} style={{ padding: "15px" }}>
        <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
          My Account
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} style={{ padding: "15px" }}>
          <Grid container item xs={12}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => handleChange(e.target.value, setFirstName)}
              fullWidth
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => handleChange(e.target.value, setLastName)}
              fullWidth
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => handleChange(e.target.value, setEmail)}
              fullWidth
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => handleChange(e.target.value, setPhoneNumber)}
              fullWidth
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => handleChange(e.target.value, setDateOfBirth)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              label="Height"
              value={height}
              onChange={(e) => handleChange(e.target.value, setHeight)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TextField
                      variant="standard"
                      select
                      fullWidth
                      SelectProps={{ native: true }}
                      value={"ft"}
                    >
                      <option value="ft">ft</option>
                      <option value="cm">cm</option>
                    </TextField>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid container item xs={12}>
            <TextField
              select
              label="Sex"
              value={sex}
              onChange={(e) => handleChange(e.target.value, setSex)}
              fullWidth
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid container style={{ justifyContent: "center" }} item xs={12} spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={saveChanges}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
