import React from 'react';
import { useSelector } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, LinearProgress, TextField, Typography, makeStyles } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    heading: {},
}))

export default function Today() {
    const classes = useStyles();
    const today = useSelector(state => state.calander.dailyView );
    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Daily Tasks</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {today.dailyTasks.map(task => (
                            <Grid item xs={12} key={task}><TextField fullWidth variant="outlined" label={task.title} /></Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Training</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {today.dailyTraining.training.map((group, index) => (
                            <Grid item xs={12} key={group}>
                                <Typography variant="h5">Set {index+1}</Typography>
                                {group.map(exercise => (
                                    <TextField key={exercise} fullWidth variant="outlined" label={exercise.exercise} />
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Nutrition</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {today.dailyNutrtion.map(task => (
                            <Grid item xs={12} key={task}><TextField fullWidth variant="outlined" label={task.title} /></Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Container>
    )
}
