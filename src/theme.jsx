import { createTheme } from "@mui/material";
import { store } from "./Redux/store";

const dark = {
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
      default: "#3a3a3a",
      NavDrawer: "#232323",
      ATCPaperBackground: "#121212",
      DashboardCard: "#282828",
      ChartToopTip: "#000",
      Footer: "#000",
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
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 6,
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
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
  }
};

// Modern Dark Theme Palette
const moor = {
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
      NavDrawer: "linear-gradient(90deg, #020617, #0f172a, #1e293b)",
      ATCPaperBackground: "#1e293b",
      DashboardCard: "#334155", // Slate 700
      ChartToopTip: "#0f172a",
      Footer: "rgba(15, 23, 42, 0.96)",
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

// Black/Red theme palette
const ember = {
  palette: {
    mode: "dark",
    primary: {
      main: "#ef4444",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f87171",
      contrastText: "#ffffff",
    },
    secondaryButton: {
      main: "#ef4444",
      contrastText: "#ffffff",
    },
    background: {
      default: "#000000",
      paper: "#121212",
      NavDrawer: "linear-gradient(90deg, #000000, #121212, #1f1f1f)",
      ATCPaperBackground: "#121212",
      DashboardCard: "#1f1f1f",
      ChartToopTip: "#000000",
      Footer: "rgba(0, 0, 0, 0.98)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#e2e8f0",
    },
    divider: "rgba(239, 68, 68, 0.18)",
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
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#000000",
          scrollbarColor: "#b91c1c #000000",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#000000",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#b91c1c",
            minHeight: 24,
            border: "2px solid #000000",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(239, 68, 68, 0.25)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #b91c1c 30%, #ef4444 90%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          backgroundColor: "#121212",
          border: "1px solid rgba(239, 68, 68, 0.12)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.45)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 16,
        },
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
              borderColor: "rgba(239, 68, 68, 0.35)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(239, 68, 68, 0.55)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ef4444",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: "#121212",
          border: "1px solid rgba(239, 68, 68, 0.16)",
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

// Modern Light Theme Palette
const light = {
  palette: {
    mode: "light",
    primary: {
      main: "#10b981", // Emerald 500
      contrastText: "#000",
    },
    secondary: {
      main: "#f59e0b", // Amber 500
      contrastText: "#000",
    },
    secondaryButton: {
      main: "#f59e0b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
      NavDrawer: "linear-gradient(90deg, #f1f5f9, #e2e8f0)",
      ATCPaperBackground: "#ffffff",
      DashboardCard: "#ffffff",
      ChartToopTip: "#334155",
      Footer: "#e2e8f0",
    },
    text: {
      primary: "#0f172a",   // Slate 900
      secondary: "#475569", // Slate 600
    },
    divider: "rgba(15, 23, 42, 0.12)",
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
    button: { fontWeight: 600, textTransform: "none" },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f8fafc",
          scrollbarColor: "#cbd5f5 #f8fafc",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#f8fafc",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#cbd5e1",
            border: "2px solid #f8fafc",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
          backgroundColor: "#ffffff",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 16,
        },
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
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: "rgba(15, 23, 42, 0.25)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(15, 23, 42, 0.45)",
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
          backgroundColor: "#ffffff",
          border: "1px solid rgba(15, 23, 42, 0.08)",
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

const buildCustomTheme = (customTheme) => {
  const colors = customTheme?.colors;
  if (!colors) {
    return dark;
  }

  const {
    primary,
    secondary,
    backgroundDefault,
    backgroundPaper,
    textPrimary,
    textSecondary,
  } = colors;

  return {
    palette: {
      mode: "dark",
      primary: {
        main: primary,
        contrastText: "#ffffff",
      },
      secondary: {
        main: secondary,
        contrastText: "#ffffff",
      },
      secondaryButton: {
        main: secondary,
        contrastText: "#ffffff",
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
        NavDrawer: `linear-gradient(90deg, ${backgroundDefault}, ${backgroundPaper})`,
        ATCPaperBackground: backgroundPaper,
        DashboardCard: backgroundPaper,
        ChartToopTip: backgroundDefault,
        Footer: backgroundDefault,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: "rgba(148, 163, 184, 0.18)",
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
      button: { fontWeight: 600, textTransform: "none" },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: backgroundDefault,
            scrollbarColor: `${primary} ${backgroundDefault}`,
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: backgroundDefault,
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: primary,
              minHeight: 24,
              border: `2px solid ${backgroundDefault}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
          containedPrimary: {
            background: primary,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: "none",
            backgroundColor: backgroundPaper,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          rounded: {
            borderRadius: 16,
          },
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
                borderColor: textSecondary,
              },
              "&:hover fieldset": {
                borderColor: textPrimary,
              },
              "&.Mui-focused fieldset": {
                borderColor: primary,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundColor: backgroundPaper,
            border: `1px solid ${textSecondary}`,
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
};

// Exporting the same function signature to maintain compatibility
export const theme = () => {
  const { themeMode, customThemes = [] } = store.getState().user;
  const userTheme = themeMode;
  if (userTheme) {
    localStorage.setItem("theme", userTheme);
  } else {
    localStorage.removeItem("theme");
  }

  const resolveCustomTheme = () => {
    if (!userTheme) return null;
    if (userTheme.startsWith("custom:")) {
      const customId = userTheme.split(":")[1];
      return customThemes.find((t) => t.id === customId) || null;
    }
    const directMatch = customThemes.find((t) => t.id === userTheme);
    return directMatch || null;
  };

  const customTheme = resolveCustomTheme();

  const selectedTheme = () => {
    if (customTheme) {
      return buildCustomTheme(customTheme);
    }
    switch (userTheme) {
      case 'dark':
        return dark;
      case 'moor':
        return moor;
      case 'ember':
        return ember;
      case 'light':
        return light;
      default:
        return dark;
    }
  }
  return createTheme(selectedTheme());
}
