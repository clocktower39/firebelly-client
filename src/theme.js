import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#ff9800",
    },
    secondaryButton: {
      main: "#ff9800",
      contrastText: "#fff",
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
  overrides: {
    MuiInputBase: {},
  },
});
