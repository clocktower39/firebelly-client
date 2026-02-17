import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateThemeMode, updateUserSettings } from "../../Redux/actions";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function AccountSettings() {
  const dispatch = useDispatch();
  const userThemeMode = useSelector((state) => state.user.themeMode);
  const customThemes = useSelector((state) => state.user.customThemes) || [];
  const isActiveCustomTheme = (themeId) => userThemeMode === `custom:${themeId}`;

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

  const defaultThemeColors = {
    primary: "#ef4444",
    secondary: "#f87171",
    backgroundDefault: "#000000",
    backgroundPaper: "#121212",
    textPrimary: "#f8fafc",
    textSecondary: "#e2e8f0",
  };

  const [themeName, setThemeName] = useState("");
  const [themeColors, setThemeColors] = useState(defaultThemeColors);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const resetBuilder = () => {
    setThemeName("");
    setThemeColors(defaultThemeColors);
    setEditingThemeId(null);
  };

  const handleOpenBuilder = (theme) => {
    if (theme) {
      setEditingThemeId(theme.id);
      setThemeName(theme.name || "");
      setThemeColors({ ...defaultThemeColors, ...(theme.colors || {}) });
    } else {
      resetBuilder();
    }
    setBuilderOpen(true);
  };
  const handleCloseBuilder = () => {
    setBuilderOpen(false);
    resetBuilder();
  };

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

  const saveCustomTheme = () => {
    const trimmedName = themeName.trim();
    if (!trimmedName) return;

    if (editingThemeId) {
      const updatedThemes = customThemes.map((theme) =>
        theme.id === editingThemeId
          ? { ...theme, name: trimmedName, colors: { ...themeColors } }
          : theme
      );
      dispatch(
        updateUserSettings({
          customThemes: updatedThemes,
        })
      );
      handleCloseBuilder();
      return;
    }

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

    setThemeSelection({
      label: `${newTheme.name} (Custom)`,
      value: newThemeMode,
      themeId: newTheme.id,
    });
    handleCloseBuilder();
  };

  const deleteCustomTheme = (themeId) => {
    const updatedThemes = customThemes.filter((theme) => theme.id !== themeId);
    const nextThemeMode = isActiveCustomTheme(themeId) ? "light" : userThemeMode;
    dispatch(
      updateUserSettings({
        customThemes: updatedThemes,
        themeMode: nextThemeMode,
      })
    );
  };

  return (
    <>
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
            <Grid container size={12} sx={{ justifyContent: "center" }}>
              <Button variant="outlined" onClick={() => handleOpenBuilder()}>
                Create Custom Theme
              </Button>
            </Grid>
            <Grid container size={12} sx={{ pt: 2 }}>
              <Typography color="primary.contrastText" variant="subtitle1">
                Your Custom Themes
              </Typography>
            </Grid>
            {customThemes.length === 0 ? (
              <Grid container size={12}>
                <Typography variant="body2" color="text.secondary">
                  No custom themes yet.
                </Typography>
              </Grid>
            ) : (
              customThemes.map((theme) => (
                <Grid
                  key={theme.id}
                  container
                  size={12}
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="primary.contrastText">
                      {theme.name}
                      {isActiveCustomTheme(theme.id) ? " (Active)" : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      {[
                        theme.colors?.primary,
                        theme.colors?.secondary,
                        theme.colors?.backgroundDefault,
                        theme.colors?.backgroundPaper,
                        theme.colors?.textPrimary,
                        theme.colors?.textSecondary,
                      ].map((color, index) => (
                        <Box
                          key={`${theme.id}-color-${index}`}
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            backgroundColor: color || "#000000",
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" onClick={() => handleOpenBuilder(theme)}>
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setConfirmDeleteId(theme.id)}
                    >
                      Delete
                    </Button>
                  </Grid>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      </Container>
      <Dialog open={builderOpen} onClose={handleCloseBuilder} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingThemeId ? "Edit Custom Theme" : "Build a Custom Theme"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
            <Grid size={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Preview
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: themeColors.backgroundDefault,
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: themeColors.backgroundPaper,
                    color: themeColors.textPrimary,
                  }}
                >
                  <Typography variant="h6" sx={{ color: themeColors.textPrimary }}>
                    Sample Card
                  </Typography>
                  <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 2 }}>
                    This is how your text and surfaces will look.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: themeColors.primary,
                        color: themeColors.textPrimary,
                        "&:hover": { backgroundColor: themeColors.primary },
                      }}
                    >
                      Primary
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.textPrimary,
                        "&:hover": { backgroundColor: themeColors.secondary },
                      }}
                    >
                      Secondary
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: themeColors.textSecondary,
                        color: themeColors.textSecondary,
                      }}
                    >
                      Outline
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBuilder}>Cancel</Button>
          <Button variant="contained" onClick={saveCustomTheme}>
            {editingThemeId ? "Save Changes" : "Create and Apply Theme"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete custom theme?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This cannot be undone. You can recreate the theme later if needed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDeleteId) deleteCustomTheme(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
