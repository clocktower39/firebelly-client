import { createTheme } from '@mui/material';

export const theme = createTheme({
    palette: {
        primary: {
            light: '#ff5131',
            main: '#d50000',
            dark: '#9b0000',
            contrastText: '#fff'
        },
        secondary: {
            light: '#66ffa6',
            main: '#00e676',
            dark: '#00b248',
            contrastText: '#000'
        },
    },
    props: {
        MuiTextField: {
            variant: 'outlined'
        },
    },
    overrides: {
        MuiInputBase: {
        }}
})
