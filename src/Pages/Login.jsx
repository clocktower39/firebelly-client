import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { loginUser } from "../Redux/actions";
import { serverURL } from "../Redux/actions";

const classes = {
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
    <Grid container size={12} sx={classes.JCcenter}>
      <TextField
        color="secondary"
        sx={classes.textField}
        label={label}
        value={value}
        error={!!error}
        helperText={error ? helperText : null}
        type={type}
        onKeyDown={handleKeyDown}
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

export const Login = () => {
  const dispatch = useDispatch();
  const [disableButtonDuringLogin, setDisableButtonDuringLogin] = useState(false);
  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    email: {
      label: "Email",
      value: localStorage.getItem("email") || "",
      error: null,
      helperText: null,
      type: "email",
    },
    password: {
      label: "Password",
      value: "",
      error: null,
      helperText: null,
      type: "password",
    },
  });

  const fieldProperties = Object.keys(formData);

  const setError = (fieldProperty, hasError, helperText) => {
    setFormData((prev) => ({
      ...prev,
      [fieldProperty]: {
        ...prev[fieldProperty],
        error: hasError,
        helperText: helperText,
      },
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLoginAttempt(e);
    }
  };

  const handleResendVerificationEmail = (e) => {
    e.preventDefault();

    const email = formData.email.value;

    if (!email) {
      setError("email", true, "Please enter your email address.");
      return;
    }

    fetch(`${serverURL}/resend-verification-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setError("email", true, "Verification email has been resent. Please check your inbox.");
        } else {
          setError("email", true, data.error || "Error resending verification email.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("email", true, "Error resending verification email. Please try again later.");
      });
  };

  const handleLoginAttempt = (e) => {
    e.preventDefault();

    fieldProperties.forEach((fieldProperty) => {
      if (formData[fieldProperty].value === "") {
        setError(fieldProperty, true, `${formData[fieldProperty].label} is required.`);
      } else {
        setError(fieldProperty, false, null);
      }
    });

    if (!formData.email.error && !formData.password.error) {
      setDisableButtonDuringLogin(true);
      dispatch(loginUser({ email: formData.email.value, password: formData.password.value })).then(
        (res) => {
          if (res.error) {
            const { error } = res;

            if (error.email) {
              if (error.email === "Please verify your email before logging in.") {
                setError(
                  "email",
                  true,
                  <>
                    <div>Please verify your email before logging in.&nbsp;</div>
                    <div>
                      <a href="#" onClick={handleResendVerificationEmail}>
                        Click here to resend verification email.
                      </a>
                    </div>
                  </>
                );
              } else {
                setError("email", true, res.error.email);
              }
            }
            if (error.password) {
              setError("password", true, res.error.password);
            }
          }
          setDisableButtonDuringLogin(false);
        }
      );
      localStorage.setItem("email", formData.email.value);
    }
  };

  return user._id ? (
    <Navigate to={{ pathname: "/" }} />
  ) : (
    <Grid container>
      <Grid
        container
        size={12}
        sx={{ flexGrow: 0, justifyContent: "center", padding: "50px 0 25px 0" }}
      >
        <Grid container size={12} sx={classes.JCcenter}>
          <Typography variant="h3" gutterBottom>
            Welcome!
          </Typography>
        </Grid>
        <Grid container size={12} sx={classes.JCcenter}>
          <Typography variant="h4" gutterBottom>
            Log in
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ flexGrow: 1, alignContent: "flex-start" }}>
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

        <Grid container size={12} sx={classes.JCcenter}>
          <Button
            variant="contained"
            color="primary"
            sx={classes.button}
            onClick={handleLoginAttempt}
            disabled={disableButtonDuringLogin}
          >
            Login
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Login;
