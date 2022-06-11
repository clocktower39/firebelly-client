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
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  JCcenter: { justifyContent: 'center', },
};

export const SignUp = (props) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const user = useSelector((state) => state.user);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (firstName && lastName && email && password && confirmPassword) {
        handleSignupAttempt();
      }
    }
  };
  const handleSignupAttempt = (e) => {
    if (email && password) {
      dispatch(signupUser(JSON.stringify({ firstName, lastName, email, password })));
      localStorage.setItem("email", email);
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

          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your first name" : false}
              sx={classes.textField}
              label="First Name"
              value={firstName}
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>

          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your last name" : false}
              sx={classes.textField}
              label="Last Name"
              value={lastName}
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>

          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your email" : false}
              sx={classes.textField}
              label="Email"
              value={email}
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>

          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your password" : false}
              sx={classes.textField}
              label="Password"
              value={password}
              type="password"
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => {
                setPassword(e.target.value);
                e.target.value === "" ? setError(true) : setError(false);
              }}
            />
          </Grid>

          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your password" : false}
              sx={classes.textField}
              label="Confirm Password"
              value={confirmPassword}
              type="password"
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                e.target.value === "" ? setError(true) : setError(false);
              }}
            />
          </Grid>

          <Grid container item xs={12} sx={classes.JCcenter} >
            <Button variant="contained" color="secondary" sx={classes.button}>
              Sign Up
            </Button>
          </Grid>
        </Grid>

      </Grid>
    </Container>
  );
};

export default SignUp;
