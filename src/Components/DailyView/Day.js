import React, { useState } from 'react';
import {
    Button,
    Container,
    Grid,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import Tasks from './Tasks';
import Training from './Training';
import Nutrition from './Nutrition';
import Notes from './Notes';

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
                <Button onClick={() => changeDate(-1)} className={classes.ArrowButton} ><ArrowBack /></Button>
                <TextField
                id="date"
                label="Date"
                type="date"

                value={selectedDate}
                className={classes.TextField}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{
                    shrink: true,
                }}
                />
                <Button onClick={() => changeDate(1)} className={classes.ArrowButton} ><ArrowForward /></Button>
            </Grid>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography>
            <Tasks selectedDate={selectedDate} />
            <Training />
            <Nutrition selectedDate={selectedDate} />
            <Notes />
        </Container>
    )
}
