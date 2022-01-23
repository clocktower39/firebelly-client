import React, { useState } from "react";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { signupUser } from "../Redux/actions";

const useStyles = makeStyles({
  root: {
    padding: "25px 0",
    textAlign: "center",
  },
  textField: {
    margin: "12px",
  },
  button: {},
});

export const SignUp = (props) => {
  const classes = useStyles();
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
    <Container maxWidth="sm">
      <Grid container className={classes.root} component={Paper} spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            color="secondary"
            error={error === true ? true : false}
            helperText={error === true ? "Please enter your first name" : false}
            className={classes.textField}
            label="First Name"
            value={firstName}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            color="secondary"
            error={error === true ? true : false}
            helperText={error === true ? "Please enter your last name" : false}
            className={classes.textField}
            label="Last Name"
            value={lastName}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            color="secondary"
            error={error === true ? true : false}
            helperText={error === true ? "Please enter your email" : false}
            className={classes.textField}
            label="Email"
            value={email}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            color="secondary"
            error={error === true ? true : false}
            helperText={error === true ? "Please enter your password" : false}
            className={classes.textField}
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
        <Grid item xs={12}>
          <TextField
            color="secondary"
            error={error === true ? true : false}
            helperText={error === true ? "Please enter your password" : false}
            className={classes.textField}
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
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" className={classes.button}>
            Sign Up
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUp;
