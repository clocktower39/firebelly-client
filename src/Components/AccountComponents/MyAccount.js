import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import InputMask from 'react-input-mask'
import { editUser } from "../../Redux/actions";

export default function MyAccount() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth.substr(0,10) || "");
  const [height, setHeight] = useState(user.height || "");
  const [sex, setSex] = useState(user.sex || "");

  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber);
    setDateOfBirth(user.dateOfBirth.substr(0,10) || "");
    setHeight(user.height);
    setSex(user.sex);
  };

  const saveChanges = () => {
    if(firstName !== "" && lastName !== "" && email !== ""){
      dispatch(
        editUser({
          ...user,
          firstName,
          lastName,
          email,
          phoneNumber,
          dateOfBirth,
          height,
          sex,
        })
      );
    }
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
            <InputMask
              mask="+1 (999) 999-9999"
              value={phoneNumber}
              onChange={(e) => handleChange(e.target.value, setPhoneNumber)}
              disabled={false}
              maskChar=" "
            >
              {() => (
                <TextField
                  label="Phone Number"
                  fullWidth
                  type="tel"
                />
              )}
            </InputMask>
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
            <InputMask
              mask={`9' ?9"`}
              formatChars={{ "9": "[0-9]", "?": "[0-9 ]" }}
              value={height}
              onChange={(e) => handleChange(e.target.value, setHeight)}
              disabled={false}
              maskChar=" "
            >
              {() => (
                <TextField
                  label="Height"
                  fullWidth
                  type="tel"
                />
              )}
            </InputMask>
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
              <MenuItem value="N/A">Prefer not to answer</MenuItem>
            </TextField>
          </Grid>
          <Grid container style={{ justifyContent: "center" }} item xs={12} spacing={2}>
            <Grid item>
              <Button color='secondaryButton' variant="contained" onClick={handleCancel} >
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
