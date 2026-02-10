import React, { useState } from "react";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { signupUser } from "../Redux/actions";

const classes = {
  JCcenter: { justifyContent: "center" },
};

const SignupInput = ({
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
        error={error === true ? true : false}
        helperText={error === true ? helperText : false}
        type={type}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
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

export const SignUp = (props) => {
  const dispatch = useDispatch();
  const [disableButtonDuringSignUp, setDisableButtonDuringSignUp] = useState(false);
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    firstName: {
      label: "First Name",
      value: "",
      error: null,
      helperText: "Please enter your first name",
    },
    lastName: {
      label: "Last Name",
      value: "",
      error: null,
      helperText: "Please enter your last name",
    },
    email: {
      label: "Email",
      value: "",
      error: null,
      helperText: "Invalid email",
      type: "email",
    },
    dateOfBirth: {
      label: "Date of Birth",
      value: "",
      error: null,
      helperText: "Please enter your date of birth",
      type: "date",
    },
    password: {
      label: "Password",
      value: "",
      error: null,
      helperText: "Please enter your password",
      type: "password",
    },
    confirmPassword: {
      label: "Confirm Password",
      value: "",
      error: null,
      helperText: "Passwords do not match",
      type: "password",
    },
  });
  const fieldProperties = Object.keys(formData);

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
      handleSignupAttempt(e);
    }
  };

  const handleSignupAttempt = (e) => {
    fieldProperties.forEach((fieldProperty) => {
      formData[fieldProperty].value === ""
        ? setError(fieldProperty, true, `${formData[fieldProperty].label} is required.`)
        : setError(fieldProperty, false, null);
    });

    const dobValue = formData.dateOfBirth.value;
    if (dobValue) {
      const dob = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }
      if (age < 13) {
        setError(
          "dateOfBirth",
          true,
          "Users under 13 need a parent or guardian to create their account."
        );
        return;
      }
    }

    if (
      !formData.firstName.error &&
      !formData.lastName.error &&
      !formData.email.error &&
      !formData.dateOfBirth.error &&
      !formData.password.error &&
      !formData.confirmPassword.error
    ) {
      setDisableButtonDuringSignUp(true);
      dispatch(
        signupUser({
          firstName: formData.firstName.value,
          lastName: formData.lastName.value,
          email: formData.email.value,
          dateOfBirth: formData.dateOfBirth.value,
          password: formData.password.value,
        })
      ).then((res) => {
        if (res.error) {
          const { error } = res;

          error.firstName && setError("firstName", true, res.error.firstName);
          error.lastName && setError("lastName", true, res.error.lastName);
          error.email && setError("email", true, res.error.email);
          error.dateOfBirth && setError("dateOfBirth", true, res.error.dateOfBirth);
          error.password && setError("password", true, res.error.password);
          error.confirmPassword && setError("confirmPassword", true, res.error.confirmPassword);
        }
        setDisableButtonDuringSignUp(false);
      })
      localStorage.setItem("email", formData.email.value);
    }
  };

  return user._id ? <Navigate to={{ pathname: "/" }} /> : (
    <Grid container >
      <Grid
        container
        size={12}
        sx={{ flexGrow: 0, justifyContent: "center", padding: "50px 0 25px 0" }}
      >
        <Grid container size={12} sx={classes.JCcenter}>
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ flexGrow: 1, alignContent: "flex-start" }}>
        {fieldProperties.map((fieldProperty) => (
          <SignupInput
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
            onClick={handleSignupAttempt}
            disabled={disableButtonDuringSignUp}
          >
            Sign Up
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SignUp;
