import React, { useState } from "react";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { signupUser } from "../Redux/actions";

const classes = {
  Container: { height: "100%", paddingTop: "15px", paddingBottom: "15px", },
  Paper: {
    padding: "0px 15px 0px 15px",
    borderRadius: "15px",
    minHeight: "100%",
    flexDirection: 'column',
  },
  JCcenter: { justifyContent: 'center', },
};

const SignupInput = ({ fieldProperty, label, value, error, helperText, handleKeyDown, setFormData }) => {
  return (
    <Grid container item xs={12} sx={classes.JCcenter} >
      <TextField
        color="secondary"
        sx={classes.textField}
        label={label}
        value={value}
        error={error === true ? true : false}
        helperText={error === true ? helperText : false}
        onKeyDown={(e) => handleKeyDown(e)}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          [fieldProperty]: {
            ...prev[fieldProperty],
            value: e.target.value
          }
        }))}
        required
      />
    </Grid>
  );
}

export const SignUp = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    firstName: {
      label: 'First Name',
      value: '',
      error: null,
      helperText: 'Please enter your first name',
    },
    lastName: {
      label: 'Last Name',
      value: '',
      error: null,
      helperText: 'Please enter your last name',
    },
    email: {
      label: 'Email',
      value: '',
      error: null,
      helperText: 'Invalid email',
    },
    password: {
      label: 'Password',
      value: '',
      error: null,
      helperText: 'Please enter your first name',
    },
    confirmPassword: {
      label: 'Confirm Password',
      value: '',
      error: null,
      helperText: 'Please enter your first name',
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword) {
        handleSignupAttempt();
      }
    }
  };

  const handleSignupAttempt = (e) => {
    if (formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword) {
      dispatch(signupUser(JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, })));
      localStorage.setItem("email", formData.email);
    }
    else {

    }
  };

  if (user.email) {
    return <Navigate to={{ pathname: "/" }} />;
  }

  return (
    <Container maxWidth="sm" sx={classes.Container}>
      <Grid container item component={Paper} sx={classes.Paper}>

        <Grid container item xs={12} sx={{ flexGrow: 0, justifyContent: 'center', padding: '50px 0 25px 0', }}>
          <Grid container item xs={12} sx={classes.JCcenter} ><Typography variant="h4" gutterBottom>Sign Up</Typography></Grid>
        </Grid>

        <Grid container item spacing={2} sx={{ flexGrow: 1, alignContent: 'flex-start', }}>

          {Object.keys(formData).map(fieldProperty => (
            <SignupInput
              key={fieldProperty}
              fieldProperty={fieldProperty}
              label={formData[fieldProperty].label}
              value={formData[fieldProperty].value}
              error={formData[fieldProperty].error}
              helperText={formData[fieldProperty].helperText}
              setFormData={setFormData}
              handleKeyDown={handleKeyDown}
            />
          ))}

          <Grid container item xs={12} sx={classes.JCcenter} >
            <Button variant="contained" color="secondary" sx={classes.button} onClick={handleSignupAttempt} >
              Sign Up
            </Button>
          </Grid>
        </Grid>

      </Grid>
    </Container>
  );
};

export default SignUp;
