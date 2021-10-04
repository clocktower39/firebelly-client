import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
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
import {
    requestDailyNote,
    // updateDailyNote,
} from "../../Redux/actions";

const useStyles = makeStyles(theme => ({
    root: {},
}))

export default function Note(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    const [note, setNote] = useState('');
    const handleChange = (e) => {
        setNote(e.value)
    }

    // const handleSave = () => {
    //     dispatch(updateDailyNote())
    // }

    useEffect(()=> {
        dispatch(requestDailyNote(user._id, props.selectedDate))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.selectedDate])

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
                    <Grid item container justifyContent="center" xs={12} ><Button variant="outlined" >Save</Button></Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}
