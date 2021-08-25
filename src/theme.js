import { createTheme } from '@material-ui/core';

export const theme = createTheme({
    palette: {
        primary:{
            light: '#ff5131',
            main:'#d50000',
            dark:'#9b0000',
            contrastText: '#fff'
        },
        secondary:{
            light: '#66ffa6',
            main:'#00e676',
            dark:'#00b248',
            contrastText: '#000'
        },
    }
})
