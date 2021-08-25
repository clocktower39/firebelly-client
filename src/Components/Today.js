import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, LinearProgress, TextField, Typography, makeStyles } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    heading: {},
}))

export default function Today() {
    const classes = useStyles();
    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={2}><Typography className={classes.heading}>Daily Tasks</Typography></Grid>
                        <Grid item xs={10} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={2}><Typography className={classes.heading}>Training</Typography></Grid>
                        <Grid item xs={10} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                        sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={2}><Typography className={classes.heading}>Nutrition</Typography></Grid>
                        <Grid item xs={10} ><LinearProgress variant="determinate" value={50} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}><TextField fullWidth variant="outlined" label="Calories In" /></Grid>
                        <Grid item xs={12}><TextField fullWidth variant="outlined" label="Calories Out" /></Grid>
                        <Grid item xs={12}><TextField fullWidth variant="outlined" label="Protein" /></Grid>
                        <Grid item xs={12}><TextField fullWidth variant="outlined" label="Carbs" /></Grid>
                        <Grid item xs={12}><TextField fullWidth variant="outlined" label="Fats" /></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Container>
    )
}
