import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { loginUser } from "../Redux/actions";

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

export const Login = (props) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [email, setEmail] = useState(
    localStorage.getItem("email") ? localStorage.getItem("email") : ""
  );
  const [password, setPassword] = useState("");
  const [disableButtonDuringLogin, setDisableButtonDuringLogin] = useState(false);
  const user = useSelector((state) => state.user);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLoginAttempt(e);
    }
  };
  const handleLoginAttempt = (e) => {
    if (email && password) {
      setDisableButtonDuringLogin(true);
      dispatch(loginUser(JSON.stringify({ email: email, password: password }))).then((res) => {
        if (res.error) {
          setError(true);
        }
        setDisableButtonDuringLogin(false);
      });
      localStorage.setItem("email", email);
    } else {
      setDisableButtonDuringLogin(false);
      setError(true);
    }
  };

  if (user.email) {
    return <Navigate to={{ pathname: "/" }} />;
  }
  return (
    <Container maxWidth="sm" sx={classes.Container}>
      <Grid container item component={Paper} sx={classes.Paper}>
        <Grid container item xs={12} sx={{ flexGrow: 0, justifyContent: 'center', padding: '50px 0 25px 0', }}>

          <Grid container item xs={12} sx={classes.JCcenter} ><Typography variant="h3" gutterBottom>Welcome!</Typography></Grid>
          <Grid container item xs={12} sx={classes.JCcenter} ><Typography variant="h4" gutterBottom>Log in</Typography></Grid>

        </Grid>
        <Grid container item spacing={2} sx={{ flexGrow: 1, alignContent: 'flex-start', }}>
          <Grid container item xs={12} sx={classes.JCcenter} >
            <TextField
              color="secondary"
              error={error === true ? true : false}
              helperText={error === true ? "Please enter your email" : false}
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
          <Grid container item xs={12} sx={classes.JCcenter}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={(e) => handleLoginAttempt(e)}
              disabled={disableButtonDuringLogin}
            >
              Login
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
