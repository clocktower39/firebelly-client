import React, { useState } from 'react';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Grid,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    root: {},
}))

export default function Day() {
    const classes = useStyles();

    const [note, setNote] = useState('');
    const handleChange = (e) => {
        setNote(e.value)
    }

    return (
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
    )
}
