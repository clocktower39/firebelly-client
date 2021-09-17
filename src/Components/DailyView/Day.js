import React, { useState } from 'react';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Container,
    Grid,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import Tasks from './Tasks';
import Training from './Training';
import Nutrition from './Nutrition';

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
    const [note, setNote] = useState('');
    const handleChange = (e) => {
        setNote(e.value)
    }

    // format a Date object like ISO
    const dateToISOLikeButLocal = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const msLocal = date.getTime() - offsetMs;
        const dateLocal = new Date(msLocal);
        const iso = dateLocal.toISOString();
        const isoLocal = iso.slice(0, 19);
        return isoLocal;
    }

    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography>
            <Tasks />
            <Training />
            <Nutrition />
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Notes</Typography></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} ><TextField fullWidth variant="outlined" value={note} onChange={(e)=>handleChange(e)} label="Please provide feedback on your day; what was difficult and what went well?"/></Grid>
                        <Grid item xs={12} ><Button variant="outlined" >Save</Button></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Container>
    )
}
