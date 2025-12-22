import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateThemeMode } from "../../Redux/actions";
import { Autocomplete, Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";

export default function AccountSettings() {
  const dispatch = useDispatch();
  const userThemeMode = useSelector((state) => state.user.themeMode);
  const options = [
    { label: "Dark", value: "dark" },
    { label: "Moor Frog (Light and Dark Blue)", value: "moor" },
    { label: "Light", value: "light" },
  ];
  const [themeSelection, setThemeSelection] = useState(
    options.filter((option) => option.value === userThemeMode)[0]
  );

  const handleChange = (e, selection) => {
    setThemeSelection(selection);
  };

  const saveTheme = () => dispatch(updateThemeMode(themeSelection.value));

  return (
    <Container maxWidth="md" sx={{ height: "100%" }}>
      <Grid container size={12} sx={{ padding: "15px" }}>
        <Typography color="primary.contrastText" variant="h5" gutterBottom>
          Theme
        </Typography>
      </Grid>
      <Paper>
        <Grid container spacing={2} sx={{ padding: "15px" }}>
          <Grid container size={12} sx={{ justifyContent: "center" }}>
            <Autocomplete
              fullWidth
              value={themeSelection}
              options={options}
              onChange={handleChange}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionDisabled={(option) => option.value === "custom"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Combo box"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid container size={12} sx={{ justifyContent: "center" }} spacing={1}>
            <Grid >
              <Button variant="contained" onClick={saveTheme}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
