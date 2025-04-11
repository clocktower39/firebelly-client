import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { changePassword } from "../../Redux/actions";

const classes = {
  JCcenter: { justifyContent: "center" },
};

const ChangePasswordInput = ({
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
export default function ChangePassword() {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState(false);

  const resetFormData = () => {
    const resetData = {};
    for (const fieldProperty in formData) {
      resetData[fieldProperty] = {
        ...formData[fieldProperty],
        value: "", // Reset the value to an empty string
        error: null, // Reset the error to null
      };
    }
    setFormData(resetData); // Update the state with the reset data
  };

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

  const handleSubmitChange = () => {
    fieldProperties.forEach((fieldProperty) => {
      formData[fieldProperty].value === ""
        ? setError(fieldProperty, true, `${formData[fieldProperty].label} is required.`)
        : setError(fieldProperty, null, null);
    });

    if (formData["newPassword"].value !== formData["confirmNewPassword"].value) {
      setError("newPassword", true, "Passwords do not match");
      setError("confirmNewPassword", true, "Passwords do not match");
      return;
    }
    const allErrorsFalse = () =>
      Object.values(formData).every((field) => field.error === null || field.error === false);

    if (allErrorsFalse()) {
      dispatch(
        changePassword(formData["currentPassword"].value, formData["newPassword"].value)
      ).then((res) => {
        if (res.error) {
          res.details.body.forEach((fieldError) =>
            setError(fieldError.context.key, true, fieldError.message)
          );
        } else {
          resetFormData();
          setSuccessMessage(true);
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmitChange(e);
    }
    successMessage && setSuccessMessage(false);
  };

  const [formData, setFormData] = useState({
    currentPassword: {
      label: "Current Password",
      value: "",
      error: null,
      helperText: "Please enter your current password",
      type: "password",
    },
    newPassword: {
      label: "New Password",
      value: "",
      error: null,
      helperText: "Please enter your new password",
      type: "password",
    },
    confirmNewPassword: {
      label: "Confrim New Password",
      value: "",
      error: null,
      helperText: "Please confirm your new password",
      type: "password",
    },
  });
  const fieldProperties = Object.keys(formData);

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container size={12} sx={{ padding: "15px" }}>
        <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
          Change Password
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          {fieldProperties.map((fieldProperty) => (
            <ChangePasswordInput
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
          <Grid container size={12} justifyContent="center" spacing="6">
            <Grid>
              <Button variant="contained" onClick={handleSubmitChange} autoFocus>
                Submit
              </Button>
            </Grid>
            {successMessage && (
              <Grid container size={12} justifyContent="center" >
                <Typography variant="caption"sx={{ color: (theme) => theme.palette.primary.main, }}>Password successfully updated.</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
