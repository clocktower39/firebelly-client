import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { loginUser, loginChild } from "../Redux/actions";
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
    identifier: {
      label: "Email/Username",
      value: localStorage.getItem("login_identifier") || "",
      error: null,
      helperText: null,
      type: "text",
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

    const email = String(formData.identifier.value || "").trim();

    if (!email || !email.includes("@")) {
      setError("identifier", true, "Please enter a valid email address.");
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
          setError(
            "identifier",
            true,
            "Verification email has been resent. Please check your inbox."
          );
        } else {
          setError("identifier", true, data.error || "Error resending verification email.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(
          "identifier",
          true,
          "Error resending verification email. Please try again later."
        );
      });
  };

  const handleLoginAttempt = (e) => {
    e.preventDefault();

    let hasError = false;
    fieldProperties.forEach((fieldProperty) => {
      if (formData[fieldProperty].value === "") {
        setError(fieldProperty, true, `${formData[fieldProperty].label} is required.`);
        hasError = true;
      } else {
        setError(fieldProperty, false, null);
      }
    });

    if (hasError) return;

    const identifier = String(formData.identifier.value || "").trim();
    const isEmail = identifier.includes("@");

    if (isEmail && !formData.identifier.error && !formData.password.error) {
      setDisableButtonDuringLogin(true);
      dispatch(loginUser({ email: identifier, password: formData.password.value })).then((res) => {
        if (res?.error) {
          const { error } = res;

          if (error.email) {
            if (error.email === "Please verify your email before logging in.") {
              setError(
                "identifier",
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
              setError("identifier", true, res.error.email);
            }
          }
          if (error.password) {
            setError("password", true, res.error.password);
          }
        }
        setDisableButtonDuringLogin(false);
      });
      localStorage.setItem("login_identifier", identifier);
    }

    if (!isEmail && !formData.identifier.error && !formData.password.error) {
      setDisableButtonDuringLogin(true);
      dispatch(loginChild({ username: identifier, pin: formData.password.value })).then((res) => {
        if (res?.error) {
          const { error } = res;
          if (error.username) {
            setError("identifier", true, error.username);
          }
          if (error.pin) {
            setError("password", true, error.pin);
          }
          if (error.consent) {
            setError("identifier", true, error.consent);
          }
        }
        setDisableButtonDuringLogin(false);
      });
      localStorage.setItem("login_identifier", identifier);
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
        <Grid container size={12} sx={{ justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Kids under 13 need a parent or guardian to create their account.
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Login;
