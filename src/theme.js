import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
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
    background: {
      ATCPaperBackground: '#121212',
      DashboardCard: '#282828',
    }
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
});
