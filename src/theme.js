import { createTheme } from "@mui/material";
import { store } from "./Redux/store";

const initTheme = createTheme();

const darkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: "#2e7d32",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ff9800",
      contrastText: "#fff",
    },
    secondaryButton: {
      main: "#ff9800",
      contrastText: "#fff",
    },
    background: {
      ATCPaperBackground: "#121212",
      DashboardCard: "#282828",
      ChartToopTip: "#000",
    },
  },
  typography: {
    h1: {
      fontSize: "2.1rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: "600",
    },
    h3: {
      fontWeight: "600",
      fontSize: "1.3rem",
    },
    h4: {},
    h5: {
      [initTheme.breakpoints.down("md")]: {},
    },
    h6: {
      fontSize: "1.2rem",
      [initTheme.breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
    },
    body1: {
      fontSize: "1rem",
      [initTheme.breakpoints.down("md")]: {
        fontSize: "1rem",
      },
      [initTheme.breakpoints.down("sm")]: {
        fontSize: "1rem",
      },
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: ".8rem",
      fontWeight: 500,
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
};
const lightTheme = {
  palette: {
    mode: "light",
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
      ATCPaperBackground: "#FFF",
      DashboardCard: "#444",
      ChartToopTip: "#fff",
    },
  },
  typography: {
    h1: {
      fontSize: "2.1rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: "600",
    },
    h3: {
      fontWeight: "600",
      fontSize: "1.3rem",
    },
    h4: {},
    h5: {
      [initTheme.breakpoints.down("md")]: {},
    },
    body1: {
      fontSize: "1rem",
      [initTheme.breakpoints.down("md")]: {
        fontSize: ".9rem",
      },
      [initTheme.breakpoints.down("sm")]: {
        fontSize: "0.9rem",
      },
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: ".8rem",
      fontWeight: 500,
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
};

export const theme = () =>
  createTheme(store.getState().user.themeMode === "light" ? lightTheme : darkTheme);
