import { createTheme } from "@mui/material";
import { store } from './Redux/store';

const darkTheme = {
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
      ChartToopTip: '#000',
    }
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
}
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
      ATCPaperBackground: '#FFF',
      DashboardCard: '#444',
      ChartToopTip: '#fff',
    }
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
  },
}

export const theme = () => createTheme(store.getState().user.themeMode === 'light' ? lightTheme : darkTheme);
