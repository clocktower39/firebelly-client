import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Button, Container, Paper, TextField, Typography, Grid } from "@mui/material";
import { editUser } from "../../Redux/actions";

export default function MyAccount() {
    const dispatch = useDispatch()
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

    const saveChanges = () => {
      dispatch(editUser({
        ...user,
        firstName,
        lastName,
        email,
        phoneNumber
      }))
    }

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
    <Grid container item xs={12} style={{padding: '15px'}}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        My Account
      </Typography>
      </Grid>
      <Grid container component={Paper} spacing={2} style={{padding: '15px'}}>
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
        <Grid container style={{justifyContent:"center"}} item xs={12} spacing={2}>
          <Grid item ><Button variant="contained" onClick={handleCancel}>Cancel</Button></Grid>
          <Grid item ><Button variant="contained" onClick={saveChanges}>Save</Button></Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
