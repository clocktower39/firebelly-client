import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Button, Container, Paper, TextField, Typography, Grid } from "@material-ui/core";

export default function Biometrics() {
    const biometrics = useSelector(state => state.user.biometrics);
    const [dateOfBirth, setDateOfBirth] = useState(biometrics.dateOfBirth.substr(0,10));
    const [height, setHeight] = useState(biometrics.height);
    const [sex, setSex] = useState(biometrics.sex);

    const handleChange = (value, setter) => setter(value);
    const handleCancel = () => {
        setDateOfBirth(biometrics.dateOfBirth.substr(0,10));
        setHeight(biometrics.height);
        setSex(biometrics.sex);
    }

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        Biometrics
      </Typography>
      <Grid container component={Paper} spacing={2} style={{padding: '15px'}}>
        <Grid item xs={12}>
            <TextField label="Date of Birth" value={dateOfBirth} onChange={(e)=>handleChange(e.target.value,setDateOfBirth)} fullWidth/>
        </Grid>
        <Grid item xs={12}>
            <TextField label="Height" value={height} onChange={(e)=>handleChange(e.target.value,setHeight)} fullWidth/>
        </Grid>
        <Grid item xs={12}>
            <TextField label="Sex" value={sex} onChange={(e)=>handleChange(e.target.value,setSex)} fullWidth/>
        </Grid>
        <Grid container justifyContent="center" item xs={12} spacing={2}>
          <Grid item ><Button variant="contained" onClick={handleCancel}>Cancel</Button></Grid>
          <Grid item ><Button variant="contained" onClick={handleCancel}>Save</Button></Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
