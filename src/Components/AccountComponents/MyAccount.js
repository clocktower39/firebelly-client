import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Button, Container, Paper, TextField, Typography, Grid } from "@material-ui/core";

export default function MyAccount() {
    const user = useSelector(state => state.user);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

    const handleChange = (value, setter) => setter(value);
    const handleCancel = () => {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhoneNumber(user.phoneNumber);
    }

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        My Account
      </Typography>
      <Grid container component={Paper} spacing={2}>
        <Grid item xs={12}>
            <TextField label="First Name" value={firstName} onChange={(e)=>handleChange(e.target.value,setFirstName)} fullWidth/>
        </Grid>
        <Grid item xs={12}>
            <TextField label="Last Name" value={lastName} onChange={(e)=>handleChange(e.target.value,setLastName)} fullWidth/>
        </Grid>
        <Grid item xs={12}>
            <TextField label="Email" value={email} onChange={(e)=>handleChange(e.target.value,setEmail)} fullWidth/>
        </Grid>
        <Grid item xs={12}>
            <TextField label="Phone Number" value={phoneNumber} onChange={(e)=>handleChange(e.target.value,setPhoneNumber)} fullWidth/>
        </Grid>
        <Grid container justifyContent="center" item xs={12} spacing={2}>
          <Grid item ><Button variant="contained" onClick={handleCancel}>Cancel</Button></Grid>
          <Grid item ><Button variant="contained" onClick={handleCancel}>Save</Button></Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
