import React, { useState } from 'react';
import {
    Button,
    Container,
    Grid,
    TextField,
    Typography,
    Divider,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Tasks from './Tasks';
import Training from './Training';
import Nutrition from './Nutrition';
import Notes from './Note';

const useStyles = makeStyles(theme => ({
    heading: {},
    ModalPaper: {
        position: 'absolute',
        padding: '17.5px',
        width: '65%',
        backgroundColor: '#fcfcfc',
        left: '50%',
        transform: 'translate(-50%, 50%)',
    },
    ArrowIcons: {
        color: theme.palette.primary.dark,
    },
    TextField: {
        '& .css-1d3z3hw-MuiOutlinedInput-notchedOutline':{
            borderColor: theme.palette.primary.dark,
        },
        '& .MuiOutlinedInput-input':{
            color: '#ffffff',
        },
    },
}))

export default function Day() {
    const classes = useStyles();

    // format a Date object like ISO
    const dateToISOLikeButLocal = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const msLocal = date.getTime() - offsetMs;
        const dateLocal = new Date(msLocal);
        const iso = dateLocal.toISOString();
        const isoLocal = iso.slice(0, 19);
        return isoLocal;
    }

    const [selectedDate, setSelectedDate] = useState(dateToISOLikeButLocal(new Date()).substr(0, 10));

    // handles when arrow buttons are clicked
    const changeDate = (change) => {
      let newDate = new Date(selectedDate).setDate(new Date(selectedDate).getDate() + change);
      setSelectedDate(new Date(newDate).toISOString().substr(0, 10));
    }

    return (
        <Container maxWidth="md" style={{ height: '100%', paddingTop: '25px', }}>
        <Typography variant="h5" gutterBottom textAlign="center" style={{ color: "#fff" }}>
          Daily View
        </Typography>
            <Grid item xs={12} container style={{justifyContent:"center"}} >

                {/* Go back one day */}
                <Button onClick={() => changeDate(-1)} className={classes.ArrowButton} ><ArrowBack className={classes.ArrowIcons} /></Button>
                
                {/* Select a date from a calander input */}
                <TextField
                focused 
                    id="date"
                    label="Date"
                    type="date"
                    color="primary"
                    value={selectedDate}
                    className={classes.TextField}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                {/* Go forward one day */}
                <Button onClick={() => changeDate(1)} className={classes.ArrowButton} ><ArrowForward className={classes.ArrowIcons} /></Button>
            </Grid>
            <Divider style={{margin: "15px"}} />

            {/* Separate accordian  */}
            <Tasks selectedDate={selectedDate} />
            <Training selectedDate={selectedDate} />
            <Nutrition selectedDate={selectedDate} />
            <Notes selectedDate={selectedDate} />

        </Container>
    )
}
