import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Button, CardMedia, Chip, Container, Dialog, Divider, Input, MenuItem, Paper, Stack, TextField, Tooltip, Typography, Grid } from "@mui/material";
// InputMask relies on findDOMNode, which was deprecated in React 18. Need to find alternative
import InputMask from "react-input-mask";
import { editUser, uploadProfilePicture, serverURL, } from "../../Redux/actions";

export default function MyAccount() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? user.dateOfBirth.substr(0, 10) : ""
  );
  const [height, setHeight] = useState(user.height || "");
  const [sex, setSex] = useState(user.sex || "");
  const [gymBarcode, setGymBarcode] = useState(user.gymBarcode || "");
  
  const [profilePictureDialog, setProfilePictureDialog] = useState(false);
  const handleProfilePictureDialog = () => setProfilePictureDialog((prev) => !prev);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState("");

  const integrations = [
    {
      id: "garmin",
      name: "Garmin Connect",
      description: "Sync runs, heart rate, GPS routes, and activity summaries.",
      statusLabel: "Not connected",
      enabled: false,
      helper: "OAuth setup required.",
    },
    {
      id: "samsung",
      name: "Samsung Health",
      description: "Sync steps, runs, heart rate, and workouts.",
      statusLabel: "Not connected",
      enabled: false,
      helper: "OAuth setup required.",
    },
    {
      id: "apple",
      name: "Apple Fitness / Health",
      description: "Sync workouts and health metrics (requires iOS device integration).",
      statusLabel: "Not connected",
      enabled: false,
      helper: "Requires iOS integration + OAuth setup.",
    },
  ];


  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber);
    setDateOfBirth(user.dateOfBirth.substr(0, 10) || "");
    setHeight(user.height);
    setSex(user.sex);
    setGymBarcode(user.gymBarcode);
  };

  const saveChanges = () => {
    if (firstName !== "" && lastName !== "" && email !== "") {
      dispatch(
        editUser({
          ...user,
          firstName,
          lastName,
          email,
          phoneNumber,
          dateOfBirth,
          height,
          sex,
          gymBarcode,
        })
      );
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container size={12} sx={{ padding: "15px" }}>
        <Typography variant="h5" gutterBottom sx={{ color: "primary.contrastText" }}>
          My Account
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container size={12} sx={{ justifyContent: "center" }}>
            <Avatar
              alt="Profile Picture"
              src={user.profilePicture && `${serverURL}/user/profilePicture/${user.profilePicture}`}
              sx={{ width: 85, height: 85 }}
              onClick={handleProfilePictureDialog}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => handleChange(e.target.value, setFirstName)}
              fullWidth
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => handleChange(e.target.value, setLastName)}
              fullWidth
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => handleChange(e.target.value, setEmail)}
              fullWidth
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              mask="+1 (999) 999-9999"
              value={phoneNumber}
              onChange={(e) => handleChange(e.target.value, setPhoneNumber)}
              disabled={false}
              // maskChar=" "
            >
              {() => <TextField label="Phone Number" fullWidth type="tel" />}
            </TextField>
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => handleChange(e.target.value, setDateOfBirth)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid container size={12}>
            <TextField
              mask={`9' ?9"`}
              // formatChars={{ 9: "[0-9]", "?": "[0-9 ]" }}
              value={height}
              onChange={(e) => handleChange(e.target.value, setHeight)}
              disabled={false}
              // maskChar=" "
            >
              {() => <TextField label="Height" fullWidth type="tel" />}
            </TextField>
          </Grid>
          <Grid container size={12}>
            <TextField
              select
              label="Sex"
              value={sex}
              onChange={(e) => handleChange(e.target.value, setSex)}
              fullWidth
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="N/A">Prefer not to answer</MenuItem>
            </TextField>
          </Grid>
          <Grid container size={12}>
            <TextField
              label="Gym Barcode"
              value={gymBarcode}
              onChange={(e) => handleChange(e.target.value, setGymBarcode)}
              fullWidth
            />
          </Grid>
          <Grid container sx={{ justifyContent: "center" }} size={12} spacing={2}>
            <Grid >
              <Button color="secondaryButton" variant="contained" onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid >
              <Button variant="contained" onClick={saveChanges}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ marginTop: "20px", padding: "15px" }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Integrations</Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your fitness apps to auto-import cardio workouts and metrics.
            </Typography>
          </Stack>
          <Divider />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="Choose an integration"
                value={selectedIntegrationId}
                onChange={(event) => setSelectedIntegrationId(event.target.value)}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {integrations.map((integration) => (
                  <MenuItem key={integration.id} value={integration.id}>
                    {integration.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              {!selectedIntegrationId ? (
                <Typography variant="body2" color="text.secondary">
                  Select an integration to manage.
                </Typography>
              ) : (
                (() => {
                  const integration = integrations.find((item) => item.id === selectedIntegrationId);
                  if (!integration) return null;
                  return (
                    <Paper variant="outlined" sx={{ padding: "12px" }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1">{integration.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {integration.description}
                            </Typography>
                          </Stack>
                          <Chip label={integration.statusLabel} size="small" variant="outlined" />
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                          <Typography variant="caption" color="text.secondary">
                            {integration.helper}
                          </Typography>
                          <Tooltip title={integration.enabled ? "Connect" : "Keys required to enable"}>
                            <span>
                              <Button variant="contained" disabled={!integration.enabled}>
                                Connect
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip title={integration.enabled ? "Sync now" : "Connect first"}>
                            <span>
                              <Button variant="outlined" disabled>
                                Sync now
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })()
              )}
            </Grid>
          </Grid>
        </Stack>
      </Paper>
      <Dialog open={profilePictureDialog} onClose={handleProfilePictureDialog}>
        <ProfilePictureUpload />
      </Dialog>
    </Container>
  );
}

const ProfilePictureUpload = () => {
  const dispatch = useDispatch();
  const [uploadPhoto, setUploadPhoto] = useState(null);

  const handlePhoto = (e) => {
    if(e.target.files[0].type.substr(0,6) === 'image/'){
      setUploadPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", uploadPhoto);

    if (uploadPhoto) {
      dispatch(uploadProfilePicture(formData));
    }
  };

  return (
    <Container disableGutters maxWidth="sm">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container>
          <Input
            type="file"
            accept=".png, .jpg, .jpeg"
            name="photo"
            onChange={handlePhoto}
            fullWidth
            id="hidden-input"
            sx={{ display: "none" }}
          />
          <Grid size={12}>
            <label htmlFor="hidden-input">
              <CardMedia
                sx={{
                  height: 0,
                  paddingTop: "100%",
                  backgroundColor: "gray",
                }}
                image={uploadPhoto && URL.createObjectURL(uploadPhoto)}
                alt="upload an image"
              />
            </label>
            {!uploadPhoto && (
              <Typography
                variant="h6"
                sx={{ textAlign: "center", position: "relative", bottom: "55%" }}
              >
                Click to upload and preview an image.
              </Typography>
            )}
          </Grid>
          <Grid size={12}>
            <Button variant="contained" fullWidth type="submit">
              Upload
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};
