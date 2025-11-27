import { createTheme } from "@mui/material";
import { store } from "./Redux/store";

// Modern Dark Theme Palette
const darkTheme = {
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981", // Emerald 500
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f59e0b", // Amber 500
      contrastText: "#ffffff",
    },
    secondaryButton: {
      main: "#f59e0b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0f172a", // Slate 900
      paper: "#1e293b",   // Slate 800
      ATCPaperBackground: "#1e293b",
      DashboardCard: "#334155", // Slate 700
      ChartToopTip: "#0f172a",
    },
    text: {
      primary: "#f8fafc", // Slate 50
      secondary: "#94a3b8", // Slate 400
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },
  typography: {
    fontFamily: "'Roboto', 'Inter', sans-serif",
    h1: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h3: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    subtitle1: { fontSize: "1.1rem", fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none" }, // Modern buttons usually don't shout
  },
  shape: {
    borderRadius: 12, // Increased border radius for a softer, modern look
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f172a",
          scrollbarColor: "#334155 #0f172a",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#0f172a",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#334155",
            minHeight: 24,
            border: "2px solid #0f172a",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999, // Pill shape
          padding: "8px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #10b981 30%, #34d399 90%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          backgroundColor: "#1e293b",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
            borderRadius: 16
        }
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            "& fieldset": {
              borderColor: "rgba(148, 163, 184, 0.3)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(148, 163, 184, 0.5)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#10b981",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: "#1e293b",
          border: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
};

// Exporting the same function signature to maintain compatibility
export const theme = () =>
  createTheme(store.getState().user.themeMode === "light" ? darkTheme : darkTheme);
