import React, { useState } from 'react';
import {
    Button,
    Container,
    Grid,
    TextField,
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
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Grid item xs={12} container justifyContent="center">
                <Button onClick={() => changeDate(-1)} className={classes.ArrowButton} ><ArrowBack className={classes.ArrowIcons} /></Button>
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
                <Button onClick={() => changeDate(1)} className={classes.ArrowButton} ><ArrowForward className={classes.ArrowIcons} /></Button>
            </Grid>
            <Divider style={{margin: "15px"}} />
            {/* <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography> */}
            <Tasks selectedDate={selectedDate} />
            <Training selectedDate={selectedDate} />
            <Nutrition selectedDate={selectedDate} />
            <Notes selectedDate={selectedDate} />
        </Container>
    )
}
