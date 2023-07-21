import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { loginUser } from "../Redux/actions";

const classes = {
  Container: { height: "100%", paddingTop: "15px", paddingBottom: "15px" },
  Paper: {
    padding: "0px 15px 0px 15px",
    borderRadius: "15px",
    minHeight: "100%",
    flexDirection: "column",
  },
  JCcenter: { justifyContent: "center" },
};

const LoginInput = ({
  fieldProperty,
  label,
  value,
  error,
  helperText,
  type,
  handleKeyDown,
  setFormData,
}) => {
  return (
    <Grid container item xs={12} sx={classes.JCcenter}>
      <TextField
        color="secondary"
        sx={classes.textField}
        label={label}
        value={value}
        error={error === true ? true : false}
        helperText={error === true ? helperText : false}
        type={type}
        onKeyDown={(e) => handleKeyDown(e)}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            [fieldProperty]: {
              ...prev[fieldProperty],
              value: e.target.value,
              error: false,
              helperText: null,
            },
          }))
        }
        required
      />
    </Grid>
  );
};

export const Login = (props) => {
  const dispatch = useDispatch();
  const [disableButtonDuringLogin, setDisableButtonDuringLogin] = useState(false);
  const user = useSelector((state) => state.user);

  const setError = (fieldProperty, hasError, message) => {
    setFormData((prev) => ({
      ...prev,
      [fieldProperty]: {
        ...prev[fieldProperty],
        error: hasError,
        helperText: message,
      },
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLoginAttempt(e);
    }
  };
  const handleLoginAttempt = (e) => {
    fieldProperties.forEach((fieldProperty) => {
      formData[fieldProperty].value === ""
        ? setError(fieldProperty, true, `${formData[fieldProperty].label} is required.`)
        : setError(fieldProperty, false, null);
    });

    if (!formData.email.error && !formData.password.error) {
      setDisableButtonDuringLogin(true);
      dispatch(loginUser({ email: formData.email.value, password: formData.password.value })).then(
        (res) => {
          if (res.error) {
            const { error } = res;

            error.email && setError("email", true, res.error.email);
            error.password && setError("password", true, res.error.password);
          }
          setDisableButtonDuringLogin(false);
        }
      );
      localStorage.setItem("email", formData.email.value);
    }
  };
  const [formData, setFormData] = useState({
    email: {
      label: "Email",
      value: localStorage.getItem("email") || "",
      error: null,
      helperText: "Invalid email",
      type: "email",
    },
    password: {
      label: "Password",
      value: "",
      error: null,
      helperText: "Please enter your password",
      type: "password",
    },
  });
  const fieldProperties = Object.keys(formData);

  return user._id ? <Navigate to={{ pathname: "/" }} /> : (
    <Container maxWidth="sm" sx={classes.Container}>
      <Grid container item component={Paper} sx={classes.Paper}>
        <Grid
          container
          item
          xs={12}
          sx={{ flexGrow: 0, justifyContent: "center", padding: "50px 0 25px 0" }}
        >
          <Grid container item xs={12} sx={classes.JCcenter}>
            <Typography variant="h3" gutterBottom>
              Welcome!
            </Typography>
          </Grid>
          <Grid container item xs={12} sx={classes.JCcenter}>
            <Typography variant="h4" gutterBottom>
              Log in
            </Typography>
          </Grid>
        </Grid>
        <Grid container item spacing={2} sx={{ flexGrow: 1, alignContent: "flex-start" }}>
          {fieldProperties.map((fieldProperty) => (
            <LoginInput
              key={fieldProperty}
              fieldProperty={fieldProperty}
              label={formData[fieldProperty].label}
              value={formData[fieldProperty].value}
              error={formData[fieldProperty].error}
              helperText={formData[fieldProperty].helperText}
              type={formData[fieldProperty].type || "text"}
              setFormData={setFormData}
              handleKeyDown={handleKeyDown}
            />
          ))}

          <Grid container item xs={12} sx={classes.JCcenter}>
            <Button
              variant="contained"
              color="primary"
              sx={classes.button}
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
