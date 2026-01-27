import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateThemeMode, updateUserSettings } from "../../Redux/actions";
import { Autocomplete, Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";

export default function AccountSettings() {
  const dispatch = useDispatch();
  const userThemeMode = useSelector((state) => state.user.themeMode);
  const customThemes = useSelector((state) => state.user.customThemes) || [];

  const baseOptions = [
    { label: "Dark", value: "dark" },
    { label: "Moor Frog (Light and Dark Blue)", value: "moor" },
    { label: "Ember (Black and Red)", value: "ember" },
    { label: "Light", value: "light" },
  ];

  const customOptions = useMemo(
    () =>
      customThemes.map((theme) => ({
        label: `${theme.name} (Custom)`,
        value: `custom:${theme.id}`,
        themeId: theme.id,
      })),
    [customThemes]
  );

  const options = useMemo(() => [...baseOptions, ...customOptions], [customOptions]);

  const [themeSelection, setThemeSelection] = useState(
    options.find((option) => option.value === userThemeMode) || baseOptions[0]
  );

  useEffect(() => {
    const nextSelection =
      options.find((option) => option.value === userThemeMode) || baseOptions[0];
    setThemeSelection(nextSelection);
  }, [options, userThemeMode]);

  const [themeName, setThemeName] = useState("");
  const [themeColors, setThemeColors] = useState({
    primary: "#ef4444",
    secondary: "#f87171",
    backgroundDefault: "#000000",
    backgroundPaper: "#121212",
    textPrimary: "#f8fafc",
    textSecondary: "#e2e8f0",
  });

  const handleChange = (e, selection) => {
    setThemeSelection(selection);
  };

  const saveTheme = () => {
    if (!themeSelection?.value) return;
    dispatch(updateThemeMode(themeSelection.value));
  };

  const handleColorChange = (key) => (event) => {
    const value = event.target.value;
    setThemeColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generateThemeId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createCustomTheme = () => {
    const trimmedName = themeName.trim();
    if (!trimmedName) return;

    const id = generateThemeId();
    const newTheme = {
      id,
      name: trimmedName,
      colors: { ...themeColors },
    };

    const updatedThemes = [...customThemes, newTheme];
    const newThemeMode = `custom:${id}`;

    dispatch(
      updateUserSettings({
        customThemes: updatedThemes,
        themeMode: newThemeMode,
      })
    );

    setThemeName("");
    setThemeSelection({
      label: `${newTheme.name} (Custom)`,
      value: newThemeMode,
      themeId: newTheme.id,
    });
  };

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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Theme"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid container size={12} sx={{ justifyContent: "center" }} spacing={1}>
            <Grid>
              <Button variant="contained" onClick={saveTheme}>
                Save
              </Button>
            </Grid>
          </Grid>
          <Grid container size={12} sx={{ paddingTop: "10px" }}>
            <Typography color="primary.contrastText" variant="h6">
              Custom Theme Builder
            </Typography>
          </Grid>
          <Grid container size={12} spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Theme name"
                value={themeName}
                onChange={(event) => setThemeName(event.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Primary color"
                type="color"
                value={themeColors.primary}
                onChange={handleColorChange("primary")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Secondary color"
                type="color"
                value={themeColors.secondary}
                onChange={handleColorChange("secondary")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Background default"
                type="color"
                value={themeColors.backgroundDefault}
                onChange={handleColorChange("backgroundDefault")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Background paper"
                type="color"
                value={themeColors.backgroundPaper}
                onChange={handleColorChange("backgroundPaper")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Text primary"
                type="color"
                value={themeColors.textPrimary}
                onChange={handleColorChange("textPrimary")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Text secondary"
                type="color"
                value={themeColors.textSecondary}
                onChange={handleColorChange("textSecondary")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="contained" onClick={createCustomTheme}>
                Create and Apply Theme
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
